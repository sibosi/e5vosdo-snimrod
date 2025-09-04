/**
 * Debug utility for camera functionality
 * Add this to any page to get detailed camera debugging info
 */

export function debugCamera() {
  console.log("=== Camera Debug Info ===");

  // Check if getUserMedia is available
  try {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      console.log("✅ getUserMedia is available");
    } else {
      console.log("❌ getUserMedia is NOT available");
      return;
    }
  } catch (error) {
    console.log("❌ Error checking getUserMedia:", error);
    return;
  }

  // List available video devices
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      console.log(`📹 Found ${videoDevices.length} video devices:`);
      videoDevices.forEach((device, index) => {
        const deviceLabel = device.label || "Camera " + (index + 1);
        console.log(
          "  " +
            (index + 1) +
            ". " +
            deviceLabel +
            " (" +
            device.deviceId +
            ")",
        );
      });
    })
    .catch((err) => {
      console.error("Failed to enumerate devices:", err);
    });

  // Test different video constraints
  const testConstraints = [
    { video: true },
    { video: { facingMode: "environment" } },
    { video: { facingMode: "user" } },
    { video: { width: 640, height: 480 } },
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
  ];

  testConstraints.forEach((constraints, index) => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        console.log(`✅ Test ${index + 1} successful:`, constraints);

        const track = stream.getVideoTracks()[0];
        if (track) {
          const settings = track.getSettings();
          console.log(`   Settings:`, settings);
        }

        // Stop the stream immediately
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        console.log(
          `❌ Test ${index + 1} failed:`,
          constraints,
          err.name,
          err.message,
        );
      });
  });

  // Check permissions
  if ("permissions" in navigator) {
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((permission) => {
        console.log(`📋 Camera permission: ${permission.state}`);
      })
      .catch(() => {
        console.log("📋 Camera permission query not supported");
      });
  }
}

// Auto-run if in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log(
    "Camera debug utility loaded. Call debugCamera() to run diagnostics.",
  );
}
