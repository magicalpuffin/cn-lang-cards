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
				class="w-[200px] justify-between"
				role="combobox"
				aria-expanded={open}
			>
				{selectedLabel || 'Select a set...'}
				<ChevronsUpDownIcon class="opacity-50" />
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
							<CheckIcon class={cn(value !== set.id && 'text-transparent')} />
							{set.name}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
