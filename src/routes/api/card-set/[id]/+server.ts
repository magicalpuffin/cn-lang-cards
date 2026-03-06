import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { cardSets } from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: "Database not available" }, { status: 500 });
	}

	const db = drizzle(platform.env.DB);
	const rows = await db
		.select()
		.from(cardSets)
		.where(eq(cardSets.id, params.id));

	if (rows.length === 0) {
		return json({ error: "Not found" }, { status: 404 });
	}

	return json({ shareCardSet: rows[0] });
};
