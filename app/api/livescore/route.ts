import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";
import { getComingMatch, getPageSettings, updateMatch } from "@/db/dbreq";

const cache = new NodeCache();

const oldFetchSoccerData = async () => {
  try {
    // Replace this URL with the actual URL you are scraping
    const url = (await getComingMatch()) as string;
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);

    // Extract the game details
    const teams = $("h3").text().trim();
    const score = $(".detail")
      .eq(0)
      .text()
      .trim()
      .split(" ")[0]
      .split(":")
      .map(Number);
    const halftimeScore = $(".detail").eq(1).text().trim();
    const gameTime = $(".detail").eq(2).text().trim();
    const events: any[] = [];

    $("#detail-tab-content .incident.soccer").each((index, element) => {
      const time = $(element).find(".i-field.time").text().trim();
      const iconElement = $(element).find(".i-field.icon");
      const eventType = iconElement.attr("class")
        ? iconElement.attr("class")?.split(" ")[1]
        : "unknown";
      const eventDetail = $(element).text().trim();
      events.push({ time, eventType, eventDetail });
    });

    // Construct the response object
    const gameData = {
      teams,
      score,
      halftimeScore,
      gameTime,
      events,
    };

    return gameData;
  } catch (error) {
    return { error: error };
  }
};

const fetchSoccerData = async () => {
  try {
    // Replace this URL with the actual URL you are scraping
    const url = ((await getComingMatch()) as any).url;
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);

    // Extract the game details
    const teams = $("h3").text().trim().split(" - ");

    const firstDetail = $(".detail").eq(0).text().trim();
    const secondDetail = $(".detail").eq(1).text().trim();

    const score = $(".detail")
      .eq(0)
      .text()
      .trim()
      .split(" ")[0]
      .split(":")
      .map(Number);

    const halftimeScore = $(".detail").eq(1).text().trim();
    const time = halftimeScore.split(" ").reverse()[0];
    const startTime = $(".detail").eq(2).text().trim();
    const events = [];

    $("#detail-tab-content .incident.soccer").each((index, element) => {
      const time = $(element).find(".i-field.time").text().trim();
      const iconElement = $(element).find(".i-field.icon");
      const eventType = iconElement.attr("class")
        ? iconElement.attr("class")?.split(" ")[1]
        : "unknown";
      const eventDetail = $(element).text().trim();
      events.push({ time, eventType, eventDetail });
    });

    // Construct the response object in the desired format
    const gameData = {
      id: 1, // Assign a unique ID if necessary
      team1: teams[0] || "Unknown Team 1",
      team2: teams[1] || "Unknown Team 2",
      teamShort1: teams[0] ? teams[0].substring(0, 3).toUpperCase() : "???",
      teamShort2: teams[1] ? teams[1].substring(0, 3).toUpperCase() : "???",
      score1: score[0] || 0,
      score2: score[1] || 0,
      image1: `/flags/${teams[0]?.toLowerCase().replace(/\s+/g, "")}.png`,
      image2: `/flags/${teams[1]?.toLowerCase().replace(/\s+/g, "")}.png`,
      status:
        time === "Finished" ? "Finished" : time === "" ? "Upcoming" : "Live",
      time: time == "Time" ? "Félidő" : time,
      startTime: time === "" ? firstDetail.split(" ").reverse()[0] : startTime,
    };

    return gameData;
  } catch (error) {
    console.error("Error fetching soccer data:", error);
    return { error: error };
  }
};

export async function GET(req: NextRequest, res: NextResponse) {
  // Check if data is cached
  const cachedData = cache.get("soccerData");
  if (cachedData) {
    console.log("Using cached data...");
    return NextResponse.json(cachedData);
  }
  const soccerData: any = await fetchSoccerData();
  cache.set("soccerData", soccerData, 20); // In seconds
  console.log("Fetched new data...");
  updateMatch(soccerData.id, soccerData);
  return NextResponse.json(soccerData);
}

export async function POST(req: NextRequest, res: NextResponse) {
  return NextResponse.json({
    status: 500,
    message: "POST requests are not supported",
  });
}
