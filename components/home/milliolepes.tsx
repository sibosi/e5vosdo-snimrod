"use client";

import {
  MillioLepesAPIResponse,
  SchoolData,
} from "@/app/api/milliolepes/route";
import { useEffect, useState } from "react";
import { Alert } from "./alert";
import { Link } from "@nextui-org/link";

const SchoolCard = ({
  school,
  className,
}: {
  school: SchoolData;
  className?: string;
}) => {
  return (
    <div className={"my-2 flex gap-2 rounded-lg border-1 text-xl " + className}>
      <div className="my-auto p-2 font-bold">
        <p>#{school.rank}</p>
      </div>
      <div>
        <p className="my-1">
          {school.points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} lépés
          - {school.headcount} fő
        </p>
        <div className="my-1 text-base">
          <p>{school.name}</p>
        </div>
      </div>
    </div>
  );
};

const MillioLepes = () => {
  const [data, setData] = useState<MillioLepesAPIResponse>();

  useEffect(() => {
    fetch("/api/milliolepes")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div>
        <Alert className="border-selfprimary-300 bg-selfprimary-100 text-xl font-bold">
          Mi az a Millió Lépés program?
          <br />
          <span className="mt-1 text-base font-normal">
            A Millió Lépés programban az iskolák a tanulók által megtett lépések
            alapján versenyeznek egymással.{" "}
            <Link href="https://milliolepes.hu">
              További információk a programról. ➜
            </Link>
          </span>
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
      <p className="text-right text-sm">
        Frissítve: {new Date(data.timestamp).toLocaleDateString("hu-HU")}
        {"  "}
        {new Date(data.timestamp).toLocaleTimeString("hu-HU")}
      </p>
    </div>
  );
};

export default MillioLepes;
