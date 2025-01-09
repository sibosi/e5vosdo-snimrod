"use client";
import { Match, PageSettingsType } from "@/db/dbreq";
import { Button, ButtonGroup, Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

async function getPageSettings() {
  return await fetch("/api/getPageSettings")
    .then((res) => res.json())
    .then((data) => {
      return data as PageSettingsType;
    });
}

async function editPageSettings(settings: PageSettingsType) {
  return await fetch("/api/editPageSettings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings: settings,
    }),
  });
}

async function getComingMatch() {
  return await fetch("/api/getComingMatch")
    .then((res) => res.json())
    .then((data) => {
      return data as Match;
    });
}

async function getMatches() {
  return await fetch("/api/getMatches")
    .then((res) => res.json())
    .then((data) => {
      return data as Match[];
    });
}

async function updateMatch(match: Match) {
  return await fetch("/api/updateMatch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: match.id,
      match: match,
    }),
  });
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Hónap 0-val kezdődik, ezért +1
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

const PageSettings = () => {
  const [settings, setSettings] = useState<PageSettingsType>();
  const [comingMatch, setComingMatch] = useState<Match>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [edit, setEdit] = useState(false);

  const [newSettings, setNewSettings] = useState<PageSettingsType>(
    {} as PageSettingsType,
  );
  const [newMatch, setNewMatch] = useState<Match>({} as Match);

  useEffect(() => {
    getPageSettings().then((data) => {
      setSettings(data);
      setNewSettings(data);
    });
    getComingMatch().then((data) => {
      setComingMatch(data);
    });
    getMatches().then((data) => {
      setMatches(data);
    });
  }, []);

  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-selfprimary-100 p-4 text-foreground">
      <div className="p-2">
        <h1 className="text-2xl font-semibold">Oldal beállítások</h1>
        <p>ID: {settings?.id}</p>
        <p>Név: {settings?.name}</p>
        <p>Headspace: {settings?.headspace}</p>
        <p>Livescore ID : {settings?.livescore}</p>
        <div className="my-2 flex flex-col gap-1 rounded-lg bg-selfprimary-200 p-2">
          <h2>{edit ? "Szerkesztés" : "Oldal beállítások szerkesztése"}</h2>
          <div className="flex gap-2">
            <Input
              title="name"
              placeholder="Név"
              label="Név (now)"
              size="sm"
              value={newSettings?.name}
              onChange={(e) =>
                setNewSettings({ ...newSettings, name: e.target.value })
              }
            />
            <Button
              size="lg"
              className="w-full"
              onClick={() =>
                setNewSettings({
                  ...newSettings,
                  headspace: newSettings.headspace ? 0 : 1,
                })
              }
            >
              {newSettings.headspace ? "Bekapcsolva" : "Kikapcsolva"}
            </Button>
            <Input
              title="livescore"
              placeholder="Livescore ID"
              size="sm"
              label="Livescore ID"
              type="number"
              value={String(newSettings?.livescore)}
              onChange={(e) =>
                setNewSettings({
                  ...newSettings,
                  livescore: Number(e.target.value),
                })
              }
            />
          </div>

          <Button
            size="sm"
            onClick={() => {
              editPageSettings(newSettings);
              setSettings(newSettings);
            }}
          >
            Mentés
          </Button>
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-selfprimary-200 p-2">
          <h2>Meccs frissítése</h2>
          <div className="flex gap-2">
            <Input
              title="id"
              placeholder="ID"
              label="ID"
              size="sm"
              type="number"
              className="w-16"
              value={String(newMatch?.id)}
              onChange={(e) => {
                setNewMatch({ ...newMatch, id: Number(e.target.value) });

                if (
                  matches.find((match) => match.id === Number(e.target.value))
                ) {
                  setNewMatch(
                    matches.find(
                      (match) => match.id === Number(e.target.value),
                    ) as Match,
                  );
                } else {
                  setNewMatch({
                    id: Number(e.target.value),
                  } as Match);
                }
              }}
            />
            <Input
              title="url"
              label="URL"
              placeholder="URL"
              size="sm"
              value={newMatch?.url}
              onChange={(e) =>
                setNewMatch({ ...newMatch, url: e.target.value })
              }
            />
          </div>

          <Button
            size="sm"
            className={
              matches.find((match) => match.id === newMatch?.id) == newMatch
                ? "bg-selfprimary-300"
                : "bg-selfsecondary-200"
            }
            onClick={() => {
              updateMatch(newMatch).then((data) => {
                if (data.status === 200) {
                  getMatches().then((data) => {
                    setMatches(data);
                    setNewMatch(
                      data.find((match) => match.id === newMatch.id) as Match,
                    );
                    alert("Sikeres frissítés!");
                  });
                }
              });
              setSettings(newSettings);
            }}
          >
            Mentés
          </Button>

          <div className="my-5 grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="flex items-center gap-2">
              <Input
                title="score1"
                placeholder="Csapat 1 pont"
                size="lg"
                type="number"
                className=""
                value={String(newMatch?.score1)}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, score1: Number(e.target.value) })
                }
              />
              <Button
                size="lg"
                className="w-14 bg-selfsecondary-200 p-0"
                onClick={() =>
                  setNewMatch({
                    ...newMatch,
                    score1: (newMatch?.score1 || 0) + 1,
                  })
                }
              >
                +1 pont
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                title="score2"
                placeholder="Csapat 2 pont"
                size="lg"
                type="number"
                value={String(newMatch?.score2)}
                onChange={(e) =>
                  setNewMatch({
                    ...newMatch,
                    score2: Number(e.target.value),
                  })
                }
              />
              <Button
                size="lg"
                className="w-14 bg-selfsecondary-200 p-0"
                onClick={() =>
                  setNewMatch({
                    ...newMatch,
                    score2: (newMatch?.score2 || 0) + 1,
                  })
                }
              >
                +1 pont
              </Button>
            </div>

            <Input
              title="team1"
              placeholder="Csapat 1"
              size="sm"
              value={newMatch?.team1}
              onChange={(e) =>
                setNewMatch({ ...newMatch, team1: e.target.value })
              }
            />
            <Input
              title="team2"
              placeholder="Csapat 2"
              size="sm"
              value={newMatch?.team2}
              onChange={(e) =>
                setNewMatch({ ...newMatch, team2: e.target.value })
              }
            />
            <Input
              title="team_short1"
              placeholder="Csapat 1 rövidítve"
              size="sm"
              value={newMatch?.team_short1}
              onChange={(e) =>
                setNewMatch({ ...newMatch, team_short1: e.target.value })
              }
            />
            <Input
              title="team_short2"
              placeholder="Csapat 2 rövidítve"
              size="sm"
              value={newMatch?.team_short2}
              onChange={(e) =>
                setNewMatch({ ...newMatch, team_short2: e.target.value })
              }
            />

            <Input
              title="image1"
              placeholder="Csapat 1 kép"
              size="sm"
              value={newMatch?.image1}
              onChange={(e) =>
                setNewMatch({ ...newMatch, image1: e.target.value })
              }
            />
            <Input
              title="image2"
              placeholder="Csapat 2 kép"
              size="sm"
              value={newMatch?.image2}
              onChange={(e) =>
                setNewMatch({ ...newMatch, image2: e.target.value })
              }
            />
          </div>

          <ButtonGroup>
            <Button
              size="sm"
              onClick={() => setNewMatch({ ...newMatch, status: "Upcoming" })}
              className={
                newMatch?.status === "Upcoming" ? "bg-selfsecondary-200" : ""
              }
            >
              Következő
            </Button>
            <Button
              size="sm"
              onClick={() => setNewMatch({ ...newMatch, status: "Live" })}
              className={
                newMatch?.status === "Live" ? "bg-selfsecondary-200" : ""
              }
            >
              Élő
            </Button>
            <Button
              size="sm"
              onClick={() => setNewMatch({ ...newMatch, status: "Finished" })}
              className={
                newMatch?.status === "Finished" ? "bg-selfsecondary-200" : ""
              }
            >
              Befejezett
            </Button>
          </ButtonGroup>
          <Input
            title="time"
            label='Idő manuálisan / ("auto")'
            placeholder="Idő"
            size="sm"
            value={newMatch?.time}
            onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <Input
              title="start_time"
              label="Kezdés"
              disabled={true}
              placeholder="Kezdés"
              size="sm"
              value={newMatch?.start_time}
              onChange={(e) =>
                setNewMatch({ ...newMatch, start_time: e.target.value })
              }
            />
            <Input
              type="datetime-local"
              title="start_time"
              label="Kezdés kiválasztása"
              placeholder="Kezdés"
              size="sm"
              onChange={(e) =>
                setNewMatch({
                  ...newMatch,
                  start_time: formatDate(e.target.value),
                })
              }
            />

            <Input
              title="end_time"
              label="Vége"
              disabled={true}
              placeholder="Vége"
              size="sm"
              value={newMatch?.end_time}
              onChange={(e) =>
                setNewMatch({ ...newMatch, end_time: e.target.value })
              }
            />
            <Input
              type="datetime-local"
              title="end_time"
              label="Vége kiválasztása"
              placeholder="Vége"
              size="sm"
              onChange={(e) =>
                setNewMatch({
                  ...newMatch,
                  end_time: formatDate(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="p-2">
        <h1 className="text-2xl font-semibold">Következő meccs</h1>
        <p>ID: {comingMatch?.id}</p>
        <p>URL: {comingMatch?.url}</p>
        <p>Csapat 1: {comingMatch?.team1}</p>
        <p>Csapat 2: {comingMatch?.team2}</p>
        <p>Csapat 1 rövidítve: {comingMatch?.team_short1}</p>
        <p>Csapat 2 rövidítve: {comingMatch?.team_short2}</p>
        <p>Csapat 1 pont: {comingMatch?.score1}</p>
        <p>Csapat 2 pont: {comingMatch?.score2}</p>
        <p>Csapat 1 kép: {comingMatch?.image1}</p>
        <p>Csapat 2 kép: {comingMatch?.image2}</p>
        <p>Státusz: {comingMatch?.status}</p>
        <p>Idő: {comingMatch?.time}</p>
        <p>Kezdés: {comingMatch?.start_time}</p>
        <p>Vége: {comingMatch?.end_time}</p>
      </div>

      <div className="rounded-lg bg-selfprimary-200 p-2">
        {matches &&
          matches.map((match) => (
            <div key={match.id} className="m-2">
              <h1 className="text-2xl font-semibold">Meccs</h1>
              <p>ID: {match.id}</p>
              <p>URL: {match.url}</p>
              <p>Csapat 1: {match.team1}</p>
              <p>Csapat 2: {match.team2}</p>
              <p>Csapat 1 rövidítve: {match.team_short1}</p>
              <p>Csapat 2 rövidítve: {match.team_short2}</p>
              <p>Csapat 1 pont: {match.score1}</p>
              <p>Csapat 2 pont: {match.score2}</p>
              <p>Csapat 1 kép: {match.image1}</p>
              <p>Csapat 2 kép: {match.image2}</p>
              <p>Státusz: {match.status}</p>
              <p>Idő: {match.time}</p>
              <p>Kezdés: {match.start_time}</p>
              <p>Vége: {match.end_time}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PageSettings;
