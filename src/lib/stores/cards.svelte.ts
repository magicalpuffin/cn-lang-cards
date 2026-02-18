import { nanoid } from "nanoid";
import { browser } from "$app/environment";
import type { CardSet, FlashCard } from "$lib/types";

export const DEFAULT_SET_ID = "default-set";

const STORAGE_KEY = "cn-lang-cards";

interface StorageData {
	sets: CardSet[];
	selectedSetId?: string;
}

function loadStorage(): StorageData {
	if (!browser) return { sets: [] };
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return { sets: [] };
		}
	}
	return { sets: [] };
}

function ensureDefaultSet(sets: CardSet[]): CardSet[] {
	if (sets.some((s) => s.id === DEFAULT_SET_ID)) return sets;
	return [
		{ id: DEFAULT_SET_ID, name: "Default Set", cards: [], createdAt: 0 },
		...sets,
	];
}

function saveStorage(sets: CardSet[], selectedSetId?: string) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ sets, selectedSetId }));
}

class CardStore {
	cardSets = $state<CardSet[]>([]);
	selectedSetId = $state<string>(DEFAULT_SET_ID);

	constructor() {
		const data = loadStorage();
		this.cardSets = ensureDefaultSet(data.sets);
		this.selectedSetId = data.selectedSetId ?? DEFAULT_SET_ID;
	}

	setSelectedSetId(id: string) {
		this.selectedSetId = id;
		saveStorage(this.cardSets, this.selectedSetId);
	}

	// Set methods
	addSet(name: string): string {
		const newSet: CardSet = {
			id: nanoid(),
			name,
			cards: [],
			createdAt: Date.now(),
		};
		this.cardSets = [...this.cardSets, newSet];
		saveStorage(this.cardSets, this.selectedSetId);
		return newSet.id;
	}

	updateSet(id: string, name: string) {
		this.cardSets = this.cardSets.map((s) =>
			s.id === id ? { ...s, name } : s,
		);
		saveStorage(this.cardSets, this.selectedSetId);
	}

	deleteSet(id: string) {
		if (id === DEFAULT_SET_ID) return;
		this.cardSets = this.cardSets.filter((s) => s.id !== id);
		if (this.selectedSetId === id) {
			this.selectedSetId = DEFAULT_SET_ID;
		}
		saveStorage(this.cardSets, this.selectedSetId);
	}

	getCardsBySet(setId: string): FlashCard[] {
		return this.cardSets.find((s) => s.id === setId)?.cards ?? [];
	}

	// Card methods
	addCard(setId: string, card: Omit<FlashCard, "id" | "createdAt">) {
		const newCard: FlashCard = {
			...card,
			id: nanoid(),
			createdAt: Date.now(),
		};
		this.cardSets = this.cardSets.map((s) =>
			s.id === setId ? { ...s, cards: [...s.cards, newCard] } : s,
		);
		saveStorage(this.cardSets, this.selectedSetId);
	}

	deleteCard(setId: string, id: string) {
		this.cardSets = this.cardSets.map((s) =>
			s.id === setId ? { ...s, cards: s.cards.filter((c) => c.id !== id) } : s,
		);
		saveStorage(this.cardSets, this.selectedSetId);
	}

	updateCard(
		setId: string,
		id: string,
		updates: Partial<Omit<FlashCard, "id" | "createdAt">>,
	) {
		this.cardSets = this.cardSets.map((s) =>
			s.id === setId
				? {
						...s,
						cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
					}
				: s,
		);
		saveStorage(this.cardSets, this.selectedSetId);
	}

	reorderCards(setId: string, orderedIds: string[]) {
		this.cardSets = this.cardSets.map((s) => {
			if (s.id !== setId) return s;
			const cardMap = new Map(s.cards.map((c) => [c.id, c]));
			const reordered = orderedIds
				.map((id) => cardMap.get(id))
				.filter((c): c is FlashCard => c !== undefined);
			return { ...s, cards: reordered };
		});
		saveStorage(this.cardSets, this.selectedSetId);
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
