import type { ExplorerLinkInput } from "@talismn/util"
import { generateExplorerLink, getAvailableExplorers } from "@talismn/util"
import { useCallback, useEffect, useState } from "react"

const EXPLORER_PREFERENCE_KEY = "talisman-explorer-preference"

interface ExplorerPreference {
  [chainId: string]: string
}

/**
 * Hook for managing explorer preferences and generating explorer links
 */
export const useExplorerLink = () => {
  const [preferences, setPreferences] = useState<ExplorerPreference>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EXPLORER_PREFERENCE_KEY)
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    } catch (error) {
      // Silently handle localStorage errors
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: ExplorerPreference) => {
    try {
      localStorage.setItem(EXPLORER_PREFERENCE_KEY, JSON.stringify(newPreferences))
      setPreferences(newPreferences)
    } catch (error) {
      // Silently handle localStorage errors
    }
  }, [])

  // Set preferred explorer for a chain
  const setPreferredExplorer = useCallback(
    (chainId: string, explorer: string) => {
      const newPreferences = { ...preferences, [chainId]: explorer }
      savePreferences(newPreferences)
    },
    [preferences, savePreferences],
  )

  // Get preferred explorer for a chain
  const getPreferredExplorer = useCallback(
    (chainId: string) => {
      return preferences[chainId]
    },
    [preferences],
  )

  // Generate explorer link with preferred explorer
  const generateLink = useCallback(
    async (input: Omit<ExplorerLinkInput, "explorer">) => {
      setIsLoading(true)
      try {
        const { chainId } = input

        // Get preferred explorer or first available
        let explorer = getPreferredExplorer(chainId)

        if (!explorer) {
          const available = await getAvailableExplorers(chainId)
          if (available.length > 0) {
            explorer = available[0]
            setPreferredExplorer(chainId, explorer)
          } else {
            throw new Error(`No explorers available for chain: ${chainId}`)
          }
        }

        return await generateExplorerLink({ ...input, explorer })
      } finally {
        setIsLoading(false)
      }
    },
    [getPreferredExplorer, setPreferredExplorer],
  )

  // Get available explorers for a chain
  const getAvailableExplorersForChain = useCallback(async (chainId: string) => {
    try {
      return await getAvailableExplorers(chainId)
    } catch (error) {
      // Return empty array on error
      return []
    }
  }, [])

  return {
    generateLink,
    setPreferredExplorer,
    getPreferredExplorer,
    getAvailableExplorersForChain,
    isLoading,
  }
}
