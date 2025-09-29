"use client";
import dynamic from "next/dynamic";

const PhotoGrid = dynamic(() => import("./PhotoGrid"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div>Loading photo gallery...</div>
    </div>
  ),
});

const PhotoGridWrapper = ({
  GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
  NEXT_PUBLIC_GOOGLE_API_KEY,
  TARGET_PX_SIZE,
}: {
  GOOGLE_CLIENT_ID: string;
  NEXT_PUBLIC_MEDIA_FOLDER_ID: string;
  NEXT_PUBLIC_GOOGLE_API_KEY: string;
  TARGET_PX_SIZE: number;
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <PhotoGrid
        GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}
        NEXT_PUBLIC_MEDIA_FOLDER_ID={NEXT_PUBLIC_MEDIA_FOLDER_ID}
        NEXT_PUBLIC_GOOGLE_API_KEY={NEXT_PUBLIC_GOOGLE_API_KEY}
        TARGET_PX_SIZE={TARGET_PX_SIZE}
      />
    </div>
  );
};

export default PhotoGridWrapper;
