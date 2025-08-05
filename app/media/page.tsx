// media/page.tsx
import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import PhotoGrid from "./PhotoGrid";

interface PhotoType {
  id: number;
  url: string;
  title: string;
  width: number;
  height: number;
}

const URL = "https://picsum.photos/200/100";

// csak az alap négy kép:
const INITIAL_PHOTOS: PhotoType[] = [
  { id: 1, url: URL, title: "Photo 1", width: 200, height: 100 },
  { id: 2, url: URL, title: "Photo 2", width: 200, height: 100 },
  { id: 3, url: URL, title: "Photo 3", width: 200, height: 100 },
  { id: 4, url: URL, title: "Photo 4", width: 200, height: 100 },
];

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  // klónozd az alapokat, és itt generáld meg egyszer a randomokat
  const photos: PhotoType[] = [ ...INITIAL_PHOTOS ];

  for (let i = 0; i < 200; i++) {
    // Create varied aspect ratios like in the reference image
    const aspectRatios = [
      { w: 300, h: 200 },  // landscape
      { w: 200, h: 300 },  // portrait
      { w: 250, h: 250 },  // square
      { w: 400, h: 250 },  // wide landscape
      { w: 200, h: 400 },  // tall portrait
    ];
    
    const ratio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
    photos.push({
      id: i + 5,
      url: `https://picsum.photos/seed/${i + 5}/${ratio.w}/${ratio.h}`,
      title: `Photo ${i + 5}`,
      width: ratio.w,
      height: ratio.h
    });
  }

  return <div
  suppressHydrationWarning
  ><PhotoGrid photos={photos} /></div>;
};

export default MediaPage;
