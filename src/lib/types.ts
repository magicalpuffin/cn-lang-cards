export interface CardSet {
	id: string;
	name: string;
	createdAt: number;
}

export interface FlashCard {
	id: string;
	setId: string;
	chinese: string;
	pinyin: string;
	english: string;
	createdAt: number;
}

export type StudyMode = 'random' | 'sequential';
