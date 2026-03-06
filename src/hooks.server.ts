import { error, type Handle } from "@sveltejs/kit";
import * as authn from "$lib/server/authn";
import { initializeDrizzle } from "$lib/server/db";

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.platform?.env?.DB) {
		return error(500);
	}

	const db = initializeDrizzle(event.platform.env.DB);

	const sessionCookieName = authn.sessionCookieName;
	const sessionToken = event.cookies.get(sessionCookieName);

	// if no sessionToken, create new session
	if (!sessionToken) {
		const { session, sessionCookie } = await authn.createSession(db);
		event.cookies.set(sessionCookieName, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		event.locals.session = session;
		return resolve(event);
	}

	// validate sessionToken, set local session if fresh
	const { session, sessionCookie } = await authn.validateSession(
		db,
		sessionToken,
	);
	if (session?.fresh) {
		event.cookies.set(sessionCookieName, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});
	}

	// if no session, create new session
	if (!session) {
		const { session, sessionCookie } = await authn.createSession(db);
		event.cookies.set(sessionCookieName, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		event.locals.session = session;
		return resolve(event);
	}

	event.locals.session = session;

	return resolve(event);
};
