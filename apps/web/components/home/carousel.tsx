"use client";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { UserType } from "@/apps/web/db/dbreq";
import { EventType } from "@/apps/web/db/event";
import Link from "next/link";

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
  const resp = await fetch("/api/getCarouselEvents", {
    headers: { module: "event" },
  });
  const data = (await resp.json()) as EventType[];
  // filter out the events that are at least 24 hours old
  const now = new Date();
  const filteredData = data.filter((event) => {
    const eventDate = new Date(event.time);
    const diff = eventDate.getTime() - now.getTime();
    return diff > 0;
  });
  return filteredData.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
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
  title: string | string[];
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
        MEDIUM_IMAGE_WIDTH,
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
        borderRadius: 24,
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
        <div className="fixed bottom-0 m-1.5">
          {Array.isArray(titleLines) ? (
            <>
              {titleLines.map((row) => (
                <p
                  className="mx-1 max-w-fit whitespace-nowrap text-base font-semibold text-slate-200"
                  key={row}
                >
                  {row}
                </p>
              ))}
            </>
          ) : (
            <p className="mx-1 text-base font-semibold text-slate-200">
              {title}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default function Carousel({
  data,
  selfUser,
}: Readonly<{ data: EventType[]; selfUser: UserType }>) {
  const [scrollX, setScrollX] = useState(0);
  const [clicked, setClicked] = useState<number | null>(null);
  const [realData, setRealData] = useState<EventType[]>(data);

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
      <div className={clicked === null ? "flex" : ""}>
        {clicked === null && realData.length > 1 && (
          <button
            className="bottom-0 top-0 z-10 my-auto -mr-10 ml-2 h-8 w-8 rounded-full bg-selfprimary-50 p-1 text-selfprimary-700 max-md:hidden"
            title="Vissza"
            onClick={() => {
              document.querySelector(".scroll-smooth")?.scrollBy(-200, 0);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="m-auto h-6 w-6 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
        <div
          onScroll={onScroll}
          className="flex snap-x overflow-x-auto scroll-smooth scrollbar-hide"
        >
          {realData?.map((item, index: number) => (
            <CarouselItem
              key={index.toString()}
              uri={item.image ?? ""}
              scrollX={scrollX * 10}
              index={index}
              dataLength={realData.length}
              title={item.title}
              onClick={() => {
                if (
                  realData[index].description?.startsWith("http") ||
                  realData[index].description?.startsWith("/")
                )
                  window.location.href = realData[index].description;
                else setClicked(clicked === index ? null : index);
              }}
              width={clicked === index ? "95%" : undefined}
              className={
                clicked == null || clicked === index ? "mx-auto" : "hidden"
              }
            />
          ))}
          {clicked !== null ? (
            <></>
          ) : (
            <Link
              title="add item"
              href="/creator/"
              className="flex w-full min-w-52 content-around gap-2 rounded-3xl bg-selfprimary-100 p-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="m-auto h-6 w-6 text-selfprimary-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={4}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {realData && realData.length == 0 && (
                <span>Esemény feltöltése</span>
              )}
            </Link>
          )}
        </div>
        {clicked === null && realData.length > 1 && (
          <button
            className="bottom-0 top-0 z-10 my-auto -ml-10 mr-2 h-8 w-8 rounded-full bg-selfprimary-50 p-1 text-selfprimary-700 max-md:hidden"
            title="Tovább"
            onClick={() => {
              document.querySelector(".scroll-smooth")?.scrollBy(200, 0);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="m-auto h-6 w-6 -rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>
      {clicked !== null && (
        <div className="blocked mt-2 whitespace-pre-wrap rounded-3xl bg-selfprimary-50 p-4 text-foreground">
          {<span>{parse(String(realData[clicked].description))}</span>}
        </div>
      )}
    </div>
  );
}
