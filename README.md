# Red Magic Wiki

Community knowledge base for Red Magic / Nubia (ZTE) device modding — bootloader unlock, root, EDL recovery, kernel work, reverse engineering.

**Primary target:** Red Magic 10 Pro (NX789J). Cross-references to RM11 Pro, RM10 Pro+, Nubia Z70U/Z80U, Pad 3 Pro.

## What's here

| Path | What it is |
|------|-----------|
| `docs/` | The wiki itself (VitePress, markdown source) |
| `docs/index.md` | Landing page with disclaimer + credits |
| `docs/rm10pro/` | RM10 Pro topical pages |
| `docs/rm11pro/` | RM11 Pro cross-reference notes |
| `docs/contributing.md` | How to contribute |
| `data/` | Raw XDA-thread extracts (markdown + JSONL). Cite-source for every claim in the wiki. |
| `.vitepress/` | Site config, sidebar, theme |

## Quick start (read it)

The deployed site lives at **https://mkonic.github.io/redmagic-wiki/** (once Pages is enabled).

## Quick start (run locally)

```bash
git clone https://github.com/mKonic/redmagic-wiki.git
cd redmagic-wiki
pnpm install
pnpm docs:dev   # http://localhost:5173
```

`pnpm docs:build` produces the static site in `docs/.vitepress/dist/`.

## Contributing

See [docs/contributing.md](docs/contributing.md). PRs welcome for everything from typo fixes to whole new device sections.

## License

- Content: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Code (build configs, scripts): MIT

## Provenance

Bootstrapped May 2026 by scraping two XDA forum threads with a Claude Code agent — 137 pages, 2,731 posts — then synthesizing high-signal content into topical pages. Every fact is cited back to the original post. Full credits in [docs/index.md](docs/index.md). Not affiliated with ZTE / Nubia / RedMagic.
