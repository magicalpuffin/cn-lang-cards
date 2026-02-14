<script lang="ts">
	import type { CardSet } from '$lib/types';
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import DeleteSetDialog from './DeleteSetDialog.svelte';

	let { open = $bindable(false), cardSet }: { open: boolean; cardSet: CardSet | null } = $props();

	let editName = $state('');
	let deleteDialogOpen = $state(false);

	const isDefaultSet = $derived(cardSet?.id === DEFAULT_SET_ID);

	$effect(() => {
		if (open && cardSet) {
			editName = cardSet.name;
		}
	});

	function handleSave() {
		if (cardSet && editName.trim()) {
			cardStore.updateSet(cardSet.id, editName.trim());
			open = false;
		}
	}

	function handleDeleteClick() {
		open = false;
		deleteDialogOpen = true;
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Set</DialogTitle>
			<DialogDescription>Rename your card set.</DialogDescription>
		</DialogHeader>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="edit-set-name">Set Name</Label>
				<Input id="edit-set-name" type="text" bind:value={editName} />
			</div>
			<DialogFooter class="flex justify-between sm:justify-between">
				<Button variant="destructive" type="button" onclick={handleDeleteClick} disabled={isDefaultSet}>
					Delete Set
				</Button>
				<div class="flex gap-2">
					<Button variant="outline" type="button" onclick={() => (open = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={!editName.trim()}>Save</Button>
				</div>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<DeleteSetDialog bind:open={deleteDialogOpen} {cardSet} />
