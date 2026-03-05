import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";

export function generateToken(size: number) {
	const bytes = crypto.getRandomValues(new Uint8Array(size));
	const token = encodeBase64url(bytes);
	return token;
}

export function hashToken(token: string) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}
