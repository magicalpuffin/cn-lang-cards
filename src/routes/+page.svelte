<script lang="ts">
	import { onMount } from 'svelte';
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import StudyMode from '$lib/components/StudyMode.svelte';
	import CardListView from '$lib/components/CardListView.svelte';
	import SetSelectorCombobox from '$lib/components/SetSelectorCombobox.svelte';
	import CreateSetDialog from '$lib/components/CreateSetDialog.svelte';
	import EditSetDialog from '$lib/components/EditSetDialog.svelte';
	import ShareSetDialog from '$lib/components/ShareSetDialog.svelte';
	import {
		GalleryHorizontalIcon,
		LayoutListIcon,
		LinkIcon,
		PlusIcon,
		SquarePenIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import DeleteSetDialog from '$lib/components/DeleteSetDialog.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Toggle } from '$lib/components/ui/toggle';
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
	import { toast } from 'svelte-sonner';
	import type { CardSet } from '$lib/types';

	let studySetId = $state<string | null>(cardStore.selectedSetId || null);

	let importDialogOpen = $state(false);
	let pendingImport = $state<CardSet | null>(null);
	let willOverwrite = $state(false);

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const shareId = params.get('share');
		if (!shareId) return;

		history.replaceState(null, '', window.location.pathname);

		try {
			const res = await fetch(`/api/card-set/${shareId}`);
			if (!res.ok) {
				toast.error('Failed to load shared card set');
				return;
			}
			const data = await res.json();
			const importedSet = data.shareCardSet?.cardSet as CardSet | undefined;
			if (!importedSet) {
				toast.error('Shared card set not found');
				return;
			}
			willOverwrite = cardStore.cardSets.some((s) => s.id === importedSet.id);
			pendingImport = importedSet;
			importDialogOpen = true;
		} catch {
			toast.error('Failed to load shared card set');
		}
	});

	function confirmImport() {
		if (!pendingImport) return;
		cardStore.importSet(pendingImport);
		studySetId = pendingImport.id;
		pendingImport = null;
		importDialogOpen = false;
	}

	function cancelImport() {
		pendingImport = null;
		importDialogOpen = false;
	}

	let viewAll = $state(false);
	let initialCardIndex = $state(0);
	let createSetOpen = $state(false);
	let editSetOpen = $state(false);
	let shareSetOpen = $state(false);
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
				<span class="hidden w-24 text-sm md:inline text-muted-foreground">Card Set</span>
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
							aria-label="Share card set"
							variant="outline"
							size="icon"
							disabled={!selectedSet || studySetId === DEFAULT_SET_ID}
							onclick={() => (shareSetOpen = true)}><LinkIcon /></Button
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
			<div class="flex gap-2 items-center">
				<ButtonGroup>
					<Toggle variant="outline" pressed={!viewAll} onPressedChange={() => (viewAll = false)}>
						<GalleryHorizontalIcon />Study
					</Toggle>
					<Toggle variant="outline" pressed={viewAll} onPressedChange={() => (viewAll = true)}>
						<LayoutListIcon />View All
					</Toggle>
				</ButtonGroup>
			</div>
		</div>

		{#if studySetId}
			{#if viewAll}
				<CardListView
					setId={studySetId}
					onviewcard={(index) => {
						initialCardIndex = index;
						viewAll = false;
					}}
				/>
			{:else}
				<StudyMode setId={studySetId} {initialCardIndex} />
			{/if}
		{:else}
			<p class="py-8 text-center text-muted-foreground">Select a set to start studying.</p>
		{/if}
	</div>
</div>

<CreateSetDialog bind:open={createSetOpen} oncreate={(id) => (studySetId = id)} />
<EditSetDialog bind:open={editSetOpen} cardSet={selectedSet} />
<ShareSetDialog bind:open={shareSetOpen} cardSet={selectedSet} />
<DeleteSetDialog
	bind:open={deleteSetOpen}
	cardSet={selectedSet}
	ondelete={() => (studySetId = DEFAULT_SET_ID)}
/>

<AlertDialog bind:open={importDialogOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Import Shared Card Set</AlertDialogTitle>
			<AlertDialogDescription>
				{#if willOverwrite}
					A card set named "{pendingImport?.name}" already exists. Importing will overwrite your
					existing set and its cards.
				{:else}
					Import "{pendingImport?.name}" with {pendingImport?.cards.length === 1
						? '1 card'
						: `${pendingImport?.cards.length} cards`}?
				{/if}
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={cancelImport}>Cancel</AlertDialogCancel>
			<AlertDialogAction onclick={confirmImport}>Import</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
