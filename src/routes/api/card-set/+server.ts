import { json } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/d1";
import { cardSets } from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: "Database not available" }, { status: 500 });
	}

	const db = drizzle(platform.env.DB);
	const allCardSets = await db.select().from(cardSets);

	return json({ allCardSets });
};

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.session) {
		return json({ error: "Session not available" }, { status: 500 });
	}
	if (!platform?.env?.DB) {
		return json({ error: "Database not available" }, { status: 500 });
	}

	const body = await request.json();
	const db = drizzle(platform.env.DB);
	const inserted = await db
		.insert(cardSets)
		.values({ sessionId: locals.session.id, cardSet: body?.cardSet ?? null })
		.returning();

	return json({ task: inserted[0] }, { status: 201 });
};
