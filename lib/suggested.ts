/**
 * Links suggested under the link bar before anything is imported. They are
 * fetched like any pasted link, so their text is never bundled with Gloss.
 */
export const SUGGESTED_LINKS = [
  { url: "https://www.category.xyz/monad-private-settlement", label: "Private Settlement", title: "Monad Private Settlement" },
  { url: "https://www.category.xyz/blogs/application-preferred-execution-sequencing", label: "APES", title: "APES: Application-Preferred Execution Sequencing" },
  { url: "https://www.category.xyz/blogs/scheduled-transactions", label: "Scheduled Transactions", title: "Scheduled Transactions: Letting Contracts Act on Their Own" },
  { url: "https://www.category.xyz/blogs/optimizing-the-monad-client-for-zkvm-execution", label: "zkVM Execution", title: "Optimizing the Monad Client for zkVM Execution" },
] as const;
