import { browser } from "$app/environment";
import type { CardSet, FlashCard } from "$lib/types";

export const DEFAULT_SET_ID = "default-set";

const STORAGE_KEY = "cn-lang-cards";

interface StorageData {
	cards: FlashCard[];
	sets: CardSet[];
	selectedSetId?: string;
}

function loadStorage(): StorageData {
	if (!browser) return { cards: [], sets: [] };
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return { cards: [], sets: [] };
		}
	}
	return { cards: [], sets: [] };
}

function ensureDefaultSet(sets: CardSet[]): CardSet[] {
	if (sets.some((s) => s.id === DEFAULT_SET_ID)) return sets;
	return [{ id: DEFAULT_SET_ID, name: "Default Set", createdAt: 0 }, ...sets];
}

function saveStorage(cards: FlashCard[], sets: CardSet[], selectedSetId?: string) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards, sets, selectedSetId }));
}

class CardStore {
	cards = $state<FlashCard[]>([]);
	cardSets = $state<CardSet[]>([]);
	selectedSetId = $state<string>(DEFAULT_SET_ID);

	constructor() {
		const data = loadStorage();
		this.cards = data.cards;
		this.cardSets = ensureDefaultSet(data.sets);
		this.selectedSetId = data.selectedSetId ?? DEFAULT_SET_ID;
	}

	setSelectedSetId(id: string) {
		this.selectedSetId = id;
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
	}

	// Set methods
	addSet(name: string): string {
		const newSet: CardSet = {
			id: crypto.randomUUID(),
			name,
			createdAt: Date.now(),
		};
		this.cardSets = [...this.cardSets, newSet];
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
		return newSet.id;
	}

	updateSet(id: string, name: string) {
		this.cardSets = this.cardSets.map((s) =>
			s.id === id ? { ...s, name } : s,
		);
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
	}

	deleteSet(id: string) {
		if (id === DEFAULT_SET_ID) return;
		this.cardSets = this.cardSets.filter((s) => s.id !== id);
		this.cards = this.cards.filter((c) => c.setId !== id);
		if (this.selectedSetId === id) {
			this.selectedSetId = DEFAULT_SET_ID;
		}
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
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
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
	}

	deleteCard(id: string) {
		this.cards = this.cards.filter((c) => c.id !== id);
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
	}

	updateCard(
		id: string,
		updates: Partial<Omit<FlashCard, "id" | "createdAt">>,
	) {
		this.cards = this.cards.map((c) =>
			c.id === id ? { ...c, ...updates } : c,
		);
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
	}

	reorderCards(setId: string, orderedIds: string[]) {
		const otherCards = this.cards.filter((c) => c.setId !== setId);
		const cardMap = new Map(
			this.cards.filter((c) => c.setId === setId).map((c) => [c.id, c]),
		);
		const reordered = orderedIds
			.map((id) => cardMap.get(id))
			.filter((c): c is FlashCard => c !== undefined);
		this.cards = [...otherCards, ...reordered];
		saveStorage(this.cards, this.cardSets, this.selectedSetId);
	}

	getRandomOrder(setId: string): FlashCard[] {
		const cards = [...this.getCardsBySet(setId)];
		for (let i = cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[cards[i], cards[j]] = [cards[j], cards[i]];
		}
		return cards;
	}
}

export const cardStore = new CardStore();
