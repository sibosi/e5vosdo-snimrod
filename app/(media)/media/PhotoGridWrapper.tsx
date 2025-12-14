"use client";
import dynamic from "next/dynamic";

const PhotoGrid = dynamic(() => import("./PhotoGrid"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div>Galéria betöltése...</div>
    </div>
  ),
});

const PhotoGridWrapper = () => {
  return (
    <div className="py-8">
      <PhotoGrid />
    </div>
  );
};

export default PhotoGridWrapper;
