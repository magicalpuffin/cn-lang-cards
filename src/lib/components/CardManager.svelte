<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
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
	import { EllipsisVerticalIcon, PlusIcon } from '@lucide/svelte';

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let activeCard = $state<FlashCard | null>(null);

	function openEditDialog(card: FlashCard) {
		activeCard = card;
		editDialogOpen = true;
	}

	function openDeleteDialog(card: FlashCard) {
		activeCard = card;
		deleteDialogOpen = true;
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Card Manager ({cardStore.cards.length})</CardTitle>
		<CardDescription>Create, edit, and manage your flashcards</CardDescription>
		<CardAction>
			<Button size="icon" onclick={() => (createDialogOpen = true)}><PlusIcon /></Button>
		</CardAction>
	</CardHeader>
	<CardContent>
		{#if cardStore.cards.length === 0}
			<p class="py-8 text-center text-muted-foreground">
				No cards yet. Click the + button to create your first card!
			</p>
		{:else}
			<div class="overflow-y-auto space-y-2 max-h-[400px]">
				{#each cardStore.cards as card (card.id)}
					<div class="flex gap-3 items-start p-3 rounded-md border hover:bg-muted/50">
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
								<DropdownMenuItem class="text-destructive" onclick={() => openDeleteDialog(card)}>
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

<CreateCardDialog bind:open={createDialogOpen} />
<EditCardDialog bind:open={editDialogOpen} card={activeCard} />
<DeleteCardDialog bind:open={deleteDialogOpen} card={activeCard} />
