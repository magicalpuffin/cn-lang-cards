<script lang="ts">
	import { DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import CardManager from '$lib/components/CardManager.svelte';
	import StudyMode from '$lib/components/StudyMode.svelte';
	import SetSelectorCombobox from '$lib/components/SetSelectorCombobox.svelte';
	import type { StudyMode as StudyModeType } from '$lib/types';

	let studyMode = $state<StudyModeType>('sequential');
	let studySetId = $state<string | null>(DEFAULT_SET_ID);
</script>

<div class="container p-4 mx-auto max-w-4xl">
	<h1 class="mb-8 text-4xl font-bold text-center">Chinese Flashcards</h1>

	<Tabs value="manage" class="w-full">
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
				<div class="flex flex-wrap gap-4 justify-between items-center">
					<SetSelectorCombobox bind:value={studySetId} />

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
