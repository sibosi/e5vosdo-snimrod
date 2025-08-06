"use client";
import dynamic from "next/dynamic";

const PhotoGrid = dynamic(() => import("./PhotoGrid"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const PhotoGridWrapper = ({
  NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
}: {
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
  NEXT_PUBLIC_MEDIA_FOLDER_ID: string;
}) => {
  return (
    <PhotoGrid
      NEXT_PUBLIC_GOOGLE_CLIENT_ID={NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      NEXT_PUBLIC_MEDIA_FOLDER_ID={NEXT_PUBLIC_MEDIA_FOLDER_ID}
    />
  );
};

export default PhotoGridWrapper;
