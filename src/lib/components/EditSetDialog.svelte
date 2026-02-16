<script lang="ts">
	import type { CardSet } from '$lib/types';
	import { cardStore } from '$lib/stores/cards.svelte';
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

	let { open = $bindable(false), cardSet }: { open: boolean; cardSet: CardSet | null } = $props();

	let editName = $state('');

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
			<DialogFooter>
				<Button variant="outline" type="button" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={!editName.trim()}>Save</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
