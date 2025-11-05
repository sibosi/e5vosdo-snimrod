import { NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { EventType } from "@/db/event";
import https from "https";

export async function GET() {
  let cache: { data: any; timestamp: number } | null =
    (globalThis as any)._ejgCache ?? null;
  const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2h

  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  const response = await updater();

  if (response.status === 200) {
    const data = await response.json();
    cache = { data, timestamp: now };
    (global as any)._ejgCache = cache;
    return NextResponse.json(data);
  } else {
    return response;
  }
}

async function updater() {
  try {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Disables SSL certificate verification
    });

    console.log("Fetching events from EJG website...");
    const response = await fetch("https://www.ejg.hu/utemterv-aktualis/", {
      agent: httpsAgent,
    });

    if (!response.ok) {
      console.error(`Failed to fetch from EJG: Status ${response.status}`);
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const htmlContent = await response.text();
    const events = parseEventsFromHTML(htmlContent);
    console.log(`Parsed ${events.length} events from EJG`);

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Error fetching external events:", error);
    return NextResponse.json(
      { error: "Failed to fetch external events", details: error.message },
      { status: 500 },
    );
  }
}

function parseEventsFromHTML(html: string): EventType[] {
  const $ = cheerio.load(html);
  const events: EventType[] = [];

  let currentYearPeriodStarterYear = new Date().getUTCFullYear();

  try {
    $("h1").each((i, elem) => {
      const text = $(elem).text().trim();
      try {
        currentYearPeriodStarterYear = Number(text.split("-")[0].slice(-4));
      } catch (error) {
        console.error("Error extracting year:", error);
      }
    });
  } catch (error) {
    console.error("Error processing header:", error);
  }

  function getYear(month: number) {
    if (month < 0 || month > 11) throw new Error("Invalid month");
    return month < 9 - 1
      ? currentYearPeriodStarterYear + 1
      : currentYearPeriodStarterYear;
  }

  try {
    // Event rows
    $("table tr").each((i, row) => {
      try {
        // Skip header rows and rows with insufficient data
        const cells = $(row).find("td");
        if (cells.length < 4) return;

        const dateCell = $(cells[0]).text().trim();
        const dayCell = $(cells[1]).text().trim();
        const timeCell = $(cells[2]).text().trim();
        const titleCell = $(cells[3]).text().trim();

        // Skip empty rows
        if (!dateCell || !titleCell) return;

        // Parse the date
        const dateParts = dateCell.split(" ");
        if (dateParts.length < 2) return;

        const monthMap: { [key: string]: number } = {
          január: 0,
          február: 1,
          március: 2,
          április: 3,
          május: 4,
          június: 5,
          július: 6,
          augusztus: 7,
          szeptember: 8,
          október: 9,
          november: 10,
          december: 11,
        };

        const month = monthMap[dateParts[0].toLowerCase()];
        const day = parseInt(dateParts[1].replace(/\D/g, ""));

        if (month !== undefined && !isNaN(day)) {
          const currentYear = getYear(month);
          let eventDate = new Date(currentYear, month, day);

          // Parse time if available (format: "HH:MM")
          if (timeCell) {
            const timeParts = timeCell.split(":");
            if (timeParts.length === 2) {
              const hour = parseInt(timeParts[0]);
              const minute = parseInt(timeParts[1]);
              if (!isNaN(hour) && !isNaN(minute)) {
                eventDate.setHours(hour, minute);
              }
            }
          }

          const event: EventType = {
            id: 0,
            title: titleCell,
            time: eventDate.toISOString(),
            description: null,
            hide_time: new Date(
              eventDate.getTime() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(), // Hide after 7 days
            show_time: new Date(
              eventDate.getTime() - 28 * 24 * 60 * 60 * 1000,
            ).toISOString(), // Show 28 days before
            tags: ["EJG"],
            image: null,
          };

          events.push(event);
        }
      } catch (rowError) {
        console.error("Error parsing row:", rowError);
      }
    });
  } catch (parseError) {
    console.error("Error parsing HTML:", parseError);
  }

  return events;
}
