"use client";
import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";

const ColorPicker = () => {
  const [primaryHue, setPrimaryHue] = useState(228);

  const updateColors = () => {
    document.documentElement.style.setProperty(
      "--color-primary-hue",
      String(primaryHue),
    );
    localStorage.setItem("primaryHue", String(primaryHue));
  };

  useEffect(() => {
    const savedPrimaryHue = localStorage.getItem("primaryHue");
    if (savedPrimaryHue) {
      setPrimaryHue(Number(savedPrimaryHue));
      document.documentElement.style.setProperty(
        "--color-primary-hue",
        savedPrimaryHue,
      );
    }
  }, []);

  const LIGHT_HSLS = [
    [228, 92, 90],
    [228, 93, 79],
    [228, 92, 69],
    [228, 92, 58],
    [228, 100, 47],
    [228, 100, 38],
    [228, 100, 29],
    [228, 100, 19],
    [228, 100, 10],
  ];

  return (
    <div className="mb-4 rounded-3xl bg-selfprimary-300 p-6">
      <div>
        <Input
          title="Primary Color"
          type="range"
          min={0}
          max={360}
          onChange={(e) => setPrimaryHue(Number(e.target.value))}
        />
        <Button
          onClick={updateColors}
          // Show the current primary hue

          style={{ backgroundColor: `hsl(${primaryHue}, 100%, 50%)` }}
        >
          Apply Colors
        </Button>
      </div>

      <div className="bg-selfprimary-100 bg-selfprimary-200 bg-selfprimary-300 bg-selfprimary-400 bg-selfprimary-500 bg-selfprimary-600 bg-selfprimary-700 bg-selfprimary-800 bg-selfprimary-900" />
      <div className="bg-primary-100 bg-primary-200 bg-primary-300 bg-primary-400 bg-primary-500 bg-primary-600 bg-primary-700 bg-primary-800 bg-primary-900" />

      <div className="flex">
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((num) => (
          <div
            key={num}
            className={`w-full p-2 text-center bg-selfprimary-${num}`}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex">
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((num, index) => (
          <div
            key={num}
            className="w-full p-2 text-center"
            style={{
              backgroundColor: `hsl(${primaryHue}, ${LIGHT_HSLS[index][1]}%, ${LIGHT_HSLS[index][2]}%)`,
            }}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex">
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((num) => (
          <div key={num} className={`w-full p-2 text-center bg-primary-${num}`}>
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
