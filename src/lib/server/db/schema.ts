import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const cardSets = sqliteTable("card_sets", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	sessionId: text("session_id")
		.notNull()
		.references(() => sessions.id),
	cardSetId: text("card_set_id").notNull(),
	timestamp: integer("timestamp", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	cardSet: text("card_set", { mode: "json" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	tokenHash: text("token_hash").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const cardSetRelations = relations(cardSets, ({ one }) => ({
	session: one(sessions, {
		fields: [cardSets.sessionId],
		references: [sessions.id],
	}),
}));
