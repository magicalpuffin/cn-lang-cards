import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const task = sqliteTable("task", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	timestamp: integer({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	cardSet: text({ mode: "json" }),
});
