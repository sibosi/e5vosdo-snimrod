"use client";
import React, { useEffect, useState } from "react";

export interface CarouselItemProps {
  title: string | [string, string];
  uri: string;
  description?: string;
}

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

async function fetchCarouselData() {
  return await fetch("/api/getCarousel").then((res) => res.json());
}

const CarouselItem = ({
  uri,
  scrollX,
  index,
  dataLength,
  title,
  onClick,
  className,
  width,
}: {
  uri: string;
  scrollX: number;
  index: number;
  dataLength: number;
  title: string | [string, string];
  onClick?: () => void;
  className?: string;
  width?: number | string;
}) => {
  const [largeImageWidth, setLargeImageWidth] = useState(100);
  const titleLines = Array.isArray(title) ? title : title.split("\n");

  useEffect(() => {
    setLargeImageWidth(window.innerWidth * 0.5);
  }, []);

  const MEDIUM_IMAGE_WIDTH = largeImageWidth * 0.5;
  const SMALL_IMAGE_WIDTH = MEDIUM_IMAGE_WIDTH * 0.8; // 0.5

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
        largeImageWidth,
        largeImageWidth,
        largeImageWidth,
      ];
    } else if (isSecondLastItem) {
      return [
        SMALL_IMAGE_WIDTH,
        MEDIUM_IMAGE_WIDTH,
        largeImageWidth,
        MEDIUM_IMAGE_WIDTH,
      ];
    } else {
      return [
        SMALL_IMAGE_WIDTH,
        MEDIUM_IMAGE_WIDTH,
        largeImageWidth,
        SMALL_IMAGE_WIDTH,
      ];
    }
  };

  const outputRange = getOutputRange();

  const animatedWidth = interpolate(scrollX, inputRange, outputRange);

  return (
    <button
      className={"overflow-hidden " + (className ?? "")}
      style={{
        backgroundImage: `url(${uri})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: width ?? animatedWidth,
        marginRight: 8,
        borderRadius: 20,
        height: 150,
        minHeight: 150,
        minWidth: width ?? animatedWidth,
      }}
      onClick={onClick}
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.8))",
          backdropFilter: "blur(0px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "left",
        }}
      >
        <div className="fixed bottom-0 m-1 text-base font-semibold text-slate-200">
          {Array.isArray(titleLines) ? (
            <>
              {titleLines.map((row) => (
                <p className="mx-1 max-w-fit whitespace-nowrap" key={row}>
                  {row}
                </p>
              ))}
            </>
          ) : (
            <p className="mx-1">{title}</p>
          )}
        </div>
      </div>
    </button>
  );
};

export default function Carousel({
  data,
}: Readonly<{ data: CarouselItemProps[] }>) {
  const [scrollX, setScrollX] = useState(0);
  const [clicked, setClicked] = useState<number | null>(null);
  const [realData, setRealData] = useState<CarouselItemProps[]>(data);

  const onScroll = (e: any) => {
    setScrollX(e.target.scrollLeft * 0.1);
  };

  useEffect(() => {
    (async () => {
      const carouselData = await fetchCarouselData();
      setRealData(carouselData);
    })();
  }, []);

  return (
    <div className="mb-2 p-0 transition-all">
      <div
        onScroll={onScroll}
        className="flex overflow-x-auto scrollbar-default"
        style={{
          scrollBehavior: "smooth",
          scrollSnapType: "x",
        }}
      >
        {realData.map((item, index: number) => (
          <CarouselItem
            key={index.toString()}
            uri={item.uri}
            scrollX={scrollX * 10}
            index={index}
            dataLength={realData.length}
            title={item.title}
            onClick={() => {
              realData[index].description?.startsWith("http")
                ? (window.location.href = realData[index].description)
                : setClicked(clicked === index ? null : index);
            }}
            width={clicked === index ? "95%" : undefined}
            className={
              clicked == null || clicked === index ? "mx-auto" : "hidden"
            }
          />
        ))}
        {clicked !== null ? null : ( // description
          <div className="min-w-unit-24" />
        )}
      </div>
      {clicked !== null && (
        <div
          className="blocked mt-2 whitespace-pre-wrap bg-selfprimary-50 p-4 text-foreground"
          style={{
            borderRadius: 20,
          }}
        >
          {realData[clicked].description}
        </div>
      )}
    </div>
  );
}