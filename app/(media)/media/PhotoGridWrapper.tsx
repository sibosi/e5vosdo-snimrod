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
}: {
  GOOGLE_CLIENT_ID: string;
}) => {
  return (
    <div
      className="py-8"
      style={{
        backgroundColor: "black",
      }}
    >
      <PhotoGrid GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID} />
    </div>
  );
};

export default PhotoGridWrapper;
