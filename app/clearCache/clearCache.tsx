"use client";
import { Button } from "@nextui-org/react";
import React, { useEffect } from "react";

const ClearCache = () => {
  const [cacheNames, setCacheNames] = React.useState<string[]>();

  useEffect(() => {
    caches.keys().then((names) => setCacheNames(names));
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
  }, []);

  return (
    <div>
      <h2>Elérhtő gyorsítótárak:</h2>
      <ul>{cacheNames?.map((name) => <li key={name}>{name}</li>)}</ul>
      {cacheNames?.length === 0 && <p>Nincs elérhető gyorsítótár.</p>}
      <Button
        onPress={() => {
          window.location.href = "/";
        }}
      >
        Vissza a főoldalra!
      </Button>
    </div>
  );
};

export default ClearCache;
