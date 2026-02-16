<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { cardStore } from '$lib/stores/cards.svelte';

	let { value = $bindable<string | null>(null) }: { value?: string | null } = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived(cardStore.cardSets.find((s) => s.id === value)?.name);

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
				class="w-[200px] justify-between overflow-hidden"
				role="combobox"
				aria-expanded={open}
			>
				<span class="truncate">{selectedLabel || 'Select a set...'}</span>
				<ChevronsUpDownIcon class="shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search sets..." />
			<Command.List>
				<Command.Empty>No sets found.</Command.Empty>
				<Command.Group value="sets">
					{#each cardStore.cardSets as set (set.id)}
						<Command.Item
							value={set.name}
							onSelect={() => {
								value = set.id;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn('shrink-0', value !== set.id && 'text-transparent')} />
							<span class="truncate">{set.name}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
