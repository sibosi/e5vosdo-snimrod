export type SiteConfig = typeof siteConfig;

interface PageSectionsType {
  teremcserek: "opened" | "closed" | "hidden";
  helyettesitesek: "opened" | "closed" | "hidden";
  menza: "opened" | "closed" | "hidden";
  esemenyek: "opened" | "closed" | "hidden";
}

const pageSections: PageSectionsType = {
  teremcserek: "opened",
  helyettesitesek: "opened",
  menza: "closed",
  esemenyek: "opened",
};

export const siteConfig = {
  name: "Eötvös DÖ",
  description: "Az Eötvös József Gimnázium Diákönkormányzat oldala",
  pageSections: pageSections,

  users: [
    "symons.timea.janet@e5vos.hu",
    "mikula.lajos@e5vos.hu",
    "deak.anna@e5vos.hu",
    "szekely.belian@e5vos.hu",
    "liu.bo.wen@e5vos.hu",
    "reti.balint@e5vos.hu",
    "torok.dorina@e5vos.hu",
    "dudla.dorottya@e5vos.hu",
    "hevizi.daniel.andor@e5vos.hu",
    "purev.ochir.erkhis@e5vos.hu",
    "prouteau.fleur.eszter@e5vos.hu",
    "bujaki.flora@e5vos.hu",
    "illes.gergo@e5vos.hu",
    "barabas.ivan@e5vos.hu",
    "eisemann.julia.kinga@e5vos.hu",
    "gayerhosz.kristof@e5vos.hu",
    "vu.le.gia.han@e5vos.hu",
    "lontai.levente@e5vos.hu",
    "kassai.leo.botond@e5vos.hu",
    "balogh.lili@e5vos.hu",
    "pentek.luca.napsugar@e5vos.hu",
    "tomoga.marcell.jozsef@e5vos.hu",
    "benedek.mate@e5vos.hu",
    "kaszap.mate@e5vos.hu",
    "simon.nimrod.zalan@e5vos.hu",
    "volk.nandor@e5vos.hu",
    "tana.orsolya@e5vos.hu",
    "nemeth.samu.levente@e5vos.hu",
    "borbely.vince@e5vos.hu",
    "hong.yezi@e5vos.hu",
    "chen.yucheng@e5vos.hu",
    "ye.zixin@e5vos.hu",
    "kovacs.zsombor@e5vos.hu",
    "rutkay.adam@e5vos.hu",
    "belle.aron@e5vos.hu",
    "czirok.adrienn@e5vos.hu",
    "botykai.andras.zeta@e5vos.hu",
    "geosits.anna.lilla@e5vos.hu",
    "szabo.balazs.istvan@e5vos.hu",
    "szirmai.balazs.oliver@e5vos.hu",
    "nguyen.bao.lam@e5vos.hu",
    "selymes.bianka@e5vos.hu",
    "megadja.blanka@e5vos.hu",
    "santa.borbala@e5vos.hu",
    "vida.balint@e5vos.hu",
    "weng.chenxin@e5vos.hu",
    "palfi.david@e5vos.hu",
    "varga.dora@e5vos.hu",
    "solymosi.kabdebo.emma@e5vos.hu",
    "solymar.eszter@e5vos.hu",
    "takacs.fanni@e5vos.hu",
    "szucs.lechner.lorin@e5vos.hu",
    "saly.luca@e5vos.hu",
    "balas.laszlo.marton@e5vos.hu",
    "varga.lena@e5vos.hu",
    "horvath.maja@e5vos.hu",
    "molnar.mihaly.boldizsar@e5vos.hu",
    "soki.milan@e5vos.hu",
    "pomozi.mate@e5vos.hu",
    "duzmath.noemi@e5vos.hu",
    "vaszi.nora@e5vos.hu",
    "pazmandi.renata@e5vos.hu",
    "katona.salamon.marton@e5vos.hu",
    "li.shiyou@e5vos.hu",
    "deak.sara.barbara@e5vos.hu",
    "lukacs.viktoria.bianka@e5vos.hu",
    "kislinder.viola@e5vos.hu",
    "cheng.yuankai@e5vos.hu",
    "szaray.zsombor.lorant@e5vos.hu",
  ],

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
