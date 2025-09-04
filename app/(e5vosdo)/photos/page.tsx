import CameraDisplay from "@/components/camera/CameraDisplay";

export default function PhotosPage() {
  return (
    <div className="container mx-auto py-6">
      <CameraDisplay autoRefresh={true} refreshInterval={30000} />
    </div>
  );
}
