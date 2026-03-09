# Chinese Flashcard App - Project Guidelines

## Project Overview

A language learning flashcard application focused on Chinese characters with automatic pinyin generation and Azure-powered English translation. Users can organize flashcards into sets, create cards by pasting Chinese characters (which auto-generates pinyin and optionally translates to English), and study them in a carousel interface. Cards are stored in browser localStorage. Card sets can be shared via URL using a Cloudflare D1 database backend. Deployed to Cloudflare Workers.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (using runes: `$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn-svelte (bits-ui) - Button, ButtonGroup, Card, Dialog, Dropdown Menu, Command, Popover, Toggle, ToggleGroup, Separator, Carousel, Tabs, Select, Textarea, AlertDialog, InputGroup, etc.
  - Install new components: `pnpx shadcn-svelte@latest add <component-name>`
- **Icons**: `@lucide/svelte`
- **Carousel**: `embla-carousel-svelte`
- **Drag & Drop**: `sortablejs` for card reordering
- **Utilities**: `runed` (Debounced)
- **Pinyin**: `pinyin` npm package for Chinese -> Pinyin conversion
- **Translation**: Azure Cognitive Services Translator API (Chinese -> English)
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM for shared card sets
- **Storage**: Browser localStorage for local card data
- **IDs**: `nanoid` for short unique IDs
- **Deployment**: Cloudflare Workers (`@sveltejs/adapter-cloudflare`)
- **Package Manager**: pnpm

## Architecture

### File Structure

```
src/
├── app.d.ts                           # Platform types (Cloudflare env: DB, Azure keys)
├── app.html                           # Root HTML template
├── lib/
│   ├── types.ts                       # TypeScript interfaces (CardSet, FlashCard, StudyMode)
│   ├── utils.ts                       # Utility functions (cn, type helpers)
│   ├── index.ts                       # Library exports
│   ├── assets/
│   │   └── favicon.svg
│   ├── server/
│   │   └── db/
│   │       ├── index.ts              # Drizzle D1 initialization helper
│   │       └── schema.ts            # share_card_set table schema (Drizzle)
│   ├── stores/
│   │   └── cards.svelte.ts           # Card/set store with localStorage sync
│   └── components/
│       ├── CardListItem.svelte        # Individual card row with drag handle + edit/delete
│       ├── CardListView.svelte        # Sortable card list with drag-to-reorder
│       ├── CardManager.svelte         # Card list with edit/delete (used in manage dialog)
│       ├── CardSelectorCombobox.svelte # Searchable combobox to jump to a card
│       ├── CreateCardDialog.svelte    # Create card form with auto-pinyin + auto-translate
│       ├── EditCardDialog.svelte      # Edit card form with auto-pinyin
│       ├── DeleteCardDialog.svelte    # Card deletion confirmation
│       ├── CreateSetDialog.svelte     # Create card set form
│       ├── EditSetDialog.svelte       # Edit card set name
│       ├── DeleteSetDialog.svelte     # Set deletion confirmation
│       ├── SetManager.svelte          # Card set list with edit/delete and card counts
│       ├── SetSelectorCombobox.svelte # Searchable set selector dropdown
│       ├── StudyCard.svelte           # Individual flashcard with reveal controls (ToggleGroup)
│       ├── StudyMode.svelte           # Carousel study interface with navigation + card selector
│       └── ui/                        # shadcn-svelte components
└── routes/
    ├── layout.css                     # Global styles
    ├── +layout.svelte                 # Root layout
    ├── +page.svelte                   # Main page (set selector + study/list views + share import)
    └── api/
        ├── translate/
        │   └── +server.ts            # Azure Translation API endpoint
        └── card-set/
            ├── +server.ts            # GET all / POST new shared card set
            └── [id]/
                └── +server.ts        # GET shared card set by nanoid
```

### Data Model

Cards are embedded directly inside their parent `CardSet` (no foreign key relationship):

```typescript
interface FlashCard {
  id: string;           // nanoid
  chinese: string;      // Required: Chinese characters
  pinyin: string;       // Auto-generated from chinese
  english: string;      // Optional: English translation (auto-translated or manual)
  createdAt: number;    // Timestamp
}

interface CardSet {
  id: string;           // nanoid (or "default-set" for the default)
  name: string;         // Set name
  cards: FlashCard[];   // Cards embedded in the set
  createdAt: number;    // Timestamp
}

type StudyMode = 'random' | 'sequential';
```

### Database Schema (D1 / Drizzle)

The `share_card_set` table stores shared card sets as JSON blobs:

```typescript
// src/lib/server/db/schema.ts
export const shareCardSet = sqliteTable("share_card_set", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  cardSet: text("card_set", { mode: "json" }),
});
```

Migrations live in `./drizzle/` and are applied via `wrangler d1 migrations apply`.

### Key Features

1. **Card Sets** (`SetSelectorCombobox.svelte`, `SetManager.svelte`)
   - Organize cards into named sets
   - Default set ("default-set") cannot be edited or deleted
   - Searchable combobox for set selection
   - Create/edit/delete sets via dialogs
   - Card counts displayed per set

2. **Card Creation** (`CreateCardDialog.svelte`)
   - Paste Chinese characters -> auto-generates pinyin using `pinyin` package
   - Auto-translates to English via Azure API (500ms debounce using `runed` Debounced)
   - Auto-translation won't overwrite manual English input (`userEditedEnglish` guard)
   - English translation is optional

3. **Card Management** (`CardListView.svelte`, `CardListItem.svelte`)
   - View All mode shows all cards in a sortable list
   - Drag-to-reorder via SortableJS (grip handle icon)
   - Edit/delete via ButtonGroup icon buttons per card
   - "View Card" link jumps to that card in Study mode

4. **Study Mode** (`StudyMode.svelte`, `StudyCard.svelte`)
   - Embla carousel for card navigation
   - Shuffle toggle for random vs sequential order
   - Independent toggle buttons for revealing pinyin/English (via ToggleGroup)
   - "Reveal All" and "Hide All" quick actions
   - Navigation resets reveal state
   - Card counter (e.g., "Card 2 of 10")
   - Searchable card selector combobox to jump to any card

5. **View Modes** (`+page.svelte`)
   - **Study** (carousel) and **View All** (sortable list) toggled via Toggle buttons
   - Switching from View All to Study preserves the selected card index

6. **Share Card Sets** (`+page.svelte`, `/api/card-set/`)
   - Upload button saves the current set to D1 database via `POST /api/card-set`
   - Shared sets are retrieved via `GET /api/card-set/[id]`
   - Visiting `/?share=<nanoid>` imports the shared set into localStorage on page load
   - Import handled in `onMount` as a one-shot side effect
   - URL query string is cleaned up with `history.replaceState` after import

7. **Data Persistence**
   - All cards and sets saved to localStorage (`cn-lang-cards` key)
   - Auto-saves on create/update/delete/import/reorder
   - Selected set ID persisted across sessions

## API Endpoints

### Azure Translator (`POST /api/translate`)

Server-side endpoint that translates Chinese (Simplified) to English using Azure Cognitive Services.

- **Request body**: `{ "text": "Chinese text" }`
- **Response**: `{ "translation": "English text" }`
- **Azure endpoint**: `https://api.cognitive.microsofttranslator.com/translate`
- **Language pair**: `zh-Hans` -> `en`

