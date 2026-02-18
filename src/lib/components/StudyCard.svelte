<script lang="ts">
	import type { FlashCard } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { ALargeSmallIcon, EyeIcon, EyeOffIcon, SquarePenIcon, Trash2Icon } from '@lucide/svelte';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import EditCardDialog from './EditCardDialog.svelte';
	import DeleteCardDialog from './DeleteCardDialog.svelte';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { Toggle } from '$lib/components/ui/toggle';

	let {
		card,
		isActive,
		showPinyin = $bindable(false),
		showEnglish = $bindable(false),
		ondelete
	}: {
		card: FlashCard;
		isActive: boolean;
		showPinyin: boolean;
		showEnglish: boolean;
		ondelete?: () => void;
	} = $props();

	let editOpen = $state(false);
	let deleteOpen = $state(false);

	const hasEnglish = $derived((card.english?.trim().length ?? 0) > 0);

	let toggleValue = $derived.by(() => {
		const v: string[] = [];
		if (showPinyin) v.push('pinyin');
		if (showEnglish) v.push('english');
		return v;
	});

	function onToggleChange(v: string[]) {
		showPinyin = v.includes('pinyin');
		showEnglish = v.includes('english');
	}

	const allRevealed = $derived(showPinyin && (showEnglish || !hasEnglish));

	function onToggleAllChange(pressed: boolean) {
		if (pressed) {
			showPinyin = true;
			if (hasEnglish) showEnglish = true;
		} else {
			showPinyin = false;
			showEnglish = false;
		}
	}
</script>

<div class="p-4 rounded-xl border shadow-xl">
	<div class="flex justify-end">
		<ButtonGroup>
			<Button aria-label="Edit card" variant="ghost" size="icon" onclick={() => (editOpen = true)}
				><SquarePenIcon /></Button
			>
			<Button
				aria-label="Delete card"
				variant="ghost"
				size="icon"
				class="text-destructive"
				onclick={() => (deleteOpen = true)}><Trash2Icon /></Button
			>
		</ButtonGroup>
	</div>
	<div class="flex justify-center items-center p-4 min-h-72">
		<div class="space-y-4 text-center">
			<!-- Always show Chinese -->
			<div class="text-6xl font-medium">{card.chinese}</div>

			<!-- Show pinyin if toggled and this is the current card -->
			{#if showPinyin && isActive}
				<div class="text-xl transition-opacity text-muted-foreground">
					{card.pinyin}
				</div>
			{/if}

			<!-- Show english if toggled and exists and this is the current card -->
			{#if showEnglish && card.english?.trim() && isActive}
				<div class="mt-4 text-2xl transition-opacity">
					{card.english}
				</div>
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
		<div class="flex justify-center md:justify-end">
			<ToggleGroup
				type="multiple"
				variant="outline"
				size="default"
				value={toggleValue}
				onValueChange={onToggleChange}
			>
				<ToggleGroupItem value="pinyin"><span class="text-xs">拼</span>Pinyin</ToggleGroupItem>
				<ToggleGroupItem value="english"><ALargeSmallIcon /> English</ToggleGroupItem>
			</ToggleGroup>
		</div>

		<div class="flex justify-center md:justify-start">
			<Toggle
				variant="outline"
				pressed={allRevealed}
				onPressedChange={onToggleAllChange}
			>
				{#if allRevealed}
					<EyeIcon /> Hide All
				{:else}
					<EyeOffIcon /> Show All
				{/if}
			</Toggle>
		</div>
	</div>
</div>

<EditCardDialog bind:open={editOpen} {card} />
<DeleteCardDialog bind:open={deleteOpen} {card} {ondelete} />
