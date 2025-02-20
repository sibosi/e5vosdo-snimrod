"use client";

import {
  MillioLepesAPIResponse,
  SchoolData,
} from "@/app/api/milliolepes/route";
import { useEffect, useState } from "react";
import { Alert } from "./alert";
import { Link } from "@heroui/react";

const SchoolCard = ({
  school,
  className,
}: {
  school: SchoolData;
  className?: string;
}) => {
  return (
    <div
      className={
        "my-2 flex gap-2 rounded-lg border-0 text-xl font-bold " + className
      }
    >
      <div className="my-auto p-2">
        <h3>#{school.rank}</h3>
      </div>
      <div>
        <h4 className="my-1">
          {school.points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} lépés
        </h4>
        <div className="my-1 text-base">
          <h6 className="">
            {school.name}{" "}
            <span className="">&middot; {school.headcount} fő</span>
          </h6>
        </div>
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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div>
        <Alert className="border-selfprimary-300 bg-selfprimary-100 text-xl font-bold">
          <Link
            href="https://milliolepes.hu"
            className="mt-1 text-base font-semibold text-selfprimary-700"
          >
            Továbbiak a programról ➜
          </Link>
        </Alert>
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

        <SchoolCard
          school={data.betterShool}
          className="border-foreground-300 bg-foreground-200"
        />
        <SchoolCard
          school={data.school}
          className="border-selfprimary-300 bg-selfprimary-200"
        />
        <SchoolCard
          school={data.worseSchool}
          className="border-foreground-300 bg-foreground-200"
        />
      </div>
      <p className="info text-right">
        Frissítve: {new Date(data.timestamp).toLocaleDateString("hu-HU")}
        {"  "}
        {new Date(data.timestamp).toLocaleTimeString("hu-HU")}
      </p>
    </div>
  );
};

export default MillioLepes;
