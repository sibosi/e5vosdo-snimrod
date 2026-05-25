#!/usr/bin/env python3
"""
One-time Instagram backfill script.

- Fetches all historical posts for configured usernames via Meta API.
- Writes into the existing feed_instagram_* tables.
- Optionally uploads media to Google Drive (same logic as the app).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from io import BytesIO
from typing import Dict, Iterable, List, Optional, Tuple

import requests
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

DEFAULT_PAGE_LIMIT = 5
DEFAULT_DELAY_SECONDS = 0.2


def parse_usernames(raw: str) -> List[str]:
    if not raw:
        return []
    parts = re.split(r"[\s,;]+", raw)
    return [part.strip() for part in parts if part.strip()]


def parse_timestamp_epoch(timestamp: Optional[str]) -> int:
    if not timestamp:
        return 0
    try:
        value = timestamp.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(value)
        return int(parsed.timestamp() * 1000)
    except Exception:
        return 0


def clamp_page_limit(value: Optional[int]) -> int:
    if not value or value <= 0:
        return DEFAULT_PAGE_LIMIT
    return min(value, 10)


def load_config(overrides: argparse.Namespace) -> Dict[str, object]:
    load_dotenv(".env")

    account_id = os.getenv("META_IG_ACCOUNT_ID")
    access_token = os.getenv("META_IG_ACCESS_TOKEN")
    graph_version = os.getenv("META_GRAPH_VERSION") or "v25.0"
    usernames = parse_usernames(os.getenv("META_IG_USERNAMES_TO_TRACK", ""))
    own_username = (os.getenv("META_IG_OWN_USERNAME") or "").strip() or None

    if overrides.usernames:
        usernames = parse_usernames(overrides.usernames)

    if not account_id or not access_token or not usernames:
        print("Missing Meta API config. Check .env for META_IG_* variables.")
        sys.exit(1)

    page_limit = clamp_page_limit(overrides.limit)
    delay_seconds = overrides.delay if overrides.delay is not None else DEFAULT_DELAY_SECONDS

    return {
        "account_id": account_id,
        "access_token": access_token,
        "graph_version": graph_version,
        "usernames": usernames,
        "own_username": own_username,
        "page_limit": page_limit,
        "delay_seconds": delay_seconds,
    }


def create_db_connection() -> mysql.connector.MySQLConnection:
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
        )
        if connection.is_connected():
            return connection
    except Error as error:
        print(f"Database connection error: {error}")
        sys.exit(1)
    raise RuntimeError("Failed to connect to database")


def get_drive_client():
    if os.getenv("IS_FEED_IMAGE_DRIVE_STORAGE_ENABLED") != "true":
        return None

    key_str = os.getenv("SERVICE_ACCOUNT_KEY") or os.getenv("SERVICE_ACCOUNT_KEY_STR")
    key_path = os.getenv("SERVICE_ACCOUNT_KEY_PATH") or ".service-account-key.json"

    creds = None
    if key_str:
        try:
            key_data = json.loads(key_str)
            creds = service_account.Credentials.from_service_account_info(
                key_data, scopes=["https://www.googleapis.com/auth/drive"],
            )
        except Exception as error:
            print(f"Failed to parse service account JSON: {error}")
            sys.exit(1)
    elif os.path.exists(key_path):
        creds = service_account.Credentials.from_service_account_file(
            key_path, scopes=["https://www.googleapis.com/auth/drive"],
        )
    else:
        print("Service account key not found. Set SERVICE_ACCOUNT_KEY or SERVICE_ACCOUNT_KEY_PATH.")
        sys.exit(1)

    return build("drive", "v3", credentials=creds, cache_discovery=False)


def mime_to_extension(mime_type: Optional[str]) -> str:
    if not mime_type:
        return ""
    mime_type = mime_type.lower()
    if "jpeg" in mime_type:
        return "jpg"
    if "png" in mime_type:
        return "png"
    if "webp" in mime_type:
        return "webp"
    if "gif" in mime_type:
        return "gif"
    if "mp4" in mime_type:
        return "mp4"
    if "quicktime" in mime_type:
        return "mov"
    return ""


def upload_to_drive(
    drive,
    folder_id: str,
    media_url: str,
    file_name_base: str,
    mime_hint: Optional[str] = None,
) -> Tuple[str, str, Optional[str]]:
    response = requests.get(media_url, timeout=60)
    response.raise_for_status()

    mime_type = response.headers.get("content-type") or mime_hint or "application/octet-stream"
    extension = mime_to_extension(mime_type)
    file_name = f"{file_name_base}.{extension}" if extension else file_name_base

    media_body = MediaIoBaseUpload(BytesIO(response.content), mimetype=mime_type, resumable=False)
    result = (
        drive.files()
        .create(
            body={"name": file_name, "parents": [folder_id]},
            media_body=media_body,
            fields="id,mimeType,md5Checksum",
            supportsAllDrives=True,
        )
        .execute()
    )

    return (
        result.get("id", ""),
        result.get("mimeType", mime_type),
        result.get("md5Checksum"),
    )


def fetch_business_discovery(
    account_id: str,
    access_token: str,
    graph_version: str,
    target_username: str,
    after_cursor: Optional[str],
    limit: int,
) -> Tuple[Dict[str, str], List[Dict[str, object]], Optional[str]]:
    media_field = f"media.limit({limit})"
    if after_cursor:
        media_field = f"{media_field}.after({after_cursor})"

    fields = (
        f"business_discovery.username({target_username}){{"
        "username,profile_picture_url,"
        f"{media_field}{{"
        "id,caption,media_type,media_url,thumbnail_url,"
        "permalink,timestamp,like_count,comments_count,"
        "children{id,media_type,media_url,thumbnail_url}"
        "}"
        "}"
    )

    url = f"https://graph.facebook.com/{graph_version}/{account_id}"
    response = requests.get(
        url,
        params={"fields": fields, "access_token": access_token},
        timeout=60,
    )
    data = response.json()

    if response.status_code >= 400:
        message = data.get("error", {}).get("message", "Business Discovery request failed")
        raise RuntimeError(message)

    discovery = data.get("business_discovery")
    if not discovery:
        raise RuntimeError(f"No business_discovery data for @{target_username}")

    account = {
        "username": discovery.get("username") or target_username,
        "profile_picture_url": discovery.get("profile_picture_url") or "",
    }

    posts = normalize_posts(discovery.get("media", {}).get("data", []), account)
    next_cursor = discovery.get("media", {}).get("paging", {}).get("cursors", {}).get("after")

    return account, posts, next_cursor


def fetch_own_profile(
    account_id: str,
    access_token: str,
    graph_version: str,
    own_username: str,
) -> Dict[str, str]:
    url = f"https://graph.facebook.com/{graph_version}/{account_id}"
    response = requests.get(
        url,
        params={"fields": "username,profile_picture_url", "access_token": access_token},
        timeout=30,
    )
    data = response.json()

    if response.status_code >= 400:
        message = data.get("error", {}).get("message", "Own account profile request failed")
        raise RuntimeError(message)

    return {
        "username": data.get("username") or own_username,
        "profile_picture_url": data.get("profile_picture_url") or "",
    }


def fetch_own_media_page(
    account_id: str,
    access_token: str,
    graph_version: str,
    account: Dict[str, str],
    after_cursor: Optional[str],
    limit: int,
) -> Tuple[List[Dict[str, object]], Optional[str]]:
    url = f"https://graph.facebook.com/{graph_version}/{account_id}/media"
    params = {
        "fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{id,media_type,media_url,thumbnail_url}",
        "limit": str(limit),
        "access_token": access_token,
    }
    if after_cursor:
        params["after"] = after_cursor

    response = requests.get(url, params=params, timeout=60)
    data = response.json()

    if response.status_code >= 400:
        message = data.get("error", {}).get("message", "Own account media request failed")
        raise RuntimeError(message)

    posts = normalize_posts(data.get("data", []), account)
    next_cursor = data.get("paging", {}).get("cursors", {}).get("after")

    return posts, next_cursor


def normalize_posts(items: Iterable[Dict[str, object]], account: Dict[str, str]) -> List[Dict[str, object]]:
    normalized = []
    for item in items:
        display_url = item.get("media_url") or item.get("thumbnail_url") or ""
        if not display_url:
            continue

        carousel_items = []
        if item.get("media_type") == "CAROUSEL_ALBUM":
            for child in item.get("children", {}).get("data", []) or []:
                child_display = child.get("media_url") or child.get("thumbnail_url")
                if not child_display:
                    continue
                carousel_items.append(
                    {
                        "id": child.get("id"),
                        "media_type": child.get("media_type"),
                        "display_url": child_display,
                    }
                )

        normalized.append(
            {
                "id": item.get("id"),
                "caption": item.get("caption") or "",
                "media_type": item.get("media_type"),
                "display_url": display_url,
                "permalink": item.get("permalink") or "",
                "timestamp": item.get("timestamp") or "",
                "like_count": item.get("like_count") or 0,
                "comments_count": item.get("comments_count") or 0,
                "account": account,
                "carousel_items": carousel_items,
            }
        )

    return normalized


def build_media_records(posts: Iterable[Dict[str, object]]) -> List[Dict[str, object]]:
    records = []
    for post in posts:
        if post.get("media_type") == "CAROUSEL_ALBUM" and post.get("carousel_items"):
            for index, item in enumerate(post.get("carousel_items")):
                records.append(
                    {
                        "id": item.get("id"),
                        "post_id": post.get("id"),
                        "media_type": item.get("media_type"),
                        "display_url": item.get("display_url"),
                        "position": index,
                        "drive_file_id": None,
                        "drive_mime_type": None,
                        "drive_md5": None,
                    }
                )
        else:
            records.append(
                {
                    "id": post.get("id"),
                    "post_id": post.get("id"),
                    "media_type": post.get("media_type"),
                    "display_url": post.get("display_url"),
                    "position": 0,
                    "drive_file_id": None,
                    "drive_mime_type": None,
                    "drive_md5": None,
                }
            )

    return records


def fetch_existing_media(cursor, media_ids: List[str]) -> Dict[str, Dict[str, object]]:
    if not media_ids:
        return {}

    placeholders = ",".join(["%s"] * len(media_ids))
    query = (
        "SELECT id, drive_file_id, drive_mime_type, drive_md5 "
        "FROM feed_instagram_media WHERE id IN (" + placeholders + ")"
    )
    cursor.execute(query, media_ids)
    rows = cursor.fetchall()

    existing = {}
    for row in rows:
        existing[row[0]] = {
            "drive_file_id": row[1],
            "drive_mime_type": row[2],
            "drive_md5": row[3],
        }
    return existing


def upsert_feed_data(
    connection: mysql.connector.MySQLConnection,
    drive,
    posts: List[Dict[str, object]],
) -> None:
    if not posts:
        return

    cursor = connection.cursor()

    accounts = {}
    for post in posts:
        account = post["account"]
        accounts[account["username"]] = account

    for account in accounts.values():
        cursor.execute(
            "INSERT INTO feed_instagram_accounts (username, profile_picture_url, updated_at) "
            "VALUES (%s, %s, CURRENT_TIMESTAMP) "
            "ON DUPLICATE KEY UPDATE profile_picture_url = VALUES(profile_picture_url), updated_at = CURRENT_TIMESTAMP",
            (account["username"], account.get("profile_picture_url") or ""),
        )

    for post in posts:
        timestamp_epoch = parse_timestamp_epoch(post.get("timestamp"))
        cursor.execute(
            "INSERT INTO feed_instagram_posts "
            "(id, account_username, caption, media_type, display_url, permalink, timestamp, timestamp_epoch, like_count, comments_count, created_at, updated_at) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) "
            "ON DUPLICATE KEY UPDATE "
            "account_username = VALUES(account_username), caption = VALUES(caption), media_type = VALUES(media_type), "
            "display_url = VALUES(display_url), permalink = VALUES(permalink), timestamp = VALUES(timestamp), "
            "timestamp_epoch = VALUES(timestamp_epoch), like_count = VALUES(like_count), comments_count = VALUES(comments_count), "
            "updated_at = CURRENT_TIMESTAMP",
            (
                post.get("id"),
                post["account"]["username"],
                post.get("caption") or "",
                post.get("media_type"),
                post.get("display_url"),
                post.get("permalink"),
                post.get("timestamp"),
                timestamp_epoch,
                post.get("like_count") or 0,
                post.get("comments_count") or 0,
            ),
        )

    media_records = build_media_records(posts)
    media_ids = [record["id"] for record in media_records if record.get("id")]
    existing_media = fetch_existing_media(cursor, media_ids)

    drive_enabled = os.getenv("IS_FEED_IMAGE_DRIVE_STORAGE_ENABLED") == "true"
    allow_videos = os.getenv("IS_FEED_VIDEO_DRIVE_STORAGE_ENABLED") == "true"
    folder_id = os.getenv("FEED_IG_MEDIA_FOLDER_ID") or ""

    if drive_enabled and not folder_id:
        print("FEED_IG_MEDIA_FOLDER_ID is required for Drive uploads.")
        sys.exit(1)

    if drive_enabled and drive:
        for record in media_records:
            media_id = record.get("id")
            if not media_id:
                continue
            media_url = record.get("display_url")
            if not media_url:
                continue
            existing = existing_media.get(media_id)
            if existing and existing.get("drive_file_id"):
                continue
            if record.get("media_type") == "VIDEO" and not allow_videos:
                continue

            try:
                drive_file_id, drive_mime, drive_md5 = upload_to_drive(
                    drive,
                    folder_id,
                    media_url,
                    media_id,
                )
                record["drive_file_id"] = drive_file_id
                record["drive_mime_type"] = drive_mime
                record["drive_md5"] = drive_md5
            except Exception as error:
                print(f"Failed to upload media {media_id}: {error}")

    for record in media_records:
        cursor.execute(
            "INSERT INTO feed_instagram_media "
            "(id, post_id, media_type, display_url, position, drive_file_id, drive_mime_type, drive_md5, created_at, updated_at) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) "
            "ON DUPLICATE KEY UPDATE "
            "post_id = VALUES(post_id), media_type = VALUES(media_type), display_url = VALUES(display_url), position = VALUES(position), "
            "drive_file_id = COALESCE(VALUES(drive_file_id), drive_file_id), "
            "drive_mime_type = COALESCE(VALUES(drive_mime_type), drive_mime_type), "
            "drive_md5 = COALESCE(VALUES(drive_md5), drive_md5), "
            "updated_at = CURRENT_TIMESTAMP",
            (
                record.get("id"),
                record.get("post_id"),
                record.get("media_type"),
                record.get("display_url"),
                record.get("position"),
                record.get("drive_file_id"),
                record.get("drive_mime_type"),
                record.get("drive_md5"),
            ),
        )

    connection.commit()
    cursor.close()


def backfill_account(
    connection: mysql.connector.MySQLConnection,
    drive,
    config: Dict[str, object],
    username: str,
) -> None:
    account_id = config["account_id"]
    access_token = config["access_token"]
    graph_version = config["graph_version"]
    own_username = config["own_username"]
    page_limit = config["page_limit"]
    delay_seconds = config["delay_seconds"]

    after_cursor = None
    page = 0

    if own_username and username == own_username:
        account = fetch_own_profile(account_id, access_token, graph_version, username)
        while True:
            page += 1
            posts, next_cursor = fetch_own_media_page(
                account_id,
                access_token,
                graph_version,
                account,
                after_cursor,
                page_limit,
            )
            if not posts:
                break

            upsert_feed_data(connection, drive, posts)
            print(f"@{username} page {page}: {len(posts)} posts")

            if not next_cursor:
                break
            after_cursor = next_cursor
            if delay_seconds:
                time.sleep(delay_seconds)
        return

    while True:
        page += 1
        account, posts, next_cursor = fetch_business_discovery(
            account_id,
            access_token,
            graph_version,
            username,
            after_cursor,
            page_limit,
        )
        if not posts:
            break

        upsert_feed_data(connection, drive, posts)
        print(f"@{username} page {page}: {len(posts)} posts")

        if not next_cursor:
            break
        after_cursor = next_cursor
        if delay_seconds:
            time.sleep(delay_seconds)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Instagram feed backfill")
    parser.add_argument("--usernames", default="", help="Comma-separated list of usernames")
    parser.add_argument("--limit", type=int, default=None, help="Page size (default 5)")
    parser.add_argument("--delay", type=float, default=None, help="Delay between pages in seconds")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = load_config(args)

    connection = create_db_connection()
    drive = get_drive_client()

    print("Starting Instagram backfill...")
    for username in config["usernames"]:
        print(f"Backfill @{username}")
        try:
            backfill_account(connection, drive, config, username)
        except Exception as error:
            print(f"Backfill failed for @{username}: {error}")

    connection.close()
    print("Backfill complete.")


if __name__ == "__main__":
    main()
