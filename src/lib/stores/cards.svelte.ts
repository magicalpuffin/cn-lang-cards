import type { FlashCard } from '$lib/types';
import { browser } from '$app/environment';

const STORAGE_KEY = 'flashcards';

function loadCards(): FlashCard[] {
	if (!browser) return [];
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? JSON.parse(stored) : [];
}

function saveCards(cards: FlashCard[]) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

class CardStore {
	cards = $state<FlashCard[]>(loadCards());

	addCard(card: Omit<FlashCard, 'id' | 'createdAt'>) {
		const newCard: FlashCard = {
			...card,
			id: crypto.randomUUID(),
			createdAt: Date.now()
		};
		this.cards = [...this.cards, newCard];
		saveCards(this.cards);
	}

	deleteCard(id: string) {
		this.cards = this.cards.filter((c) => c.id !== id);
		saveCards(this.cards);
	}

	updateCard(id: string, updates: Partial<Omit<FlashCard, 'id' | 'createdAt'>>) {
		this.cards = this.cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
		saveCards(this.cards);
	}

	getRandomOrder(): FlashCard[] {
		return [...this.cards].sort(() => Math.random() - 0.5);
	}
}

export const cardStore = new CardStore();
