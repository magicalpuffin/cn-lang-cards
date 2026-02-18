<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
	import type { FlashCard } from '$lib/types';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { SquarePenIcon, Trash2Icon } from '@lucide/svelte';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import EditCardDialog from './EditCardDialog.svelte';
	import DeleteCardDialog from './DeleteCardDialog.svelte';

	let { setId }: { setId: string } = $props();

	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let activeCard = $state<FlashCard | null>(null);

	const cards = $derived(cardStore.getCardsBySet(setId));

	function openEditDialog(card: FlashCard) {
		activeCard = card;
		editDialogOpen = true;
	}

	function openDeleteDialog(card: FlashCard) {
		activeCard = card;
		deleteDialogOpen = true;
	}
</script>

<div class="space-y-2">
	{#each cards as card (card.id)}
		<div class="p-4 rounded-xl border hover:bg-muted/50">
			<div class="flex justify-between">
				<div class="text-2xl font-medium">{card.chinese}</div>
				<ButtonGroup>
					<Button
						aria-label="Edit card"
						variant="ghost"
						size="icon"
						onclick={() => openEditDialog(card)}
					>
						<SquarePenIcon />
					</Button>
					<Button
						aria-label="Delete card"
						variant="ghost"
						size="icon"
						class="text-destructive"
						onclick={() => openDeleteDialog(card)}
					>
						<Trash2Icon />
					</Button>
				</ButtonGroup>
			</div>
			<div class="flex flex-col space-y-2">
				<div class="text-sm text-muted-foreground">{card.pinyin}</div>
				{#if card.english}
					<div class="text-sm">{card.english}</div>
				{/if}
			</div>
		</div>
		<!-- <div class="flex gap-3 items-start p-3 rounded-md border hover:bg-muted/50"> -->
		<!-- 	<div class="flex-1 space-y-1"> -->
		<!-- 		<div class="text-2xl font-medium">{card.chinese}</div> -->
		<!-- 		<div class="text-sm text-muted-foreground">{card.pinyin}</div> -->
		<!-- 		{#if card.english} -->
		<!-- 			<div class="text-sm">{card.english}</div> -->
		<!-- 		{/if} -->
		<!-- 	</div> -->
		<!-- 	<ButtonGroup> -->
		<!-- 		<Button -->
		<!-- 			aria-label="Edit card" -->
		<!-- 			variant="ghost" -->
		<!-- 			size="icon" -->
		<!-- 			onclick={() => openEditDialog(card)} -->
		<!-- 		> -->
		<!-- 			<SquarePenIcon /> -->
		<!-- 		</Button> -->
		<!-- 		<Button -->
		<!-- 			aria-label="Delete card" -->
		<!-- 			variant="ghost" -->
		<!-- 			size="icon" -->
		<!-- 			class="text-destructive" -->
		<!-- 			onclick={() => openDeleteDialog(card)} -->
		<!-- 		> -->
		<!-- 			<Trash2Icon /> -->
		<!-- 		</Button> -->
		<!-- 	</ButtonGroup> -->
		<!-- </div> -->
	{:else}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">No cards in this set.</p>
				<p class="mt-2 text-sm text-muted-foreground">Create some cards first!</p>
			</CardContent>
		</Card>
	{/each}
</div>

<EditCardDialog bind:open={editDialogOpen} card={activeCard} />
<DeleteCardDialog bind:open={deleteDialogOpen} card={activeCard} />
