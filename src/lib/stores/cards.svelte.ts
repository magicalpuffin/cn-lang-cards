import { nanoid } from "nanoid";
import { toast } from "svelte-sonner";
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
		toast("Card set created", { description: name });
		return newSet.id;
	}

	updateSet(id: string, name: string) {
		this.cardSets = this.cardSets.map((s) =>
			s.id === id ? { ...s, name } : s,
		);
		saveStorage(this.cardSets, this.selectedSetId);
		toast("Card set updated", { description: name });
	}

	deleteSet(id: string) {
		if (id === DEFAULT_SET_ID) return;
		const setName = this.cardSets.find((s) => s.id === id)?.name;
		this.cardSets = this.cardSets.filter((s) => s.id !== id);
		if (this.selectedSetId === id) {
			this.selectedSetId = DEFAULT_SET_ID;
		}
		saveStorage(this.cardSets, this.selectedSetId);
		toast("Card set deleted", { description: setName });
	}

	importSet(cardSet: CardSet) {
		const existingIndex = this.cardSets.findIndex((s) => s.id === cardSet.id);
		if (existingIndex !== -1) {
			this.cardSets = this.cardSets.map((s) =>
				s.id === cardSet.id ? cardSet : s,
			);
		} else {
			this.cardSets = [...this.cardSets, cardSet];
		}
		saveStorage(this.cardSets, this.selectedSetId);
		toast("Card set imported", { description: cardSet.name });
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
		toast("New card created", { description: newCard.chinese });
	}

	deleteCard(setId: string, id: string) {
		const card = this.cardSets
			.find((s) => s.id === setId)
			?.cards.find((c) => c.id === id);
		this.cardSets = this.cardSets.map((s) =>
			s.id === setId ? { ...s, cards: s.cards.filter((c) => c.id !== id) } : s,
		);
		saveStorage(this.cardSets, this.selectedSetId);
		toast("Card deleted", { description: card?.chinese });
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
		toast("Card updated", { description: updates.chinese });
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
		toast("Cards reordered");
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
