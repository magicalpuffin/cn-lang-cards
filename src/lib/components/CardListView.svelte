<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import CardListItem from './CardListItem.svelte';
	import Sortable from 'sortablejs';

	let { setId, onviewcard }: { setId: string; onviewcard?: (index: number) => void } = $props();

	const cards = $derived(cardStore.getCardsBySet(setId));

	let listEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!listEl) return;

		const sortable = Sortable.create(listEl, {
			animation: 150,
			handle: '.drag-handle',
			onEnd(evt) {
				const { oldIndex, newIndex, item, from } = evt;
				if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

				// Read the new order from DOM before reverting
				const orderedIds = Array.from(from.children).map(
					(el) => (el as HTMLElement).dataset.cardId!
				);

				// Revert DOM change so Svelte stays in control
				from.removeChild(item);
				if (oldIndex < from.children.length) {
					from.insertBefore(item, from.children[oldIndex]);
				} else {
					from.appendChild(item);
				}

				cardStore.reorderCards(setId, orderedIds);
			}
		});

		return () => sortable.destroy();
	});
</script>

<div class="space-y-2" bind:this={listEl}>
	{#each cards as card, i (card.id)}
		<div data-card-id={card.id}>
			<CardListItem {card} index={i} onviewcard={() => onviewcard?.(i)} />
		</div>
	{:else}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">No cards in this set.</p>
				<p class="mt-2 text-sm text-muted-foreground">Create some cards first!</p>
			</CardContent>
		</Card>
	{/each}
</div>
