<script lang="ts">
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import type { CardSet } from '$lib/types';
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
	import CreateSetDialog from './CreateSetDialog.svelte';
	import EditSetDialog from './EditSetDialog.svelte';
	import DeleteSetDialog from './DeleteSetDialog.svelte';
	import { EllipsisVerticalIcon, PlusIcon } from '@lucide/svelte';

	let { onselect }: { onselect: (setId: string) => void } = $props();

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let activeSet = $state<CardSet | null>(null);

	function openEditDialog(set: CardSet) {
		activeSet = set;
		editDialogOpen = true;
	}

	function openDeleteDialog(set: CardSet) {
		activeSet = set;
		deleteDialogOpen = true;
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Card Sets ({cardStore.cardSets.length})</CardTitle>
		<CardDescription>Organize your flashcards into sets</CardDescription>
		<CardAction>
			<Button size="icon" onclick={() => (createDialogOpen = true)}><PlusIcon /></Button>
		</CardAction>
	</CardHeader>
	<CardContent>
		{#if cardStore.cardSets.length === 0}
			<p class="py-8 text-center text-muted-foreground">
				No sets yet. Click the + button to create your first set!
			</p>
		{:else}
			<div class="max-h-[400px] space-y-2 overflow-y-auto">
				{#each cardStore.cardSets as set (set.id)}
					<button
						type="button"
						class="flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 text-left hover:bg-muted/50"
						onclick={() => onselect(set.id)}
					>
						<div class="flex-1 space-y-1">
							<div class="text-lg font-medium">{set.name}</div>
							<div class="text-sm text-muted-foreground">
								{set.cards.length} cards
							</div>
						</div>

						{#if set.id !== DEFAULT_SET_ID}
							<DropdownMenu>
								<DropdownMenuTrigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="ghost"
											size="icon"
											onclick={(e: MouseEvent) => e.stopPropagation()}
										>
											<EllipsisVerticalIcon />
										</Button>
									{/snippet}
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onclick={() => openEditDialog(set)}>Edit</DropdownMenuItem>
									<DropdownMenuItem
										class="text-destructive"
										onclick={() => openDeleteDialog(set)}
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<CreateSetDialog bind:open={createDialogOpen} />
<EditSetDialog bind:open={editDialogOpen} cardSet={activeSet} />
<DeleteSetDialog bind:open={deleteDialogOpen} cardSet={activeSet} />
