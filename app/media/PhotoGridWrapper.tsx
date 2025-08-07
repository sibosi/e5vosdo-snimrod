"use client";
import dynamic from "next/dynamic";

const PhotoGrid = dynamic(() => import("./PhotoGrid"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const PhotoGridWrapper = ({
  GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
  NEXT_PUBLIC_GOOGLE_API_KEY,
}: {
  GOOGLE_CLIENT_ID: string;
  NEXT_PUBLIC_MEDIA_FOLDER_ID: string;
  NEXT_PUBLIC_GOOGLE_API_KEY: string;
}) => {
  return (
    <PhotoGrid
      GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}
      NEXT_PUBLIC_MEDIA_FOLDER_ID={NEXT_PUBLIC_MEDIA_FOLDER_ID}
      NEXT_PUBLIC_GOOGLE_API_KEY={NEXT_PUBLIC_GOOGLE_API_KEY}
    />
  );
};

export default PhotoGridWrapper;
