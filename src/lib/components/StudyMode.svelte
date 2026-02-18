<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
	import type { FlashCard, StudyMode } from '$lib/types';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import StudyCard from './StudyCard.svelte';
	import CreateCardDialog from './CreateCardDialog.svelte';
	import CardManager from './CardManager.svelte';
	import CardSelectorCombobox from './CardSelectorCombobox.svelte';
	import { PlusIcon, ShuffleIcon, SquarePenIcon } from '@lucide/svelte';
	import { Toggle } from '$lib/components/ui/toggle';

	let { setId, initialCardIndex = 0 }: { setId: string; initialCardIndex?: number } = $props();

	let createCardOpen = $state(false);
	let manageCardsOpen = $state(false);

	let api = $state<CarouselAPI>();
	let currentIndex = $state(initialCardIndex);
	let showPinyin = $state(false);
	let showEnglish = $state(false);
	let mode = $state<StudyMode>('sequential');
	let pendingScrollTo = $state<number | null>(initialCardIndex > 0 ? initialCardIndex : null);
	let studyCards = $derived<FlashCard[]>(
		mode === 'random' ? cardStore.getRandomOrder(setId) : cardStore.getCardsBySet(setId)
	);

	$effect(() => {
		// when selecting different card set
		if (setId) {
			currentIndex = 0;
			showPinyin = false;
			showEnglish = false;
			// Reset carousel to first slide when mode/set changes
			if (api) {
				api.scrollTo(0, true);
			}
		}
	});

	$effect(() => {
		// adding callbacks for carousel API
		if (api) {
			// scroll to initial position if needed
			if (pendingScrollTo !== null) {
				const target = pendingScrollTo;
				pendingScrollTo = null;
				api.scrollTo(target, true);
				currentIndex = target;
			}

			// initial canScroll state on reload
			canScrollPrev = api!.canScrollPrev();
			canScrollNext = api!.canScrollNext();

			// update canScroll reInit when cards change
			const updateScrollState = () => {
				if (pendingScrollTo !== null) {
					const target = pendingScrollTo;
					pendingScrollTo = null;
					api!.scrollTo(target);
					// Update currentIndex directly in case scrollTo is a no-op
					// (e.g. already at the target position after deleting the last card)
					currentIndex = api!.selectedScrollSnap();
				}
				canScrollPrev = api!.canScrollPrev();
				canScrollNext = api!.canScrollNext();
			};

			const onSelect = () => {
				// update current index to scrolled to selection
				currentIndex = api!.selectedScrollSnap();
				showPinyin = false;
				showEnglish = false;
				updateScrollState();
			};

			api.on('select', onSelect);
			api.on('reInit', updateScrollState);
			return () => {
				api!.off('select', onSelect);
				api!.off('reInit', updateScrollState);
			};
		}
	});

	const currentCard = $derived(studyCards[currentIndex]);
	const selectedCardId = $derived(currentCard?.id ?? null);
	const hasCards = $derived(studyCards.length > 0);
	let canScrollPrev = $state(false);
	let canScrollNext = $state(false);

	function handleCardDelete() {
		pendingScrollTo = Math.max(0, currentIndex - 1);
	}

	function handleCardCreate() {
		pendingScrollTo = api?.scrollSnapList().length ?? null;
	}

	function handleCardSelect(index: number) {
		api?.scrollTo(index);
	}
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<div class="flex items-center space-x-4">
			{#if hasCards}
				<span class="hidden w-24 text-sm md:inline text-muted-foreground"
					>Card {currentIndex + 1} of {studyCards.length}</span
				>
			{:else}
				<span class="w-20 text-sm text-muted-foreground">No Cards</span>
			{/if}
			<ButtonGroup>
				<ButtonGroup>
					<CardSelectorCombobox
						value={selectedCardId}
						cards={studyCards}
						onselect={handleCardSelect}
					/>
				</ButtonGroup>
				<ButtonGroup>
					<Button variant="default" size="icon" onclick={() => (createCardOpen = true)}
						><PlusIcon /></Button
					>
				</ButtonGroup>
			</ButtonGroup>
		</div>
		<Toggle
			aria-label="Toggle shuffle"
			variant="outline"
			onPressedChange={(v) => {
				mode = v ? 'random' : 'sequential';
			}}
		>
			<ShuffleIcon />
			<span class="hidden md:inline"> Shuffle </span>
		</Toggle>
	</div>

	<Carousel.Root setApi={(emblaApi) => (api = emblaApi)}>
		<Carousel.Content>
			{#each studyCards as card (card.id)}
				<Carousel.Item>
					<StudyCard
						{card}
						{setId}
						isActive={card.id === currentCard?.id}
						bind:showPinyin
						bind:showEnglish
						ondelete={handleCardDelete}
					/>
				</Carousel.Item>
			{:else}
				<Carousel.Item>
					<Card>
						<CardContent class="py-12 text-center">
							<p class="text-muted-foreground">No cards available for study.</p>
							<p class="mt-2 text-sm text-muted-foreground">Create some cards first!</p>
						</CardContent>
					</Card>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>

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

<CreateCardDialog bind:open={createCardOpen} {setId} oncreate={handleCardCreate} />

<Dialog bind:open={manageCardsOpen}>
	<DialogContent class="overflow-y-auto sm:max-w-lg max-h-[80vh]">
		<DialogHeader>
			<DialogTitle>Manage Cards</DialogTitle>
		</DialogHeader>
		<CardManager {setId} />
	</DialogContent>
</Dialog>
