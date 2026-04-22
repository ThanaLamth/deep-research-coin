# MemeCore Deep On-Chain Structure Note

**Asset:** MemeCore (`M`)  
**Date:** April 22, 2026  
**Primary chain:** MemeCore mainnet  
**Explorer used:** [MemecoreScan](https://memecorescan.io/)

## Core Takeaway

The deeper on-chain read makes the MemeCore case more specific than a generic "high concentration" story.

The chain data suggests three things at once:

1. the top holder structure is highly concentrated
2. multiple top wallets are not simple EOAs, but **timelock or proxy-style contracts**
3. several of the largest on-chain balances line up unusually closely with the **official token allocation percentages** published in MemeCore's own docs

That combination matters because it suggests MemeCore is trading on top of a supply structure that is not only concentrated, but also **programmed and staged** through contract-controlled allocation rails.

This does **not** by itself prove manipulation or unlawful conduct.

It does support a narrower conclusion:

> MemeCore's price is being discovered inside a highly managed supply structure where contract-controlled allocation buckets and scheduled distribution paths can materially affect the tradeable float.

## Market and Supply Context

According to the user-facing [MemeCore `$M` docs](https://docs.memecore.com/memecore/token/usdm):

| Field | Value |
|---|---:|
| Initial supply at TGE | **5,000,000,000 M** |
| Max supply | **10,000,000,000 M** |
| Chain | **MemeCore mainnet** |

According to the user-facing [Token Allocation docs](https://docs.memecore.com/memecore/token/token-allocation), the intended initial split was:

| Category | Ratio | Implied tokens on 5B initial supply |
|---|---:|---:|
| Community | **58%** | **2,900,000,000 M** |
| Foundation | **15%** | **750,000,000 M** |
| Core Contributor | **13%** | **650,000,000 M** |
| Investor | **12%** | **600,000,000 M** |
| Meme Treasury | **2%** | **100,000,000 M** |

That table becomes much more interesting once it is compared with the actual top-holder list.

## Top Holder Concentration

From the live [MemecoreScan top accounts page](https://memecorescan.io/accounts) checked on **April 22, 2026**:

| Rank | Address | Balance | Share | Type clue |
|---|---|---:|---:|---|
| 1 | [`0x22eAc7cE...fBF859e98`](https://memecorescan.io/address/0x22eac7ce8e04052523369b93d50cdccfbf859e98) | **1,649,999,999.71542643 M** | **30.78230941%** | Contract |
| 2 | [`0xF31f1Ad0...9b2193790`](https://memecorescan.io/address/0xf31f1ad07f469c1cabdda041a501fcc9b2193790) | **699,999,999.94794969 M** | **13.05916157%** | Contract |
| 3 | [`0xEeEA0Cc8...7250Ab159`](https://memecorescan.io/address/0xeeea0cc8cf98b0e3a8b30b48a89e56a7250ab159) | **649,999,999.94794969 M** | **12.12636431%** | Contract |
| 4 | [`0x07e14dfd...05e827DB4`](https://memecorescan.io/address/0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4) | **599,999,999.94794969 M** | **11.19356706%** | Contract |
| 5 | [`0x74696D9e...187012EEe`](https://memecorescan.io/address/0x74696d9ed2885a1335a914f1ea53445187012eee) | **317,316,773 M** | **5.91984430%** | Contract |
| 6 | [`0x747EFd38...dCFD31E5e`](https://memecorescan.io/address/0x747efd38c12621d10bc821f29c3d985dcfd31e5e) | **244,550,000 M** | **4.56231137%** | Passive EOA |
| 7 | [`0xC0222729...21613aE99`](https://memecorescan.io/address/0xc02227299520cb75e2938695da843e721613ae99) | **229,684,135.963145 M** | **4.28497463%** | Proxy contract |
| 8 | [`0x5327dB59...23CB6103a`](https://memecorescan.io/address/0x5327db59913772934128c6201d3311823cb6103a) | **99,999,999.94794969 M** | **1.86559451%** | Contract |

The headline concentration is obvious. But the more important detail is that many of these are not just wallets. They are infrastructure.

Using the shares shown on the same explorer snapshot, the **top four** listed accounts control about **67.16%** of visible supply, while the **top eight** control about **83.79%**.

That does not mean all of that supply is freely tradeable. In practice, it means a very large share of the token base sits inside a small number of addresses before the analyst even starts asking what those addresses actually are.

## The Allocation Cross-Check Is Too Close To Ignore

Four of the top on-chain balances line up very closely with the official allocation document:

| Docs category | Docs target | On-chain address | Observed amount | Match quality |
|---|---:|---|---:|---|
| Foundation | **750,000,000 M** | [`0xF31f1Ad0...9b2193790`](https://memecorescan.io/address/0xf31f1ad07f469c1cabdda041a501fcc9b2193790) | **699,999,999.94794969 M** | Very close after later outflow |
| Core Contributor | **650,000,000 M** | [`0xEeEA0Cc8...7250Ab159`](https://memecorescan.io/address/0xeeea0cc8cf98b0e3a8b30b48a89e56a7250ab159) | **649,999,999.94794969 M** | Exact-scale match |
| Investor | **600,000,000 M** | [`0x07e14dfd...05e827DB4`](https://memecorescan.io/address/0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4) | **599,999,999.94794969 M** | Exact-scale match |
| Meme Treasury | **100,000,000 M** | [`0x5327dB59...23CB6103a`](https://memecorescan.io/address/0x5327db59913772934128c6201d3311823cb6103a) | **99,999,999.94794969 M** | Exact-scale match |

This is one of the strongest on-chain observations in the whole MemeCore case.

The docs do not prove what each wallet is. But the wallet balances mirror the documented allocation framework closely enough that it is reasonable to interpret these addresses as **allocation buckets or allocation-adjacent contracts**, rather than random whale accumulation.

The important boundary here is analytical discipline. The match is strong enough to support the idea of a **structured allocation system**, but not strong enough to let us assign every bucket with absolute certainty without a labeled wallet registry from the team.

The biggest address, for example, currently holds about **1.65B M**, which does not map cleanly to one single published allocation line. But later flow analysis shows that this wallet already pushed more than **1.02B M** into a secondary timelock rail, which means its current balance likely reflects a partially distributed upstream bucket rather than a standalone organic holder.

![MemeCore holder structure capture](../images/memecore/memecore-holder-structure-capture.png)

*Research capture built from the live MemecoreScan top-holder snapshot and the public token-allocation page checked on April 22, 2026.*

## These Top Buckets Are Contract-Controlled, Not Simple Wallets

The top allocation-like addresses are not ordinary externally owned accounts.

The following addresses all show verified contract behavior with **TimelockMultiSigWallet** code patterns:

| Address | Contract clue | Creator |
|---|---|---|
| [`0x22eAc7cE...fBF859e98`](https://memecorescan.io/address/0x22eac7ce8e04052523369b93d50cdccfbf859e98) | `TimelockMultiSigWallet` | [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |
| [`0xF31f1Ad0...9b2193790`](https://memecorescan.io/address/0xf31f1ad07f469c1cabdda041a501fcc9b2193790) | `TimelockMultiSigWallet` | [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |
| [`0xEeEA0Cc8...7250Ab159`](https://memecorescan.io/address/0xeeea0cc8cf98b0e3a8b30b48a89e56a7250ab159) | `TimelockMultiSigWallet` | [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |
| [`0x07e14dfd...05e827DB4`](https://memecorescan.io/address/0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4) | `TimelockMultiSigWallet` | [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |
| [`0x74696D9e...187012EEe`](https://memecorescan.io/address/0x74696d9ed2885a1335a914f1ea53445187012eee) | `TimelockMultiSigWallet` | [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |
| [`0x5327dB59...23CB6103a`](https://memecorescan.io/address/0x5327db59913772934128c6201d3311823cb6103a) | `TimelockMultiSigWallet` | [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |

That matters because these balances are not just sitting in random accounts. They appear to be staged inside contracts designed for controlled execution, delayed movement, and multi-sig style administration.

In market-structure terms, that is a very different kind of float from a broad, naturally distributed holder base.

![MemeCore token allocation docs capture](../images/memecore/memecore-token-allocation-docs.png)

*Public MemeCore docs capture showing the token-allocation framework referenced in the allocation cross-check.*

## Initial Funding Paths

Several of the largest buckets were funded through one-hop seed addresses before landing in the timelock contracts.

### Foundation-like bucket

| Path | Amount | Evidence |
|---|---:|---|
| [`0x502c8070...541e61E8f`](https://memecorescan.io/address/0x502c80703c86182dc3863aabe59dc02541e61e8f) -> [`0xF31f1Ad0...9b2193790`](https://memecorescan.io/address/0xf31f1ad07f469c1cabdda041a501fcc9b2193790) | **749,999,999.94794969 M** | [`0x3cce8178...`](https://memecorescan.io/tx/0x3cce81780d34a192b21424c874f4a555b49b7bd2b54ac14b4ae71fbc123fc7a6) |

### Core Contributor-like bucket

| Path | Amount | Evidence |
|---|---:|---|
| [`0x17b69d35...B2f0E8421`](https://memecorescan.io/address/0x17b69d359f2b18d975e0adf7a7d8e09b2f0e8421) -> [`0xEeEA0Cc8...7250Ab159`](https://memecorescan.io/address/0xeeea0cc8cf98b0e3a8b30b48a89e56a7250ab159) | **649,999,999.94794969 M** | [`0x125135e2...`](https://memecorescan.io/tx/0x125135e215489e27023342ff4554981c287b5e2ef916b6a814decacb0337f446) |

### Investor-like bucket

| Path | Amount | Evidence |
|---|---:|---|
| [`0xBb98F2a5...f5628529D`](https://memecorescan.io/address/0xbb98f2a59e22bb07e72bf6bd1640779f5628529d) -> [`0x07e14dfd...05e827DB4`](https://memecorescan.io/address/0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4) | **599,999,999.94794969 M** | [`0xb34947ca...`](https://memecorescan.io/tx/0xb34947ca065881d0de61b4c972b6b82d9baa6323fd9efb6260117dd9bfba90de) |

### Treasury-like bucket

| Path | Amount | Evidence |
|---|---:|---|
| [`0x05Ab0e19...13cc6a252`](https://memecorescan.io/address/0x05ab0e19d82f5b3dcaa23cd84d420cb13cc6a252) -> [`0x5327dB59...23CB6103a`](https://memecorescan.io/address/0x5327db59913772934128c6201d3311823cb6103a) | **99,999,999.94794969 M** | [`0x9628111f...`](https://memecorescan.io/tx/0x9628111f058e7162930f8aa200a3ac14c916a0d04c3a41661ac821d08f6a1d97) |

These seed addresses themselves were funded by earlier upstream wallets, which suggests the supply was staged through multiple preparation layers before settling into the visible top-balance contracts.

## The Largest Bucket Already Split Into a Secondary Distribution Rail

The biggest holder, [`0x22eAc7cE...fBF859e98`](https://memecorescan.io/address/0x22eac7ce8e04052523369b93d50cdccfbf859e98), did not simply sit still after receiving its allocation.

Two important internal transfers from that wallet to another timelock contract, [`0x74696D9e...187012EEe`](https://memecorescan.io/address/0x74696d9ed2885a1335a914f1ea53445187012eee), stand out:

| Route | Amount | Evidence |
|---|---:|---|
| `0x22eAc7... -> 0x74696D...` | **926,996,069 M** | [`0xb16a73e5...`](https://memecorescan.io/tx/0xb16a73e5ef26f4f0591fe211cbbf86dd7c4af1792015039ec182338e5ef64d1c) |
| `0x22eAc7... -> 0x74696D...` | **100,000,000 M** | [`0x3306eb66...`](https://memecorescan.io/tx/0x3306eb668d0352e68091c60dd103970f55d471f88a6bf4176ee8e03190d5a712) |

That means the top holder's visible current balance understates how much supply originally sat in that bucket.

More importantly, the receiving contract did not stay idle.

The same secondary contract then pushed material amounts outward to other addresses:

| Route from `0x74696D...` | Amount | Evidence |
|---|---:|---|
| `0x74696D... -> 0xA2c98A78...` | **30,000,000 M** | [`0x5ae02e42...`](https://memecorescan.io/tx/0x5ae02e4293e3b42c26938ed12d757a523919aecd22119f4bfa34c2f0ab158938) |
| `0x74696D... -> 0xA2c98A78...` | **6,000,000 M** | [`0x33812417...`](https://memecorescan.io/tx/0x3381241771a8253533d431125b019c4cfca6353b9a8f3347b919146d3fbc6f1f) |
| `0x74696D... -> 0xfEaB4522...` | **50,000,000 M** | [`0x490e8c5e...`](https://memecorescan.io/tx/0x490e8c5edf50d0a8478e9d0e49bb21e1dcad58c55dfdeaf067ebf1404e1074e3) |
| `0x74696D... -> 0x326ad04F...` | **2,500,000 M** | [`0x028e9844...`](https://memecorescan.io/tx/0x028e9844a97b615e76b4d91dd332b13f50ca79bc557bac2777c54c94193754f1) |
| `0x74696D... -> 0x15dfA76a...` | **2,500,000 M** | [`0x5693da6a...`](https://memecorescan.io/tx/0x5693da6af2078eb3f30052de4f264f5ba2c4feb8365320a97736c4a681d2ed85) |

This is one of the clearest signs that MemeCore's supply is not just concentrated, but actively **routed through downstream release contracts or distributor wallets**.

## Another Structured Rail: Proxy -> Proxy -> Recipient

A second major flow path exists through a different contract family.

The address [`0xC0222729...21613aE99`](https://memecorescan.io/address/0xc02227299520cb75e2938695da843e721613ae99), which holds **229,684,135.963145 M**, is not a timelock. MemecoreScan shows it as a **DelayedERC1967Proxy** created by [`0x0014Eb4A...b2BCdc53C`](https://memecorescan.io/address/0x0014eb4ac6dd1473b258d088e6ef214b2bcdc53c).

The proxy is funded by another proxy-like contract, [`0x690357e6...E983853aB`](https://memecorescan.io/address/0x690357e684f7661911ced0f857a5920e983853ab), which MemecoreScan identifies as an **ERC1967Proxy**.

Example funding transactions into `0xC022...` include:

| Route | Amount | Evidence |
|---|---:|---|
| `0x690357... -> 0xC02227...` | **207,200,000 M** | [`0xd8dedf5e...`](https://memecorescan.io/tx/0xd8dedf5ec7a94c875907ac99c4e901135ebe75c22f0f8dee76518aa6c3644cf5) |
| `0x690357... -> 0xC02227...` | **50,000,000 M** | [`0x35f9975a...`](https://memecorescan.io/tx/0x35f9975ab5c93f8256e07057b476b1f99086b5ac507a4bb839d86a9f20178ccf) |
| `0x690357... -> 0xC02227...` | **1,800,000 M** | [`0x8a5a7928...`](https://memecorescan.io/tx/0x8a5a7928f955856ff5519c303d64450fb7164cddf7a9bf4e1edbdb13190dd05c) |

Then `0xC022...` feeds recipient address [`0x666d6b8a...e3aC065A2`](https://memecorescan.io/address/0x666d6b8a44d226150ca9058beebafe0e3ac065a2), which itself remains active and still shows activity as recently as **8 hours ago** on the explorer page.

Examples of the proxy-to-recipient stream:

| Route | Amount | Evidence |
|---|---:|---|
| `0xC02227... -> 0x666d6b...` | **4,200,000 M** | [`0x13356333...`](https://memecorescan.io/tx/0x133563337dbf0f7058cd70a4845eba4b1fc1a29383e39b7f0be9abcfd5dd81d3) |
| `0xC02227... -> 0x666d6b...` | **1,600,000 M** | [`0x8e6ee5e3...`](https://memecorescan.io/tx/0x8e6ee5e3c186760e73149b295021170bd080eedc67d6d81ccd6066f3d24ee460) |
| `0xC02227... -> 0x666d6b...` | **1,200,000 M** | [`0xd3fd1db7...`](https://memecorescan.io/tx/0xd3fd1db7072fdbc7f534f906c8c808b95bc6329af67964f16cfa2df5030a4d5b) |
| `0xC02227... -> 0x666d6b...` | **800,000 M** | [`0x3154ad76...`](https://memecorescan.io/tx/0x3154ad76407af8296d06a295b02cc1703ad392bd4715efb95adbd378df38c676) |
| `0xC02227... -> 0x666d6b...` | **400,000 M** | [`0xdb323680...`](https://memecorescan.io/tx/0xdb32368055090852c62613acdea755288c7b2a1d2a319395ca6108b0724c877c) |

That is not how a naturally dispersed retail base behaves.

It looks much more like a contract-mediated release rail.

![MemeCore managed supply rails capture](../images/memecore/memecore-managed-rails-capture.png)

*Research capture summarizing the timelock, proxy, and downstream release rails identified in the MemecoreScan address and transaction pages checked on April 22, 2026.*

## Passive Large Wallet: 244.55M M

The current #6 wallet, [`0x747EFd38...dCFD31E5e`](https://memecorescan.io/address/0x747efd38c12621d10bc821f29c3d985dcfd31e5e), is notable for a different reason.

MemecoreScan shows:

| Observation | Detail |
|---|---|
| Current balance | **244,550,000 M** |
| Transactions sent | **N/A** |
| Funding path | Funded by [`0x76d07aa5...9ba2e35a9`](https://memecorescan.io/address/0x76d07aa519662e08182672fb7068e2d9ba2e35a9) |
| Internal transfer | **244,550,000 M** via [`0xdd7c267d...`](https://memecorescan.io/tx/0xdd7c267d68eead94a87da4f0a9990fadf0bc6c81a9a9ad7865e8f7e32cdaeae4) |

The funder address `0x76d07...` itself was seeded by the common deployer-linked address [`0xe486BF98...D94546764`](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) in multiple tranches:

| Route into `0x76d07...` | Amount | Evidence |
|---|---:|---|
| `0xe486BF... -> 0x76d07...` | **200,000,000 M** | [`0x346f4e4c...`](https://memecorescan.io/tx/0x346f4e4c39f4989c9f6d35f6d7bd61085dc816fc86331ebe517afc0b7b4f3836) |
| `0xe486BF... -> 0x76d07...` | **50,000,000 M** | [`0x4b609b6c...`](https://memecorescan.io/tx/0x4b609b6ccc7688815bd0ddf2b840d3c14aaf5b358951d238bd1ecb99b9e5711d) |
| `0xe486BF... -> 0x76d07...` | **94,550,000 M** | [`0xf97b44ff...`](https://memecorescan.io/tx/0xf97b44ffce6377d201249ebc2f41f6e0fd224426583632507bbebc34363551ec) |

That means at least one of the largest wallets in the current top-holder table is effectively a **downstream parked balance** funded through a deployer-linked staging address.

## What The Deep Read Changes

Without the deeper transaction work, MemeCore can be described as a token with concentrated holders.

After the deeper read, that description is too weak.

The more precise framing is that MemeCore appears to be trading inside a **managed supply topology**:

| Surface view | Deeper read |
|---|---|
| A few whales hold a lot of supply | Many of the largest balances sit in contract-controlled buckets |
| Distribution looks concentrated | Distribution looks staged through timelocks, proxies, and intermediate seed wallets |
| Float looks small | Float may be intentionally gated by release architecture |
| Some large wallets are dormant | Dormancy may reflect parked supply rather than inactive organic ownership |

That distinction matters because the market impact is different.

In a normal concentrated market, analysts mainly worry about whales selling.

In a managed supply market, analysts have to worry about **when**, **through which rail**, and **under what contract logic** supply may become economically relevant.

## What This Means For The Current MemeCore Pump

The deep on-chain read does not tell you whether MemeCore must go up or down next.

It does tell you the market is trading on top of a structure with the following characteristics:

| On-chain trait | Market implication |
|---|---|
| Top buckets mirror documented token allocation categories | Supply is likely more programmatic than organic |
| Many top holders are timelock contracts | Float can be gated and delayed |
| One large bucket already feeds a secondary distribution rail | Supply can be released in stages |
| Another major bucket sits behind proxy architecture | Distribution may remain adaptive rather than static |
| A 244.55M passive wallet was funded through a deployer-linked address | Large dormant balances can still matter later |

That makes the current pump easier to understand.

MemeCore is not trading like a token with broad, messy, naturally dispersed ownership. It is trading like a token where the visible float can remain tighter than the full supply picture, while the underlying allocation rails stay heavily structured.

This is one reason the upside can look stronger than outside critics expect.

It is also one reason the market can become unstable very quickly if any of these controlled rails begin releasing supply more aggressively.

## Working Conclusion

The best disciplined conclusion is:

> MemeCore's on-chain structure looks less like broad public distribution and more like a contract-mediated allocation system with timelock buckets, proxy-based release rails, and concentrated downstream recipients.

That does not automatically invalidate the rally.

But it means any analysis of why `M` is pumping is incomplete unless it accounts for the fact that the market is trading against a **managed supply structure**, not a clean free-float market.

## Source Map

| Category | Source |
|---|---|
| Holder concentration | [MemecoreScan top accounts](https://memecorescan.io/accounts) |
| Top holder #1 | [0x22eAc7cE...fBF859e98](https://memecorescan.io/address/0x22eac7ce8e04052523369b93d50cdccfbf859e98) |
| Top holder #2 | [0xF31f1Ad0...9b2193790](https://memecorescan.io/address/0xf31f1ad07f469c1cabdda041a501fcc9b2193790) |
| Top holder #3 | [0xEeEA0Cc8...7250Ab159](https://memecorescan.io/address/0xeeea0cc8cf98b0e3a8b30b48a89e56a7250ab159) |
| Top holder #4 | [0x07e14dfd...05e827DB4](https://memecorescan.io/address/0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4) |
| Secondary distributor timelock | [0x74696D9e...187012EEe](https://memecorescan.io/address/0x74696d9ed2885a1335a914f1ea53445187012eee) |
| Passive large holder | [0x747EFd38...dCFD31E5e](https://memecorescan.io/address/0x747efd38c12621d10bc821f29c3d985dcfd31e5e) |
| Proxy rail | [0xC0222729...21613aE99](https://memecorescan.io/address/0xc02227299520cb75e2938695da843e721613ae99), [0x690357e6...E983853aB](https://memecorescan.io/address/0x690357e684f7661911ced0f857a5920e983853ab), [0x666d6b8a...e3aC065A2](https://memecorescan.io/address/0x666d6b8a44d226150ca9058beebafe0e3ac065a2) |
| Common deployer-linked address | [0xe486BF98...D94546764](https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764) |
| Token economics | [MemeCore docs: `$M`](https://docs.memecore.com/memecore/token/usdm), [Token Allocation](https://docs.memecore.com/memecore/token/token-allocation) |
| Consensus emissions | [MemeCore docs: Consensus](https://docs.memecore.com/guides/consensus) |

## References (APA 7th)

MemecoreScan. (n.d.). *Top accounts by M balance*. Retrieved April 22, 2026, from https://memecorescan.io/accounts

MemecoreScan. (n.d.). *Address page for 0x22eAc7cE8e04052523369b93d50CdcCfBF859e98*. Retrieved April 22, 2026, from https://memecorescan.io/address/0x22eac7ce8e04052523369b93d50cdccfbf859e98

MemecoreScan. (n.d.). *Address page for 0xF31f1Ad07F469c1CAbDdA041A501Fcc9b2193790*. Retrieved April 22, 2026, from https://memecorescan.io/address/0xf31f1ad07f469c1cabdda041a501fcc9b2193790

MemecoreScan. (n.d.). *Address page for 0xEeEA0Cc8cf98b0e3A8B30B48A89E56a7250Ab159*. Retrieved April 22, 2026, from https://memecorescan.io/address/0xeeea0cc8cf98b0e3a8b30b48a89e56a7250ab159

MemecoreScan. (n.d.). *Address page for 0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4*. Retrieved April 22, 2026, from https://memecorescan.io/address/0x07e14dfdfd3bd6efe10d2d30e68fab105e827db4

MemecoreScan. (n.d.). *Address page for 0x74696D9ed2885A1335A914f1Ea53445187012EEe*. Retrieved April 22, 2026, from https://memecorescan.io/address/0x74696d9ed2885a1335a914f1ea53445187012eee

MemecoreScan. (n.d.). *Address page for 0x747EFd38c12621D10Bc821f29C3D985dCFD31E5e*. Retrieved April 22, 2026, from https://memecorescan.io/address/0x747efd38c12621d10bc821f29c3d985dcfd31e5e

MemecoreScan. (n.d.). *Address page for 0xC02227299520cb75e2938695da843e721613ae99*. Retrieved April 22, 2026, from https://memecorescan.io/address/0xc02227299520cb75e2938695da843e721613ae99

MemecoreScan. (n.d.). *Address page for 0x666d6b8a44d226150ca9058bEEbafe0e3aC065A2*. Retrieved April 22, 2026, from https://memecorescan.io/address/0x666d6b8a44d226150ca9058beebafe0e3ac065a2

MemecoreScan. (n.d.). *Address page for 0xe486BF9858f8B995d4bde291c43eB35D94546764*. Retrieved April 22, 2026, from https://memecorescan.io/address/0xe486bf9858f8b995d4bde291c43eb35d94546764

MemeCore Docs. (n.d.). *$M*. Retrieved April 22, 2026, from https://docs.memecore.com/memecore/token/usdm

MemeCore Docs. (n.d.). *Consensus*. Retrieved April 22, 2026, from https://docs.memecore.com/guides/consensus

MemeCore Docs. (n.d.). *Token allocation*. Retrieved April 22, 2026, from https://docs.memecore.com/memecore/token/token-allocation
