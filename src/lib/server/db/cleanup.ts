import { eq, lt } from "drizzle-orm";
import type { Database } from "./index";
import { cardSets, sessions } from "./schema";

export async function cleanupExpiredSessions(db: Database) {
	const now = new Date();

	// Find all expired sessions
	const expired = await db
		.select({ id: sessions.id })
		.from(sessions)
		.where(lt(sessions.expiresAt, now));

	if (expired.length === 0) return;

	// Delete card_sets belonging to expired sessions
	for (const { id } of expired) {
		await db.delete(cardSets).where(eq(cardSets.sessionId, id));
	}

	// Delete expired sessions
	await db.delete(sessions).where(lt(sessions.expiresAt, now));
}
