# Contributing

This wiki is free, community-maintained, and PR-driven. Anyone can contribute — corrections, new content, translations, fresh evidence from the forum threads, anything that helps a future reader avoid bricking their phone.

## Ways to help

### Small (no setup required)

- **Fix a typo or wrong fact:** click the "Edit this page on GitHub" link at the bottom of any wiki page. GitHub opens an in-browser editor; commit the fix on a new branch and open a PR.
- **Report something broken or missing:** open an [issue](https://github.com/mKonic/redmagic-wiki/issues).
- **Verify a procedure:** if you followed a guide here and something was wrong, outdated, or worked differently than documented — let us know in an issue or open a PR with corrections.

### Medium (clone the repo)

- **Add a new page** for a topic that isn't covered (e.g. RM10 Air, Z70U, Pad 3 Pro specifics).
- **Expand a stub** — many pages cite posts but could use more elaboration or a real example.
- **Add a screenshot** when text alone isn't enough — drop the image in `docs/public/img/` and reference as `/img/your-image.png`.

### Larger

- **Translate** pages into another language. VitePress supports i18n natively. Open an issue first so we can plan structure.
- **Add a new device section** if you have substantive knowledge for one. Use the `rm10pro/` directory as a template structure.

## Local development

Requirements: Node.js 18+ and a package manager (pnpm recommended).

```bash
git clone https://github.com/mKonic/redmagic-wiki.git
cd redmagic-wiki
pnpm install
pnpm docs:dev   # opens http://localhost:5173
```

Or with npm:
```bash
npm install
npm run docs:dev
```

The dev server hot-reloads on file changes. Build the static site with `pnpm docs:build` (output in `docs/.vitepress/dist/`).

## Style guide

### Citations

Every factual claim should cite a source where possible. Conventions:

- **Forum post citation:** `[#N pP author]` — e.g. `[#423 p22 BD_Security]` means post #423 on page 22 by user BD_Security. The post is in [`data/rm10pro.md`](https://github.com/mKonic/redmagic-wiki/tree/main/data) (search for `### #423`).
- **External link:** ordinary markdown link with the source URL.
- **No citation:** OK only for utterly uncontroversial general knowledge (e.g. "Android uses A/B partitions").

If you're adding a fact from a forum source not yet in the repo:
1. Note the post URL in your PR.
2. We can add the thread to `data/` if it's substantially relevant.

### Tone

- Direct. Procedure first, explanation second.
- "Don't do X because Y" is better than "X is widely considered risky for various reasons".
- Code blocks for *anything* a reader will paste — including XML, hex offsets, command lines.

### Admonitions

VitePress supports these — use them where the visual emphasis matters:

```md
:::tip Tip
Good thing to know.
:::

:::warning Caution
Trip wire / common mistake.
:::

:::danger Stop
Will brick your device / cause data loss / void your unlock window forever.
:::

:::info Note
Side info.
:::

:::details Click to expand
Long thing that doesn't need to be inline.
:::
```

### Internal links

Use absolute paths from `docs/`: `[link text](/rm10pro/edl-9008)`. Anchors work: `(/rm10pro/known-issues#the-fusing-threat-read-first)`. VitePress strips `.md` from URLs — don't include it in links.

### Adding a new page

1. Drop your `your-page.md` in the appropriate device dir (e.g. `docs/rm10pro/your-page.md`).
2. Add it to the sidebar in `docs/.vitepress/config.ts` so navigation finds it.
3. Cross-link from related pages.

## Code of conduct

- Be helpful. People come here to learn; meet them where they are.
- No paid-service shilling. The whole point of this wiki is documenting *free* community work. Posts/PRs hawking paid unlock services or fake fixes will be rejected.
- Credit your sources. If you copied a procedure from someone else's post, cite them.
- No personal info. Don't paste people's full IMEIs, account names, or anything that could dox them.

## Crediting yourself

This is community work. If you contributed substantively (a whole new procedure, a major correction, a new device added), add your name to [Contributors](/rm10pro/contributors) in the same PR. Anonymous PRs are welcome too — say so in the PR description.

## Maintainer

This wiki was bootstrapped by **[@mKonic](https://github.com/mKonic)** in May 2026, who also maintains [Redmagic-Control-Center](https://github.com/mKonic/Redmagic-Control-Center). For substantial structural changes (new device sections, framework upgrades), open a discussion before a PR so we can plan.

## License

- **Content:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Credit the wiki and original posters. Share-alike.
- **Code (build configs, scripts):** MIT.

By submitting a PR you agree your contribution is released under these licenses.
