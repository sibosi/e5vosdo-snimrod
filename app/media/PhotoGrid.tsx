"use client";
import React, { useState, useEffect } from "react";
import { gapi } from "gapi-script";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

// Component to handle authenticated image loading
const AuthenticatedImage = ({
  fileId,
  fileName,
  authInstance,
}: {
  fileId: string;
  fileName: string;
  authInstance: any;
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!authInstance?.isSignedIn?.get()) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const accessToken = authInstance.currentUser
          .get()
          .getAuthResponse().access_token;
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImageSrc(imageUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup function to revoke object URL
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [fileId, authInstance]);

  if (loading) {
    return (
      <div className="flex h-[100px] w-[100px] items-center justify-center bg-gray-200 text-sm text-gray-500">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className="flex h-[100px] w-[100px] items-center justify-center bg-red-100 text-sm text-red-500">
        <p>Failed to load</p>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={fileName}
      width={100}
      height={100}
      className="inset-0"
    />
  );
};

const PhotoGrid = ({
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
  GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_API_KEY,
}: {
  NEXT_PUBLIC_MEDIA_FOLDER_ID: string;
  GOOGLE_CLIENT_ID: string;
  NEXT_PUBLIC_GOOGLE_API_KEY: string;
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authInstance, setAuthInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  console.log("Google Client ID:", GOOGLE_CLIENT_ID);
  console.log("Media Folder ID:", NEXT_PUBLIC_MEDIA_FOLDER_ID);
  console.log(
    "Current origin:",
    typeof window !== "undefined" ? window.location.origin : "SSR",
  );
  console.log(
    "Current hostname:",
    typeof window !== "undefined" ? window.location.hostname : "SSR",
  );
  console.log(
    "Current protocol:",
    typeof window !== "undefined" ? window.location.protocol : "SSR",
  );
  console.log(
    "Current port:",
    typeof window !== "undefined" ? window.location.port : "SSR",
  );

  useEffect(() => {
    let isMounted = true;

    const initializeGoogleAPI = async () => {
      try {
        // Prevent multiple initializations
        if (!isMounted) return;

        await new Promise((resolve) => {
          gapi.load("auth2:client", resolve);
        });

        if (!isMounted) return;

        // Check if auth2 is already initialized
        let auth2;
        try {
          auth2 = gapi.auth2.getAuthInstance();
          if (!auth2?.isSignedIn) {
            // Sign out any existing session first to clean state
            if (auth2) {
              await auth2.signOut();
            }
            auth2 = await gapi.auth2.init({
              client_id: GOOGLE_CLIENT_ID,
              scope: "https://www.googleapis.com/auth/drive.readonly",
            });
          }
        } catch (initError) {
          console.log(
            "Auth instance not found, initializing new one:",
            initError,
          );
          // If getAuthInstance fails, try to initialize
          auth2 = await gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly",
          });
        }

        if (!isMounted) return;

        await gapi.client.init({
          apiKey: NEXT_PUBLIC_GOOGLE_API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        });

        if (!isMounted) return;

        setAuthInstance(auth2);
        setIsSignedIn(auth2.isSignedIn.get());
        setLoading(false);

        // Listen for sign-in state changes
        auth2.isSignedIn.listen((signedIn: boolean) => {
          if (isMounted) {
            setIsSignedIn(signedIn);
          }
        });

        // If already signed in, load files
        if (auth2.isSignedIn.get()) {
          await loadFiles();
        }
      } catch (error: any) {
        console.error("Failed to initialize Google API:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details || "No details available",
          error: error.error || "No error code",
          stack: error.stack,
        });
        if (isMounted) {
          setError(
            `Failed to initialize Google API: ${error.message || error}`,
          );
          setLoading(false);
        }
      }
    };

    initializeGoogleAPI();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const loadFiles = async () => {
    try {
      setError("");
      const response = await gapi.client.drive.files.list({
        q: `'${NEXT_PUBLIC_MEDIA_FOLDER_ID}' in parents and trashed=false`,
        fields: "files(id,name,mimeType)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      console.log("Google Drive API response:", response);
      const imageFiles =
        response.result.files?.filter((f: any) =>
          f.mimeType?.startsWith("image/"),
        ) || [];
      setFiles(imageFiles);
    } catch (error: any) {
      console.error("Google Drive API error:", error);
      setError(`Failed to load files: ${error.message}`);
    }
  };

  const signIn = async () => {
    try {
      console.log("Attempting to sign in...");
      if (authInstance) {
        console.log("Auth instance available, calling signIn()");
        const result = await authInstance.signIn();
        console.log("Sign in result:", result);
        await loadFiles();
      } else {
        console.error("No auth instance available");
        setError("Authentication not initialized. Please reload the page.");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      console.error("Sign in error details:", {
        message: error.message,
        details: error.details || "No details available",
        error: error.error || "No error code",
      });
      setError(`Sign in failed: ${error.message || error}`);
    }
  };

  const signOut = () => {
    if (authInstance) {
      authInstance.signOut();
      setFiles([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading Google API...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 rounded border border-red-400 bg-red-100 p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 p-4">
          <h3 className="font-bold text-yellow-800">
            OAuth Configuration Info
          </h3>
          <p>
            <strong>Current Origin:</strong>{" "}
            {typeof window !== "undefined"
              ? window.location.origin
              : "Loading..."}
          </p>
          <p>
            <strong>Client ID:</strong> {GOOGLE_CLIENT_ID}
          </p>
          <p>
            <strong>Expected Origins for this Client ID:</strong>
          </p>
          <ul className="ml-6 list-disc text-sm">
            <li>http://local.e5vos.hu:3000</li>
            <li>https://e5vosdo.hu</li>
            <li>
              https://humble-space-parakeet-qxgp4jj4xgxhx94w-3000.app.github.dev
            </li>
          </ul>
          <p className="mt-2 text-sm text-yellow-700">
            <strong>Important:</strong> If you see "origin not allowed" errors,
            the current origin needs to be added to your Google OAuth client
            settings in the Google Cloud Console.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={signIn}
            className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Google to view photos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Photo Gallery</h1>
        <button
          onClick={signOut}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Sign Out
        </button>
      </div>

      {files.length === 0 ? (
        <div className="p-8 text-center">
          <p>No images found in the media folder.</p>
          <button
            onClick={loadFiles}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {files.map((f) => (
            <AuthenticatedImage
              key={f.id}
              fileId={f.id}
              fileName={f.name}
              authInstance={authInstance}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
