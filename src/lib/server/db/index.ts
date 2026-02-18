import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function initializeDrizzle(D1: DrizzleD1Database) {
	return drizzle(D1, { schema });
}
