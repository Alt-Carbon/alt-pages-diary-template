# alt-pages-diary-template

The Lab Diary template of The Portfolio Project: your site as a notebook, with a tab per section and pages that turn. Same content, same editor at `/admin`, same Goodreads shelf as the [Sidebar template](https://github.com/Alt-Carbon/alt-pages-minimal-template); only the reading differs. MIT-licensed, so it stays yours after you leave.

## Get a site

Pick the Lab Diary on the Alt Pages dashboard and press Create my site. Cloudflare copies this repository into your GitHub account and deploys it to your Cloudflare account. Then open `/admin` on your new site and sign in with GitHub.

## Edit

Everything is a file under `content/`, the same files as the Sidebar template: `site.json`, `now.json`, `about.json`, `talks.json`, `questions.json`, `reading.json`, and one Markdown file per piece in `content/writing/`. The newest piece of writing is the notebook's featured essay; footnotes written as `[^1]` become its notes.

## How it is built

- `src/pages/index.astro` reads the content files at build time and hands them to the notebook as one data object.
- `src/diary/notebook.js` and `notebook.css` draw the notebook in the browser: tabs, left and right pages, the page turn. Before drawing, it fetches `/reading/view.json` from the site's own reading sync, so books change without a rebuild.
- `src/worker/` is the reading sync, `scripts/prepare.mjs` writes the editor config, `wrangler.jsonc` is what the Deploy button provisions. All unchanged from the Sidebar template.

```
npm install
npm run dev        # http://localhost:4321
npm run build
npm run preview    # the built site the way Cloudflare serves it
npm test
```

## Not yet

The Lab Diary is the basics: one featured essay rather than a page per piece, and no separate addresses per section (sections are tabs at `/#now`, `/#about` and so on). The scientist sections of the prototype, Research, Publications and Teaching, are drawn by the notebook but not yet in the editor.

## Updates

When this template changes, the Alt Pages dashboard opens a pull request on your repository with the changed files. Your content and settings are never part of it.
