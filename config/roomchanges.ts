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
  "2024.06.07.": [
    ["3.", "308", "52", "11.E", "a2"],
    ["3.", "310", "59", "7.A", "tö2"],
    ["3.", "310", "59", "7.A", "tö2"],
  ],
};

export default roomchangesConfig as unknown as RoomchangesConfig;
