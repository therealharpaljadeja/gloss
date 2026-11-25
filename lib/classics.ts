import type { TopicKey } from "./library";

/**
 * A first shelf for an empty library: a dozen posts from Category Labs and
 * Monad, each checked to read in cleanly through the importer. Fetched like any
 * pasted link, so their text is never bundled; shelved by hand, so they need no sorting.
 */
export type PackItem = { key: string; url: string; title: string; author: string; year: number; topic: TopicKey };

const CAT = "https://www.category.xyz/blogs/";
const MONAD = "https://www.monad.xyz/blog/";

export const STARTER_PACK: PackItem[] = [
  { key: "big-four", url: `${MONAD}big-four-blockchain-properties`, title: "The Big Four Blockchain Properties", author: "Keone Hon", year: 2026, topic: "tech" },
  { key: "monadbft", url: `${CAT}monadbft-fast-responsive-fork-resistant-streamlined-consensus`, title: "MonadBFT: Fast, Responsive, Fork-Resistant, Streamlined Consensus", author: "Category Labs", year: 2025, topic: "infra" },
  { key: "raptorcast", url: `${CAT}raptorcast-designing-a-messaging-layer`, title: "RaptorCast: Designing a Messaging Layer", author: "Babak Gilkalaye", year: 2025, topic: "infra" },
  { key: "base-fee", url: `${CAT}redesigning-a-base-fee-for-monad`, title: "Redesigning a Base Fee for Monad", author: "Jason Milionis, Lioba Heimbach", year: 2025, topic: "economics" },
  { key: "spam-mev", url: `${CAT}blockspace-under-pressure-an-analysis-of-spam-mev-on-high-throughput-blockchains`, title: "Blockspace Under Pressure: Spam MEV on High-Throughput Blockchains", author: "Lioba Heimbach, Kushal Babel", year: 2026, topic: "economics" },
  { key: "kv-cache", url: `${CAT}designing-a-robust-key-value-cache-for-monad`, title: "Designing a Robust Key-Value Cache for Monad", author: "Maged Michael", year: 2026, topic: "infra" },
  { key: "evm-workloads", url: `${CAT}measuring-evm-workloads-in-the-wild`, title: "Measuring EVM Workloads in the Wild", author: "Lioba Heimbach, Kushal Babel, Jason Milionis", year: 2026, topic: "data" },
  { key: "ordering-rights", url: `${CAT}giving-ordering-rights-to-applications`, title: "Giving Ordering Rights to Applications", author: "Andrea Canidio", year: 2026, topic: "economics" },
  { key: "private-rpc", url: `${CAT}a-private-rpc-for-public-blockchains`, title: "A Private RPC for Public Blockchains", author: "Kushal Babel, Sourav Das", year: 2026, topic: "security" },
  { key: "gas-limit", url: `${CAT}setting-your-gas-limit-on-monad`, title: "Setting Your Gas Limit on Monad", author: "Lioba Heimbach", year: 2026, topic: "programming" },
  { key: "quantum-cadence", url: `${MONAD}quantum-cadence-part-1`, title: "Quantum Cadence, Part 1: Consensus Recap", author: "Mohsen Ahmadvand", year: 2026, topic: "security" },
  { key: "category-labs", url: `${CAT}introducing-category-labs`, title: "Introducing Category Labs", author: "Category Labs", year: 2024, topic: "tech" },
];
