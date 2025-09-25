"use client";

import {
  MillioLepesAPIResponse,
  SchoolData,
} from "@/app/api/milliolepes/route";
import { useEffect, useState } from "react";
import { Link } from "@heroui/react";

const SchoolCard = ({
  school,
  color = "foreground",
}: {
  school: SchoolData;
  color?: "foreground" | "selfprimary" | "selfsecondary";
}) => {
  const filterColor = color == "foreground" ? "" : color;
  return (
    <div
      className={`my-2 flex items-stretch overflow-hidden rounded-lg bg-${color}-100`}
    >
      <div
        className={`flex w-16 min-w-16 items-center justify-center bg-${filterColor}-800`}
      >
        <h3
          className={`${color == "foreground" ? "text-xl" : "text-2xl"} font-bold text-${color}-bg`}
        >
          #{school.rank}
        </h3>
      </div>
      <div className="w-full p-2">
        <div className="flex items-center justify-between">
          <p className="text-md font-medium">
            {school.points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
            lépés
          </p>

          <span
            className={`rounded-lg bg-${color}-200 border-2 border-${color}-400 px-1 text-xs font-bold text-${color}-800`}
          >
            {school.headcount} fő
          </span>
        </div>

        <h6 className="line-clamp-1 text-xs">{school.name}</h6>
        <span className="hidden bg-selfprimary-800" />
        <span className="hidden bg-selfsecondary-800" />
      </div>
    </div>
  );
};

const MillioLepes = () => {
  const [data, setData] = useState<MillioLepesAPIResponse>();

  const fetcher = async () => {
    try {
      await fetch("/api/milliolepes")
        .then((res) => res.json())
        .then(setData);
    } catch {
      return;
    }
  };

  useEffect(() => {
    fetcher();
  }, []);

  if (!data) {
    return <p>Betöltés...</p>;
  }

  return (
    <div className="max-w-xl">
      <div>
        <div>
          <p>
            A következő iskola{" "}
            <span className="font-bold">
              {(data.betterShool.points - data.school.points)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
            </span>{" "}
            lépéssel előttünk jár.
          </p>
          <p>
            Ez fejenként{" "}
            <span className="font-bold">
              {Math.round(
                (data.betterShool.points - data.school.points) /
                  data.school.headcount,
              )
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
            </span>{" "}
            lépés.
          </p>
        </div>

        <SchoolCard school={data.betterShool} />
        <SchoolCard school={data.school} color="selfprimary" />
        <SchoolCard school={data.worseSchool} />
      </div>
      <div className="flex justify-between">
        <Link
          href="https://milliolepes.hu"
          className="text-sm text-selfprimary-700"
        >
          További infók ➜
        </Link>

        <p className="info">
          Frissítve: {new Date(data.timestamp).toLocaleDateString("hu-HU")}
          {"  "}
          {new Date(data.timestamp).toLocaleTimeString("hu-HU")}
        </p>
      </div>
    </div>
  );
};

export default MillioLepes;
