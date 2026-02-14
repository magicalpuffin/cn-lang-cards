<script lang="ts">
	import type { FlashCard } from '$lib/types';
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
	import pinyin from 'pinyin';

	let { open = $bindable(false), card }: { open: boolean; card: FlashCard | null } = $props();

	let editChinese = $state('');
	let editPinyin = $state('');
	let editEnglish = $state('');

	$effect(() => {
		if (open && card) {
			editChinese = card.chinese;
			editPinyin = card.pinyin;
			editEnglish = card.english;
		}
	});

	function handleChineseInput() {
		if (editChinese.trim()) {
			const result = pinyin(editChinese, {
				style: pinyin.STYLE_TONE,
				heteronym: false
			});
			editPinyin = result.map((arr: string[]) => arr[0]).join(' ');
		} else {
			editPinyin = '';
		}
	}

	function handleSave() {
		if (card && editChinese.trim()) {
			cardStore.updateCard(card.id, {
				chinese: editChinese.trim(),
				pinyin: editPinyin.trim(),
				english: editEnglish.trim()
			});
			open = false;
		}
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Card</DialogTitle>
			<DialogDescription>Make changes to your flashcard.</DialogDescription>
		</DialogHeader>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="edit-chinese">Chinese Characters</Label>
				<Textarea
					id="edit-chinese"
					bind:value={editChinese}
					oninput={handleChineseInput}
					class="{editChinese ? 'md:text-xl' : ''} h-16"
				></Textarea>
			</div>
			<div class="space-y-2">
				<Label for="edit-pinyin">Pinyin (auto-generated)</Label>
				<Input id="edit-pinyin" type="text" bind:value={editPinyin} />
			</div>
			<div class="space-y-2">
				<Label for="edit-english">English Translation (optional)</Label>
				<Textarea id="edit-english" bind:value={editEnglish}></Textarea>
			</div>
			<DialogFooter>
				<Button variant="outline" type="button" onclick={() => (open = false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={!editChinese.trim()}>Save</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
