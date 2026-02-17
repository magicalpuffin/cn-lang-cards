import TextTranslationClient, {
	type TranslatorCredential,
	isUnexpected,
} from "@azure-rest/ai-translation-text";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env) {
		return json({ translation: "" }, { status: 500 });
	}

	const body = await request.json();
	const text = body?.text;

	if (!text || typeof text !== "string" || !text.trim()) {
		return json({ error: "Missing text" }, { status: 400 });
	}

	const credential: TranslatorCredential = {
		key: platform.env.AZ_TRANSLATOR_API_KEY,
		region: platform.env.AZ_REGION,
	};
	const translationClient = TextTranslationClient(
		"https://api.cognitive.microsofttranslator.com",
		credential,
	);

	const translateResponse = await translationClient.path("/translate").post({
		body: [{ text: text.trim() }],
		queryParameters: {
			to: "en",
			from: "zh-Hans",
		},
	});

	if (isUnexpected(translateResponse)) {
		return json({ error: "Translation failed" }, { status: 500 });
	}

	const translation = translateResponse.body[0]?.translations[0]?.text ?? "";

	return json({ translation });
};
