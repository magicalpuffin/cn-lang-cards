export interface FlashCard {
	id: string;
	chinese: string;
	pinyin: string;
	english: string;
	createdAt: number;
}

export interface CardSet {
	id: string;
	name: string;
	cards: FlashCard[];
	createdAt: number;
}

export type StudyMode = 'random' | 'sequential';
