<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
	import type { FlashCard, StudyMode } from '$lib/types';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import StudyCard from './StudyCard.svelte';

	let { mode = 'sequential', setId }: { mode?: StudyMode; setId: string } = $props();

	let api = $state<CarouselAPI>();
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
		// Reset carousel to first slide when mode/set changes
		if (api) {
			api.scrollTo(0, true);
		}
	});

	$effect(() => {
		if (api) {
			api.on('select', () => {
				currentIndex = api!.selectedScrollSnap();
				showPinyin = false;
				showEnglish = false;
			});
		}
	});

	const currentCard = $derived(studyCards[currentIndex]);
	const hasCards = $derived(studyCards.length > 0);
	const hasEnglish = $derived(currentCard?.english?.trim().length > 0);
	// Reference currentIndex so these re-derive on slide change
	const canScrollPrev = $derived(currentIndex >= 0 && (api?.canScrollPrev() ?? false));
	const canScrollNext = $derived(currentIndex >= 0 && (api?.canScrollNext() ?? false));

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
		<div class="flex justify-between items-center text-sm text-muted-foreground">
			<span>Card {currentIndex + 1} of {studyCards.length}</span>
			<span class="capitalize">{mode} mode</span>
		</div>

		<Carousel.Root setApi={(emblaApi) => (api = emblaApi)}>
			<Carousel.Content>
				{#each studyCards as card (card.id)}
					<Carousel.Item>
						<StudyCard
							{card}
							isActive={card.id === currentCard?.id}
							{showPinyin}
							{showEnglish}
						/>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
		</Carousel.Root>

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
				<Button
					onclick={() => api?.scrollPrev()}
					disabled={!canScrollPrev}
					variant="outline"
					class="w-24">Previous</Button
				>
				<Button
					onclick={() => api?.scrollNext()}
					disabled={!canScrollNext}
					variant="outline"
					class="w-24">Next</Button
				>
			</ButtonGroup>
		</div>
	</div>
{/if}
