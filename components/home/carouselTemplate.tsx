"use client";
import React, { useState } from "react";

const idk = [
  "/groups/bimun.jpg",
  "/groups/debate.png",
  "/groups/diak.jpg",
  "/groups/FLC.jpg",
  "/groups/FLC.jpg",
  "/groups/FLC.jpg",
];

const sampleData = idk.map((uri, index) => ({
  id: index,
  uri,
}));

const LARGE_IMAGE_WIDTH = window.innerWidth * 0.5;
const MEDIUM_IMAGE_WIDTH = LARGE_IMAGE_WIDTH * 0.5;
const SMALL_IMAGE_WIDTH = MEDIUM_IMAGE_WIDTH * 0.5;

const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
) => {
  const inputStart = inputRange[0];
  const inputEnd = inputRange[inputRange.length - 1];

  // Ha a value kívül esik az inputRange-en, akkor visszatér a legközelebbi outputRange értékkel.
  if (value <= inputStart) return outputRange[0];
  if (value >= inputEnd) return outputRange[outputRange.length - 1];

  // Kiszámítja az indexet a bemeneti tartományban.
  const index = inputRange.findIndex((val) => val > value) - 1;

  // Kiszámítja az interpolált értéket.
  const ratio =
    (value - inputRange[index]) / (inputRange[index + 1] - inputRange[index]);
  return (
    outputRange[index] + ratio * (outputRange[index + 1] - outputRange[index])
  );
};

const CarouselItem = ({
  uri,
  scrollX,
  index,
  dataLength,
}: {
  uri: string;
  scrollX: number;
  index: number;
  dataLength: number;
}) => {
  const inputRange = [
    (index - 2) * SMALL_IMAGE_WIDTH,
    (index - 1) * SMALL_IMAGE_WIDTH,
    index * SMALL_IMAGE_WIDTH,
    (index + 1) * SMALL_IMAGE_WIDTH,
  ];

  const isLastItem = dataLength === index + 1;
  const isSecondLastItem = dataLength === index + 2;

  const getOutputRange = () => {
    if (isLastItem) {
      return [
        SMALL_IMAGE_WIDTH,
        LARGE_IMAGE_WIDTH,
        LARGE_IMAGE_WIDTH,
        LARGE_IMAGE_WIDTH,
      ];
    } else if (isSecondLastItem) {
      return [
        SMALL_IMAGE_WIDTH,
        LARGE_IMAGE_WIDTH,
        MEDIUM_IMAGE_WIDTH,
        MEDIUM_IMAGE_WIDTH,
      ];
    } else {
      return [
        SMALL_IMAGE_WIDTH,
        MEDIUM_IMAGE_WIDTH,
        LARGE_IMAGE_WIDTH,
        SMALL_IMAGE_WIDTH,
      ];
    }
  };

  const outputRange = getOutputRange();

  const animatedWidth = interpolate(scrollX, inputRange, outputRange);

  return (
    <div
      style={{
        backgroundImage: `url(${uri})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: animatedWidth,
        marginRight: 8,
        borderRadius: 20,
        height: 150,
        minHeight: 150,
        minWidth: animatedWidth,
      }}
    />
  );
};

export default function Carousel() {
  const [scrollX, setScrollX] = useState(0);

  const onScroll = (e: any) => {
    setScrollX(e.target.scrollLeft);
  };

  return (
    <div style={{ padding: "16px" }}>
      <div
        onScroll={onScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollBehavior: "smooth",
        }}
      >
        {sampleData.map((item: any, index: number) => (
          <CarouselItem
            key={item.id.toString()}
            uri={item.uri}
            scrollX={scrollX}
            index={index}
            dataLength={sampleData.length}
          />
        ))}
      </div>
    </div>
  );
}
