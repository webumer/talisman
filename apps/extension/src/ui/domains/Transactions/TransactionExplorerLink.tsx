import { ExternalLinkIcon } from "@talismn/icons"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ExplorerSelector } from "@ui/domains/ViewOnExplorer/ExplorerSelector"
import { useChainByGenesisHash } from "@ui/state"

interface TransactionExplorerLinkProps {
  txHash: string
  genesisHash?: string
  chainId?: string
  className?: string
}

export const TransactionExplorerLink: FC<TransactionExplorerLinkProps> = ({
  txHash,
  genesisHash,
  chainId,
  className = "",
}) => {
  const { t } = useTranslation()
  const chain = useChainByGenesisHash(genesisHash)

  // Determine the chain ID to use
  const effectiveChainId = useMemo(() => {
    if (chainId) return chainId
    if (chain?.id) return chain.id
    return null
  }, [chainId, chain?.id])

  if (!effectiveChainId) {
    return null
  }

  return (
    <ExplorerSelector
      chainId={effectiveChainId}
      entityType="extrinsic"
      value={txHash}
      className={className}
    >
      <ExternalLinkIcon className="text-md" />
      <span>{t("View on Explorer")}</span>
    </ExplorerSelector>
  )
}
