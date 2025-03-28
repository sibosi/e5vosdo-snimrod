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

const ManageMatches = (
  {
    isOrganiser,
  }: {
    isOrganiser: boolean;
  } = { isOrganiser: false },
) => {
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
              {isOrganiser && (
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
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ManageMatches;
