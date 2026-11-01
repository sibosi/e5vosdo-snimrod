"use client";

import { useEffect, useRef, useState } from "react";
import defaultImage from "./defrosting.png";

/**
 * <IceBlock />
 * Csak a jégkocka, háttér nélkül. Kattintásra megreped, lejátssza a
 * defrosting.mp3-at, de nem esik szét. A hang végén a repedés magától
 * összeforr.
 *
 * Használat:
 *   // saját PNG-vel (átlátszó hátterű, a kockára vágott kép):
 *   <IceBlock image="/ice.png" sound="/defrosting.mp3" />
 *
 *   // PNG nélkül a komponens saját rajzolt jégkockát használ, piros alakkal:
 *   <IceBlock sound="/defrosting.mp3" />
 *
 * A fájlokat a projekt public/ mappájába tedd.
 */

const CRACK_MS = 600; // repedés rajzolódása
const HEAL_MS = 900; // összeforrás
const FALLBACK_MS = 4000; // ha a hang nem indul el, ennyi után forr össze

interface IceBlockProps {
  image?: string;
  sound?: string;
  hint?: string;
  width?: string;
  onPlay?: () => void;
}

type IcePhase = "idle" | "cracked" | "healing";

export default function IceBlock({
  image = defaultImage.src,
  sound = "/defrosting.mp3",
  hint = "Kattints a jégre",
  width = "min(70vw, 280px)",
  onPlay,
}: Readonly<IceBlockProps>) {
  const [phase, setPhase] = useState<IcePhase>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = useRef(false);

  useEffect(() => {
    const audio = new Audio(sound);
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      timers.current.forEach(clearTimeout);
      audioRef.current = null;
    };
  }, [sound]);

  const heal = () => {
    setPhase("healing");
    timers.current.push(
      setTimeout(() => {
        setPhase("idle");
        busy.current = false;
      }, HEAL_MS),
    );
  };

  const start = () => {
    if (busy.current) return;
    busy.current = true;
    setPhase("cracked");
    if (onPlay) onPlay();
    if (navigator.vibrate) navigator.vibrate([25, 30, 60]);

    const audio = audioRef.current;
    if (!audio) {
      timers.current.push(setTimeout(heal, FALLBACK_MS));
      return;
    }
    // a lejátszást közvetlenül a kattintás indítja, így a böngésző engedi
    audio.currentTime = 0;
    audio.onended = heal;
    audio.onerror = heal;
    audio.play().catch(() => {
      timers.current.push(setTimeout(heal, FALLBACK_MS));
    });
  };

  // a repedés, csillanás és villanás csak a PNG fedett részén látszik
  const maskStyle = image
    ? {
        WebkitMaskImage: `url(${image})`,
        maskImage: `url(${image})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : undefined;

  return (
    <div className="ice-root">
      <style>{css}</style>

      {!image && (
        <svg
          width="0"
          height="0"
          style={{ position: "absolute" }}
          aria-hidden="true"
        >
          <defs>
            <filter
              id="ice-refract"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05 0.035"
                numOctaves="2"
                seed="7"
                result="t"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="t"
                scale="5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="0.7" />
            </filter>
            <filter id="ice-bump" x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.16 0.11"
                numOctaves="3"
                seed="4"
                result="n"
              />
              <feSpecularLighting
                in="n"
                surfaceScale="3"
                specularConstant="0.9"
                specularExponent="24"
                lightingColor="#ffffff"
                result="s"
              >
                <feDistantLight azimuth="235" elevation="55" />
              </feSpecularLighting>
              <feComposite in="s" in2="SourceAlpha" operator="in" />
            </filter>
            <filter id="ice-mottle" x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.07 0.04"
                numOctaves="2"
                seed="11"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.12  0 0 0 0 0.38  0 0 0 0 0.6  0 0 0 1.6 -0.45"
              />
            </filter>
          </defs>
        </svg>
      )}

      <div className={`ice-wrap is-${phase}`} style={{ width }}>
        {!image && <span className="ice-top" aria-hidden="true" />}

        <button
          type="button"
          className={`ice-block ${image ? "has-image" : "is-drawn"}`}
          onClick={start}
          aria-label="Játszd le a defrosting hangot"
          aria-busy={phase !== "idle"}
        >
          {image ? (
            <img className="ice-img" src={image} alt="" draggable="false" />
          ) : (
            <>
              <span className="ice-figure-wrap">
                <svg
                  className="ice-figure"
                  viewBox="0 0 100 205"
                  aria-hidden="true"
                  style={{ filter: "url(#ice-refract)" }}
                >
                  <defs>
                    <linearGradient id="ice-red" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#f0283d" />
                      <stop offset="1" stopColor="#9c0d24" />
                    </linearGradient>
                    <linearGradient id="ice-hair" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#f6dc9a" />
                      <stop offset="1" stopColor="#c8974c" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M38 30 C33 14 43 7 51 7 C60 7 67 15 62 31 C67 46 64 62 71 80 C66 84 60 80 57 72 C55 66 56 60 55 54 L45 54 C44 60 45 66 43 72 C40 80 34 84 29 80 C36 62 33 46 38 30 Z"
                    fill="url(#ice-hair)"
                  />
                  <rect x="46" y="42" width="8" height="10" fill="#efc4a4" />
                  <ellipse
                    cx="50.5"
                    cy="31"
                    rx="8.3"
                    ry="10.4"
                    fill="#f3cbae"
                  />
                  <path
                    d="M42 26 C44 18 56 16 59 25 C54 21 47 21 42 26 Z"
                    fill="#e8c277"
                  />
                  <path
                    d="M40 52 C36 53 33 55 33 59 L37 88 L34 97 C32 116 29 138 25 160 C42 165 58 165 75 160 C71 138 68 116 66 97 L63 88 L67 59 C67 55 64 53 60 52 C56 55 44 55 40 52 Z"
                    fill="url(#ice-red)"
                  />
                  <path
                    d="M32 58 C35 53 44 56 50 58 C56 56 65 53 68 58 C68 63 62 61 58 63 C54 65 46 65 42 63 C38 61 32 63 32 58 Z"
                    fill="#b8e6f4"
                    fillOpacity=".78"
                  />
                  <path
                    d="M24 159 C42 164 58 164 76 159 L77 166 C58 171 42 171 23 166 Z"
                    fill="#b8e6f4"
                    fillOpacity=".78"
                  />
                  <rect
                    x="35"
                    y="86"
                    width="30"
                    height="4.5"
                    rx="2"
                    fill="#2a0b10"
                  />
                  <rect
                    x="47.5"
                    y="85.4"
                    width="5"
                    height="5.6"
                    rx="1"
                    fill="#d9b25a"
                  />
                  <path
                    d="M35 60 L21 80 L36 97"
                    fill="none"
                    stroke="#c91a31"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="37.5" cy="97.5" r="3.4" fill="#f3cbae" />
                  <path
                    d="M65 60 L73 94 L71 120"
                    fill="none"
                    stroke="#c91a31"
                    strokeWidth="6.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="71" cy="123" r="3.2" fill="#f3cbae" />
                  <path
                    d="M44 168 L43 203 M57 168 L58 203"
                    stroke="#8f0c22"
                    strokeWidth="9"
                    strokeLinecap="butt"
                  />
                </svg>
              </span>
              <span className="ice-frost" aria-hidden="true" />
              <svg
                className="ice-texture"
                viewBox="0 0 100 205"
                aria-hidden="true"
              >
                <rect
                  width="100"
                  height="205"
                  fill="#fff"
                  filter="url(#ice-mottle)"
                  opacity=".55"
                />
                <rect
                  width="100"
                  height="205"
                  fill="#fff"
                  filter="url(#ice-bump)"
                  opacity=".7"
                />
              </svg>
            </>
          )}

          {/* effektek: csillanás, villanás, repedések */}
          <span className="ice-fx" style={maskStyle} aria-hidden="true">
            <span className="ice-glint" />
            <span className="ice-flash" />
            <svg
              className="ice-cracks"
              viewBox="0 0 100 205"
              preserveAspectRatio="none"
            >
              <path
                pathLength="1"
                d="M52 0 L46 38 L60 76 L44 112 L57 150 L48 205"
              />
              <path pathLength="1" d="M60 76 L84 86 L100 80" />
              <path pathLength="1" d="M44 112 L20 122 L0 116" />
              <path pathLength="1" d="M46 38 L28 28 L8 34" />
              <path pathLength="1" d="M57 150 L78 164 L94 158" />
              <path
                pathLength="1"
                className="thin"
                d="M30 123 L26 150 L34 176"
              />
              <path
                pathLength="1"
                className="thin"
                d="M72 85 L80 112 L74 136"
              />
            </svg>
          </span>
        </button>
      </div>

      {hint && (
        <p
          className="ice-hint"
          style={{ opacity: phase === "idle" ? undefined : 0 }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

const css = `
.ice-root{
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:18px; padding:0px 0px; font-family:inherit; color:inherit;
}
.ice-wrap{
  position:relative;
  filter:drop-shadow(0 16px 22px rgba(3,20,37,.4));
}
.ice-wrap.is-cracked{animation:ice-shake .09s linear 6;}

.ice-block{
  all:unset; box-sizing:border-box; position:relative; display:block; cursor:pointer;
  width:100%; line-height:0; transition:filter .25s ease;
}
.ice-block:hover{filter:brightness(1.06);}
.ice-block:focus-visible{outline:3px solid #fff; outline-offset:5px;}
.is-cracked .ice-block,.is-healing .ice-block{cursor:default;}
.is-cracked .ice-block.has-image{filter:brightness(1.15) drop-shadow(0 0 12px rgba(170,225,255,.9));}

/* PNG mód */
.ice-img{display:block; width:100%; height:auto; user-select:none; -webkit-user-drag:none;}

/* rajzolt mód */
.ice-top{
  position:absolute; left:0; right:0; top:-3.2%; height:3.4%; z-index:1;
  clip-path:polygon(7% 0,93% 0,100% 100%,0 100%);
  background:linear-gradient(180deg,rgba(235,250,255,.95),rgba(170,215,238,.85));
}
.ice-block.is-drawn{
  aspect-ratio:100/205; overflow:hidden; border-radius:2px;
  background:linear-gradient(90deg,#2d6a93 0%,#4d93bb 45%,#2d6a93 100%);
  box-shadow:
    inset 0 0 0 1.5px rgba(255,255,255,.75),
    inset 9px 0 16px rgba(255,255,255,.28),
    inset -9px 0 18px rgba(8,40,70,.45);
}
.ice-figure-wrap{
  position:absolute; inset:0; display:block;
  filter:drop-shadow(0 0 7px rgba(255,59,74,.5)); transition:filter .5s ease;
}
.is-cracked .ice-figure-wrap{filter:drop-shadow(0 0 14px rgba(255,59,74,.95)) brightness(1.18);}
.ice-figure{position:absolute; inset:0; width:100%; height:100%;}
.ice-frost{
  position:absolute; inset:0;
  background:
    linear-gradient(105deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 24%),
    linear-gradient(180deg,rgba(210,240,255,.32) 0%,rgba(120,185,222,.24) 55%,rgba(60,130,180,.34) 100%);
  -webkit-backdrop-filter:blur(1.4px); backdrop-filter:blur(1.4px);
}
.ice-texture{position:absolute; inset:0; width:100%; height:100%; mix-blend-mode:screen;}

/* effektek */
.ice-fx{position:absolute; inset:0; display:block; overflow:hidden; pointer-events:none;}
.ice-glint{
  position:absolute; top:-20%; left:-70%; width:45%; height:150%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
  transform:rotate(14deg); animation:ice-glint 6s ease-in-out infinite;
}
.ice-flash{position:absolute; inset:0; background:#fff; opacity:0;}
.is-cracked .ice-flash{animation:ice-flash .5s ease-out;}

.ice-cracks{position:absolute; inset:0; width:100%; height:100%;}
.ice-cracks path{
  fill:none; stroke:rgba(185,230,245,.72); stroke-width:.9; stroke-linecap:round; stroke-linejoin:round;
  stroke-dasharray:1; stroke-dashoffset:1;
  filter:drop-shadow(0 0 1px rgba(8,40,70,.9));
}
.ice-cracks path.thin{stroke-width:.5; stroke-opacity:.62;}
.is-cracked .ice-cracks path{stroke-dashoffset:0; transition:stroke-dashoffset ${CRACK_MS}ms ease-out;}
.is-cracked .ice-cracks path:nth-child(n+2){transition-delay:140ms;}
.is-healing .ice-cracks path{stroke-dashoffset:1; transition:stroke-dashoffset ${HEAL_MS}ms ease-in-out;}

.ice-hint{margin:0; font-size:15px; animation:ice-pulse 2.4s ease-in-out infinite; transition:opacity .3s;}

@keyframes ice-shake{
  0%{transform:translateX(0)} 25%{transform:translateX(-2px)}
  50%{transform:translateX(2px)} 75%{transform:translateX(-1px)} 100%{transform:translateX(0)}
}
@keyframes ice-glint{0%,60%{left:-70%}100%{left:150%}}
@keyframes ice-flash{0%{opacity:.7}100%{opacity:0}}
@keyframes ice-pulse{0%,100%{opacity:.5}50%{opacity:.9}}

@media (prefers-reduced-motion:reduce){
  .ice-glint,.ice-hint,.is-cracked.ice-wrap,.is-cracked .ice-flash{animation:none}
}
`;
