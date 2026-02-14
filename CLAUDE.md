# Chinese Flashcard App - Project Guidelines

## Project Overview

A language learning flashcard application focused on Chinese characters with automatic pinyin generation. Users can create flashcards by pasting Chinese characters, which automatically generates pinyin romanization, with optional English translations. Cards are stored in browser localStorage for persistence.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (using runes: `$state`, `$derived`, `$effect`, `$props`)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn-svelte (bits-ui) - Button, Card, Tabs, Dialog, Alert Dialog, Dropdown Menu, etc.
  - Install new components: `pnpx shadcn-svelte@latest add <component-name>`
- **Translation**: `pinyin` npm package for Chinese → Pinyin conversion
- **Storage**: Browser localStorage
- **Package Manager**: pnpm

## Architecture

### File Structure

```
src/
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── stores/
│   │   └── cards.svelte.ts        # Card store with localStorage sync
│   └── components/
│       ├── CardCreator.svelte      # Create new flashcards
│       ├── CardList.svelte         # Display all cards
│       ├── StudyMode.svelte        # Flashcard study interface
│       └── ui/                     # shadcn-svelte components
└── routes/
    ├── +layout.svelte              # Root layout
    └── +page.svelte                # Main app (tabs: Manage/Study/Settings)
```

### Data Model

```typescript
interface FlashCard {
  id: string;           // UUID
  chinese: string;      // Required: Chinese characters
  pinyin: string;       // Auto-generated from chinese
  english: string;      // Optional: English translation
  createdAt: number;    // Timestamp
}
```

### Key Features

1. **Card Creation** (CardCreator.svelte)
   - Paste Chinese characters → auto-generates pinyin using `pinyin` package
   - English translation is optional
   - Real-time pinyin generation on input

2. **Card Management** (CardList.svelte)
   - View all cards with 3-dot dropdown menu (edit/delete)
   - Edit opens a modal dialog with pinyin auto-regeneration
   - Delete opens a confirmation dialog
   - Shows Chinese, pinyin, and English (if present)

3. **Study Mode** (StudyMode.svelte)
   - Two modes: Sequential (creation order) or Random (shuffled)
   - Independent toggle buttons for revealing pinyin/English
   - "Reveal All" and "Hide All" quick actions
   - Navigation resets reveal state

4. **Data Persistence**
   - All cards saved to localStorage (`flashcards` key)
   - Auto-saves on create/update/delete

## Development

### Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm check        # Type checking
pnpm lint         # ESLint
pnpm format       # Prettier formatting
```

### Svelte 5 Runes Pattern

This project uses Svelte 5's new runes syntax:

```svelte
<script lang="ts">
  // Reactive state
  let count = $state(0);

  // Derived values
  const doubled = $derived(count * 2);

  // Props
  let { mode = 'sequential' }: { mode?: StudyMode } = $props();

  // Side effects
  $effect(() => {
    console.log('count changed:', count);
  });
</script>
```

## Coding Guidelines

### Component Patterns

1. **Use Svelte 5 runes** instead of legacy `let/const` for reactivity
2. **Store pattern**: Use classes with `$state` for stores (see `cards.svelte.ts`)
3. **Browser checks**: Always check `browser` from `$app/environment` before localStorage access
4. **Type safety**: All components use TypeScript

### Pinyin Generation

```typescript
import pinyin from 'pinyin';

const result = pinyin(chinese, {
  style: pinyin.STYLE_TONE,  // Use tone marks (ā, á, ǎ, à)
  heteronym: false           // Return single most common pronunciation
});
const pinyinText = result.map((arr) => arr[0]).join(' ');
```

### localStorage Sync

The `cardStore` automatically syncs with localStorage on every mutation:
- `addCard()` → saves to localStorage
- `deleteCard()` → saves to localStorage
- `updateCard()` → saves to localStorage

### Component Communication

- Global state: `cardStore` (imported from `$lib/stores/cards.svelte`)
- No prop drilling - components import store directly
- Study mode receives `mode` prop from parent

## UI/UX Patterns

### Button States

- **Active state**: Use `variant="default"` (filled button)
- **Inactive state**: Use `variant="outline"` (outlined button)
- **Secondary actions**: Use `variant="secondary"`
- **Destructive actions**: Use `variant="destructive"`

### Form Handling

```svelte
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <!-- Prevent default, then handle -->
</form>
```

### Textarea Elements

Always use closing tags for textareas (Svelte requirement):
```svelte
<textarea></textarea>  <!-- ✓ Correct -->
<textarea />           <!-- ✗ Causes Svelte warning -->
```

## Future Enhancements (Not Yet Implemented)

- Export/import cards (JSON)
- Spaced repetition algorithm
- Audio pronunciation
- Multiple deck support
- Progress tracking
- Search/filter cards
- Full translation API integration (Google Translate, DeepL)

## Dependencies

### Core
- `svelte@^5.49.2` - Framework
- `@sveltejs/kit@^2.50.2` - Meta-framework
- `pinyin@^4.x` - Chinese to pinyin conversion

### UI
- `tailwindcss@^4.1.18` - Styling
- `bits-ui@^2.15.5` - Headless UI components
- `@tailwindcss/vite@^4.1.18` - Vite integration

### Dev
- `typescript@^5.9.3`
- `vite@^7.3.1`
- `svelte-check@^4.3.6` - Type checking
- `prettier@^3.8.1` + `prettier-plugin-svelte` - Formatting
- `eslint@^9.39.2` - Linting

## Important Notes

1. **Do not use legacy Svelte syntax** - this is a Svelte 5 project
2. **English is optional** - cards can exist with just Chinese + pinyin
3. **Study mode buttons** - pinyin and English have independent toggles
4. **Navigation resets reveals** - moving to next/prev card hides all reveals
5. **No backend** - everything is client-side with localStorage
