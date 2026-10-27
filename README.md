# INFS7903 Study Studio

A static, bilingual database learning website with 13 chapters and 11 interactive A2 laboratories.

**Website:** https://49079986.github.io/infs7903-study/

## Learn

- Start at [the study map](docs/index.html) or [A2 from zero](docs/specials/a2/preparation.html).
- Explore joins, filtering, ranking, recursion, materialized views, indexes, anti-joins, selectivity, statement snapshots and deadlocks.
- Read 265 annotated lines across 20 anonymous SQL files. Practise explaining all 24 task summaries in the tutor room.
- Progress and drafts stay in your browser. There is no account system or cross-device synchronization.

## Publish with GitHub Pages

In this repository, open **Settings → Pages → Deploy from a branch → main → /docs → Save**. The `.nojekyll` file keeps the site as plain HTML/CSS/JavaScript. No dependency installation, build step or server database is needed.

## Update

Edit the files in `docs/` and commit to `main`. Pages republishes the site automatically. A validation workflow checks local paths and file sizes. Run the same check locally with `python scripts/validate_site.py`.

## Publication scope

This is a personal learning project with AI-assisted material, not an official course answer key. Public files contain study notes, task summaries, anonymous SQL examples and measured-output excerpts. Course PDFs, original page scans, the full database dataset, named submission reports, private source archives and local QA records are excluded. Obtain official materials from authorized course channels.

Teaching simulations use explicitly labelled small datasets and browser models. They do not execute PostgreSQL in the browser. Preserved measured numbers come from prior local PostgreSQL 18.6 experiments.

No license has been selected for this repository. Course materials and third-party documentation remain subject to their owners' terms.
