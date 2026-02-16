<script lang="ts">
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import CardManager from '$lib/components/CardManager.svelte';
	import StudyMode from '$lib/components/StudyMode.svelte';
	import SetSelectorCombobox from '$lib/components/SetSelectorCombobox.svelte';
	import CreateSetDialog from '$lib/components/CreateSetDialog.svelte';
	import EditSetDialog from '$lib/components/EditSetDialog.svelte';
	import type { StudyMode as StudyModeType } from '$lib/types';
	import { PlusIcon, SquarePenIcon } from '@lucide/svelte';

	let studyMode = $state<StudyModeType>('sequential');
	let studySetId = $state<string | null>(cardStore.selectedSetId);

	let createSetOpen = $state(false);
	let editSetOpen = $state(false);

	const selectedSet = $derived(cardStore.cardSets.find((s) => s.id === studySetId) ?? null);

	$effect(() => {
		if (studySetId) {
			cardStore.setSelectedSetId(studySetId);
		}
	});
</script>

<div class="container p-4 mx-auto max-w-4xl">
	<h1 class="mb-8 text-4xl font-bold text-center">Chinese Flashcards</h1>

	<Tabs value="study" class="w-full">
		<TabsList class="grid grid-cols-3 w-full">
			<TabsTrigger value="manage">Manage Cards</TabsTrigger>
			<TabsTrigger value="study">Study</TabsTrigger>
			<TabsTrigger value="settings">Settings</TabsTrigger>
		</TabsList>

		<TabsContent value="manage" class="mt-6 space-y-6">
			<CardManager />
		</TabsContent>

		<TabsContent value="study" class="mt-6">
			<div class="space-y-6">
				<div class="flex flex-wrap justify-between items-center">
					<div class="flex items-center space-x-4">
						<span class="w-20 text-sm text-muted-foreground">Card Set</span>
						<ButtonGroup>
							<SetSelectorCombobox bind:value={studySetId} />
							<Button variant="outline" onclick={() => (createSetOpen = true)}><PlusIcon /></Button>
							<Button
								variant="outline"
								onclick={() => (editSetOpen = true)}
								disabled={!studySetId || studySetId === DEFAULT_SET_ID}><SquarePenIcon /></Button
							>
						</ButtonGroup>
					</div>

					<ButtonGroup>
						<Button
							variant={studyMode === 'sequential' ? 'default' : 'outline'}
							onclick={() => (studyMode = 'sequential')}
						>
							Sequential
						</Button>
						<Button
							variant={studyMode === 'random' ? 'default' : 'outline'}
							onclick={() => (studyMode = 'random')}
						>
							Random
						</Button>
					</ButtonGroup>
				</div>

				{#if studySetId}
					<StudyMode mode={studyMode} setId={studySetId} />
				{:else}
					<p class="py-8 text-center text-muted-foreground">Select a set to start studying.</p>
				{/if}
			</div>
		</TabsContent>

		<TabsContent value="settings" class="mt-6">
			<div class="py-12 text-center text-muted-foreground">Settings coming soon...</div>
		</TabsContent>
	</Tabs>
</div>

<CreateSetDialog bind:open={createSetOpen} oncreate={(id) => (studySetId = id)} />
<EditSetDialog bind:open={editSetOpen} cardSet={selectedSet} />
