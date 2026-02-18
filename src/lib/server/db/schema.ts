import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const shareCardSet = sqliteTable("share_card_set", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	timestamp: integer("timestamp", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	cardSet: text("card_set", { mode: "json" }),
});
