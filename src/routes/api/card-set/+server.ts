import { json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import Value from "typebox/value";
import { cardSets } from "$lib/server/db/schema";
import { CardSet } from "$lib/types";
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
	let cardSet: CardSet;
	try {
		cardSet = Value.Parse(CardSet, body.cardSet);
	} catch (e) {
		return json({ error: "Invalid card set" }, { status: 400 });
	}

	const db = drizzle(platform.env.DB);
	const sessionId = locals.session.id;

	const existing = await db
		.select()
		.from(cardSets)
		.where(and(eq(cardSets.sessionId, sessionId), eq(cardSets.cardSetId, cardSet.id)))
		.limit(1);

	if (existing.length > 0) {
		const updated = await db
			.update(cardSets)
			.set({ cardSet, timestamp: new Date() })
			.where(eq(cardSets.id, existing[0].id))
			.returning();

		return json({ task: updated[0] }, { status: 200 });
	}

	const inserted = await db
		.insert(cardSets)
		.values({
			cardSetId: cardSet.id,
			sessionId,
			cardSet,
		})
		.returning();

	return json({ task: inserted[0] }, { status: 201 });
};
