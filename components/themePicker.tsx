"use client";
import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { hexFromArgb, Hct } from "@material/material-color-utilities";

const versions = [
  "20",
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

export const loadPalette = (colorName: string, theme?: "light" | "dark") => {
  const colorHue =
    Number(localStorage.getItem(`${colorName}Hue`)) !== undefined
      ? Number(localStorage.getItem(`${colorName}Hue`))
      : colorName === "primary"
        ? 255
        : 300;
  document.documentElement.style.setProperty(
    `--color-${colorName}`,
    hexFromArgb(Hct.from(colorHue, 100, 50).toInt()),
  );

  const isDarkMode = theme
    ? theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;

  versions.forEach((version) => {
    const argbColor = Hct.from(
      colorHue,
      100,
      isDarkMode ? Number(version) / 10 : 100 - Number(version) / 10,
    );
    if (argbColor) {
      document.documentElement.style.setProperty(
        `--color-${colorName}-${version}`,
        hexFromArgb(argbColor.toInt()),
      );
    }
  });

  if (localStorage.getItem("materialBg") === "true") {
    document.documentElement.style.setProperty(
      `--color-${colorName}-bg`,
      hexFromArgb(Hct.from(colorHue, 100, isDarkMode ? 3 : 97).toInt()),
    );
  }
};

export const ThemePicker = ({ color }: { color: "primary" | "secondary" }) => {
  const defaultHue = color === "primary" ? 212 : 270;
  const [colorHue, setColorHue] = useState(defaultHue);

  const updateColors = () => {
    const savedColorHue = Number(localStorage.getItem(`${color}Hue`));

    document.documentElement.style.setProperty(
      `--color-${color}`,
      hexFromArgb(Hct.from(savedColorHue, 100, 50).toInt()),
    );

    versions.forEach((version) => {
      const argbColor = Hct.from(
        savedColorHue,
        100,
        100 - Number(version) / 10,
      );
      if (argbColor) {
        document.documentElement.style.setProperty(
          `--color-${color}-${version}`,
          hexFromArgb(argbColor.toInt()),
        );
        console.log(
          `--color-${color}-${version}`,
          hexFromArgb(argbColor.toInt()),
          argbColor,
        );
      }
    });
    localStorage.setItem(`${color}Hue`, String(colorHue));
  };

  return (
    <div className={`mb-4 overflow-auto rounded-3xl bg-self${color}-300 p-6`}>
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
              backgroundColor: hexFromArgb(
                Hct.from(colorHue, 100, 100 - num / 10).toInt(),
              ),
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
  const [selectedHue, setSelectedHue] = useState(212);

  useEffect(() => {
    setSelectedHue(
      Number(localStorage.getItem(`${color}Hue`)) ||
        (color === "primary" ? 212 : 270),
    );
  }, []);

  return (
    <div
      className={
        "mb-4 rounded-3xl p-3 " +
        (color === "primary" ? "bg-selfprimary-300" : "bg-selfsecondary-300")
      }
    >
      <h1 className="text-2xl font-bold">
        {color === "primary" ? "Elsődleges" : "Másodlagos"} szín
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
            setSelectedHue(color === "primary" ? 212 : 270);
          }}
        >
          Reset
        </Button>
      </h1>
      <div className="flex">
        {colorHues.map((hue) => (
          <div
            key={hue}
            className={
              "h-14 w-full border-1 " + (selectedHue === hue ? "border-4" : "")
            }
            style={{
              // From Hct.from(hue, 100, 0) to Hct.from(hue, 100, 100) gradient
              background: `linear-gradient(to bottom, ${hexFromArgb(
                Hct.from(hue, 100, 40).toInt(),
              )}, ${hexFromArgb(Hct.from(hue, 100, 80).toInt())})`,
            }}
            onClick={() => {
              localStorage.setItem(`${color}Hue`, String(hue));
              setSelectedHue(hue);
              loadPalette(color);
            }}
          >
            <div className="my-auto hidden text-center">{hue}</div>
          </div>
        ))}
      </div>
      <input
        title="color"
        type="range"
        className="mt-2 w-full"
        min={0}
        max={colorHues.length - 1}
        value={colorHues.indexOf(selectedHue) as any}
        onChange={(e) => {
          const hue = colorHues[Number(e.target.value)];
          setSelectedHue(hue);
          localStorage.setItem(`${color}Hue`, String(hue));
          loadPalette(color);
        }}
      />
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
