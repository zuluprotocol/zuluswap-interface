import { ChainId } from '@zuluswap/zs-sdk-core'
import { useNavigate } from 'react-router-dom'

import { AnnouncementTemplatePopup, PopupContentAnnouncement, PopupItemType } from 'components/Announcement/type'

const LsKey = 'ack-announcements'
const getAnnouncementsAckMap = () => JSON.parse(localStorage[LsKey] || '{}')

export const ackAnnouncementPopup = (id: string | number) => {
  const announcementsMap = getAnnouncementsAckMap()
  localStorage.setItem(
    LsKey,
    JSON.stringify({
      ...announcementsMap,
      [id]: '1',
    }),
  )
}

export const formatNumberOfUnread = (num: number) => (num > 10 ? '10+' : num + '')

export const isPopupCanShow = (popupInfo: PopupItemType<PopupContentAnnouncement>, chainId: ChainId) => {
  const { templateBody = {}, metaMessageId } = popupInfo.content
  const { endAt, startAt, chainIds = [] } = templateBody as AnnouncementTemplatePopup
  const isRightChain = chainIds.includes(chainId + '')
  const announcementsAckMap = getAnnouncementsAckMap()
  const isRead = announcementsAckMap[metaMessageId]
  const isExpired = Date.now() < startAt * 1000 || Date.now() > endAt * 1000
  return !isRead && !isExpired && isRightChain
}

export const formatTime = (time: number) => {
  const delta = (Date.now() - time * 1000) / 1000
  const min = Math.floor(delta / 60)
  if (min < 1) return `< 1 minute ago`
  if (min < 60) return `${min} minutes ago`
  const hour = Math.floor(delta / 3600)
  if (hour < 24) return `${hour} hours ago`
  const day = Math.floor(delta / (24 * 3600))
  return `${day} days ago`
}

export const useNavigateCtaPopup = () => {
  const navigate = useNavigate()
  const onNavigate = (actionURL: string) => {
    try {
      if (!actionURL) return
      const { pathname, host } = new URL(actionURL)
      if (window.location.host === host) {
        navigate(pathname)
      } else {
        window.open(actionURL)
      }
    } catch (error) {}
  }
  return onNavigate
}
