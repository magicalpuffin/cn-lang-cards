<script lang="ts">
	import type { CardSet } from '$lib/types';
	import { cardStore } from '$lib/stores/cards.svelte';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';

	let {
		open = $bindable(false),
		cardSet,
		ondelete
	}: { open: boolean; cardSet: CardSet | null; ondelete?: () => void } = $props();

	const cardCount = $derived(cardSet ? cardSet.cards.length : 0);

	function handleDelete() {
		if (cardSet) {
			cardStore.deleteSet(cardSet.id);
			open = false;
			ondelete?.();
		}
	}
</script>

<AlertDialog bind:open>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete Set?</AlertDialogTitle>
			<AlertDialogDescription>
				Are you sure you want to delete this set? This will also delete
				{cardCount === 1 ? '1 card' : `${cardCount} cards`} in this set. This action cannot be
				undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction onclick={handleDelete}>Delete</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
