import { NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { EventType } from "@/db/event";
import https from "https";

export async function GET() {
  try {
    // Create an HTTPS agent disabling certificate verification
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // WARNING: Disables SSL certificate verification
    });

    console.log("Fetching events from EJG website...");
    const response = await fetch("https://www.ejg.hu/utemterv-aktualis/", {
      agent: httpsAgent,
      // node-fetch doesn't support a 'cache' option, so remove if not needed
    });

    if (!response.ok) {
      console.error(`Failed to fetch from EJG: Status ${response.status}`);
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const htmlContent = await response.text();
    console.log(`Received HTML content (${htmlContent.length} bytes)`);

    // Parse the HTML content to extract events
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

  try {
    // Find the table rows containing events
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

        // Parse the date (format: "hónap nap." e.g., "március 31.")
        const dateParts = dateCell.split(" ");
        if (dateParts.length < 2) return;

        // Map Hungarian month names to numbers
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
        // Parse day, removing any trailing period
        const day = parseInt(dateParts[1].replace(/\D/g, ""));

        // If valid date parts
        if (month !== undefined && !isNaN(day)) {
          // Create date for the event, assuming current year or next if the month is earlier than current month
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          let eventDate = new Date(currentYear, month, day);

          // If the month is earlier than current month, assume it's for next year
          if (eventDate < currentDate && month < currentDate.getMonth()) {
            eventDate.setFullYear(currentYear + 1);
          }

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

          // Create an event object matching EventType
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
        // Continue processing other rows even if one fails
      }
    });
  } catch (parseError) {
    console.error("Error parsing HTML:", parseError);
  }

  return events;
}
