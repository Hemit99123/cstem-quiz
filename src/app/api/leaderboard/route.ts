/* eslint no-use-before-define: 0 */ 

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to the JSON file that stores the leaderboard.
// Ensure that a file named "leaderboard.json" exists at the project root (e.g., with an empty array: [])
const leaderboardFilePath = path.join(process.cwd(), "leaderboard.json");

export async function GET() {
  try {
    const data = fs.readFileSync(leaderboardFilePath, "utf8");
    const leaderboard = JSON.parse(data);
    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const newEntry = await request.json(); // Expecting { name: string, score: number, time: string }
  let leaderboard: any[] = [];
  
  try {
    const data = fs.readFileSync(leaderboardFilePath, "utf8");
    leaderboard = JSON.parse(data);
  } catch (error) {
    leaderboard = [];
    return error
  }
  
  // Check if an entry with the same username exists
  const existingIndex = leaderboard.findIndex(entry => entry.name === newEntry.name);
  if (existingIndex !== -1) {
    // Update the existing entry with the new score and time
    leaderboard[existingIndex] = newEntry;
  } else {
    // Add new entry if username doesn't exist
    leaderboard.push(newEntry);
  }
  
  // Sort the leaderboard by score descending and keep the top 5 entries
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard, null, 2));
  return NextResponse.json(leaderboard);
}
