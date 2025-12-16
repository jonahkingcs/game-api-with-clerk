import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Game from "@/models/Game";

export const runtime = "nodejs";

export async function GET() {
    await connectDB();
    const games = await Game.find({}).lean();
    return NextResponse.json({ Games: games });
}