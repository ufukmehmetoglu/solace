import db from "../../../db";
import { advocates } from "../../../db/schema";
import { NextRequest } from "next/server";
import { ilike, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");

  let data;
  if (search) {
    // Split search string into words, ignore extra spaces
    const words = search.trim().split(/\s+/);

    // For each word, create an OR condition across all fields
    const conditions = words.map(word =>
      or(
        ilike(advocates.firstName, `%${word}%`),
        ilike(advocates.lastName, `%${word}%`),
        ilike(advocates.city, `%${word}%`),
        ilike(advocates.degree, `%${word}%`)
      )
    );

    // Combine all word-conditions with AND (all words must match somewhere)
    data = await db
      .select()
      .from(advocates)
      .where(and(...conditions))
      .limit(10);
  } else {
    data = await db.select().from(advocates).limit(50);
  }

  return Response.json({ data });
}