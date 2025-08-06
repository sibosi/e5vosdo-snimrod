"use client";
import React, { useState } from "react";
import {
  GoogleLogin,
  googleLogout,
  CredentialResponse,
} from "@react-oauth/google";
import Image from "next/image";
import { gapi } from "gapi-script";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

const PhotoGrid = ({
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
  NEXT_PUBLIC_GOOGLE_API_KEY,
}: {
  NEXT_PUBLIC_MEDIA_FOLDER_ID: string;
  NEXT_PUBLIC_GOOGLE_API_KEY: string;
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [token, setToken] = useState<string>();

  console.log("Environment:", process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
  console.log("Media Folder ID:", process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID);
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
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        })
        .then(() => {
          console.log("Google API client initialized successfully");
          gapi.client.setToken({ access_token: accessToken });
          console.log("Token set successfully");
          // Listázás
          return gapi.client.drive.files.list({
            q: `'${process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID}' in parents and trashed=false`,
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
    console.log("Credential type:", typeof credentialResponse.credential);
    console.log(
      "Full credential response:",
      JSON.stringify(credentialResponse, null, 2),
    );

    const accessToken = credentialResponse.credential!; // JWT, de gapi.client.setToken elvégzi a munkát
    setToken(accessToken);
    initClient(accessToken);
    alert("Login Successful");
  };

  if (!token) {
    return (
      <div>
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
            <li>
              https://humble-space-parakeet-qxgp4jj4xgxhx94w-3000.app.github.dev
            </li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            If you see a "origin not allowed" error, add the current origin
            above to your Google OAuth client settings.
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
            <Image src={url} alt={f.name!} fill className="object-cover" />
          </div>
        );
      })}
    </div>
  );
};

export default PhotoGrid;
