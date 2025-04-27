import React from "react";

const timetable = [
  ["07:15?", "08:00?"],
  ["08:15", "08:55"],
  ["09:05", "09:45"],
  ["09:55", "10:35"],
  ["10:45", "11:25"],
  ["11:35", "12:15"],
  ["12:25", "13:05"],
  ["13:15", "13:55"],
];

const ShortDay = () => {
  return (
    <div className="max-w-md space-y-2 rounded-xl bg-selfprimary-100 p-4">
      <h2 className="text-lg font-bold">Rövidített órák csengetési rendje</h2>
      <div className="text-sm">
        <div className="grid grid-cols-3 gap-4 py-2 font-semibold">
          <span />
          <span>Becsöngő</span>
          <span>Kicsöngő</span>
        </div>
        {timetable.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-4 border-t-2 border-selfprimary-300 py-2"
          >
            <span className="font-semibold">{index}. óra</span>
            <span>{item[0]}</span>
            <span>{item[1]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-selfprimary-300">
        Ha vki tudja a 0. órát, dobja már át
      </p>
    </div>
  );
};

export default ShortDay;
