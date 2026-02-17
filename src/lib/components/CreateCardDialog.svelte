<script lang="ts">
	import { cardStore } from '$lib/stores/cards.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Debounced } from "runed";
	import pinyin from 'pinyin';

	let {
		open = $bindable(false),
		setId,
		oncreate
	}: { open: boolean; setId: string; oncreate?: () => void } = $props();

	let chinese = $state('');
	let chineseDebounced = new Debounced(() => chinese, 500);
	let pinyinText = $state('');
	let english = $state('');
	let translating = $state(false);
	let userEditedEnglish = $state(false);

	$effect(() => {
		if (open) {
			chinese = '';
			pinyinText = '';
			english = '';
			translating = false;
			userEditedEnglish = false;
		}
	});

	$effect(() => {
		const text = chineseDebounced.current;
		if (!text?.trim() || userEditedEnglish) return;

		translating = true;
		fetch('/api/translate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: text.trim() })
		})
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.translation && !userEditedEnglish) {
					english = data.translation;
				}
			})
			.catch(() => {
				// Leave english empty on error
			})
			.finally(() => {
				translating = false;
			});
	});

	function handleChineseInput() {
		if (chinese.trim()) {
			const result = pinyin(chinese, {
				style: pinyin.STYLE_TONE,
				heteronym: false
			});
			pinyinText = result.map((arr: string[]) => arr[0]).join(' ');
		} else {
			pinyinText = '';
		}
	}

	function handleEnglishInput() {
		userEditedEnglish = english.trim().length > 0;
	}

	function handleSubmit() {
		if (chinese.trim()) {
			cardStore.addCard({
				setId,
				chinese: chinese.trim(),
				pinyin: pinyinText.trim(),
				english: english.trim()
			});
			oncreate?.();
			chinese = '';
			pinyinText = '';
			english = '';
			open = false;
		}
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create New Card</DialogTitle>
			<DialogDescription>Add a new flashcard to your collection.</DialogDescription>
		</DialogHeader>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="create-chinese">Chinese Characters</Label>
				<Textarea
					id="create-chinese"
					bind:value={chinese}
					oninput={handleChineseInput}
					placeholder="Paste or type Chinese characters..."
					class="{chinese ? 'md:text-xl' : ''} h-16"
				></Textarea>
			</div>
			<div class="space-y-2">
				<Label for="create-pinyin">Pinyin (auto-generated)</Label>
				<Input
					id="create-pinyin"
					type="text"
					bind:value={pinyinText}
					placeholder="Auto-generated from Chinese"
				/>
			</div>
			<div class="space-y-2">
				<Label for="create-english">
					English Translation (optional)
					{#if translating}
						<span class="ml-1 text-xs text-muted-foreground">Translating...</span>
					{/if}
				</Label>
				<Textarea
					id="create-english"
					bind:value={english}
					oninput={handleEnglishInput}
					placeholder="Enter English translation (optional)..."
				></Textarea>
			</div>
			<DialogFooter>
				<Button variant="outline" type="button" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={!chinese.trim()}>Add Card</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
