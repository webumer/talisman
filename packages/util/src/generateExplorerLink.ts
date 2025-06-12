/**
 * Types for explorer link generation
 */
export interface ExplorerLinkInput {
  chainId: string
  entityType: "block" | "extrinsic" | "account"
  value: string
  explorer: string
}

export interface ExplorerTemplate {
  name: string
  templates: {
    block: string
    extrinsic: string
    account: string
  }
}

export interface ChainExplorers {
  id: string
  explorers: ExplorerTemplate[]
}

/**
 * Fetches chain data from the Talisman chaindata repository
 */
async function fetchChainData(): Promise<ChainExplorers[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/TalismanSociety/chaindata/main/pub/v1/chains/summary.json",
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch chain data: ${response.status}`)
    }
    const data = await response.json()
    return data.chains || []
  } catch (error) {
    throw new Error("Failed to fetch chain data")
  }
}

/**
 * Generates an explorer link for a given chain, entity type, and value
 * @param input - The input parameters for generating the explorer link
 * @returns Promise<string> - The generated explorer URL
 */
export async function generateExplorerLink(input: ExplorerLinkInput): Promise<string> {
  const { chainId, entityType, value, explorer } = input

  // Validate inputs
  if (!chainId || !entityType || !value || !explorer) {
    throw new Error(
      "Missing required parameters: chainId, entityType, value, and explorer are required",
    )
  }

  if (!["block", "extrinsic", "account"].includes(entityType)) {
    throw new Error(`Invalid entity type: ${entityType}. Must be one of: block, extrinsic, account`)
  }

  try {
    // Fetch chain data
    const chains = await fetchChainData()

    // Find the specific chain
    const chain = chains.find((c) => c.id === chainId)
    if (!chain) {
      throw new Error(`Chain not found: ${chainId}`)
    }

    // Find the specific explorer
    const explorerConfig = chain.explorers.find((e) => e.name === explorer)
    if (!explorerConfig) {
      throw new Error(`Explorer '${explorer}' not supported for chain '${chainId}'`)
    }

    // Get the template for the entity type
    const template = explorerConfig.templates[entityType]
    if (!template) {
      throw new Error(
        `Entity type '${entityType}' not supported by explorer '${explorer}' for chain '${chainId}'`,
      )
    }

    // Replace the placeholder with the actual value
    const url = template.replace("{value}", encodeURIComponent(value))

    return url
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to generate explorer link")
  }
}

/**
 * Gets available explorers for a specific chain
 * @param chainId - The chain ID
 * @returns Promise<string[]> - Array of available explorer names
 */
export async function getAvailableExplorers(chainId: string): Promise<string[]> {
  try {
    const chains = await fetchChainData()
    const chain = chains.find((c) => c.id === chainId)

    if (!chain) {
      return []
    }

    return chain.explorers.map((e) => e.name)
  } catch (error) {
    return []
  }
}

/**
 * Gets all available chains with their supported explorers
 * @returns Promise<ChainExplorers[]> - Array of chains with their explorers
 */
export async function getAllChainsWithExplorers(): Promise<ChainExplorers[]> {
  return await fetchChainData()
}
