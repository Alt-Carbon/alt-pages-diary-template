# AGENTS.md

This repository is one person's website, made from the Alt Pages **Lab Diary** template: a spiral notebook lying on a desk, with index tabs down the side; pages turn like paper. It is an Astro site served by a Cloudflare Worker, and Cloudflare builds and publishes it about two minutes after anything is pushed to `main`.

The owner is probably not a developer. Explain what you are about to change in plain words, change one thing at a time, show them the result, and ask before anything on the "ask first" list below.

## The rule that matters most: updates replace the code

Once a week (and whenever the owner presses Site updates → Update now in the editor), the site's Worker copies the latest version of the template into this repository as one commit. That replaces every file **except**:

- `content/`: the words, settings and the owner's own styles
- `public/media/`: photos and files
- `.github/`

(`wrangler.jsonc`, `package.json` and `package-lock.json` are merged, so the site keeps its own name and storage.)

So a change anywhere else, such as `src/`, `public/` or `scripts/`, is undone at the next update.

## Where each kind of change goes

| The owner wants | Change | Survives updates |
|---|---|---|
| Colours, fonts, sizes, spacing, hiding something | `content/custom.css` | Yes |
| Words, links, photos | `content/*.json`, `content/writing/*.md`, or the editor at `/admin` | Yes |
| Hiding a page | its `"show": false` (`content/about.json`, `writing.json`, `research.json`, `reading.json`, `now.json`), or the page's switch in the editor | Yes |
| A new page (Projects, Talks…) | a Markdown file in `content/pages/` (`title`, optional `show`, `photo`, `description`, then the text), or Your pages in the editor | Yes |
| A setting the template already has (accent colour, …) | `content/site.json`, or the editor | Yes |
| A different layout or new behaviour | `src/` | **No**, see below |

If what they ask for needs `src/`, tell them, before you change anything, that the weekly update will undo it. Their choice is to keep updates (and lose the change), or turn updates off and keep the change: `"advanced": { "autoUpdate": false }` in `content/site.json`, or Site settings → Advanced → "Get improvements automatically" in the editor. Updates off means no more fixes from the template. Never turn them off without asking.

## content/custom.css

Every page loads it after the template's own styles (it is the first thing in `<body>`), so a rule here wins over the template's rule with the same selector. Prefer changing the variables below over rewriting the template's rules: it is shorter, and it keeps working when the template changes. Keep the file small and add a short comment above each change, so the owner can read it. Emptying the file brings back the template's look.

Example:

```css
/* A blue-grey desk */
:root { --desk: #2b3a4a; --desk-2: #1b2632; }
```

## Lab Diary: what you can change

Files: `src/pages/index.astro` (the whole book), `src/diary/notebook.css` (the book, pages and tabs), `src/diary/` (the rest).

### Colours

| Variable | What it colours |
|---|---|
| `--desk`, `--desk-2` | the desk behind the book |
| `--paper` | the pages |
| `--board` | the cover board's edge |
| `--type`, `--type-2` | text, and secondary text |
| `--rule`, `--rule-2` | lines, and the faint ruled lines |

Links and focus rings use a brown (`#7a4e22`) written directly in `notebook.css`; override `a:hover` and `:focus-visible` to change it.

### Type

`--font-display` (the name and headings; a serif), `--font-text` (what you read), `--font-ui` (tabs, buttons). Sizes are `--fs-*` steps. `--tabs-w` is the width of the index tabs.

### Parts of the page

`.scene` the desk · `.book`, `.page`, `.face` the pages · `.tabs`, `.tab` the index tabs · `.binding` the wire · `.entry-cover` a piece's first page · `.footnotes`

## Ask first, or leave alone

- `wrangler.jsonc`: the Worker's name, storage ids and routes. Changing them breaks the site or loses the owner's data.
- `src/worker/`: sign-in for the editor, the reading and posts sync, the weekly update.
- `public/admin/` (the editor) and `scripts/prepare.mjs` (writes the editor's settings at build time).
- Never commit passwords, tokens or keys.
- The book is 3D. Never put a 2D `transform` (rotate, scale, translate) on anything clickable inside it: browsers then miss clicks on the tabs.


## Check your work

```sh
npm ci
npm run build   # runs scripts/prepare.mjs first; must succeed, or Cloudflare won't publish
npm test
npm run dev     # look at it; it prints the address
```

The shape of every content file is in `src/content.config.ts`. A build that fails on Cloudflare leaves the live site as it was, but tell the owner.

## Publishing

Pushing to `main` publishes. For anything bigger than a small style change, work on a branch, show the owner screenshots from `npm run dev`, and merge when they are happy. If Cloudflare is set to build other branches, it also gives each branch its own preview address.
