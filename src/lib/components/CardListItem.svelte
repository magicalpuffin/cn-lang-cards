<script lang="ts">
	import type { FlashCard } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { GripVerticalIcon, SquarePenIcon, Trash2Icon } from '@lucide/svelte';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import EditCardDialog from './EditCardDialog.svelte';
	import DeleteCardDialog from './DeleteCardDialog.svelte';

	let {
		card,
		setId,
		index,
		onviewcard,
		ondelete
	}: {
		card: FlashCard;
		setId: string;
		index: number;
		onviewcard?: () => void;
		ondelete?: () => void;
	} = $props();

	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
</script>

<div class="p-4 rounded-xl border hover:bg-muted/50">
	<div class="flex justify-between items-center">
		<div class="flex items-center">
			<div class="p-2 drag-handle cursor-grab text-muted-foreground active:cursor-grabbing">
				<GripVerticalIcon class="size-4" />
			</div>
			<span class="text-sm text-muted-foreground">{index + 1}.</span>

			<Button variant="link" size="default" onclick={() => onviewcard?.()}>View Card</Button>
		</div>
		<ButtonGroup>
			<Button
				aria-label="Edit card"
				variant="ghost"
				size="icon"
				onclick={() => (editDialogOpen = true)}
			>
				<SquarePenIcon />
			</Button>
			<Button
				aria-label="Delete card"
				variant="ghost"
				size="icon"
				class="text-destructive"
				onclick={() => (deleteDialogOpen = true)}
			>
				<Trash2Icon />
			</Button>
		</ButtonGroup>
	</div>
	<div class="flex flex-col p-2 space-y-2">
		<div class="text-2xl font-medium">{card.chinese}</div>
		<div class="text-sm text-muted-foreground">{card.pinyin}</div>
		{#if card.english}
			<div class="text-sm">{card.english}</div>
		{/if}
	</div>
</div>

<EditCardDialog bind:open={editDialogOpen} {card} {setId} />
<DeleteCardDialog bind:open={deleteDialogOpen} {card} {setId} {ondelete} />
