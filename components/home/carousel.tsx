"use client";
import React, { useEffect, useState, useRef } from "react";
import parse from "html-react-parser";
import { EventType } from "@/db/event";
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
  const titleLines = Array.isArray(title) ? title : title.split(String.raw`\n`);

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

function PhoneCarousel({ data }: Readonly<{ data: EventType[] }>) {
  const [scrollX, setScrollX] = useState(0);
  const [clicked, setClicked] = useState<number | null>(null);

  const onScroll = (e: any) => {
    setScrollX(e.target.scrollLeft * 0.1);
  };

  return (
    <div className="mb-2 p-0 transition-all">
      <div className={clicked === null ? "flex" : ""}>
        {clicked === null && data.length > 1 && (
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
          {data?.map((item, index: number) => (
            <CarouselItem
              key={index.toString()}
              uri={item.image ?? ""}
              scrollX={scrollX * 10}
              index={index}
              dataLength={data.length}
              title={item.title}
              onClick={() => {
                if (
                  data[index].description?.startsWith("http") ||
                  data[index].description?.startsWith("/")
                )
                  window.location.href = data[index].description.split("\n")[0];
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
              {data && data.length == 0 && <span>Esemény feltöltése</span>}
            </Link>
          )}
        </div>
        {clicked === null && data.length > 1 && (
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
          {<span>{parse(String(data[clicked].description))}</span>}
        </div>
      )}
    </div>
  );
}

function DesktopCarousel({ data }: Readonly<{ data: EventType[] }>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Map<string, string>>(
    new Map(),
  );
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const preloadImageAsBlob = async (
    src: string,
  ): Promise<{ original: string; objectUrl: string }> => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return { original: src, objectUrl };
    } catch (error) {
      console.error(`Failed to load image: ${src}`, error);
      return { original: src, objectUrl: "" };
    }
  };

  useEffect(() => {
    const loadCarouselData = async () => {
      // Start preloading images
      const imagesToPreload = data
        .map((item) => item.image)
        .filter(Boolean) as string[];

      if (imagesToPreload.length === 0) return;

      setIsImagesLoading(true);
      const imagePromises = imagesToPreload.map(preloadImageAsBlob);

      try {
        const loadedImages = await Promise.allSettled(imagePromises);
        const successfullyLoaded = new Map<string, string>();

        loadedImages.forEach((result) => {
          if (result.status === "fulfilled") {
            successfullyLoaded.set(
              result.value.original,
              result.value.objectUrl,
            );
          }
        });

        setPreloadedImages(successfullyLoaded);
      } catch (error) {
        console.warn("Some images failed to preload:", error);
      } finally {
        setIsImagesLoading(false);
      }
    };

    loadCarouselData();
  }, []);

  useEffect(() => {
    return () => {
      preloadedImages.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
    };
  }, [preloadedImages]);

  useEffect(() => {
    if (!isAutoPlaying || data.length <= 1) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (50 / 5000) * 100; // 5000ms
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === data.length - 1 ? 0 : prevIndex + 1,
      );
      setProgress(0);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [data.length, isAutoPlaying]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    if (!isAutoPlaying) {
      setProgress(0);
    }
  };

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const currentImageSrc = data[currentIndex]?.image;
    if (currentImageSrc && preloadedImages.has(currentImageSrc)) {
      setImageLoaded(true);
    } else {
      setImageLoaded(false);
    }
  }, [currentIndex, preloadedImages, data]);

  if (data.length === 0) {
    return (
      <div className="col-span-2 flex h-80 items-center justify-center rounded-2xl bg-selfprimary-bg">
        <div className="text-center text-white">
          {isImagesLoading ? (
            <>
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
              <span>Képek betöltése...</span>
            </>
          ) : (
            <span>Nincsenek események</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="carousel relative grid h-80 grid-cols-2 overflow-hidden rounded-2xl bg-selfprimary-50">
      <div className="relative h-80 w-full">
        <img
          loading="eager"
          src={
            data[currentIndex]?.image &&
            preloadedImages.has(data[currentIndex].image)
              ? preloadedImages.get(data[currentIndex].image)
              : (data[currentIndex].image ?? "")
          }
          alt={
            typeof data[currentIndex].title === "string"
              ? data[currentIndex].title
              : data[currentIndex].title.join(" ")
          }
          className="h-80 w-full object-cover"
          style={{ display: imageLoaded ? "block" : "none" }}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Progress indicator chips */}
        {data.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
            {data.map((_, index) => (
              <button
                key={index}
                className="relative h-2 w-8 rounded-full bg-black/20"
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
              >
                {/* Static background for non-current chips */}
                {index < currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-white" />
                )}

                {/* Animated progress for current chip */}
                {index === currentIndex && (
                  <div
                    className="absolute inset-0 rounded-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      width: `${isAutoPlaying ? progress : 0}%`,
                    }}
                  />
                )}

                {/* Future chips remain empty (just the background) */}
              </button>
            ))}
          </div>
        )}

        {/* Play/Stop button */}
        {data.length > 1 && (
          <button
            onClick={toggleAutoPlay}
            className="absolute left-2 top-2 rounded-full bg-black/30 p-2 text-white transition-colors duration-200 hover:bg-black/50"
            title={isAutoPlaying ? "Leállítás" : "Indítás"}
          >
            {isAutoPlaying ? (
              // Stop icon
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="4" width="2" height="12" />
                <rect x="12" y="4" width="2" height="12" />
              </svg>
            ) : (
              // Play icon
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div
        className="max-h-80 overflow-auto bg-selfprimary-100 p-4"
        style={{ display: imageLoaded ? "block" : "none" }}
      >
        <h2>{data[currentIndex].title}</h2>
        <p className="mt-2 whitespace-pre-wrap">
          {parse(String(data[currentIndex].description))}
        </p>
      </div>
      {!imageLoaded && (
        <div className="col-span-2 flex h-80 items-center justify-center bg-selfprimary-50">
          <span className="text-white">Betöltés...</span>
        </div>
      )}
    </div>
  );
}

async function fetchCarouselData() {
  const resp = await fetch("/api/getCarouselEvents", {
    headers: { module: "event" },
  });
  const data = (await resp.json()) as EventType[];
  return filterCarouselData(data);
}

function filterCarouselData(data: EventType[]) {
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

export default function Carousel({ data }: Readonly<{ data?: EventType[] }>) {
  const [carouselData, setCarouselData] = useState<EventType[]>(data || []);
  const [windowInnerWidth, setWindowInnerWidth] = useState<number>(1024);

  useEffect(() => {
    if (!data)
      fetchCarouselData().then((fetchedData) => {
        setCarouselData(fetchedData);
      });
  }, [data]);

  useEffect(() => {
    const handleResize = () => setWindowInnerWidth(window.innerWidth);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const uploadContentEvent: EventType = {
    id: 0,
    title: "Esemény feltöltése",
    description:
      'Valamit kihagytunk? <a href="/creator" className="text-selfprimary-800 font-bold">Töltsd fel te!</a>',
    time: new Date().toISOString(),
    image: "/opinion.png",
    show_time: new Date().toISOString(),
    hide_time: new Date().toISOString(),
    tags: [],
  };

  if (windowInnerWidth < 768)
    return <PhoneCarousel data={filterCarouselData(carouselData)} />;
  return (
    <DesktopCarousel
      data={[...filterCarouselData(carouselData), uploadContentEvent]}
    />
  );
}
