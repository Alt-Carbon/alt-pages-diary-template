# alt-pages-diary-template

The Lab Diary template of The Portfolio Project: your site as a notebook, with a tab per section and pages that turn. Same content, same editor at `/admin`, same Goodreads shelf as the [Sidebar template](https://github.com/Alt-Carbon/alt-pages-minimal-template); only the reading differs. MIT-licensed, so it stays yours after you leave.

## Get a site

Pick the Lab Diary on the Alt Pages dashboard and press Create my site. Cloudflare copies this repository into your GitHub account and deploys it to your Cloudflare account. Then open `/admin` on your new site and sign in with GitHub.

## Edit

Everything is a file under `content/`, the same files as the Sidebar template: `site.json`, `now.json`, `about.json`, `research.json`, `reading.json`, `writing.json`, and one Markdown file per piece in `content/writing/`. A section with nothing in it stays out of the notebook. Every piece of writing gets its own pages after the Writing index; footnotes written as `[^1]` become its notes.

## How it is built

- `src/pages/index.astro` reads the content files at build time and hands them to the notebook as one data object.
- `src/diary/notebook.js` and `notebook.css` draw the notebook in the browser: tabs, pages, the page turn. Each section is a run of blocks that the script measures in a hidden page and lays over as many pages as it needs, so the contents page numbers are real. Before drawing, it fetches `/reading/view.json` from the site's own reading sync, so books change without a rebuild.
- `src/lib/`, `src/worker/`, `scripts/prepare.mjs` and the routes for the favicon, touch icon, link-preview cards (`/og/*.png`), RSS, sitemap and robots are the Sidebar template's, unchanged apart from addresses: a piece is at `/#essay-<its-file-name>`.

```
npm install
npm run dev        # http://localhost:4321
npm run build
npm run preview    # the built site the way Cloudflare serves it
npm test
node scripts/check-turn.mjs   # frames of a page turn and the phone layout, from headless Chrome
```

## Not yet

No separate addresses per section or piece: sections are tabs at `/#now`, `/#about` and so on, and a piece is at `/#essay-<its-file-name>`. The bookshelf styles of the Sidebar template do not apply; books are a list here.

## Updates

When this template changes, the Alt Pages dashboard opens a pull request on your repository with the changed files. Your content and settings are never part of it.
