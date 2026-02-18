<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { FlashCard } from '$lib/types';

	let {
		value = $bindable<string | null>(null),
		cards,
		onselect
	}: {
		value?: string | null;
		cards: FlashCard[];
		onselect?: (index: number) => void;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived(cards.find((c) => c.id === value)?.chinese);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class="overflow-hidden justify-between w-40 md:w-52"
				role="combobox"
				aria-expanded={open}
			>
				<span class="truncate">{selectedLabel || 'Select a card...'}</span>
				<ChevronsUpDownIcon class="opacity-50 shrink-0" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0 w-40 md:w-52">
		<Command.Root>
			<Command.Input placeholder="Search cards..." />
			<Command.List>
				<Command.Empty>No cards found.</Command.Empty>
				<Command.Group value="cards">
					{#each cards as card, index (card.id)}
						<Command.Item
							value={card.chinese}
							onSelect={() => {
								value = card.id;
								onselect?.(index);
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn('shrink-0', value !== card.id && 'text-transparent')} />
							<span class="truncate">{card.chinese}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
