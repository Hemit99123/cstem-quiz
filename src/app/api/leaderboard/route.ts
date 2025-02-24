/* eslint-disable */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define the type for leaderboard entries
interface LeaderboardEntry {
  name: string;
  score: number;
  time: string;
}

// Path to the JSON file that stores the leaderboard
const leaderboardFilePath = path.join(process.cwd(), "leaderboard.json");

export async function GET() {
  try {
    const data = fs.readFileSync(leaderboardFilePath, "utf8");
    const leaderboard: LeaderboardEntry[] = JSON.parse(data);
    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const newEntry: LeaderboardEntry = await request.json();
  let leaderboard: LeaderboardEntry[] = [];
  
  try {
    const data = fs.readFileSync(leaderboardFilePath, "utf8");
    leaderboard = JSON.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read leaderboard data" });
  }

  // Check if an entry with the same username exists
  const existingIndex = leaderboard.findIndex(entry => entry.name === newEntry.name);
  if (existingIndex !== -1) {
    leaderboard[existingIndex] = newEntry;
  } else {
    leaderboard.push(newEntry);
  }
  
  // Sort the leaderboard by score descending and keep the top 5 entries
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  try {
    fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard, null, 2));
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leaderboard" });
  }

  return NextResponse.json(leaderboard);
}
