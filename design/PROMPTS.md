# Session prompts

Copy-paste starters. Each assumes zero prior context — the repo carries
everything.

## A — Portfolio work session (Claude Code, from this repo's root)

> Read CLAUDE.md, design/BRIEF.md, design/ROADMAP.md, and
> design/assets/shots.md. We're in phase P<N>. Pick up the first unchecked
> item and drive it. Rules that matter most: this repo is public and
> nothing private enters it; project sibling repos are read-only sources;
> Meliora captures use Dev-workspace seed data only and Okibi captures use
> the demo tab; every claim on the site must come from BRIEF.md's fact
> packs. For browser captures, I'm logged in — drive Chrome and I'll
> supervise. Log any design decisions we make in design/iterations/ and
> keep ROADMAP checkboxes current.

## B — Claude Design, Round 1: direction exploration
(attach: BRIEF.md · the five assets/*/CONTEXT.md sheets · meliora
01-dashboard, 06-project-schedule-tab, 06-project-schedule-tab-drawer,
19-finance-page · okibi 01-weekly, 03-welcome, 05-welcome-scene — more
captures exist in assets/ if a later round wants them)

> I'm designing my portfolio site — the attached brief is authoritative;
> the images are real artifacts from my projects, described below. I'm a
> GPU & rendering engineer with published research (EGPGV 2025, honorable
> mention) and shipped products; the audience is national-lab researchers
> and defense/GPU-company engineers — people who judge how I think.
>
> **Governing principle: on this site, nothing moves and nothing decorates
> unless it demonstrates something true about the work.** Every animation
> is evidence. Anything that could appear on a SaaS landing page is wrong.
>
> Mock up ALL FOUR directions below (home page + the cINR research page
> for each), then propose AT LEAST ONE direction of your own that none of
> mine cover — hybrids and stranger ideas welcome, same principle applies.
> Mockups are static, so annotate intended motion in captions.
>
> **Direction A — "Convergence."** Everything I build converges: renderers
> resolve noise → image, training converges, products went first-commit →
> production in 47 days, releases 1 → 11, a curriculum climbs stages. The
> site owns ONE signature control — a scrubber styled like a sample-count
> axis — reused on every project hero with a different real meaning
> (render samples, LOD level, build days, releases, curriculum stages).
> Page transitions re-converge around a persistent shared element. Raw
> material arrives from the site's own demo datasets and product
> timelines later — this round, design the grammar, not the pixels.
>
> **Direction B — "Instrument."** The site speaks the visual language of
> measurement: figures as numbered plates with measured captions,
> monospace numerals for every quantity, calibrated axis ticks as the only
> ornament, full-bleed renders as dark plates between light reading
> sections. Signature motif: any number on the site can draw a thin
> provenance line to its source (paper section, benchmark CSV, changelog).
> My real benchmark figures headline their own caveats ("no aggregate
> winner") and sign themselves with a SHA-256 — that is the native tone:
> honest to a fault. Keep it instrument, never newspaper nostalgia.
>
> **Direction C — "Five rooms."** Home is one continuous walk through five
> full-bleed atmospheres in fixed order — cINR's volume-render void, GRT's
> field of gaussian splats, Meliora's construction-document surface,
> Okibi's calendar light, SPLAT's graph paper — each derived from that
> project's REAL material, never invented texture. Crossing a threshold
> shifts the whole palette; a project page is its room expanded; at page
> end the next room bleeds in.
>
> **Direction D — "Abstract live index."** The home page has NO
> screenshots or renders above the fold. Each project's marker is a small
> kinetic sketch, all sharing one minimal aesthetic (monochrome + one
> accent), each animating the project's core idea: cells streaming in and
> sharpening around the cursor (cache paging); thousands of noisy splats
> consolidating under a running update counter (matched quality, fewer
> updates); a web of dependent bars reflowing when one moves; two
> timelines exchanging events where a "data destroyed" lamp never lights;
> a pose graph relaxing. Captioned honestly as illustrations. The real
> renders and product UI live inside the pages. Mock the sketches as
> stills with motion notes.
>
> For every direction: name the type pairing (display / body / a
> numerals-and-captions face), give the palette as named hex values with a
> light/dark decision, and name the one signature moment. Layout must
> anticipate: a publications block (the EGPGV 2025 paper), future sections
> (talks, new projects) added without redesign, and — on BOTH research
> pages (cINR, GRTCache) — a hero that is a DEMO SLOT: it ships as a
> captured poster/clip of the demo's own dataset first and is later
> replaced in place by the interactive in-browser demo, so design the
> frame, caption, and controls chrome around that slot now.
>
> Non-negotiables from the brief: research-first project order; no
> marketing tone, no stock imagery, no invented numbers — every figure
> and claim comes from the brief's fact packs; static-site friendly;
> legible on a phone; honest labels on every demo, comparison, and
> illustration.
>
> **Attached context (deliberately no research renders):**
> - BRIEF.md — authoritative; the only source of claims and numbers.
> - Five CONTEXT.md sheets (cINR, GRTCache, Meliora, Okibi, SPLAT) —
>   what each project is, what it looks like, and how it behaves. The
>   research pages will present as interactive demos on small public
>   datasets, so design their slots (frame, caption, controls chrome,
>   poster state) from the sheets — do not fake dataset imagery, invent
>   UI the sheets don't describe, or lean on generic "tech" visuals.
>   Honest labeled placeholder blocks are correct wherever material is
>   pending.
> - Meliora/Okibi UI screenshots (from assets/meliora/ + assets/okibi/):
>   real product surfaces on fixture/demo data — Meliora light "Classic"
>   theme, Okibi's warm dark ember language. Note the two products have
>   deliberately different design languages; the portfolio must hold its
>   own identity beside both. Okibi's welcome page is PUBLIC and worth
>   browsing live at okibi.app — scroll it: the "task mortality" day
>   simulation there is the bar for demonstration-not-decoration motion.
> - Optionally attached by me from private repos (never committed to the
>   public portfolio repo): selected product design docs — e.g. Meliora's
>   UI primer and one or two area specs — when a round needs the
>   products' own design language at full depth.
>
> I'll pick a direction (or a hybrid) and we'll iterate from there.

## C — Claude Design, later rounds

> Continuing from last round (decisions so far are pasted below / in the
> attached SYSTEM.md). This round: <the specific pages or components to
> refine>. Keep everything consistent with the agreed tokens; if you want
> to break one, say so explicitly and why.

## D — After any Claude Design round (back in Claude Code)

> Round <N> of Claude Design is done. Here's what was shown and decided:
> <paste / attach exports>. Write design/iterations/<nn>-<date>.md
> (shown / decided / rejected / open questions), fold the agreed tokens
> into design/SYSTEM.md, and flag anything that conflicts with CLAUDE.md
> or BRIEF.md before it calcifies.
