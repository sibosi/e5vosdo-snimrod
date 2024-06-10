export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Eötvös DÖ",
  description: "Az Eötvös József Gimnázium Diákönkormányzat oldala",
  pageSections: {
    teremcserek: true,
    helyettesitesek: true,
    menza: true,
    esemenyek: true,
  },

  navItems: [
    {
      label: "Főoldal",
      href: "/",
    },
    {
      label: "Dokumentumok ⤤",
      href: "https://drive.google.com/drive/u/0/folders/0BzvbwQrx8NJEVnJfM2tSTjJsaTA",
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
      label: "Rólunk",
      href: "/about",
    },
  ],
  //navMenuItems: [],
  links: {
    github: "https://github.com/Sibosi",
    mypage: "https://linktr.ee/snimrod",
    instagram: "https://instagram.com/e5vosdo/",
    gdrive:
      "https://drive.google.com/drive/u/0/folders/0BzvbwQrx8NJEVnJfM2tSTjJsaTA",
    feedback: "https://forms.gle/XdMtAx6fsubWEBW97",
  },
};
