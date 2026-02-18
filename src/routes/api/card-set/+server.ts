import { json } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/d1";
import { shareCardSet } from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: "Database not available" }, { status: 500 });
	}

	const db = drizzle(platform.env.DB);
	const cardSets = await db.select().from(shareCardSet);

	return json({ cardSets });
};

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: "Database not available" }, { status: 500 });
	}

	const body = await request.json();
	const db = drizzle(platform.env.DB);
	const inserted = await db
		.insert(shareCardSet)
		.values({ cardSet: body?.cardSet ?? null })
		.returning();

	return json({ task: inserted[0] }, { status: 201 });
};
