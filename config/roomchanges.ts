type RoomchangesConfig = {
  dates: {
    title: string;
    time: string;
    _hide_time_: string;
    image: string;
    _show_time_?: string;
    _img_src_?: string;
    details?: string;
    tags?: string[];
  }[];
};

const roomchangesConfig = {
  1: {
    "2024.06.05.": {
      "210": "100",
    },
  },
};

export default roomchangesConfig as unknown as RoomchangesConfig;
