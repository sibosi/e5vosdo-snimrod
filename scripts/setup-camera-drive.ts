/**
 * Script to help setup Google Drive folder for camera photos
 * This script helps you find or create the Drive folder and get its ID
 */

import { getDriveClient } from "../db/autobackup";

async function setupCameraPhotosFolder() {
  try {
    const drive = getDriveClient();

    // Search for existing "Camera Photos" folder
    console.log("Searching for existing 'Camera Photos' folder...");

    const searchResponse = await drive.files.list({
      q: "name='Camera Photos' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name, webViewLink)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    let folderId: string;

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      // Folder exists
      const folder = searchResponse.data.files[0];
      folderId = folder.id!;
      console.log(`✅ Found existing folder: ${folder.name}`);
      console.log(`📂 Folder ID: ${folderId}`);
      console.log(`🔗 Folder URL: ${folder.webViewLink}`);
    } else {
      // Create new folder
      console.log("📁 Creating new 'Camera Photos' folder...");

      const createResponse = await drive.files.create({
        requestBody: {
          name: "Camera Photos",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id, name, webViewLink",
        supportsAllDrives: true,
      });

      folderId = createResponse.data.id!;
      console.log(`✅ Created new folder: ${createResponse.data.name}`);
      console.log(`📂 Folder ID: ${folderId}`);
      console.log(`🔗 Folder URL: ${createResponse.data.webViewLink}`);
    }

    // Test permissions by listing contents
    console.log("\n🔍 Testing folder access...");
    const listResponse = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    console.log(
      `✅ Folder access test successful! Contains ${listResponse.data.files?.length || 0} files.`,
    );

    console.log(`\n📝 Add this to your .env file:`);
    console.log(`CAMERA_PHOTOS_DRIVE_FOLDER_ID=${folderId}`);

    return folderId;
  } catch (error) {
    console.error("❌ Error setting up camera photos folder:", error);

    if (error instanceof Error) {
      if (error.message.includes("SERVICE_ACCOUNT_KEY")) {
        console.log(
          "\n💡 Make sure you have set up the Google Service Account credentials:",
        );
        console.log(
          "   - SERVICE_ACCOUNT_KEY (base64 encoded JSON or inline JSON)",
        );
        console.log("   - or SERVICE_ACCOUNT_KEY_PATH (path to JSON file)");
      }
    }

    throw error;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupCameraPhotosFolder()
    .then((folderId) => {
      console.log(`\n🎉 Setup complete! Folder ID: ${folderId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}

export { setupCameraPhotosFolder };
