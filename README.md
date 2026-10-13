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

## Posts from Medium and Substack

Set a Medium handle or address and a Substack address under Site settings, and the Worker reads their public RSS feeds (`medium.com/feed/@handle`, `<name>.substack.com/feed`) every 12 hours, keeps the newest posts in KV, and serves them at `/writing/elsewhere.json` (`src/worker/core/posts.js` parses, `posts-store.js` runs a sync, `posts-object.js` is the Durable Object with the alarm; all shared with the Sidebar template). The newest posts join the writing list in the browser, each with a small chip saying where it lives and a link to the post there. A feed that fails keeps its last good posts. Medium shares its 10 newest stories and Substack its 20 newest posts, so older pieces still need an entry under Writing with "Published elsewhere" set; those get the same chip. Posts to leave out are listed under Writing page → Posts to leave out. With nothing set, the sample posts in `public/writing/elsewhere.json` are served, regenerated with `npm run sample:posts`. `GET /writing/elsewhere/status` reports the last run; `POST /writing/elsewhere/sync` asks for one now.
