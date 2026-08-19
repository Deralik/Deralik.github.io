# Content contract — what every view must answer, for whom

The site-wide goal (BRIEF): a hiring-adjacent reader leaves believing
*"this person does real GPU/rendering work, measures honestly, and
explains it well"* — within 30 seconds for the skimmer, with 20 minutes
of reward for the reader who stays.

**Element rule:** every figure, demo, and text block in a view is
assigned to one of that view's questions below. An element serving no
question is removed — or the contract gains a question by explicit owner
ruling, never silently. Reviews (REVIEW.md) audit against this file.

## D0 — dashboard

Reader: anyone; 10–30 seconds; may never click. Most readers stop here —
whatever D0 says on the surface must be true on its own.

Questions D0 answers:
1. Who is this and what kind of engineer? (identity line; About column)
2. What's the strongest credential, and is it checkable? (cINR card:
   peer-reviewed, EGPGV 2025 honorable mention — largest weight, first)
3. Researcher or web dev? (the band boundary: checkable research above,
   asserted products below — research visibly leads)
4. Is the work real and current? (figures computing live on the cards;
   under-construction slots honest about what's pending)
5. How do I reach them / is he available? (About: contact rows, status)

Card roles: **cINR** = the peer-reviewed anchor. **GRTCache** = research
continues, and the honesty culture itself (tier states the revision
plainly). **About** = a real person: portrait, availability, contact,
history at a glance. **MelioraOS / Okibi / SPLAT** (until designed) =
titled under-construction slots: breadth exists, nothing is faked.

## D1 — opened panel

Reader: a skimmer who clicked; 30–90 seconds. No question below may
require reading a paragraph to answer.

1. What is this, in one claim?
2. What's the headline evidence? (trends, never dataset numbers)
3. What makes it distinctive?
4. Is there more, and how do I get to it? (the rail + depth affordance)

## D2 — document

Reader: an evaluating engineer or researcher; 5–20 minutes; the one the
site exists to reward.

1. How does the method / product actually work? (pipeline + method
   figures, the hero demo)
2. What's the evidence, and where does each number come from? (record
   tables with provenance labels)
3. What are the honest limits? (Not-claimed blocks, the rejection stated
   plainly, open issues, in-progress work)
4. Where are the artifacts? (DOI, arXiv, code, résumé — reference block,
   same place every section)
5. Implicit, answered by the architecture rather than by assertion: can I
   trust this person's judgment?

## Per-section notes

- **About**: D0 answers 1/4/5 (who, real, reachable); D2 adds the record
  timeline (thickness = engagement), publications block, transcript
  facts, résumé. Every mark plots from `about-record.json`; nothing
  unsourced renders.
- **cINR**: demo answers "what does the cache do" by showing it (fill
  coarse→fine); pipeline figure answers "how"; record table + FPS charts
  + quality figure answer "evidence"; Not-claimed block answers "limits"
  (no cluster claims, renderer authorship disclaimed).
- **GRTCache**: hero answers "what does the cache buy" (honest with/
  without on real data); method figures answer "how" (pipeline + NRC-
  style training trace-back, attributed); comparison answers "how it
  differs from NRC/GSCache"; record answers "evidence" (manuscript-
  labelled); in-progress answers "what's active"; the plainly-stated
  rejection answers question 5 louder than any claim could.
- **MelioraOS / Okibi / SPLAT**: full contracts written with their design
  rounds. Until then their only D0 job is: exist honestly (title +
  under-construction state), claim nothing.
