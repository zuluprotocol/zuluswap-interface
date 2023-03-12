import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId, NativeCurrency, Token } from '@zuluswap/zs-sdk-core'
import { Connection } from '@solana/web3.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ETH_PRICE, PROMM_ETH_PRICE, TOKEN_DERIVED_ETH } from 'apollo/queries'
import { ackAnnouncementPopup, isPopupCanShow } from 'components/Announcement/helper'
import {
  AnnouncementTemplatePopup,
  PopupContent,
  PopupContentAnnouncement,
  PopupContentSimple,
  PopupContentTxn,
  PopupItemType,
  PopupType,
} from 'components/Announcement/type'
import { OUTSITE_FARM_REWARDS_QUERY, ZERO_ADDRESS } from 'constants/index'
import { NETWORKS_INFO, isEVM, isSolana } from 'constants/networks'
import ethereumInfo from 'constants/networks/ethereum'
import { ZPX } from 'constants/tokens'
import { VERSION } from 'constants/v2'
import { useActiveWeb3React } from 'hooks/index'
import { useAppSelector } from 'state/hooks'
import { AppDispatch, AppState } from 'state/index'
import { getBlockFromTimestamp, getPercentChange } from 'utils'
import { createClient } from 'utils/client'

import {
  ApplicationModal,
  addPopup,
  closeModal,
  removePopup,
  setAnnouncementDetail,
  setOpenModal,
  updateETHPrice,
  updateZPXPrice,
  updatePrommETHPrice,
} from './actions'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId])
}

export const useCloseModal = (modal: ApplicationModal) => {
  const dispatch = useDispatch<AppDispatch>()

  const onCloseModal = useCallback(() => {
    dispatch(closeModal(modal))
  }, [dispatch, modal])

  return onCloseModal
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useToggleNotificationCenter() {
  const toggleNotificationCenter = useToggleModal(ApplicationModal.NOTIFICATION_CENTER)
  const clearAllPopup = useRemoveAllPopupByType()
  return useCallback(() => {
    toggleNotificationCenter()
    clearAllPopup(PopupType.TOP_RIGHT)
  }, [clearAllPopup, toggleNotificationCenter])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useOpenNetworkModal(): () => void {
  return useOpenModal(ApplicationModal.NETWORK)
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useToggleTransactionSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.TRANSACTION_SETTINGS)
}

export function useToggleYourCampaignTransactionsModal(): () => void {
  return useToggleModal(ApplicationModal.YOUR_CAMPAIGN_TRANSACTIONS)
}

export function usePoolDetailModalToggle(): () => void {
  return useToggleModal(ApplicationModal.POOL_DETAIL)
}

export function useSelectCampaignModalToggle(): () => void {
  return useToggleModal(ApplicationModal.SELECT_CAMPAIGN)
}

export function useRegisterCampaignCaptchaModalToggle(): () => void {
  return useToggleModal(ApplicationModal.REGISTER_CAMPAIGN_CAPTCHA)
}

export function useRegisterCampaignSuccessModalToggle(): () => void {
  return useToggleModal(ApplicationModal.REGISTER_CAMPAIGN_SUCCESS)
}

export function useTrueSightNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.TRUESIGHT_NETWORK)
}

export function useNotificationModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NOTIFICATION_SUBSCRIPTION)
}

export function useToggleEthPowAckModal(): () => void {
  return useToggleModal(ApplicationModal.ETH_POW_ACK)
}

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  popupType: PopupType,
  key?: string,
  removeAfterMs?: number | null,
) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, popupType: PopupType, key?: string, removeAfterMs?: number | null) => {
      dispatch(addPopup({ content, key, popupType, removeAfterMs }))
    },
    [dispatch],
  )
}

// simple notify with text and description
export const useNotify = () => {
  const addPopup = useAddPopup()
  return useCallback(
    (data: PopupContentSimple, removeAfterMs: number | null | undefined = 4000) => {
      addPopup(data, PopupType.SIMPLE, data.title + Math.random(), removeAfterMs)
    },
    [addPopup],
  )
}

