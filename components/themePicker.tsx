"use client";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { hexFromArgb, Hct } from "@material/material-color-utilities";
import "./css/HuePicker.css";
import "./css/ChromaPicker.css";

const defaultHues: { [key: string]: number } = {
  primary: 240, // 267
  secondary: 45, // 305
};

const defaultChromas: { [key: string]: number } = {
  primary: 30, // 71
  secondary: 50, // 87
};

const blockedColors = [
  [267, 71], // primary
  [305, 87], // secondary
];

const tones = [
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

export const loadPalette = (
  colorName: string,
  theme?: "light" | "dark" | "system",
  hue?: number,
  chroma?: number,
) => {
  const colorHuePre =
    hue ||
    Number(localStorage.getItem(`${colorName}Hue`)) ||
    defaultHues[colorName] ||
    255;

  const colorChromaPre =
    chroma ||
    Number(localStorage.getItem(`${colorName}Chroma`)) ||
    defaultChromas[colorName] ||
    50;

  const colorHue = blockedColors.some(
    (blocked) => blocked[0] === colorHuePre && blocked[1] === colorChromaPre,
  )
    ? defaultHues[colorName]
    : colorHuePre;
  const colorChroma = blockedColors.some(
    (blocked) => blocked[0] === colorHuePre && blocked[1] === colorChromaPre,
  )
    ? defaultChromas[colorName]
    : colorChromaPre;

  document.documentElement.style.setProperty(
    `--color-${colorName}`,
    hexFromArgb(Hct.from(colorHue, colorChroma, 50).toInt()),
  );

  document.documentElement.style.setProperty(
    "--" + colorName,
    hexFromArgb(Hct.from(colorHue, colorChroma, 50).toInt()),
  );

  const isDarkMode = (() => {
    if ((theme || localStorage.getItem("theme")) === "dark") return true;
    else if ((theme || localStorage.getItem("theme")) === "light") return false;
    else if ((theme || localStorage.getItem("theme")) === "system")
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })();

  tones.forEach((version) => {
    const argbColor = Hct.from(
      colorHue,
      colorChroma,
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
      hexFromArgb(Hct.from(colorHue, 6, isDarkMode ? 6 : 97).toInt()),
    );

    document.documentElement.style.setProperty(
      `--color-${colorName}-cont`,
      hexFromArgb(Hct.from(colorHue, 6, isDarkMode ? 97 : 6).toInt()),
    );
  }

  if (colorName === "primary") loadPalette("surface", theme, colorHue, 5);
};

const savePalette = (colorName: string, hue: number, chroma: number) => {
  localStorage.setItem(`${colorName}Hue`, String(hue));
  localStorage.setItem(`${colorName}Chroma`, String(chroma));
};

export default function ThemePicker({ colorName }: { colorName: string }) {
  const [hue, setHue] = useState(
    Number(localStorage.getItem(`${colorName}Hue`)) || defaultHues[colorName],
  );
  const [chroma, setChroma] = useState(
    Number(localStorage.getItem(`${colorName}Chroma`)) ||
      defaultChromas[colorName],
  );

  const currentColor = hexFromArgb(Hct.from(hue, chroma, 50).toInt());

  useEffect(() => {
    loadPalette(colorName, undefined, hue, chroma);
    savePalette(colorName, hue, chroma);
  }, [hue, chroma, colorName]);

  return (
    <div
      className={
        "mb-4 rounded-3xl p-3 text-foreground " + "bg-self" + colorName + "-300"
      }
    >
      <p className="text-2xl font-bold">
        {colorName === "primary" ? "Elsődleges" : "Másodlagos"} szín
      </p>

      <div className="my-3 flex items-center gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-black"
          style={{
            backgroundColor: hexFromArgb(Hct.from(hue, chroma, 50).toInt()),
          }}
        >
          {hue}
        </div>
        <input
          title="Hue picker"
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="hue-slider"
          style={{
            background: `linear-gradient(to right, ${hexFromArgb(
              Hct.from(0, chroma, 50).toInt(),
            )}, ${hexFromArgb(Hct.from(60, chroma, 50).toInt())}, ${hexFromArgb(
              Hct.from(120, chroma, 50).toInt(),
            )}, ${hexFromArgb(Hct.from(180, chroma, 50).toInt())}, ${hexFromArgb(
              Hct.from(240, chroma, 50).toInt(),
            )}, ${hexFromArgb(Hct.from(300, chroma, 50).toInt())}, ${hexFromArgb(
              Hct.from(360, chroma, 50).toInt(),
            )})`,
          }}
        />
      </div>

      <div className="my-3 flex items-center gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-black"
          style={{ backgroundColor: currentColor }}
        >
          {chroma}
        </div>

        <input
          title="Hue picker"
          type="range"
          min="0"
          max="100"
          value={chroma}
          onChange={(e) => setChroma(Number(e.target.value))}
          className="chroma-slider"
          style={{
            background: `linear-gradient(to right, ${hexFromArgb(
              Hct.from(hue, 0, 50).toInt(),
            )}, ${hexFromArgb(Hct.from(hue, 100, 50).toInt())})`,
          }}
        />
      </div>
    </div>
  );
}

export const ThemeTemplate = ({
  color,
}: {
  color: "primary" | "secondary";
}) => {
  const colorHues = [...Array.from({ length: 24 }, (_, i) => i * 15)];
  const colorChromas = [...Array.from({ length: 5 }, (_, i) => i * 10 + 20)];
  const [selectedHue, setSelectedHue] = useState(212);
  const [selectedChroma, setSelectedChroma] = useState(50);

  useEffect(() => {
    setSelectedHue(
      Number(localStorage.getItem(`${color}Hue`)) ||
        (color === "primary" ? defaultHues.primary : defaultHues.secondary),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={
        "mb-4 rounded-3xl p-3 text-foreground " +
        (color === "primary" ? "bg-primary-300" : "bg-secondary-300")
      }
    >
      {color}: {selectedHue}/{selectedChroma}
      <h1 className="text-2xl font-bold">
        {color === "primary" ? "Elsődleges" : "Másodlagos"} szín
        <Button
          color={color}
          size="sm"
          className="my-auto ml-2"
          onPress={() => {
            localStorage.removeItem(`${color}Hue`);
            location.reload();
          }}
        >
          Reset
        </Button>
      </h1>
      <div className="flex">
        <input
          title="color"
          type="range"
          style={{ writingMode: "vertical-lr" }}
          className="my-4 mr-2"
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
        {colorChromas.map((chroma) => (
          <div key={chroma} className="h-auto w-full">
            {colorHues.map((hue) => (
              <div
                key={hue + chroma}
                className={
                  "h-5 w-full border-1 " +
                  (selectedHue === hue && selectedChroma === chroma
                    ? "border-4"
                    : "")
                }
                style={{
                  // From Hct.from(hue, 100, 0) to Hct.from(hue, 100, 100) gradient
                  background: `linear-gradient(to bottom, ${hexFromArgb(
                    Hct.from(hue, chroma, 50).toInt(),
                  )}, ${hexFromArgb(Hct.from(hue, chroma, 70).toInt())})`,
                }}
                onClick={() => {
                  localStorage.setItem(`${color}Hue`, String(hue));
                  localStorage.setItem(`${color}Chroma`, String(chroma));
                  setSelectedHue(hue);
                  setSelectedChroma(chroma);
                  loadPalette(color);
                }}
              >
                <div className="my-auto hidden text-center">{hue}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <input
        title="chroma"
        type="range"
        className="w-full"
        style={{ writingMode: "horizontal-tb" }}
        min={0}
        max={colorChromas.length - 1}
        value={colorChromas.indexOf(selectedChroma) as any}
        onChange={(e) => {
          const chroma = colorChromas[Number(e.target.value)];
          localStorage.setItem(`${color}Chroma`, String(chroma));
          setSelectedChroma(chroma);
          loadPalette(color);
        }}
      />
      {color}: {selectedHue}/{selectedChroma}
    </div>
  );
};

export const ThemeOptions = () => {
  const templates = [
    {
      name: "Default",
      primary: [defaultHues.primary, defaultChromas.primary],
      secondary: [defaultHues.secondary, defaultChromas.secondary],
    },
    {
      // Coral, Olive
      name: "Coral, Olive",
      primary: [30, 50],
      secondary: [135, 40],
    },
    {
      // Stone, Lavender (Nimród)
      name: "Stone, Lavender",
      primary: [120, 20],
      secondary: [285, 50],
    },
    {
      // Sky, Mango
      name: "Sky, Mango",
      primary: [240, 60],
      secondary: [45, 50],
    },
    {
      // Camel, Lavender
      name: "Camel, Lavender",
      primary: [75, 40],
      secondary: [300, 60],
    },
    {
      // Helina
      name: "Windows, Tulip",
      primary: [255, 50],
      secondary: [345, 50],
    },
    {
      // Luca
      name: "Orhid, Rose",
      primary: [330, 60],
      secondary: [15, 60],
    },
    {
      // Timi
      name: "Slate, Wood",
      primary: [255, 20],
      secondary: [60, 40],
    },
    {
      // Timi 2
      name: "Leaf, Gold",
      primary: [165, 20],
      secondary: [90, 60],
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-foreground">
      {templates.map((template) => (
        <button
          type="button"
          key={template.name}
          className="max-w-min rounded-lg bg-selfprimary-100 p-2 text-center hover:bg-selfprimary-200"
          onClick={() => {
            localStorage.setItem("primaryHue", String(template.primary[0]));
            localStorage.setItem("primaryChroma", String(template.primary[1]));
            localStorage.setItem("secondaryHue", String(template.secondary[0]));
            localStorage.setItem(
              "secondaryChroma",
              String(template.secondary[1]),
            );
            loadPalette("primary");
            loadPalette("secondary");
          }}
        >
          <div className="mx-auto grid h-8 w-8 grid-cols-2 overflow-hidden rounded-full">
            <div
              className="h-full w-full"
              style={{
                backgroundColor: hexFromArgb(
                  Hct.from(
                    template.primary[0],
                    template.primary[1],
                    50,
                  ).toInt(),
                ),
              }}
            />
            <div
              className="h-full w-full"
              style={{
                backgroundColor: hexFromArgb(
                  Hct.from(
                    template.secondary[0],
                    template.secondary[1],
                    50,
                  ).toInt(),
                ),
              }}
            />
          </div>

          <div className="max-w-min">{template.name}</div>
        </button>
      ))}
    </div>
  );
};
