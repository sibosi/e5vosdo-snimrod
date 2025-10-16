export type SiteConfig = typeof siteConfig;

interface PageSectionsType {
  [key: string]: "opened" | "closed" | "hidden";
}

const pageSections: PageSectionsType = {
  teremcserek: "hidden",
  helyettesitesek: "opened",
  menza: "opened",
  esemenyek: "opened",
};

export const siteConfig = {
  name: "Eötvös DÖ",
  description: "Az Eötvös József Gimnázium Diákönkormányzat oldala",
  pageSections: pageSections,
  developer: "Simon Nimród",
  developerEmail: "simon.nimrod.zalan@e5vos.hu",

  navItems: [
    {
      label: "Főoldal",
      href: "/",
    },
    {
      label: "Dokumentumok ⤤",
      href: "https://drive.google.com/drive/u/0/folders/0BzvbwQrx8NJEVnJfM2tSTjJsaTA?resourcekey=0-dexBffraBCSqohIM_y4Xiw",
    },
    {
      label: "Események",
      href: "/events",
    },
    {
      label: "Klubok",
      href: "/clubs",
    },
    {
      label: "Profilom",
      href: "/me",
    },
    {
      label: "Média",
      href: "/media",
    },
    {
      label: "E5 Podcast",
      href: "/est",
    },
  ],
  //navMenuItems: [],
  links: {
    home: "https://e5vosdo.hu",
    alternative: "https://info.e5vosdo.hu",
    github: "https://github.com/sibosi",
    mypage: "https://linktr.ee/snimrod",
    instagram: "https://instagram.com/e5vosdo/",
    mediaGallery: "/media",
    gdrive:
      "https://drive.google.com/drive/u/0/folders/0BzvbwQrx8NJEVnJfM2tSTjJsaTA",
    feedback: "https://forms.gle/XdMtAx6fsubWEBW97",
  },
};
