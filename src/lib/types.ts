import Type from "typebox";

export const FlashCard = Type.Object({
	id: Type.String(),
	chinese: Type.String(),
	pinyin: Type.String(),
	english: Type.String(),
	createdAt: Type.Number(),
});
export type FlashCard = Type.Static<typeof FlashCard>;

export const CardSet = Type.Object({
	id: Type.String(),
	name: Type.String(),
	createdAt: Type.Number(),
	cards: Type.Array(FlashCard),
});
export type CardSet = Type.Static<typeof CardSet>;

export type StudyMode = "random" | "sequential";
