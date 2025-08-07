"use client";
import React, { useState } from "react";
import {
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import Image from "next/image";
import { gapi } from "gapi-script";
import { GoogleOAuthLogin } from "./GoogleOAuthLogin";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

const PhotoGrid = ({
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
  GOOGLE_CLIENT_ID,
}: {
  NEXT_PUBLIC_MEDIA_FOLDER_ID: string;
  GOOGLE_CLIENT_ID: string;
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [token, setToken] = useState<string>();

  console.log("Google Client ID:", GOOGLE_CLIENT_ID);
  console.log("Media Folder ID:", NEXT_PUBLIC_MEDIA_FOLDER_ID);
  console.log("Current origin:", window.location.origin);
  console.log("Current hostname:", window.location.hostname);
  console.log("Current protocol:", window.location.protocol);
  console.log("Current port:", window.location.port);

  const initClient = (accessToken: string) => {
    console.log(
      "Initializing Google API client with token:",
      accessToken.substring(0, 20) + "...",
    );
    gapi.load("client", () => {
      gapi.client
        .init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        })
        .then(() => {
          console.log("Google API client initialized successfully");
          gapi.client.setToken({ access_token: accessToken });
          console.log("Token set successfully");
          return gapi.client.drive.files.list({
            q: `'${NEXT_PUBLIC_MEDIA_FOLDER_ID}' in parents and trashed=false`,
            fields: "files(id,name,mimeType)",
            pageSize: 100,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          });
        })
        .then((resp: any) => {
          console.log("Google Drive API response:", resp);
          setFiles(
            resp.result.files!.filter((f: any) =>
              f.mimeType!.startsWith("image/"),
            ),
          );
        })
        .catch((error: any) => {
          console.error("Google Drive API error:", error);
          alert(`API Error: ${error.message || error}`);
        })
        .catch((initError: any) => {
          console.error("Google API client initialization error:", initError);
          alert(`Initialization Error: ${initError.message || initError}`);
        });
    });
  };

  const onSuccess = (credentialResponse: CredentialResponse) => {
    console.log("Google Login Success:", credentialResponse);

    // For Google Drive API access, we need to use the OAuth flow to get an access token
    // The credential from GoogleLogin is a JWT ID token, not an access token
    console.log("Starting OAuth flow for Drive API access...");

    // Request additional scopes for Drive API
    gapi.load("auth2", () => {
      gapi.auth2
        .init({
          client_id: GOOGLE_CLIENT_ID,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          return authInstance.signIn({
            scope: "https://www.googleapis.com/auth/drive.readonly",
          });
        })
        .then((googleUser: any) => {
          const accessToken = googleUser.getAuthResponse().access_token;
          console.log("Got access token for Drive API");
          setToken(accessToken);
          initClient(accessToken);
        })
        .catch((error: any) => {
          console.error("OAuth error:", error);
          alert(`OAuth Error: ${error.message || error}`);
        });
    });
  };

  if (!token) {
    return (
      <div>
        <GoogleOAuthLogin NEXT_PUBLIC_GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID} />
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 p-4">
          <p>
            <strong>Current Origin:</strong>{" "}
            {typeof window !== "undefined"
              ? window.location.origin
              : "Loading..."}
          </p>
          <p>
            <strong>Expected Origins:</strong>
          </p>
          <ul className="ml-6 list-disc">
            <li>http://local.e5vos.hu:3000</li>
            <li>https://e5vosdo.hu</li>
            <li>
              https://humble-space-parakeet-qxgp4jj4xgxhx94w-3000.app.github.dev
            </li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            If you see a "client ID not found" error, make sure you have set up
            a Google OAuth client ID (not API key) and added the current origin
            above to your OAuth client settings.
          </p>
        </div>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => alert("Login Failed")}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {files.map((f) => {
        const url = `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&supportsAllDrives=true`;
        return (
          <div key={f.id} className="relative h-0 w-full pb-[100%]">
            <Image src={url} alt={f.name} fill className="object-cover" />
          </div>
        );
      })}
    </div>
  );
};

export default PhotoGrid;
