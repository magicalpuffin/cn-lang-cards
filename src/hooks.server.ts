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
	if (!sessionToken) {
		const { session, sessionCookie } = await authn.createSession(db);
		event.cookies.set(sessionCookieName, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		event.locals.session = session;
		return resolve(event);
	}

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
	if (!session) {
		event.cookies.set(sessionCookieName, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		event.locals.session = null;
		return resolve(event);
	}

	event.locals.session = session;

	return resolve(event);
};
