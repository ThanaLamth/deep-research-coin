# Long-Form Coin Article Playbook

Use this playbook when turning a researched token case into a long-form publishable article for WordPress, Google Docs, or GitHub.

This was saved from the final `RAVE` article workflow and should be reused for future coins.

## Reference Example

- Main example article:
  - `/home/qwen/deep-research-coin/research-output/ravedao-will-rave-hit-another-pump-2026-04-21.md`

## Goal

Produce one clean long-form article that:

- reads like a crypto-native analyst report
- keeps storytelling strong without becoming theatrical
- uses clear `H1 -> H2 -> H3` structure
- keeps tables where tables improve readability
- uses only user-facing links
- contains no internal repo links, no GitHub links, and no `.md` links
- can be copied into WordPress with minimal cleanup

## Output Pattern

Save the final article in:

- `research-output/{slug}-{core-topic}-{yyyy-mm-dd}.md`

Examples:

- `research-output/ravedao-will-rave-hit-another-pump-2026-04-21.md`
- `research-output/{coin}-price-prediction-{date}.md`
- `research-output/{coin}-onchain-market-structure-{date}.md`

## Article Structure

Use this default hierarchy:

- `#` = title only
- `##` = main sections
- `###` = subsections only

Recommended section flow:

1. `H1` title
2. asset/date/contract block
3. `H2` overview
4. `H2` short answer
5. `H2` timeline / setup at a glance
6. `H2` on-chain flow / entity map / market structure sections
7. `H2` bullish case
8. `H2` bearish case
9. `H2` scenario map / price prediction
10. `H2` final verdict
11. `H2` source map
12. `H2` references

## Writing Rules

- Keep the tone expert, crypto-native, and market-structure aware.
- Prefer full paragraphs over clipped sentence fragments.
- Use tables for:
  - timelines
  - venue comparisons
  - scenario maps
  - wallet/entity summaries
  - bullish vs bearish factors
- Keep images, but isolate them as separate blocks.
- Leave whitespace around image blocks so WordPress paste is easier.
- Do not overuse bullets in the body when a table or paragraph reads better.

## Source Rules

Always prefer user-facing URLs:

- `CoinGecko coin page` instead of `CoinGecko API`
- `DexScreener token/pair page` instead of `DexScreener API`
- `exchange announcement page` or `trading page` instead of exchange API endpoints
- `Etherscan / BaseScan / BscScan token or tx page` instead of raw RPC endpoint references

Do not leave:

- internal repo links
- GitHub blob links
- `raw.githubusercontent` links in article body or refs
- `.md` links
- API endpoint URLs in source map or references unless absolutely unavoidable

## Source Map Rules

The `Source Map` section should contain only public links a reader can open directly.

Keep categories like:

- market data
- listing timeline
- deployment / contract verification
- exchange-facing labels
- perp venue pages
- liquidity pages

Do not include:

- repo-internal research notes
- unpublished local files
- implementation-only sources

## References Rules

The `References` section should:

- use readable public URLs
- stay shorter than the raw research notebook
- avoid duplicate API-style entries when one public page can represent the same source class

Preferred reference replacements:

- announcement page + trade page
- coin page + token page
- token page + transaction page

## Images and Tables

Images:

- keep each image on its own line
- keep one blank line before and after the image block
- keep a short italic capture note below it

Tables:

- preserve tables in markdown whenever possible
- use tables instead of long bullet runs for comparison-heavy sections
- avoid converting tables into bullet lists during final cleanup

## Google Docs Export Rules

When syncing to Google Docs:

- keep the heading structure as `H1/H2/H3`
- preserve tables as real tables
- preserve inline images if possible
- remove GitHub, raw GitHub, and `.md` links from the final doc
- use only user-facing public links

## Final QC Checklist

Before considering the article done, verify:

- exactly one `H1`
- all main sections are `H2`
- all sub-sections are `H3`
- no `.md` links remain
- no `github.com` or `raw.githubusercontent` links remain
- no API endpoint links remain where a public page exists
- images are spaced cleanly
- source map is public-facing
- references are public-facing
- tables still render clearly

## Reuse Path For New Coins

For a new coin:

1. start from this playbook
2. gather market, on-chain, entity, listing, perp, and liquidity inputs
3. draft the long-form markdown in `research-output/`
4. convert headings to final `H1/H2/H3`
5. replace API/internal links with public-facing links
6. clean source map and references
7. sync to Google Docs only after the markdown is clean

## Important Constraint

Do not store service account credentials, tokens, or temporary upload scripts in the repo when reusing this workflow.
