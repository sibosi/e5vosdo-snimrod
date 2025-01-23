"use client";
import { useEffect, useState } from "react";
import presentations_data from "./presentations.json";
import teachers from "./teachers.json";
import { PresentationType, UserType } from "@/db/dbreq";
import {
  Button,
  ButtonGroup,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { Alert } from "@/components/home/alert";

const presentations = presentations_data as any as PresentationType[];
const presentationsById: Record<number, PresentationType> = {};
presentations.forEach((pre) => {
  presentationsById[pre.id] = pre;
});

interface MyPreType {
  11: number[] | undefined;
  12: number[] | undefined;
  21: number[] | undefined;
  22: number[] | undefined;
  23: number[] | undefined;
}

const MyPre = ({ selfUser }: { selfUser: UserType }) => {
  const [myPre, setMyPre] = useState<MyPreType>();
  const [selectedSlot, setSelectedSlot] = useState<11 | 12 | 21 | 22 | 23>(11);
  const [search, setSearch] = useState<string>("");
  const [signupers, setSignupers] = useState<string[]>();

  async function getMyPre() {
    const response = await fetch("/api/getMyPre");
    const data = await response.json();
    setMyPre(data);
    console.log(JSON.stringify(data));
  }

  async function fetchSignupers(presentation_id: number) {
    const resp = await fetch("/api/getMembersAtPresentation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ presentation_id }),
    });
    const data = await resp.json();
    setSignupers(data);
  }

  useEffect(() => {
    getMyPre();
  }, []);

  return (
    <div>
      <div>
        <h1>Előadáskereső és jelentkezési lista tanároknak</h1>
        <Input
          placeholder="Keresés"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {search.length > 2 &&
            presentations
              .filter(
                (pre) =>
                  pre.organiser.toLowerCase().includes(search.toLowerCase()) ||
                  pre.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((pre) => (
                <div key={pre.id} className="rounded-xl bg-selfprimary-50 p-4">
                  <p className="font-mono">{pre.starts_at}</p>
                  <p className="text-lg font-extrabold">
                    Terem: {pre.room ?? "Ismeretlen"}
                  </p>
                  <p className="underline">{pre.name}</p>
                  <p>{pre.organiser}</p>

                  <p className="m-1">{pre.description}</p>
                  {(selfUser.permissions.includes("organiser") ||
                    teachers.includes(selfUser.email)) && (
                    <Button onPress={() => fetchSignupers(pre.id)}>
                      Jelentkezők lekérése
                    </Button>
                  )}
                </div>
              ))}
        </div>
      </div>
      <h1>Saját előadások</h1>
      <Button onPress={getMyPre}>Előadásaim lekérése</Button>
      <div>
        <ButtonGroup className="flex flex-wrap">
          <Button
            className={selectedSlot === 11 ? "bg-primary-500" : ""}
            onPress={() => setSelectedSlot(11)}
          >
            Csütörtök 1. sáv
          </Button>
          <Button
            className={selectedSlot === 12 ? "bg-primary-500" : ""}
            onPress={() => setSelectedSlot(12)}
          >
            Csütörtök 2. sáv
          </Button>
          <Button
            className={selectedSlot === 21 ? "bg-primary-500" : ""}
            onPress={() => setSelectedSlot(21)}
          >
            Péntek 1. sáv
          </Button>
          <Button
            className={selectedSlot === 22 ? "bg-primary-500" : ""}
            onPress={() => setSelectedSlot(22)}
          >
            Péntek 2. sáv
          </Button>
          <Button
            className={selectedSlot === 23 ? "bg-primary-500" : ""}
            onPress={() => setSelectedSlot(23)}
          >
            Péntek 3. sáv
          </Button>
        </ButtonGroup>
      </div>
      <div>
        {selectedSlot && myPre && (
          <div>
            <h2>
              {selectedSlot === 11
                ? "Csütörtök 1. sáv"
                : selectedSlot === 12
                  ? "Csütörtök 2. sáv"
                  : selectedSlot === 21
                    ? "Péntek 1. sáv"
                    : selectedSlot === 22
                      ? "Péntek 2. sáv"
                      : "Péntek 3. sáv"}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPre[selectedSlot] ? (
                myPre[selectedSlot].map((preId) => (
                  <div key={preId} className="rounded-xl bg-selfprimary-50 p-4">
                    <p className="font-mono">
                      {presentationsById[preId].starts_at}
                    </p>
                    <p className="text-lg font-extrabold">
                      Terem: {presentationsById[preId].room ?? "Ismeretlen"}
                    </p>
                    <p className="underline">{presentationsById[preId].name}</p>
                    <p>{presentationsById[preId].organiser}</p>
                    <p className="m-1">
                      {presentationsById[preId].description}
                    </p>
                    {presentationsById[preId].root_parent !== null && (
                      <Alert>
                        Ez egy dupla előadás. Ilyenkor mindkét sávra elmehetsz.
                      </Alert>
                    )}
                    {(selfUser.permissions.includes("organiser") ||
                      teachers.includes(selfUser.email)) && (
                      <Button onPress={() => fetchSignupers(preId)}>
                        Jelentkezők lekérése
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div>Nincs</div>
              )}
              {myPre === undefined && <div>Előadások betöltése...</div>}
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={signupers !== undefined}
        onClose={() => setSignupers(undefined)}
        title="Jelentkezők"
      >
        <ModalContent>
          <ModalHeader>Jelenléti ív</ModalHeader>
          <ModalBody>
            <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
              <ul>
                {signupers &&
                  signupers
                    .sort((a, b) => a.localeCompare(b)) // Itt rendezzük a listát
                    .map((signuper, index) => (
                      <li key={signuper}>
                        {index + 1}.{" "}
                        {signuper.split("@")[0].split(".").join(" ")}
                      </li>
                    ))}
              </ul>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MyPre;
