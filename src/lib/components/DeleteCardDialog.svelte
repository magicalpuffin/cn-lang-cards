<script lang="ts">
	import type { FlashCard } from '$lib/types';
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

	let { open = $bindable(false), card }: { open: boolean; card: FlashCard | null } = $props();

	function handleDelete() {
		if (card) {
			cardStore.deleteCard(card.id);
			open = false;
		}
	}
</script>

<AlertDialog bind:open>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete Card?</AlertDialogTitle>
			<AlertDialogDescription>
				Are you sure you want to delete this flashcard? This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction onclick={handleDelete}>Delete</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
