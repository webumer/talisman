import type { ExplorerLinkInput } from "./generateExplorerLink"
import { generateExplorerLink, getAvailableExplorers } from "./generateExplorerLink"

// Mock fetch for testing
global.fetch = jest.fn()

describe("generateExplorerLink", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockChainData = {
    chains: [
      {
        id: "polkadot",
        explorers: [
          {
            name: "subscan",
            templates: {
              block: "https://polkadot.subscan.io/block/{value}",
              extrinsic: "https://polkadot.subscan.io/extrinsic/{value}",
              account: "https://polkadot.subscan.io/account/{value}",
            },
          },
          {
            name: "polkadot.js",
            templates: {
              block: "https://polkadot.js.org/apps/#/explorer/query/{value}",
              extrinsic: "https://polkadot.js.org/apps/#/explorer/query/{value}",
              account: "https://polkadot.js.org/apps/#/accounts/{value}",
            },
          },
        ],
      },
      {
        id: "kusama",
        explorers: [
          {
            name: "subscan",
            templates: {
              block: "https://kusama.subscan.io/block/{value}",
              extrinsic: "https://kusama.subscan.io/extrinsic/{value}",
              account: "https://kusama.subscan.io/account/{value}",
            },
          },
        ],
      },
    ],
  }

  it("should generate correct subscan extrinsic link for polkadot", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const input: ExplorerLinkInput = {
      chainId: "polkadot",
      entityType: "extrinsic",
      value: "0x1234567890abcdef",
      explorer: "subscan",
    }

    const result = await generateExplorerLink(input)
    expect(result).toBe("https://polkadot.subscan.io/extrinsic/0x1234567890abcdef")
  })

  it("should generate correct polkadot.js block link", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const input: ExplorerLinkInput = {
      chainId: "polkadot",
      entityType: "block",
      value: "12345",
      explorer: "polkadot.js",
    }

    const result = await generateExplorerLink(input)
    expect(result).toBe("https://polkadot.js.org/apps/#/explorer/query/12345")
  })

  it("should generate correct account link for kusama", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const input: ExplorerLinkInput = {
      chainId: "kusama",
      entityType: "account",
      value: "1a2b3c4d5e6f7890",
      explorer: "subscan",
    }

    const result = await generateExplorerLink(input)
    expect(result).toBe("https://kusama.subscan.io/account/1a2b3c4d5e6f7890")
  })

  it("should throw error for unsupported chain", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const input: ExplorerLinkInput = {
      chainId: "unsupported-chain",
      entityType: "extrinsic",
      value: "0x123",
      explorer: "subscan",
    }

    await expect(generateExplorerLink(input)).rejects.toThrow("Chain not found: unsupported-chain")
  })

  it("should throw error for unsupported explorer", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const input: ExplorerLinkInput = {
      chainId: "polkadot",
      entityType: "extrinsic",
      value: "0x123",
      explorer: "unsupported-explorer",
    }

    await expect(generateExplorerLink(input)).rejects.toThrow(
      "Explorer 'unsupported-explorer' not supported for chain 'polkadot'",
    )
  })

  it("should throw error for invalid entity type", async () => {
    const input = {
      chainId: "polkadot",
      entityType: "invalid" as "block" | "extrinsic" | "account",
      value: "0x123",
      explorer: "subscan",
    }

    await expect(generateExplorerLink(input)).rejects.toThrow(
      "Invalid entity type: invalid. Must be one of: block, extrinsic, account",
    )
  })

  it("should throw error for missing parameters", async () => {
    const input = {
      chainId: "",
      entityType: "extrinsic" as const,
      value: "",
      explorer: "",
    }

    await expect(generateExplorerLink(input)).rejects.toThrow(
      "Missing required parameters: chainId, entityType, value, and explorer are required",
    )
  })

  it("should handle fetch errors", async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    const input: ExplorerLinkInput = {
      chainId: "polkadot",
      entityType: "extrinsic",
      value: "0x123",
      explorer: "subscan",
    }

    await expect(generateExplorerLink(input)).rejects.toThrow("Failed to fetch chain data")
  })
})

describe("getAvailableExplorers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockChainData = {
    chains: [
      {
        id: "polkadot",
        explorers: [
          { name: "subscan", templates: {} },
          { name: "polkadot.js", templates: {} },
        ],
      },
      {
        id: "kusama",
        explorers: [{ name: "subscan", templates: {} }],
      },
    ],
  }

  it("should return available explorers for polkadot", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const result = await getAvailableExplorers("polkadot")
    expect(result).toEqual(["subscan", "polkadot.js"])
  })

  it("should return available explorers for kusama", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const result = await getAvailableExplorers("kusama")
    expect(result).toEqual(["subscan"])
  })

  it("should return empty array for unsupported chain", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChainData,
    })

    const result = await getAvailableExplorers("unsupported-chain")
    expect(result).toEqual([])
  })

  it("should handle fetch errors gracefully", async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    const result = await getAvailableExplorers("polkadot")
    expect(result).toEqual([])
  })
})
