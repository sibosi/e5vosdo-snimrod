"use client";
import dynamic from "next/dynamic";

const PhotoGrid = dynamic(() => import("./PhotoGrid"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const PhotoGridWrapper = () => {
  return <PhotoGrid />;
};

export default PhotoGridWrapper;
