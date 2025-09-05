"use client";
import dynamic from "next/dynamic";

const RunClientSide = dynamic(() => import("./runClientSide"), {
  ssr: false,
});

export default RunClientSide;