### Share Card Set (`/api/card-set`)

**`POST /api/card-set`** - Save a card set to D1:
- **Request body**: `{ "cardSet": CardSet }`
- **Response**: `{ "task": { id, timestamp, cardSet } }` with status 201

**`GET /api/card-set`** - List all shared card sets (admin/debug)

**`GET /api/card-set/[id]`** - Retrieve a shared card set by nanoid:
- **Response**: `{ "shareCardSet": { id, timestamp, cardSet } }` or 404

All endpoints guard on `platform.env.DB` availability and return 500 if the D1 binding is missing.

## Environment Variables

### Cloudflare Secrets (set via `wrangler secret put` or dashboard)
- `AZ_TRANSLATOR_API_KEY` - Azure Translator API key
- `AZ_REGION` - Azure region (e.g., `eastus`)

### Cloudflare Bindings (configured in `wrangler.jsonc`)
- `DB` - Cloudflare D1 database binding

### Local Development
- `DATABASE_URL` - Local SQLite path for Drizzle dev tools (e.g., `local.db`); only used by `drizzle.config.ts`, not the Worker runtime

Accessed via `platform.env` in SvelteKit server routes. Translation and D1 are unavailable in local dev (`pnpm dev`) since `platform.env` is not populated -- endpoints return 500 and the app gracefully degrades.

## Development

### Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Production build
pnpm preview      # Build + wrangler dev (local Cloudflare preview)
pnpm check        # Type checking
pnpm check:watch  # Type checking (watch mode)
pnpm lint         # Prettier + ESLint
pnpm format       # Prettier formatting
pnpm deploy       # Build + deploy to Cloudflare Workers
pnpm gen          # Generate Cloudflare worker types (wrangler types)
pnpm cf-typegen   # Alias for pnpm gen

# Drizzle database commands
pnpm db:generate  # Generate migration files from schema changes
pnpm db:push      # Push schema directly to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio GUI
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
  style: pinyin.STYLE_TONE,  // Use tone marks
  heteronym: false           // Return single most common pronunciation
});
const pinyinText = result.map((arr: string[]) => arr[0]).join(' ');
```

### localStorage Sync

The `cardStore` automatically syncs with localStorage on every mutation:
- `addCard()` / `deleteCard()` / `updateCard()` -> saves to localStorage
- `addSet()` / `deleteSet()` / `updateSet()` -> saves to localStorage
- `importSet()` -> upserts a card set (replace if exists, append if new) and saves
- `reorderCards()` -> persists new card order
- `setSelectedSetId()` -> saves to localStorage

Storage key: `cn-lang-cards`. Data shape: `{ sets: CardSet[], selectedSetId?: string }`

### Component Communication

- Global state: `cardStore` (imported from `$lib/stores/cards.svelte`)
- No prop drilling - components import store directly
- `StudyMode` receives `setId` prop from parent
- Dialog open state managed via `$bindable` props
- Callbacks via props (e.g., `oncreate`, `ondelete`, `onviewcard`)

## UI/UX Patterns

### Button States

- **Active state**: Use `variant="default"` (filled button)
- **Inactive state**: Use `variant="outline"` (outlined button)
- **Secondary actions**: Use `variant="secondary"`
- **Destructive actions**: Use `variant="destructive"`
- **Icon-only buttons**: Use `size="icon"` with aria-label
- **Grouped buttons**: Use `ButtonGroup` to visually join related buttons

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
- `nanoid@^5.1.6` - Short unique ID generation
- `@azure-rest/ai-translation-text@^1.0.1` - Azure Translation API client

### Database
- `drizzle-orm@^0.45.1` - ORM for D1/SQLite
- `drizzle-kit@^0.31.8` - Drizzle migration/studio CLI
- `better-sqlite3@^12.6.2` - SQLite driver for local Drizzle dev

### UI
- `tailwindcss@^4.1.18` - Styling
- `bits-ui@^2.15.5` - Headless UI components
- `@tailwindcss/vite@^4.1.18` - Vite integration
- `embla-carousel-svelte@^8.6.0` - Carousel for study mode
- `@lucide/svelte@^0.561.0` - Icons
- `runed@^0.37.1` - Reactive utilities (Debounced)
- `sortablejs@^1.15.7` - Drag-to-reorder lists
- `tailwind-variants@^3.2.2` - Used in ButtonGroup component
- `tw-animate-css@^1.4.0` - Tailwind animation utilities

### Infrastructure
- `@sveltejs/adapter-cloudflare@^7.2.6` - Cloudflare Workers adapter
- `wrangler@^4.63.0` - Cloudflare CLI
- `@cloudflare/workers-types@^4.20260218.0` - Cloudflare Worker type definitions

### Dev
- `typescript@^5.9.3`
- `vite@^7.3.1`
- `svelte-check@^4.3.6` - Type checking
- `prettier@^3.8.1` + `prettier-plugin-svelte` + `prettier-plugin-tailwindcss` - Formatting
- `eslint@^9.39.2` - Linting

## Important Notes

1. **Do not use legacy Svelte syntax** - this is a Svelte 5 project
2. **English is optional** - cards can exist with just Chinese + pinyin
3. **Cards are embedded in sets** - `FlashCard` objects live inside `CardSet.cards[]`, not in a separate flat array
4. **Study mode buttons** - pinyin and English have independent toggles
5. **Navigation resets reveals** - moving to next/prev card hides all reveals
6. **Default set is protected** - cannot be edited or deleted
7. **Translation and D1 require Cloudflare** - the Azure translate and card-set endpoints use `platform.env` which is only available in Cloudflare Workers; local dev gracefully degrades
8. **Wrangler config is JSONC** - the project uses `wrangler.jsonc`, not `wrangler.toml`
9. **IDs use nanoid** - not `crypto.randomUUID()`; generates shorter, URL-friendly IDs