// popup notify transaction
export const useTransactionNotify = () => {
  const addPopup = useAddPopup()
  return useCallback(
    (data: PopupContentTxn) => {
      addPopup(data, PopupType.TRANSACTION, data.hash)
    },
    [addPopup],
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup() {
  const dispatch = useDispatch()
  return useCallback(
    (popup: PopupItemType) => {
      const { key, popupType, content } = popup
      if ([PopupType.CENTER, PopupType.SNIPPET, PopupType.TOP_RIGHT, PopupType.TOP_BAR].includes(popupType)) {
        ackAnnouncementPopup((content as PopupContentAnnouncement).metaMessageId)
      }
      dispatch(removePopup({ key }))
    },
    [dispatch],
  )
}

export function useRemoveAllPopupByType() {
  const data = useActivePopups()
  const removePopup = useRemovePopup()

  return useCallback(
    (typesRemove: PopupType) => {
      const { snippetPopups, centerPopups, topPopups, topRightPopups } = data

      const map: Record<PopupType, PopupItemType[]> = {
        [PopupType.SNIPPET]: snippetPopups,
        [PopupType.CENTER]: centerPopups,
        [PopupType.TOP_BAR]: topPopups,
        [PopupType.TOP_RIGHT]: topRightPopups,
        [PopupType.SIMPLE]: topRightPopups,
        [PopupType.TRANSACTION]: topRightPopups,
      }
      const popups: PopupItemType[] = map[typesRemove] ?? []
      popups.forEach(removePopup)
    },
    [data, removePopup],
  )
}

// get the list of active popups
export function useActivePopups() {
  const popups = useSelector(
    (state: AppState) => state.application.popupList,
  ) as PopupItemType<PopupContentAnnouncement>[]
  const { chainId } = useActiveWeb3React()

  return useMemo(() => {
    const topRightPopups = popups.filter(e =>
      [PopupType.SIMPLE, PopupType.TOP_RIGHT, PopupType.TRANSACTION].includes(e.popupType),
    )

    const topPopups = popups.filter(e => e.popupType === PopupType.TOP_BAR && isPopupCanShow(e, chainId))
    const snippetPopups = popups.filter(e => e.popupType === PopupType.SNIPPET && isPopupCanShow(e, chainId))

    const centerPopups = popups.filter(e => e.popupType === PopupType.CENTER && isPopupCanShow(e, chainId))
    return {
      topPopups,
      centerPopups,
      topRightPopups,
      snippetPopups,
    }
  }, [popups, chainId])
}

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
export const getEthPrice = async (
  chainId: ChainId,
  apolloClient: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>,
) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, chainId, blockClient)
    const result = await apolloClient.query({
      query: ETH_PRICE(),
      fetchPolicy: 'network-only',
    })

    const resultOneDay = await apolloClient.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'network-only',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPrice
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice

    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

const getPrommEthPrice = async (
  chainId: ChainId,
  apolloClient: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>,
) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, chainId, blockClient)
    const result = await apolloClient.query({
      query: PROMM_ETH_PRICE(),
      fetchPolicy: 'network-only',
    })

    const resultOneDay = await apolloClient.query({
      query: PROMM_ETH_PRICE(oneDayBlock),
      fetchPolicy: 'network-only',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPriceUSD
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPriceUSD

    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

let fetchingETHPrice = false
export function useETHPrice(version: string = VERSION.CLASSIC): AppState['application']['ethPrice'] {
  const dispatch = useDispatch()
  const { isEVM, chainId } = useActiveWeb3React()
  const { elasticClient, classicClient, blockClient } = useZuluSwapConfig()

  const ethPrice = useSelector((state: AppState) =>
    version === VERSION.ELASTIC ? state.application.prommEthPrice : state.application.ethPrice,
  )

  useEffect(() => {
    if (!isEVM) return

    async function checkForEthPrice() {
      if (fetchingETHPrice) return
      fetchingETHPrice = true
      try {
        const [newPrice, oneDayBackPrice, pricePercentChange] = await (version === VERSION.ELASTIC
          ? getPrommEthPrice(chainId, elasticClient, blockClient)
          : getEthPrice(chainId, classicClient, blockClient))

        dispatch(
          version === VERSION.ELASTIC
            ? updatePrommETHPrice({
                currentPrice: (newPrice ? newPrice : 0).toString(),
                oneDayBackPrice: (oneDayBackPrice ? oneDayBackPrice : 0).toString(),
                pricePercentChange,
              })
            : updateETHPrice({
                currentPrice: (newPrice ? newPrice : 0).toString(),
                oneDayBackPrice: (oneDayBackPrice ? oneDayBackPrice : 0).toString(),
                pricePercentChange,
              }),
        )
      } finally {
        fetchingETHPrice = false
      }
    }
    checkForEthPrice()
  }, [dispatch, chainId, version, isEVM, elasticClient, classicClient, blockClient])

  return ethPrice
}

/**
 * Gets the current price of ZPX by ETH
 */
export const getZPXPriceByETH = async (chainId: ChainId, apolloClient: ApolloClient<NormalizedCacheObject>) => {
  let zpxPriceByETH = 0

  try {
    const result = await apolloClient.query({
      query: TOKEN_DERIVED_ETH(ZPX[chainId].address),
      fetchPolicy: 'no-cache',
    })

    const derivedETH = result?.data?.tokens[0]?.derivedETH

    zpxPriceByETH = parseFloat(derivedETH) || 0
  } catch (e) {
    console.log(e)
  }

  return zpxPriceByETH
}

export function useZPXPrice(): AppState['application']['zpxPrice'] {
  const dispatch = useDispatch()
  const ethPrice = useETHPrice()
  const { isEVM, chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const { classicClient } = useZuluSwapConfig()

  const zpxPrice = useSelector((state: AppState) => state.application.zpxPrice)

  useEffect(() => {
    if (!isEVM) return
    async function checkForZPXPrice() {
      const zpxPriceByETH = await getZPXPriceByETH(chainId, classicClient)
      const zpxPrice = ethPrice.currentPrice && zpxPriceByETH * parseFloat(ethPrice.currentPrice)
      dispatch(updateZPXPrice(zpxPrice?.toString()))
    }
    checkForZPXPrice()
  }, [zpxPrice, dispatch, ethPrice.currentPrice, isEVM, classicClient, chainId, blockNumber])

  return zpxPrice
}

/**
 * Gets the current price of ZPX by ETH
 */
const getTokenPriceByETH = async (tokenAddress: string, apolloClient: ApolloClient<NormalizedCacheObject>) => {
  let tokenPriceByETH = 0

  try {
    const result = await apolloClient.query({
      query: TOKEN_DERIVED_ETH(tokenAddress),
      fetchPolicy: 'no-cache',
    })

    const derivedETH = result?.data?.tokens[0]?.derivedETH

    tokenPriceByETH = parseFloat(derivedETH)

    const temp = OUTSITE_FARM_REWARDS_QUERY[tokenAddress]
    if (temp) {
      const res = await fetch(temp.subgraphAPI, {
        method: 'POST',
        body: JSON.stringify({
          query: temp.query,
        }),
      }).then(res => res.json())

      const derivedETH = res?.data?.tokens[0]?.derivedBNB

      tokenPriceByETH = parseFloat(derivedETH)
    }
  } catch (e) {
    console.log(e)
  }

  return tokenPriceByETH
}

const cache: { [key: string]: number } = {}

export function useTokensPrice(tokens: (Token | NativeCurrency | null | undefined)[], version?: string): number[] {
  const ethPrice = useETHPrice(version)

  const { chainId, isEVM } = useActiveWeb3React()
  const [prices, setPrices] = useState<number[]>([])
  const { elasticClient, classicClient } = useZuluSwapConfig()

  const ethPriceParsed = ethPrice?.currentPrice ? parseFloat(ethPrice.currentPrice) : undefined

  useEffect(() => {
    if (!isEVM) return
    const client = version !== VERSION.ELASTIC ? classicClient : elasticClient

    async function checkForTokenPrice() {
      const tokensPrice = tokens.map(async token => {
        if (!token) {
          return 0
        }

        if (!ethPriceParsed) {
          return 0
        }

        if (token.isNative || token?.address === ZERO_ADDRESS) {
          return ethPriceParsed
        }

        const key = `${token.address}_${chainId}_${version}`
        if (cache[key]) return cache[key]

        const tokenPriceByETH = await getTokenPriceByETH(token?.address, client)
        const tokenPrice = tokenPriceByETH * ethPriceParsed

        if (tokenPrice) cache[key] = tokenPrice

        return tokenPrice || 0
      })

      const result = await Promise.all(tokensPrice)

      setPrices(result)
    }

    checkForTokenPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethPriceParsed, chainId, isEVM, elasticClient, classicClient, JSON.stringify(tokens), version])

  return prices
}

export const useServiceWorkerRegistration = () => {
  return useAppSelector(state => state.application.serviceWorkerRegistration)
}

type DetailAnnouncementParam = {
  selectedIndex: number | null
  hasMore?: boolean
  announcements?: AnnouncementTemplatePopup[]
}

export const useDetailAnnouncement = (): [DetailAnnouncementParam, (v: DetailAnnouncementParam) => void] => {
  const announcementDetail = useAppSelector(state => state.application.notification?.announcementDetail)
  const dispatch = useDispatch()
  const setDetail = useCallback(
    (data: DetailAnnouncementParam) => {
      dispatch(setAnnouncementDetail({ ...announcementDetail, ...data }))
    },
    [dispatch, announcementDetail],
  )
  return [announcementDetail, setDetail]
}

const cacheConfig: {
  rpc: { [rpc: string]: ethers.providers.JsonRpcProvider }
  client: { [subgraphLink: string]: ApolloClient<NormalizedCacheObject> }
} = {
  rpc: {},
  client: {},
}

const cacheCalc: <T extends keyof typeof cacheConfig, U extends typeof cacheConfig[T][string]>(
  type: T,
  value: string,
  fallback: (value: string) => U,
) => U = <T extends keyof typeof cacheConfig, U extends typeof cacheConfig[T][string]>(
  type: T,
  value: string,
  fallback: (value: string) => U,
) => {
  if (!cacheConfig[type][value]) {
    cacheConfig[type][value] = fallback(value)
  }
  return cacheConfig[type][value] as U
}

function getDefaultConfig(chainId: ChainId) {
  const evm = isEVM(chainId)
  return {
    rpc: NETWORKS_INFO[chainId].defaultRpcUrl,
    prochart: false,
    blockSubgraph: (evm ? NETWORKS_INFO[chainId] : ethereumInfo).defaultBlockSubgraph,
    elasticSubgraph: (evm ? NETWORKS_INFO[chainId] : ethereumInfo).elastic.defaultSubgraph,
    classicSubgraph: (evm ? NETWORKS_INFO[chainId] : ethereumInfo).classic.defaultSubgraph,
  }
}

type ZuluSwapConfig = {
  rpc: string
  prochart: boolean
  blockClient: ApolloClient<NormalizedCacheObject>
  classicClient: ApolloClient<NormalizedCacheObject>
  elasticClient: ApolloClient<NormalizedCacheObject>
  provider: ethers.providers.JsonRpcProvider | undefined
  connection: Connection | undefined
}

export const useZuluSwapConfig = (customChainId?: ChainId): ZuluSwapConfig => {
  const storeChainId = useAppSelector(state => state.user.chainId) || ChainId.MAINNET
  const chainId = customChainId || storeChainId

  const config = useAppSelector(state => state.application.config[chainId] || getDefaultConfig(chainId))

  const provider = useMemo(
    () => cacheCalc('rpc', config.rpc, subgraph => new ethers.providers.JsonRpcProvider(subgraph)),
    [config.rpc],
  )
  const blockClient = useMemo(
    () => cacheCalc('client', config.blockSubgraph, subgraph => createClient(subgraph)),
    [config.blockSubgraph],
  )
  const classicClient = useMemo(
    () => cacheCalc('client', config.classicSubgraph, subgraph => createClient(subgraph)),
    [config.classicSubgraph],
  )
  const elasticClient = useMemo(
    () => cacheCalc('client', config.elasticSubgraph, subgraph => createClient(subgraph)),
    [config.elasticSubgraph],
  )

  return useMemo(() => {
    return {
      rpc: config.rpc,
      provider,
      prochart: config.prochart,
      blockClient,
      elasticClient,
      classicClient,
      connection: isSolana(chainId) ? new Connection(config.rpc, { commitment: 'confirmed' }) : undefined,
    }
  }, [chainId, provider, elasticClient, blockClient, classicClient, config.rpc, config.prochart])
}
