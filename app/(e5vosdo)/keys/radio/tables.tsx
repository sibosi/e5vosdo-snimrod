export function WeekA() {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-700/70 bg-zinc-900 shadow-xl shadow-black/10">
      <table className="w-full min-w-[720px] border-collapse text-center text-sm text-zinc-200">
        <thead>
          <tr className="bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <th className="bg-amber-400 px-5 py-4 text-left text-zinc-950">
              Szünet
            </th>
            <th className="px-4 py-4">Hétfő</th>
            <th className="px-4 py-4">Kedd</th>
            <th className="px-4 py-4">Szerda</th>
            <th className="px-4 py-4">Csütörtök</th>
            <th className="px-4 py-4">Péntek</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800">
          {[
            {
              name: "1. szünet",
              people: [
                "Szalay Kevin",
                "Illés Gergő",
                "Paál-Koroknai Bence",
                "Miki",
                "Andris",
              ],
            },
            {
              name: "2. szünet",
              people: [
                "Jona",
                "Béki Bettina",
                "Viktor",
                "Horváth Jana",
                "Magyar Natasa",
              ],
            },
            {
              name: "3. szünet",
              people: [
                "Palai Patrik Baltazár",
                "Mező Bálint",
                "Nikó",
                "Geri és Bakai Szonja",
                "Miki",
              ],
            },
            {
              name: "1. nagyszünet",
              people: ["Szabó Fanni", "Nikó", "Árvay Dóra", "Andris", "Nikó"],
              long: true,
            },
            {
              name: "2. nagyszünet",
              people: [
                "Oros Ábel Regő",
                "Miki",
                "Pesti Vince",
                "Jona",
                "Viktor",
              ],
              long: true,
            },
          ].map((row) => (
            <tr
              key={row.name}
              className="group transition-colors duration-150 hover:bg-zinc-700/50"
            >
              <th
                scope="row"
                className={`whitespace-nowrap px-5 py-4 text-left font-semibold ${
                  row.long
                    ? "bg-orange-400/5 text-orange-300"
                    : "text-amber-400"
                }`}
              >
                {row.name}
              </th>

              {row.people.map((person, index) => (
                <td
                  key={index}
                  className={`whitespace-nowrap px-4 py-4 transition-colors group-hover:bg-transparent ${
                    row.long
                      ? "bg-orange-400/[0.025]"
                      : index % 2 === 0
                        ? "bg-zinc-900"
                        : "bg-zinc-800/30"
                  }`}
                >
                  {person}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WeekB() {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-700/70 bg-zinc-900 shadow-xl shadow-black/10">
      <table className="w-full min-w-[720px] border-collapse text-center text-sm text-zinc-200">
        <thead>
          <tr className="bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <th className="bg-amber-400 px-5 py-4 text-left text-zinc-950">
              Szünet
            </th>
            <th className="px-4 py-4">Hétfő</th>
            <th className="px-4 py-4">Kedd</th>
            <th className="px-4 py-4">Szerda</th>
            <th className="px-4 py-4">Csütörtök</th>
            <th className="px-4 py-4">Péntek</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800">
          {[
            {
              name: "1. szünet",
              people: ["Szabó Fanni", "Viktor", "Árvay Dóra", "Nikó", "Viktor"],
            },
            {
              name: "2. szünet",
              people: [
                "Oros Ábel Regő",
                "Miki",
                "Pesti Vince",
                "Andris",
                "Nikó",
              ],
            },
            {
              name: "3. szünet",
              people: ["Nikó", "Miki", "Béki Bettina", "Jona", "Andris"],
            },
            {
              name: "1. nagyszünet",
              people: [
                "Horváth Jana",
                "Magyar Natasa",
                "Mező Bálint",
                "Miki",
                "Jona",
              ],
              long: true,
            },
            {
              name: "2. nagyszünet",
              people: [
                "Szalay Kevin",
                "Geri és Bakai Szonja",
                "Paál-Koroknai Bence",
                "Illés Gergő",
                "Palai Patrik Baltazár",
              ],
              long: true,
            },
          ].map((row) => (
            <tr
              key={row.name}
              className="group transition-colors duration-150 hover:bg-zinc-700/50"
            >
              <th
                scope="row"
                className={`whitespace-nowrap px-5 py-4 text-left font-semibold ${
                  row.long
                    ? "bg-orange-400/5 text-orange-300"
                    : "text-amber-400"
                }`}
              >
                {row.name}
              </th>

              {row.people.map((person, index) => (
                <td
                  key={index}
                  className={`whitespace-nowrap px-4 py-4 transition-colors group-hover:bg-transparent ${
                    row.long
                      ? "bg-orange-400/[0.025]"
                      : index % 2 === 0
                        ? "bg-zinc-900"
                        : "bg-zinc-800/30"
                  }`}
                >
                  {person}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
