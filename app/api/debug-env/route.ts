
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    env_keys: Object.keys(process.env).filter(k => k.includes("API") || k.includes("KEY")),
    runtime: "edge"
  });
}
