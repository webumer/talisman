import { ChevronDownIcon, ExternalLinkIcon } from "@talismn/icons"
import { FC, useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Popover, PopoverContent, PopoverTrigger } from "talisman-ui"

import { useExplorerLink } from "@ui/hooks/useExplorerLink"

interface ExplorerSelectorProps {
  chainId: string
  entityType: "block" | "extrinsic" | "account"
  value: string
  className?: string
  children?: React.ReactNode
}

export const ExplorerSelector: FC<ExplorerSelectorProps> = ({
  chainId,
  entityType,
  value,
  className = "",
  children,
}) => {
  const { t } = useTranslation()
  const {
    generateLink,
    setPreferredExplorer,
    getPreferredExplorer,
    getAvailableExplorersForChain,
    isLoading,
  } = useExplorerLink()

  const [availableExplorers, setAvailableExplorers] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load available explorers for the chain
  useEffect(() => {
    const loadExplorers = async () => {
      try {
        const explorers = await getAvailableExplorersForChain(chainId)
        setAvailableExplorers(explorers)
        setError(null)
      } catch (err) {
        setError("Failed to load explorers")
      }
    }

    if (chainId) {
      loadExplorers()
    }
  }, [chainId, getAvailableExplorersForChain])

  const handleExplorerSelect = useCallback(
    async (explorer: string) => {
      try {
        setError(null)
        setPreferredExplorer(chainId, explorer)

        const url = await generateLink({
          chainId,
          entityType,
          value,
        })

        window.open(url, "_blank")
        setIsOpen(false)
      } catch (err) {
        setError("Failed to open explorer")
      }
    },
    [chainId, entityType, value, generateLink, setPreferredExplorer],
  )

  const currentExplorer = getPreferredExplorer(chainId) || availableExplorers[0]

  if (availableExplorers.length === 0) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`bg-grey-800 text-body-secondary hover:bg-grey-700 hover:text-body flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${className}`}
          disabled={isLoading}
        >
          {children || (
            <>
              <ExternalLinkIcon className="text-md" />
              <span>{t("View on Explorer")}</span>
            </>
          )}
          <ChevronDownIcon className="text-xs" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="bg-grey-900 border-grey-700 w-64 rounded-sm border p-0">
        <div className="border-grey-700 border-b p-3">
          <h3 className="text-body text-sm font-medium">{t("Select Explorer")}</h3>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {availableExplorers.map((explorer) => (
            <button
              key={explorer}
              type="button"
              onClick={() => handleExplorerSelect(explorer)}
              className={`hover:bg-grey-800 w-full px-3 py-2 text-left text-sm transition-colors ${
                explorer === currentExplorer ? "text-primary bg-grey-800" : "text-body-secondary"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="capitalize">{explorer}</span>
                {explorer === currentExplorer && <span className="text-primary text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="border-grey-700 border-t p-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
