CREATE TABLE
  IF NOT EXISTS feed_instagram_accounts (
    username VARCHAR(255) PRIMARY KEY,
    profile_picture_url TEXT,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS feed_instagram_posts (
    id VARCHAR(255) PRIMARY KEY,
    account_username VARCHAR(255) NOT NULL,
    caption TEXT,
    media_type VARCHAR(50) NOT NULL,
    display_url TEXT,
    permalink TEXT, -- URL to the post on Instagram
    timestamp VARCHAR(50),
    timestamp_epoch BIGINT,
    like_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_account_timestamp (account_username, timestamp_epoch),
    KEY idx_timestamp (timestamp_epoch),
    CONSTRAINT fk_feed_instagram_posts_account FOREIGN KEY (account_username) REFERENCES feed_instagram_accounts (username) ON DELETE CASCADE
  );

CREATE TABLE
  IF NOT EXISTS feed_instagram_media (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    display_url TEXT,
    position INT DEFAULT 0, -- Pos in the carousel
    drive_file_id VARCHAR(255) DEFAULT NULL,
    drive_mime_type VARCHAR(100) DEFAULT NULL, -- image/jpeg, video/mp4, etc.
    drive_md5 VARCHAR(64) DEFAULT NULL,
    -- Store the MD5 hash of the media file for integrity checks
    -- drive_md5 is used for cache invalidation. The Drive file ID alone is not sufficient,
    -- because it remains the same even if the file content is overwritten on Drive.
    -- By including the MD5 in the cache path (e.g. /cache/{driveId}-{md5}), we ensure
    -- that any content change results in a new cache entry, preventing stale media from being served.
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_post (post_id),
    KEY idx_drive_file_id (drive_file_id),
    CONSTRAINT fk_feed_instagram_media_post FOREIGN KEY (post_id) REFERENCES feed_instagram_posts (id) ON DELETE CASCADE
  );
