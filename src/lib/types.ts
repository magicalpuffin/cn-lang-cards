export interface FlashCard {
	id: string;
	chinese: string;
	pinyin: string;
	english: string;
	createdAt: number;
}

export type StudyMode = 'random' | 'sequential';
