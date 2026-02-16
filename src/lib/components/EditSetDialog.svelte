<script lang="ts">
	import type { CardSet } from '$lib/types';
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import CardManager from './CardManager.svelte';
	import DeleteSetDialog from './DeleteSetDialog.svelte';
	import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from '@lucide/svelte';

	let { open = $bindable(false), cardSet }: { open: boolean; cardSet: CardSet | null } = $props();

	let editingName = $state(false);
	let editName = $state('');
	let deleteDialogOpen = $state(false);

	const isDefaultSet = $derived(cardSet?.id === DEFAULT_SET_ID);

	$effect(() => {
		if (open) {
			editingName = false;
		}
	});

	function startEditing() {
		if (cardSet) {
			editName = cardSet.name;
			editingName = true;
		}
	}

	function saveName() {
		if (cardSet && editName.trim()) {
			cardStore.updateSet(cardSet.id, editName.trim());
			editingName = false;
		}
	}

	function cancelEditing() {
		editingName = false;
	}

	function handleDeleteClick() {
		open = false;
		deleteDialogOpen = true;
	}
</script>

<Dialog bind:open>
	<DialogContent class="overflow-y-auto sm:max-w-lg max-h-[80vh]">
		<DialogHeader>
			<DialogTitle>
				{#if editingName}
					<form
						class="flex items-center gap-2"
						onsubmit={(e) => {
							e.preventDefault();
							saveName();
						}}
					>
						<Input
							type="text"
							bind:value={editName}
							class="h-8"
						/>
						<Button variant="ghost" size="icon" type="submit" disabled={!editName.trim()}>
							<CheckIcon class="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" type="button" onclick={cancelEditing}>
							<XIcon class="h-4 w-4" />
						</Button>
					</form>
				{:else}
					<div class="flex items-center gap-2">
						<span class="truncate">{cardSet?.name}</span>
						{#if !isDefaultSet}
							<Button variant="ghost" size="icon" onclick={startEditing}>
								<PencilIcon class="h-4 w-4" />
							</Button>
							<Button variant="ghost" size="icon" onclick={handleDeleteClick}>
								<Trash2Icon class="h-4 w-4 text-destructive" />
							</Button>
						{/if}
					</div>
				{/if}
			</DialogTitle>
		</DialogHeader>
		{#if cardSet}
			<CardManager setId={cardSet.id} />
		{/if}
	</DialogContent>
</Dialog>

<DeleteSetDialog bind:open={deleteDialogOpen} {cardSet} />
