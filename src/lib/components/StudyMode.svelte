<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
	import type { FlashCard, StudyMode } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import { Card, CardContent } from '$lib/components/ui/card';

	let { mode = 'sequential', setId }: { mode?: StudyMode; setId: string } = $props();

	let currentIndex = $state(0);
	let showPinyin = $state(false);
	let showEnglish = $state(false);
	let studyCards = $state<FlashCard[]>([]);

	$effect(() => {
		if (mode === 'random') {
			studyCards = cardStore.getRandomOrder(setId);
		} else {
			studyCards = cardStore.getCardsBySet(setId);
		}
		currentIndex = 0;
		showPinyin = false;
		showEnglish = false;
	});

	const currentCard = $derived(studyCards[currentIndex]);
	const hasCards = $derived(studyCards.length > 0);
	const isFirst = $derived(currentIndex === 0);
	const isLast = $derived(currentIndex === studyCards.length - 1);
	const hasEnglish = $derived(currentCard?.english?.trim().length > 0);

	function next() {
		if (!isLast) {
			currentIndex++;
			showPinyin = false;
			showEnglish = false;
		}
	}

	function prev() {
		if (!isFirst) {
			currentIndex--;
			showPinyin = false;
			showEnglish = false;
		}
	}

	function togglePinyin() {
		showPinyin = !showPinyin;
	}

	function toggleEnglish() {
		showEnglish = !showEnglish;
	}

	function revealAll() {
		showPinyin = true;
		if (hasEnglish) {
			showEnglish = true;
		}
	}

	function hideAll() {
		showPinyin = false;
		showEnglish = false;
	}
</script>

{#if !hasCards}
	<Card>
		<CardContent class="py-12 text-center">
			<p class="text-muted-foreground">No cards available for study.</p>
			<p class="mt-2 text-sm text-muted-foreground">Create some cards first!</p>
		</CardContent>
	</Card>
{:else}
	<div class="space-y-4">
		<div class="flex items-center justify-between text-sm text-muted-foreground">
			<span>Card {currentIndex + 1} of {studyCards.length}</span>
			<span class="capitalize">{mode} mode</span>
		</div>

		<Card class="min-h-[300px]">
			<CardContent class="flex min-h-[300px] items-center justify-center p-8">
				<div class="space-y-4 text-center">
					<!-- Always show Chinese -->
					<div class="text-6xl font-medium">{currentCard.chinese}</div>

					<!-- Show pinyin if toggled -->
					{#if showPinyin}
						<div class="text-xl text-muted-foreground transition-opacity">
							{currentCard.pinyin}
						</div>
					{/if}

					<!-- Show english if toggled and exists -->
					{#if showEnglish && hasEnglish}
						<div class="mt-4 text-2xl transition-opacity">
							{currentCard.english}
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Reveal controls -->
		<div class="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
			<div class="flex justify-center md:justify-end">
				<ButtonGroup>
					<Button onclick={togglePinyin} variant={showPinyin ? 'default' : 'outline'} class="w-32">
						{showPinyin ? 'Hide' : 'Show'} Pinyin
					</Button>
					<Button
						onclick={toggleEnglish}
						variant={showEnglish ? 'default' : 'outline'}
						class="w-32"
						disabled={!hasEnglish}
					>
						{showEnglish ? 'Hide' : 'Show'} English
					</Button>
				</ButtonGroup>
			</div>

			<div class="flex justify-center md:justify-start">
				<ButtonGroup>
					<Button onclick={revealAll} variant="secondary" class="w-32">Reveal All</Button>
					<Button onclick={hideAll} variant="secondary" class="w-32">Hide All</Button>
				</ButtonGroup>
			</div>
		</div>

		<!-- Navigation buttons -->
		<div class="flex justify-center">
			<ButtonGroup>
				<Button onclick={prev} disabled={isFirst} variant="outline" class="w-24">Previous</Button>
				<Button onclick={next} disabled={isLast} variant="outline" class="w-24">Next</Button>
			</ButtonGroup>
		</div>
	</div>
{/if}
