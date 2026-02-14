<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import CardManager from '$lib/components/CardManager.svelte';
	import StudyMode from '$lib/components/StudyMode.svelte';
	import type { StudyMode as StudyModeType } from '$lib/types';

	let studyMode = $state<StudyModeType>('sequential');
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
			<div class="space-y-6">
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

				<StudyMode mode={studyMode} />
			</div>
		</TabsContent>

		<TabsContent value="settings" class="mt-6">
			<div class="py-12 text-center text-muted-foreground">Settings coming soon...</div>
		</TabsContent>
	</Tabs>
</div>
