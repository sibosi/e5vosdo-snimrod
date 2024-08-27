"use client";
import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";

export const ThemeUpdate = () => {
  useEffect(() => {
    const colors = ["primary", "secondary"];

    colors.forEach((color) => {
      const savedColorHue = localStorage.getItem(`${color}Hue`);
      if (savedColorHue) {
        document.documentElement.style.setProperty(
          `--color-${color}-hue`,
          savedColorHue,
        );
      }
    });
  }, []);

  return <></>;
};

export const ThemePicker = ({ color }: { color: "primary" | "secondary" }) => {
  const defaultHue = color === "primary" ? 212 : 270;
  const [colorHue, setColorHue] = useState(defaultHue);

  const updateColors = () => {
    document.documentElement.style.setProperty(
      `--color-${color}-hue`,
      String(colorHue),
    );
    localStorage.setItem(`${color}Hue`, String(colorHue));
  };

  useEffect(() => {
    const savedColorHue = localStorage.getItem(`${color}Hue`);
    if (savedColorHue) {
      setColorHue(Number(savedColorHue));
      document.documentElement.style.setProperty(
        `--color-${color}-hue`,
        savedColorHue,
      );
    }
  }, [color]);

  const LIGHT_HSLS = [
    [228, 92, 95],
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
    <div className={`mb-4 rounded-3xl bg-self${color}-300 p-6`}>
      <div className="mb-2 flex gap-2">
        <Input
          title="Primary Color"
          type="range"
          min={0}
          max={360}
          onChange={(e) => setColorHue(Number(e.target.value))}
        />
        <Button
          onClick={updateColors}
          style={{ backgroundColor: `hsl(${colorHue}, 100%, 50%)` }}
        >
          Apply Colors
        </Button>
      </div>

      <div className="flex">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((num) => (
          <div
            key={num}
            className={`w-full p-2 text-center bg-self${color}-${num}`}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((num, index) => (
          <div
            key={num}
            className="w-full p-2 text-center"
            style={{
              backgroundColor: `hsl(${colorHue}, ${LIGHT_HSLS[index][1]}%, ${LIGHT_HSLS[index][2]}%)`,
            }}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((num) => (
          <div
            key={num}
            className={`w-full p-2 text-center bg-${color}-${num}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ThemeTemplate = ({
  color,
}: {
  color: "primary" | "secondary";
}) => {
  const colorHues = [...Array.from({ length: 24 }, (_, i) => i * 15)];
  return (
    <div className={`mb-4 rounded-3xl bg-self${color}-300 p-6`}>
      <h1 className="text-2xl font-bold">
        {color === "primary" ? "Primary" : "Secondary"} Color
        <Button
          color={color}
          size="sm"
          className="my-auto ml-2"
          onClick={() => {
            localStorage.removeItem(`${color}Hue`);
            document.documentElement.style.setProperty(
              `--color-${color}-hue`,
              color === "primary" ? "212" : "270",
            );
          }}
        >
          Reset
        </Button>
      </h1>
      <div className="flex flex-wrap">
        {colorHues.map((hue) => (
          <div
            key={hue}
            className="h-14 w-14 border-1"
            style={{
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
            }}
            onClick={() => {
              localStorage.setItem(`${color}Hue`, String(hue));
              document.documentElement.style.setProperty(
                `--color-${color}-hue`,
                String(hue),
              );
            }}
          >
            <div className="my-auto text-center">{hue}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ThemePickerPrimary = () => {
  return <ThemePicker color="primary" />;
};

export const ThemePickerSecondary = () => {
  return <ThemePicker color="secondary" />;
};

export const ThemeTemplatePrimary = () => {
  return <ThemeTemplate color="primary" />;
};

export const ThemeTemplateSecondary = () => {
  return <ThemeTemplate color="secondary" />;
};
