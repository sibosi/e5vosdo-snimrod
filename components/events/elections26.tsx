"use client";
import Image from "next/image";

const Elections = () => {
  return (
    <div className="my-2 space-y-2 rounded-2xl bg-[#97b2cdff] py-2">
      <h2 className="flex flex-wrap items-center justify-center text-center text-lg font-bold text-black">
        <span>Köszöntjük az </span>
        <span>
          <Image
            src="/governments/26/alap_logo_full_unofficial2.png"
            alt="Alap párt logója"
            width={60}
            height={100}
            style={{ objectFit: "contain" }}
            className="mx-1 h-auto max-h-96 max-w-full rounded-lg py-1"
            priority
          />
        </span>
        <span> kormányt!</span>
      </h2>
      <div>
        <Image
          src="/governments/26/alap3.jpg"
          alt="Alap párt"
          width={900}
          height={1600}
          style={{ objectFit: "contain" }}
          className="mx-auto h-auto max-h-96 max-w-full"
          priority
        />
      </div>
      <h3 className="text-center text-base font-bold text-black line-through">
        Átadás: április 15. (szerda) 2. nagyszünet, udvar
      </h3>
    </div>
  );
};

export default Elections;
