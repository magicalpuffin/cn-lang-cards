import { browser } from "$app/environment";
import type { CardSet, FlashCard } from "$lib/types";

export const DEFAULT_SET_ID = "default";

const STORAGE_KEY = "cn-lang-cards";

interface StorageData {
	cards: FlashCard[];
	sets: CardSet[];
}

function loadStorage(): StorageData {
	if (!browser) return { cards: [], sets: [] };
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		return JSON.parse(stored);
	}
	// Migrate from old keys if they exist
	const oldCards = localStorage.getItem("flashcards");
	const oldSets = localStorage.getItem("flashcard-sets");
	const data: StorageData = {
		cards: oldCards ? JSON.parse(oldCards) : [],
		sets: oldSets ? JSON.parse(oldSets) : [],
	};
	if (oldCards || oldSets) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		localStorage.removeItem("flashcards");
		localStorage.removeItem("flashcard-sets");
	}
	return data;
}

function ensureDefaultSet(sets: CardSet[]): CardSet[] {
	if (sets.some((s) => s.id === DEFAULT_SET_ID)) return sets;
	return [{ id: DEFAULT_SET_ID, name: "Default", createdAt: 0 }, ...sets];
}

function saveStorage(cards: FlashCard[], sets: CardSet[]) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards, sets }));
}

class CardStore {
	cards: FlashCard[];
	cardSets: CardSet[];

	constructor() {
		const data = loadStorage();
		this.cards = $state(data.cards);
		this.cardSets = $state(ensureDefaultSet(data.sets));
	}

	// Set methods
	addSet(name: string) {
		const newSet: CardSet = {
			id: crypto.randomUUID(),
			name,
			createdAt: Date.now(),
		};
		this.cardSets = [...this.cardSets, newSet];
		saveStorage(this.cards, this.cardSets);
	}

	updateSet(id: string, name: string) {
		this.cardSets = this.cardSets.map((s) =>
			s.id === id ? { ...s, name } : s,
		);
		saveStorage(this.cards, this.cardSets);
	}

	deleteSet(id: string) {
		if (id === DEFAULT_SET_ID) return;
		this.cardSets = this.cardSets.filter((s) => s.id !== id);
		this.cards = this.cards.filter((c) => c.setId !== id);
		saveStorage(this.cards, this.cardSets);
	}

	getCardsBySet(setId: string): FlashCard[] {
		return this.cards.filter((c) => c.setId === setId);
	}

	// Card methods
	addCard(card: Omit<FlashCard, "id" | "createdAt">) {
		const newCard: FlashCard = {
			...card,
			id: crypto.randomUUID(),
			createdAt: Date.now(),
		};
		this.cards = [...this.cards, newCard];
		saveStorage(this.cards, this.cardSets);
	}

	deleteCard(id: string) {
		this.cards = this.cards.filter((c) => c.id !== id);
		saveStorage(this.cards, this.cardSets);
	}

	updateCard(
		id: string,
		updates: Partial<Omit<FlashCard, "id" | "createdAt">>,
	) {
		this.cards = this.cards.map((c) =>
			c.id === id ? { ...c, ...updates } : c,
		);
		saveStorage(this.cards, this.cardSets);
	}

	getRandomOrder(setId: string): FlashCard[] {
		return this.getCardsBySet(setId).sort(() => Math.random() - 0.5);
	}
}

export const cardStore = new CardStore();
