"use client";
import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { hexFromArgb, Hct } from "@material/material-color-utilities";

const defaultHues = {
  primary: 255,
  secondary: 300,
};

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

export const loadPalette = (
  colorName: string,
  theme?: "light" | "dark" | "system",
) => {
  const colorHue = (() => {
    if (Number(localStorage.getItem(`${colorName}Hue`)))
      return Number(localStorage.getItem(`${colorName}Hue`));
    else if (colorName === "primary") return defaultHues.primary;
    else return defaultHues.secondary;
  })();

  const colorChroma = Number(localStorage.getItem(`${colorName}Chroma`)) || 50;

  document.documentElement.style.setProperty(
    `--color-${colorName}`,
    hexFromArgb(Hct.from(colorHue, colorChroma, 50).toInt()),
  );

  const isDarkMode = (() => {
    if ((theme || localStorage.getItem("theme")) === "dark") return true;
    else if ((theme || localStorage.getItem("theme")) === "light") return false;
    else if ((theme || localStorage.getItem("theme")) === "system")
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })();

  versions.forEach((version) => {
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
  }
};

export const ThemePicker = ({ color }: { color: "primary" | "secondary" }) => {
  const defaultHue =
    color === "primary" ? defaultHues.primary : defaultHues.secondary;
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
        (color === "primary" ? "bg-selfprimary-300" : "bg-selfsecondary-300")
      }
    >
      {color}: {selectedHue}/{selectedChroma}
      <h1 className="text-2xl font-bold">
        {color === "primary" ? "Elsődleges" : "Másodlagos"} szín
        <Button
          color={color}
          size="sm"
          className="my-auto ml-2"
          onClick={() => {
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
      primary: [267, 71],
      secondary: [305, 87],
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
          <div className="mx-auto grid h-8 w-8 grid-cols-2 overflow-hidden rounded-badge">
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
