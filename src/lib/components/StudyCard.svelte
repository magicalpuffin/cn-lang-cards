<script lang="ts">
	import type { FlashCard } from '$lib/types';
	import { Card, CardContent } from '$lib/components/ui/card';

	let {
		card,
		isActive,
		showPinyin,
		showEnglish
	}: {
		card: FlashCard;
		isActive: boolean;
		showPinyin: boolean;
		showEnglish: boolean;
	} = $props();
</script>

<Card class="min-h-[300px]">
	<CardContent class="flex justify-center items-center p-8 min-h-[300px]">
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
	</CardContent>
</Card>
