<script lang="ts">
	import { cardStore, DEFAULT_SET_ID } from '$lib/stores/cards.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { ArrowLeftIcon } from '@lucide/svelte';
	import CardManager from '$lib/components/CardManager.svelte';
	import StudyMode from '$lib/components/StudyMode.svelte';
	import type { StudyMode as StudyModeType } from '$lib/types';

	let studyMode = $state<StudyModeType>('sequential');
	let studySetId = $state<string | null>(DEFAULT_SET_ID);

	const studySetName = $derived(
		cardStore.cardSets.find((s) => s.id === studySetId)?.name ?? ''
	);
</script>

<div class="container mx-auto max-w-4xl p-4">
	<h1 class="mb-8 text-center text-4xl font-bold">Chinese Flashcards</h1>

	<Tabs value="manage" class="w-full">
		<TabsList class="grid w-full grid-cols-3">
			<TabsTrigger value="manage">Manage Cards</TabsTrigger>
			<TabsTrigger value="study">Study</TabsTrigger>
			<TabsTrigger value="settings">Settings</TabsTrigger>
		</TabsList>

		<TabsContent value="manage" class="mt-6 space-y-6">
			<CardManager />
		</TabsContent>

		<TabsContent value="study" class="mt-6">
			{#if studySetId === null}
				<!-- Set picker -->
				<Card>
					<CardContent class="p-6">
						{#if cardStore.cardSets.length === 0}
							<p class="py-8 text-center text-muted-foreground">
								No sets available. Create a set first!
							</p>
						{:else}
							<div class="space-y-3">
								<h2 class="text-lg font-medium">Select a set to study</h2>
								<div class="space-y-2">
									{#each cardStore.cardSets as set (set.id)}
										{@const count = cardStore.getCardsBySet(set.id).length}
										<button
											type="button"
											class="flex w-full items-center justify-between rounded-md border p-4 text-left hover:bg-muted/50"
											onclick={() => (studySetId = set.id)}
										>
											<span class="text-lg font-medium">{set.name}</span>
											<span class="text-sm text-muted-foreground">
												{count} {count === 1 ? 'card' : 'cards'}
											</span>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			{:else}
				<!-- Study UI -->
				<div class="space-y-6">
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="icon" onclick={() => (studySetId = null)}>
							<ArrowLeftIcon />
						</Button>
						<span class="text-lg font-medium">{studySetName}</span>
					</div>

					<div class="flex justify-center">
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

					<StudyMode mode={studyMode} setId={studySetId} />
				</div>
			{/if}
		</TabsContent>

		<TabsContent value="settings" class="mt-6">
			<div class="py-12 text-center text-muted-foreground">Settings coming soon...</div>
		</TabsContent>
	</Tabs>
</div>
