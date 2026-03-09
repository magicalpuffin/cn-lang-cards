<script lang="ts">
	import type { CardSet } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { CheckIcon, CopyIcon, LoaderCircleIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), cardSet }: { open: boolean; cardSet: CardSet | null } = $props();

	let saving = $state(false);
	let shareLink = $state('');
	let error = $state('');
	let copied = $state(false);

	$effect(() => {
		if (open && cardSet) {
			saveToDb();
		}
		if (!open) {
			shareLink = '';
			error = '';
			copied = false;
		}
	});

	async function saveToDb() {
		if (!cardSet) return;
		saving = true;
		error = '';
		shareLink = '';
		try {
			const res = await fetch('/api/card-set', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cardSet })
			});
			if (!res.ok) {
				error = 'Failed to share card set';
				toast.error('Failed to share card set');
				return;
			}
			const data = await res.json();
			const id = data.task?.id;
			if (!id) {
				error = 'No share ID returned';
				toast.error('Failed to share card set');
				return;
			}
			shareLink = `${window.location.origin}/?share=${id}`;
			if (res.status === 201) {
				toast.success('Share link created', { description: cardSet.name });
			}
		} catch {
			error = 'Failed to share card set';
			toast.error('Failed to share card set');
		} finally {
			saving = false;
		}
	}

	async function copyLink() {
		if (!shareLink) return;
		await navigator.clipboard.writeText(shareLink);
		copied = true;
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Share "{cardSet?.name}"</DialogTitle>
			<DialogDescription>Generate a link to share your card set</DialogDescription>
		</DialogHeader>
		{#if saving}
			<div class="flex justify-center py-4">
				<LoaderCircleIcon class="animate-spin text-muted-foreground" />
			</div>
		{:else if error}
			<p class="text-sm text-destructive">{error}</p>
		{:else if shareLink}
			<ButtonGroup class="w-full">
				<Input class="h-10" readonly value={shareLink} />
				<Button variant="outline" size="lg" onclick={copyLink}>
					{#if copied}
						<CheckIcon />Copied
					{:else}
						<CopyIcon />Copy Link
					{/if}
				</Button>
			</ButtonGroup>
		{/if}
	</DialogContent>
</Dialog>
