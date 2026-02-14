<script lang="ts">
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import type { FlashCard } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardAction,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import CreateCardDialog from './CreateCardDialog.svelte';
	import EditCardDialog from './EditCardDialog.svelte';
	import DeleteCardDialog from './DeleteCardDialog.svelte';
	import SetManager from './SetManager.svelte';
	import { EllipsisVerticalIcon, PlusIcon, ArrowLeftIcon } from '@lucide/svelte';

	let activeSetId = $state<string | null>(null);

	let quickAddOpen = $state(false);
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let activeCard = $state<FlashCard | null>(null);

	const activeSetName = $derived(
		cardStore.cardSets.find((s) => s.id === activeSetId)?.name ?? ''
	);
	const setCards = $derived(activeSetId ? cardStore.getCardsBySet(activeSetId) : []);

	function openEditDialog(card: FlashCard) {
		activeCard = card;
		editDialogOpen = true;
	}

	function openDeleteDialog(card: FlashCard) {
		activeCard = card;
		deleteDialogOpen = true;
	}
</script>

{#if activeSetId === null}
	<div class="mb-4">
		<Button class="w-full" onclick={() => (quickAddOpen = true)}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Quick Add Card
		</Button>
	</div>
	<SetManager onselect={(setId) => (activeSetId = setId)} />
{:else}
	<Card>
		<CardHeader>
			<CardTitle>
				<Button variant="ghost" size="icon" onclick={() => (activeSetId = null)}>
					<ArrowLeftIcon />
				</Button>
				{activeSetName} ({setCards.length})
			</CardTitle>
			<CardDescription>Manage cards in this set</CardDescription>
			<CardAction>
				<Button size="icon" onclick={() => (createDialogOpen = true)}><PlusIcon /></Button>
			</CardAction>
		</CardHeader>
		<CardContent>
			{#if setCards.length === 0}
				<p class="py-8 text-center text-muted-foreground">
					No cards yet. Click the + button to create your first card!
				</p>
			{:else}
				<div class="max-h-[400px] space-y-2 overflow-y-auto">
					{#each setCards as card (card.id)}
						<div class="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
							<div class="flex-1 space-y-1">
								<div class="text-2xl font-medium">{card.chinese}</div>
								<div class="text-sm text-muted-foreground">{card.pinyin}</div>
								{#if card.english}
									<div class="text-sm">{card.english}</div>
								{/if}
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger>
									{#snippet child({ props })}
										<Button {...props} variant="ghost" size="icon">
											<EllipsisVerticalIcon />
										</Button>
									{/snippet}
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onclick={() => openEditDialog(card)}>Edit</DropdownMenuItem>
									<DropdownMenuItem
										class="text-destructive"
										onclick={() => openDeleteDialog(card)}
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<CreateCardDialog bind:open={createDialogOpen} setId={activeSetId} />
	<EditCardDialog bind:open={editDialogOpen} card={activeCard} />
	<DeleteCardDialog bind:open={deleteDialogOpen} card={activeCard} />
{/if}

<CreateCardDialog bind:open={quickAddOpen} setId={DEFAULT_SET_ID} />
