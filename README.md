# Model Match

A working, browser-only model-selection prototype for the Fireworks AI brief. It helps a developer choosing their first model explore support-ticket routing, inspect errors, change requirements, and leave with an explained provisional choice.

## Run locally

No installation, API key, or build step is needed. Open **index.html** in a modern browser.

For a local HTTP preview, run this command from the `model-match` folder:

```sh
python3 -m http.server 8787 --bind 127.0.0.1 --directory .
```

Then visit http://127.0.0.1:8787. Stop the server with Ctrl+C.

The app works without a network connection; optional Google Fonts fall back to system fonts. Clipboard access varies by browser and local-file permissions, so the code action falls back to a file download.

## Try this 90-second walkthrough

1. Keep **Everyday inbox** and the default requirements. Click **Compare sample results**. DeepSeek qualifies at a lower simulated cost than Kimi.
2. Lower **Minimum correct routes** from 7 to 6. GLM becomes the cost-based choice.
3. Select **Speed**. DeepSeek becomes the choice because it is faster in the authored fixtures.
4. Raise **Minimum correct routes** to 8 and select **Accuracy**. Kimi is the only qualifying candidate.
5. Choose **Try harder tickets**. No candidate passes all eight. Inspect the missed cases and review next steps.
6. Return to the everyday inbox and open **Explain my recommendation**. Export the decision, get starter code, or download the labeled test cases.

You can inspect every ticket, change its expected route, review the common routing policy, and reset the demo. Preferences and label changes are stored only in this browser's local storage. On smaller screens, the bottom navigation takes you through all three steps.

## Simulation boundary

All responses, timings, and costs are **invented fixtures**, not measurements or Fireworks price quotes. Named models provide realistic context only. There is no API integration, no analytics, no backend, and no account or key collection. The exported Python code is an optional starting point for a future live test; the prototype never executes it.

Cost per 1,000 tickets is fixed at $0.12 / $0.48 / $1.60 for the three demo profiles. Monthly cost scales this rate by the chosen ticket count. Actual production costs require real token usage and current provider pricing.

## Decision rule

A model must meet the minimum correct routes, maximum median response time, and monthly cost ceiling. Only then is it ranked by the chosen priority. Cost ties use accuracy then latency; accuracy ties use cost then latency; speed ties use cost then accuracy. No qualifying models means no recommendation. Scores use the selected eight examples and the user's reviewed labels.

## Files

- `index.html`, `styles.css`, `app.js`: interface and interactions.
- `data.js`: fixtures and a pure decision engine.
- `product-brief.pdf`: one-page problem, decisions, tradeoffs, validation, and success measures.
- `tests.cjs`: core decision checks, including a constraint invariant across 1,800 combinations.

Optional developer check (Node.js required):

```sh
node tests.cjs
```

Official product context consulted October 5, 2026:

- https://docs.fireworks.ai/guides/recommended-models
- https://docs.fireworks.ai/getting-started/quickstart
- https://demos.fireworks.ai/

The two inboxes and their labels are authored prototype examples. Human review handles mixed intent or insufficient context; this demo does not define a production security or escalation policy.

## Public hosting

This repository publishes its root on the main branch through GitHub Pages. The application runs independently of ChatGPT.
