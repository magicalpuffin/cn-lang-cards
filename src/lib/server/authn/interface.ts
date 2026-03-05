export interface Session {
	id: string;
	token: string;
	fresh: boolean;
	expiresAt: Date;
}
