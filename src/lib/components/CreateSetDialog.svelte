<script lang="ts">
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

	let {
		open = $bindable(false),
		oncreate
	}: { open: boolean; oncreate?: (setId: string) => void } = $props();

	let name = $state('');

	function handleSubmit() {
		if (name.trim()) {
			const newId = cardStore.addSet(name.trim());
			name = '';
			open = false;
			oncreate?.(newId);
		}
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create New Set</DialogTitle>
			<DialogDescription>Create a new card set to organize your flashcards.</DialogDescription>
		</DialogHeader>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="create-set-name">Set Name</Label>
				<Input
					id="create-set-name"
					type="text"
					bind:value={name}
					placeholder="Enter set name..."
				/>
			</div>
			<DialogFooter>
				<Button variant="outline" type="button" onclick={() => (open = false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={!name.trim()}>Create Set</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
