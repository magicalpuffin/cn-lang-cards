<script lang="ts">
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import StudyMode from '$lib/components/StudyMode.svelte';
	import SetSelectorCombobox from '$lib/components/SetSelectorCombobox.svelte';
	import CreateSetDialog from '$lib/components/CreateSetDialog.svelte';
	import EditSetDialog from '$lib/components/EditSetDialog.svelte';
	import { PlusIcon, SquarePenIcon, Trash2Icon } from '@lucide/svelte';
	import DeleteSetDialog from '$lib/components/DeleteSetDialog.svelte';
	import { Separator } from '$lib/components/ui/separator';

	let studySetId = $state<string | null>(cardStore.selectedSetId || null);

	let createSetOpen = $state(false);
	let editSetOpen = $state(false);
	let deleteSetOpen = $state(false);

	const selectedSet = $derived(cardStore.cardSets.find((s) => s.id === studySetId) ?? null);

	$effect(() => {
		cardStore.setSelectedSetId(studySetId ?? DEFAULT_SET_ID);
	});
</script>

<div class="container p-4 mx-auto max-w-4xl">
	<h1 class="font-mono font-bold tracking-wide text-center md:text-2xl">Chinese Language Cards</h1>
	<Separator class="my-2 md:my-4" />

	<div class="space-y-6">
		<div class="flex flex-wrap justify-between items-center">
			<div class="flex items-center space-x-4">
				<span class="hidden w-20 text-sm md:inline text-muted-foreground">Card Set</span>
				<ButtonGroup>
					<ButtonGroup>
						<SetSelectorCombobox bind:value={studySetId} />
						<Button
							aria-label="Edit card set"
							variant="outline"
							size="icon"
							onclick={() => (editSetOpen = true)}
							disabled={!studySetId || studySetId === DEFAULT_SET_ID}><SquarePenIcon /></Button
						>
						<Button
							aria-label="Delete card set"
							variant="outline"
							size="icon"
							onclick={() => (deleteSetOpen = true)}
							disabled={!studySetId || studySetId === DEFAULT_SET_ID}
							><Trash2Icon class="text-destructive" /></Button
						>
					</ButtonGroup>
					<ButtonGroup>
						<Button aria-label="Create card set" size="icon" onclick={() => (createSetOpen = true)}
							><PlusIcon /></Button
						>
					</ButtonGroup>
				</ButtonGroup>
			</div>
		</div>

		{#if studySetId}
			<StudyMode setId={studySetId} />
		{:else}
			<p class="py-8 text-center text-muted-foreground">Select a set to start studying.</p>
		{/if}
	</div>
</div>

<CreateSetDialog bind:open={createSetOpen} oncreate={(id) => (studySetId = id)} />
<EditSetDialog bind:open={editSetOpen} cardSet={selectedSet} />
<DeleteSetDialog
	bind:open={deleteSetOpen}
	cardSet={selectedSet}
	ondelete={() => (studySetId = DEFAULT_SET_ID)}
/>
