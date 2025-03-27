"use client";
import { Match, Team } from "@/db/matches";
import React from "react";
import { getColorClass } from "./manageTeams";
import { Button } from "@heroui/react";
import "@/components/navbar/headspace/timer.css";

function getBetweenContent(match: Match) {
  switch (match.status) {
    case "pending":
      return (
        <div className="text-md text-gray-500">
          <p className="">
            {new Date(match.datetime).toLocaleTimeString("hu-HU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-xl font-bold">vs</p>
        </div>
      );
    case "live":
      return (
        <div>
          <p className="text-xl font-bold">
            {match.team1_score} - {match.team2_score}
          </p>
          <div className="h-1 w-full overflow-hidden">
            <div className="animate-grow-line-x mx-auto h-full w-1/2 bg-green-500"></div>
          </div>
        </div>
      );
    case "finished":
      return (
        <p className="text-3xl font-bold">
          {match.team1_score} - {match.team2_score}
        </p>
      );
    default:
      return <span className="text-sm text-gray-500">Unknown</span>;
  }
}

const ManageMatches = () => {
  const [matches, setMatches] = React.useState<Match[]>();
  const [teams, setTeams] = React.useState<Team[]>();
  const [matchFilter, setMatchFilter] = React.useState<Team[]>([]);

  function fetchMatches() {
    fetch("/api/getMatches", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(
          data.toSorted((a, b) => a.datetime.localeCompare(b.datetime)),
        );
      });
  }

  React.useEffect(() => {
    fetch("/api/getTeams", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
      });

    fetchMatches();
  }, []);

  function updateMatch(match: Match) {
    fetch("/api/editMatch", {
      method: "POST",
      headers: {
        module: "matches",
      },
      body: JSON.stringify({
        match: match,
      }),
    }).then((res) => {
      if (res.ok) fetchMatches();
    });
  }

  if (!matches)
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-auto overflow-x-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="m-auto min-w-fit"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
        </svg>
        {teams?.map((team) => (
          <button
            key={team.id}
            className={
              "min-w-fit rounded-lg p-1 text-xl font-bold " +
              getColorClass(team.group_letter) +
              (matchFilter.includes(team) ? "" : " opacity-15")
            }
            onClick={() => {
              if (matchFilter.includes(team)) {
                setMatchFilter(matchFilter.filter((t) => t !== team));
              } else {
                setMatchFilter([...matchFilter, team]);
              }
            }}
          >
            <img
              className="h-6 w-6 rounded-lg border-gray-500"
              src={team.image_url}
              alt={team.name}
            />
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {matches
          .filter((match) => {
            if (matchFilter.length === 0) return true;
            return (
              matchFilter.some((team) => team.id === match.team1_id) ||
              matchFilter.some((team) => team.id === match.team2_id)
            );
          })
          .map((match) => (
            <div key={match.id}>
              <div
                key={match.id}
                className={
                  "grid grid-cols-3 items-center justify-between gap-2 rounded-lg p-2 text-center " +
                  getColorClass(match.group_letter)
                }
              >
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="mx-1 h-9 w-9 rounded-lg border-gray-500"
                    src={
                      teams?.find((team) => team.id === match.team1_id)
                        ?.image_url
                    }
                    alt={
                      teams?.find((team) => team.id === match.team1_id)?.name
                    }
                  />
                  <span>
                    {teams?.find((team) => team.id === match.team1_id)?.name}
                  </span>
                </div>
                <div>{getBetweenContent(match)}</div>
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="mx-1 h-9 w-9 rounded-lg border-gray-500"
                    src={
                      teams?.find((team) => team.id === match.team2_id)
                        ?.image_url
                    }
                    alt={
                      teams?.find((team) => team.id === match.team2_id)?.name
                    }
                  />
                  <span>
                    {teams?.find((team) => team.id === match.team2_id)?.name}
                  </span>
                </div>
              </div>
              <div className="flex">
                <Button
                  color="primary"
                  className="m-2"
                  onPress={() => {
                    const updatedMatch: Match = {
                      ...match,
                      team1_score: match.team1_score + 1,
                      team2_score: match.team2_score,
                    };
                    updateMatch(updatedMatch);
                  }}
                >
                  +1
                </Button>
                <Button
                  className="m-2"
                  onPress={() => {
                    const updatedMatch: Match = {
                      ...match,
                      team1_score: 0,
                      team2_score: 0,
                      status: "pending",
                    };
                    updateMatch(updatedMatch);
                  }}
                >
                  Reset Match (Pending)
                </Button>
                <Button
                  className="m-2"
                  onPress={() => {
                    const updatedMatch: Match = {
                      ...match,
                      start_time: new Date().toISOString(),
                      status: "live",
                    };
                    updateMatch(updatedMatch);
                  }}
                >
                  Start Match
                </Button>
                <Button
                  className="m-2"
                  onPress={() => {
                    const updatedMatch: Match = {
                      ...match,
                      status: "finished",
                    };
                    updateMatch(updatedMatch);
                  }}
                >
                  Finish Match
                </Button>
                <Button
                  color="primary"
                  className="m-2"
                  onPress={() => {
                    const updatedMatch: Match = {
                      ...match,
                      team1_score: match.team1_score,
                      team2_score: match.team2_score + 1,
                    };
                    updateMatch(updatedMatch);
                  }}
                >
                  +1
                </Button>
              </div>
            </div>
          ))}
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Add New Match</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newMatch = {
              team1_id: Number(formData.get("team1_id")),
              team2_id: Number(formData.get("team2_id")),
              datetime: formData.get("datetime") as string,
            };
            fetch("/api/createMatch", {
              method: "POST",
              headers: {
                module: "matches",
              },
              body: JSON.stringify(newMatch),
            })
              .then((res) => res.json())
              .then((data) => {
                setMatches([...matches, data]);
              });
          }}
          className="flex flex-col gap-2"
        >
          <select name="team1_id" required>
            <option value="">Select Team 1</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <select name="team2_id" required>
            <option value="">Select Team 2</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="datetime"
            required
            className="rounded border p-2"
          />
          <button type="submit" className="rounded bg-blue-500 p-2 text-white">
            Add Match
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Edit Match</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updatedMatch = {
              id: Number(formData.get("id")),
              team1_id: Number(formData.get("team1_id")),
              team2_id: Number(formData.get("team2_id")),
              datetime: formData.get("datetime") as string,
            };
            fetch("/api/editMatch", {
              method: "POST",
              headers: {
                module: "matches",
              },
              body: JSON.stringify(updatedMatch),
            })
              .then((res) => res.json())
              .then((data) => {
                setMatches(
                  matches.map((match) => (match.id === data.id ? data : match)),
                );
              });
          }}
          className="flex flex-col gap-2"
        >
          <select name="id" required>
            <option value="">Select Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {teams?.find((team) => team.id === match.team1_id)?.name} vs{" "}
                {teams?.find((team) => team.id === match.team2_id)?.name}
              </option>
            ))}
          </select>
          <select name="team1_id" required>
            <option value="">Select Team 1</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <select name="team2_id" required>
            <option value="">Select Team 2</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="datetime"
            required
            className="rounded border p-2"
          />
          <button type="submit" className="rounded bg-blue-500 p-2 text-white">
            Edit Match
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Delete Match</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const matchId = Number(formData.get("id"));
            fetch("/api/deleteMatch", {
              method: "POST",
              headers: {
                module: "matches",
              },
              body: JSON.stringify({ id: matchId }),
            })
              .then((res) => res.json())
              .then(() => {
                setMatches(matches.filter((match) => match.id !== matchId));
              });
          }}
          className="flex flex-col gap-2"
        >
          <select name="id" required>
            <option value="">Select Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {teams?.find((team) => team.id === match.team1_id)?.name} vs{" "}
                {teams?.find((team) => team.id === match.team2_id)?.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded bg-red-500 p-2 text-white">
            Delete Match
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Pin Match</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const matchId = Number(formData.get("id"));
            fetch("/api/pinMatch", {
              method: "POST",
              headers: {
                module: "matches",
              },
              body: JSON.stringify({ id: matchId }),
            })
              .then((res) => res.json())
              .then(() => {
                // Handle pinning logic
              });
          }}
          className="flex flex-col gap-2"
        >
          <select name="id" required>
            <option value="">Select Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {teams?.find((team) => team.id === match.team1_id)?.name} vs{" "}
                {teams?.find((team) => team.id === match.team2_id)?.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-yellow-500 p-2 text-white"
          >
            Pin Match
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Unpin Match</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const matchId = Number(formData.get("id"));
            fetch("/api/unpinMatch", {
              method: "POST",
              headers: {
                module: "matches",
              },
              body: JSON.stringify({ id: matchId }),
            })
              .then((res) => res.json())
              .then(() => {
                // Handle unpinning logic
              });
          }}
          className="flex flex-col gap-2"
        >
          <select name="id" required>
            <option value="">Select Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {teams?.find((team) => team.id === match.team1_id)?.name} vs{" "}
                {teams?.find((team) => team.id === match.team2_id)?.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded bg-gray-500 p-2 text-white">
            Unpin Match
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Set Match Result</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const matchId = Number(formData.get("id"));
            const result = formData.get("result") as string;
            fetch("/api/setMatchResult", {
              method: "POST",
              headers: {
                module: "matches",
              },
              body: JSON.stringify({ id: matchId, result }),
            })
              .then((res) => res.json())
              .then(() => {
                // Handle setting match result logic
              });
          }}
          className="flex flex-col gap-2"
        >
          <select name="id" required>
            <option value="">Select Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {teams?.find((team) => team.id === match.team1_id)?.name} vs{" "}
                {teams?.find((team) => team.id === match.team2_id)?.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="result"
            required
            placeholder="Enter result (e.g., 3-1)"
            className="rounded border p-2"
          />
          <button type="submit" className="rounded bg-green-500 p-2 text-white">
            Set Result
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageMatches;
