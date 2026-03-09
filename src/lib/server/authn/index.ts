import { eq } from "drizzle-orm";
import type { Database } from "$lib/server/db";
import { sessions } from "$lib/server/db/schema";
import { type Cookie, CookieController } from "./cookie";
import type { Session } from "./interface";
import {
	createExpirationDate,
	isBeforeExpirationDate,
	TimeSpan,
} from "./timespan";
import { generateToken, hashToken } from "./token";

export const sessionCookieName = "cn-lang-card-session";
export const sessionExpiresIn = new TimeSpan(90, "d");
export const sessionCookieController = new CookieController(
	sessionCookieName,
	{
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
	},
	{ expiresIn: sessionExpiresIn },
);

export async function createSession(db: Database) {
	const sessionToken = generateToken(18);
	const tokenHash = hashToken(sessionToken);
	const sessionExpiresAt = createExpirationDate(sessionExpiresIn);
	const [createdSession] = await db
		.insert(sessions)
		.values({
			tokenHash,
			expiresAt: sessionExpiresAt,
		})
		.returning();

	const session: Session = {
		id: createdSession.id,
		token: sessionToken,
		fresh: true,
		expiresAt: createdSession.expiresAt,
	};
	const sessionCookie = createSessionCookie(sessionToken);

	return { session, sessionCookie };
}

export async function validateSession(db: Database, token: string) {
	const tokenHash = hashToken(token);
	const activeSession = await db.query.sessions.findFirst({
		where: eq(sessions.tokenHash, tokenHash),
	});

	if (!activeSession) {
		const sessionCookie = createBlankSessionCookie();
		return { session: null, sessionCookie };
	}

	// if session is expired
	if (!isBeforeExpirationDate(activeSession.expiresAt)) {
		await invalidateSession(db, tokenHash);
		const sessionCookie = createBlankSessionCookie();
		return { session: null, sessionCookie };
	}
	const session: Session = {
		id: activeSession.id,
		token,
		fresh: false,
		expiresAt: activeSession.expiresAt,
	};

	const activePeriodExpirationDate = new Date(
		activeSession.expiresAt.getTime() - sessionExpiresIn.milliseconds() / 2,
	);

	// if session is no longer active, renew session
	if (!isBeforeExpirationDate(activePeriodExpirationDate)) {
		session.fresh = true;
		session.expiresAt = createExpirationDate(sessionExpiresIn);
		await db
			.update(sessions)
			.set({ expiresAt: session.expiresAt })
			.where(eq(sessions.tokenHash, tokenHash));
	}
	const sessionCookie = createSessionCookie(token);
	return { session, sessionCookie };
}

export async function invalidateSession(db: Database, tokenHash: string) {
	await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export function createSessionCookie(token: string): Cookie {
	return sessionCookieController.createCookie(token);
}

export function createBlankSessionCookie(): Cookie {
	return sessionCookieController.createBlankCookie();
}
