"use client";
import Image from "next/image";
import React from "react";

export interface PhotoType {
  id: number;
  url: string;
  title: string;
  width: number;
  height: number;
}

interface MasonryGridProps {
  photos: PhotoType[];
  gap?: number;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ photos, gap = 16 }) => {
  const [expectedImageWidth, setExpectedImageWidth] = React.useState<number>(0);
  const [expectedImageHeights, setExpectedImageHeights] = React.useState<
    number[]
  >([]);
  const [columns, setColumns] = React.useState<number>();
  const [colHeight, setColHeight] = React.useState<number[]>([]);
  const [imagesInColumn, setImagesInColumn] = React.useState<PhotoType[][]>([]);
  const [imageIndex, setImageIndex] = React.useState<number>(0);
  const [isColLoaded, setIsColLoaded] = React.useState<boolean>(false);
  const [areSizesLoaded, setAreSizesLoaded] = React.useState<boolean>(false);
  const [windowWidth, setWindowWidth] = React.useState<number>();

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const getColumns = () => {
      const width = window.innerWidth;
      if (width < 600) return 3;
      if (width < 900) return 4;
      if (width < 1200) return 6;
      return 8;
    };

    const columns = getColumns();
    setColumns(columns);
    setColHeight(Array(columns).fill(0));
    setImagesInColumn(Array.from({ length: columns }, () => []));

    setIsColLoaded(true);
  }, [windowWidth]);

  React.useEffect(() => {
    if (!columns) return;
    const containerWidth = window.innerWidth * 0.9 - (columns - 1) * gap;
    const newExpectedImageWidth = Math.floor(containerWidth / columns);
    setExpectedImageWidth(newExpectedImageWidth);
    console.log(`Expected image width set to: ${newExpectedImageWidth}px`);
  }, [columns, windowWidth]);

  React.useEffect(() => {
    const heights: number[] = [];
    photos.forEach((photo) => {
      const aspectRatio = photo.width / photo.height;
      const expectedHeight = expectedImageWidth / aspectRatio;
      heights.push(expectedHeight);
    });
    setExpectedImageHeights(heights);
    setAreSizesLoaded(true);
  }, [photos, expectedImageWidth, windowWidth]);

  React.useEffect(() => {
    if (!isColLoaded || photos.length === 0) return;

    const newColHeight = [...colHeight];
    const newImagesInColumn = imagesInColumn.map((col) => [...col]);

    for (let index = imageIndex; index < photos.length; index++) {
      const image = photos[index];
      const indexOfMinHeight = newColHeight.indexOf(Math.min(...newColHeight));

      newColHeight[indexOfMinHeight] += image.height + gap;
      newImagesInColumn[indexOfMinHeight].push(image);
    }

    setColHeight(newColHeight);
    setImagesInColumn(newImagesInColumn);
    setImageIndex(photos.length);
  }, [isColLoaded, photos, gap]);

  if (!areSizesLoaded) return <p>Loading...</p>;

  return (
    <div
      id="gridParent"
      className="grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {imagesInColumn.map((column, colIndex) => (
        <div
          key={colIndex}
          style={{ display: "flex", flexDirection: "column", gap }}
        >
          {column.map((image) => (
            <div
              key={`ImageWrapper${image.id}`}
              style={{
                minWidth: expectedImageWidth,
                minHeight: expectedImageHeights[image.id - 1],
              }}
            >
              <Image
                priority={false}
                src={image.url}
                alt={image.title}
                width={expectedImageWidth}
                height={expectedImageHeights[image.id - 1]}
                className="bg-selfprimary-500"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
