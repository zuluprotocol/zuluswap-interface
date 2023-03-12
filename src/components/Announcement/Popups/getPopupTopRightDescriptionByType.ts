import { ChainId } from '@zuluswap/zs-sdk-core'
import { t } from '@lingui/macro'

import {
  AnnouncementTemplateBridge,
  NotificationType,
  PopupContentAnnouncement,
  PopupItemType,
  PrivateAnnouncementType,
} from 'components/Announcement/type'
import { APP_PATHS } from 'constants/index'
import { NETWORKS_INFO } from 'constants/networks'
import { MultichainTransfer, MultichainTransferStatus } from 'hooks/bridge/useGetBridgeTransfers'
import { formatAmountBridge } from 'pages/Bridge/helpers'

const getDescriptionBridge = (popup: PopupItemType<PopupContentAnnouncement>) => {
  const { templateBody } = popup.content
  const { transaction = {} } = templateBody as AnnouncementTemplateBridge
  const { srcAmount, srcTokenSymbol, status, srcChainId, dstChainId } = transaction as MultichainTransfer
  const isSuccess = status === MultichainTransferStatus.Success
  const fromNetwork = NETWORKS_INFO[Number(srcChainId) as ChainId].name
  const toNetwork = NETWORKS_INFO[Number(dstChainId) as ChainId].name
  const amount = formatAmountBridge(srcAmount)
  const statusTxt = isSuccess ? t`Success` : t`Failed`
  return {
    title: t`Transfer transaction - ${statusTxt}`,
    type: isSuccess ? NotificationType.SUCCESS : NotificationType.WARNING,
    link: APP_PATHS.BRIDGE,
    summary: isSuccess
      ? `${amount} ${srcTokenSymbol} has been successfully transferred from ${fromNetwork} to ${toNetwork}`
      : t`There was an issue with transferring ${amount} ${srcTokenSymbol} from ${fromNetwork} to ${toNetwork}. Your assets will be reimbursed to your wallet`,
  }
}

type Summary = {
  title: string
  summary: string
  type: NotificationType
  link: string
}
type SummaryMap = {
  [type in PrivateAnnouncementType]: (popup: PopupItemType<PopupContentAnnouncement>) => Summary
}
const MAP_DESCRIPTION: Partial<SummaryMap> = {
  [PrivateAnnouncementType.BRIDGE]: getDescriptionBridge,
}

export default function getPopupTopRightDescriptionByType(popup: PopupItemType<PopupContentAnnouncement>) {
  const { templateType } = popup.content
  return (MAP_DESCRIPTION[templateType]?.(popup) ?? {}) as Summary
}
