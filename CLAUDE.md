# Chinese Flashcard App - Project Guidelines

## Project Overview

A language learning flashcard application focused on Chinese characters with automatic pinyin generation and Azure-powered English translation. Users can organize flashcards into sets, create cards by pasting Chinese characters (which auto-generates pinyin and optionally translates to English), and study them in a carousel interface. Cards are stored in browser localStorage. Deployed to Cloudflare Workers.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (using runes: `$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn-svelte (bits-ui) - Button, Card, Dialog, Dropdown Menu, Command, Popover, Toggle, Separator, Carousel, etc.
  - Install new components: `pnpx shadcn-svelte@latest add <component-name>`
- **Icons**: `@lucide/svelte`
- **Carousel**: `embla-carousel-svelte`
- **Utilities**: `runed` (Debounced)
- **Pinyin**: `pinyin` npm package for Chinese → Pinyin conversion
- **Translation**: Azure Cognitive Services Translator API (Chinese → English)
- **Storage**: Browser localStorage
- **Deployment**: Cloudflare Workers (`@sveltejs/adapter-cloudflare`)
- **Package Manager**: pnpm

## Architecture

### File Structure

```
src/
├── lib/
│   ├── types.ts                       # TypeScript interfaces (CardSet, FlashCard, StudyMode)
│   ├── utils.ts                       # Utility functions (cn, type helpers)
│   ├── index.ts                       # Library exports
│   ├── stores/
│   │   └── cards.svelte.ts           # Card/set store with localStorage sync
│   └── components/
│       ├── CardManager.svelte         # Card list with edit/delete (used in manage dialog)
│       ├── CreateCardDialog.svelte    # Create card form with auto-pinyin + auto-translate
│       ├── EditCardDialog.svelte      # Edit card form with auto-pinyin
│       ├── DeleteCardDialog.svelte    # Card deletion confirmation
│       ├── CreateSetDialog.svelte     # Create card set form
│       ├── EditSetDialog.svelte       # Edit card set name
│       ├── DeleteSetDialog.svelte     # Set deletion confirmation
│       ├── SetManager.svelte          # Card set list with edit/delete
│       ├── SetSelectorCombobox.svelte # Searchable set selector dropdown
│       ├── StudyCard.svelte           # Individual flashcard with reveal controls
│       ├── StudyMode.svelte           # Carousel study interface with navigation
│       └── ui/                        # shadcn-svelte components
└── routes/
    ├── +layout.svelte                 # Root layout
    ├── +page.svelte                   # Main page (set selector + study mode)
    └── api/
        └── translate/
            └── +server.ts            # Azure Translation API endpoint
```

### Data Model

```typescript
interface CardSet {
  id: string;           // UUID (or "default-set" for the default)
  name: string;         // Set name
  createdAt: number;    // Timestamp
}

interface FlashCard {
  id: string;           // UUID
  setId: string;        // References CardSet.id
  chinese: string;      // Required: Chinese characters
  pinyin: string;       // Auto-generated from chinese
  english: string;      // Optional: English translation (auto-translated or manual)
  createdAt: number;    // Timestamp
}

type StudyMode = 'random' | 'sequential';
```

### Key Features

1. **Card Sets** (`SetManager.svelte`, `SetSelectorCombobox.svelte`)
   - Organize cards into named sets
   - Default set ("default-set") cannot be edited or deleted
   - Searchable combobox for set selection
   - Create/edit/delete sets via dialogs

2. **Card Creation** (`CreateCardDialog.svelte`)
   - Paste Chinese characters → auto-generates pinyin using `pinyin` package
   - Auto-translates to English via Azure API (500ms debounce using `runed` Debounced)
   - Auto-translation won't overwrite manual English input (`userEditedEnglish` guard)
   - English translation is optional

3. **Card Management** (`CardManager.svelte`)
   - View all cards in a set with 3-dot dropdown menu (edit/delete)
   - Edit opens a dialog with pinyin auto-regeneration
   - Delete opens a confirmation dialog
   - Accessible from study mode via manage button

4. **Study Mode** (`StudyMode.svelte`, `StudyCard.svelte`)
   - Embla carousel for card navigation
   - Shuffle toggle for random vs sequential order
   - Independent toggle buttons for revealing pinyin/English
   - "Reveal All" and "Hide All" quick actions
   - Navigation resets reveal state
   - Card counter (e.g., "Card 2 of 10")

5. **Data Persistence**
   - All cards and sets saved to localStorage (`cn-lang-cards` key)
   - Auto-saves on create/update/delete
   - Selected set ID persisted across sessions

## Translation API

### Azure Translator (`/api/translate`)

Server-side endpoint that translates Chinese (Simplified) to English using Azure Cognitive Services.

- **Endpoint**: `POST /api/translate`
- **Request body**: `{ "text": "Chinese text" }`
- **Response**: `{ "translation": "English text" }`
- **Azure endpoint**: `https://api.cognitive.microsofttranslator.com/translate`
- **Language pair**: `zh-Hans` → `en`

### Environment Variables (Cloudflare)

Set via `wrangler secret put` or Cloudflare dashboard:
- `AZ_TRANSLATOR_API_KEY` - Azure Translator API key
- `AZ_REGION` - Azure region (e.g., `eastus`)

Accessed via `platform.env` in SvelteKit server routes. Translation is unavailable in local dev (`pnpm dev`) since `platform.env` is not populated — the endpoint returns a 500 and card creation proceeds without translation.

## Development

### Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Production build
pnpm preview      # Build + wrangler dev (local Cloudflare preview)
pnpm check        # Type checking
pnpm lint         # Prettier + ESLint
pnpm format       # Prettier formatting
pnpm deploy       # Build + deploy to Cloudflare Workers
pnpm gen          # Generate Cloudflare worker types (wrangler types)
```

### Svelte 5 Runes Pattern

This project uses Svelte 5's new runes syntax:

```svelte
<script lang="ts">
  // Reactive state
  let count = $state(0);

  // Derived values
  const doubled = $derived(count * 2);

  // Props (with bindable)
  let { value = $bindable(), mode = 'sequential' }: { value?: string; mode?: StudyMode } = $props();

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
5. **Dialog pattern**: Each CRUD action has its own dialog component (Create/Edit/Delete)

### Pinyin Generation

```typescript
import pinyin from 'pinyin';

const result = pinyin(chinese, {
  style: pinyin.STYLE_TONE,  // Use tone marks (ā, á, ǎ, à)
  heteronym: false           // Return single most common pronunciation
});
const pinyinText = result.map((arr: string[]) => arr[0]).join(' ');
```

### localStorage Sync

The `cardStore` automatically syncs with localStorage on every mutation:
- `addCard()` / `deleteCard()` / `updateCard()` → saves to localStorage
- `addSet()` / `deleteSet()` / `updateSet()` → saves to localStorage
- `setSelectedSetId()` → saves to localStorage

Storage key: `cn-lang-cards`. Data shape: `{ cards: FlashCard[], sets: CardSet[], selectedSetId?: string }`

### Component Communication

- Global state: `cardStore` (imported from `$lib/stores/cards.svelte`)
- No prop drilling - components import store directly
- `StudyMode` receives `setId` prop from parent
- Dialog open state managed via `$bindable` props
- Callbacks via props (e.g., `oncreate`, `ondelete`)

## UI/UX Patterns

### Button States

- **Active state**: Use `variant="default"` (filled button)
- **Inactive state**: Use `variant="outline"` (outlined button)
- **Secondary actions**: Use `variant="secondary"`
- **Destructive actions**: Use `variant="destructive"`
- **Icon-only buttons**: Use `size="icon"` with aria-label

### Form Handling

```svelte
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <!-- Prevent default, then handle -->
</form>
```

### Textarea Elements

Always use closing tags for textareas (Svelte requirement):
```svelte
<textarea></textarea>  <!-- Correct -->
<textarea />           <!-- Causes Svelte warning -->
```

## Dependencies

### Core
- `svelte@^5.49.2` - Framework
- `@sveltejs/kit@^2.50.2` - Meta-framework
- `pinyin@^4.0.0` - Chinese to pinyin conversion
- `@azure-rest/ai-translation-text@^1.0.1` - Azure Translation API client

### UI
- `tailwindcss@^4.1.18` - Styling
- `bits-ui@^2.15.5` - Headless UI components
- `@tailwindcss/vite@^4.1.18` - Vite integration
- `embla-carousel-svelte@^8.6.0` - Carousel for study mode
- `@lucide/svelte@^0.561.0` - Icons
- `runed@^0.37.1` - Reactive utilities (Debounced)

### Infrastructure
- `@sveltejs/adapter-cloudflare@^7.2.6` - Cloudflare Workers adapter
- `wrangler@^4.63.0` - Cloudflare CLI

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
5. **Default set is protected** - cannot be edited or deleted
6. **Translation requires Cloudflare** - the Azure translate endpoint uses `platform.env` which is only available in Cloudflare Workers; local dev gracefully degrades (no auto-translation)
