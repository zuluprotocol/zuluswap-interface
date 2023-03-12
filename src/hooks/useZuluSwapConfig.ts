/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from '@zuluswap/zs-sdk-core'
import { Connection } from '@solana/web3.js'
import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ZuluswapConfigurationResponse,
  ZuluswapGlobalConfigurationResponse,
  useGetZuluswapGlobalConfigurationQuery,
  useLazyGetZuluswapConfigurationQuery,
} from 'services/ksSetting'

import { AGGREGATOR_API } from 'constants/env'
import { NETWORKS_INFO, SUPPORTED_NETWORKS, isEVM, isSolana } from 'constants/networks'
import ethereumInfo from 'constants/networks/ethereum'
import solanaInfo from 'constants/networks/solana'
import { AppState } from 'state'
import { createClient } from 'utils/client'

type ZuluswapConfig = {
  rpc: string
  prochart: boolean
  blockClient: ApolloClient<NormalizedCacheObject>
  classicClient: ApolloClient<NormalizedCacheObject>
  elasticClient: ApolloClient<NormalizedCacheObject>
  provider: ethers.providers.JsonRpcProvider | undefined
  connection: Connection | undefined
}

const cacheRPC: { [chainId in ChainId]?: { [rpc: string]: ethers.providers.JsonRpcProvider } } = {}

const parseResponse = (
  responseData: ZuluswapConfigurationResponse | undefined,
  defaultChainId: ChainId,
): ZuluswapConfig => {
  const data = responseData?.data?.config
  const rpc = data?.rpc || NETWORKS_INFO[defaultChainId].defaultRpcUrl

  if (!cacheRPC[defaultChainId]?.[rpc]) {
    if (!cacheRPC[defaultChainId]) cacheRPC[defaultChainId] = {}
    cacheRPC[defaultChainId]![rpc] = new ethers.providers.JsonRpcProvider(rpc)
  }
  const provider = cacheRPC[defaultChainId]![rpc]

  return {
    rpc,
    prochart: data?.prochart || false,
    blockClient: isEVM(defaultChainId)
      ? createClient(data?.blockSubgraph || NETWORKS_INFO[defaultChainId].defaultBlockSubgraph)
      : createClient(ethereumInfo.defaultBlockSubgraph),
    classicClient: isEVM(defaultChainId)
      ? createClient(data?.classicSubgraph || NETWORKS_INFO[defaultChainId].classic.defaultSubgraph)
      : createClient(ethereumInfo.classic.defaultSubgraph),
    elasticClient: isEVM(defaultChainId)
      ? createClient(data?.elasticSubgraph || NETWORKS_INFO[defaultChainId].elastic.defaultSubgraph)
      : createClient(ethereumInfo.elastic.defaultSubgraph),
    provider: isEVM(defaultChainId) ? provider : undefined,
    connection: isSolana(defaultChainId)
      ? new Connection(data?.rpc || solanaInfo.defaultRpcUrl, { commitment: 'confirmed' })
      : undefined,
  }
}

type ZuluswapGlobalConfig = {
  aggregatorDomain: string
  aggregatorAPI: string
}

const parseGlobalResponse = (
  responseData: ZuluswapGlobalConfigurationResponse | undefined,
  chainId: ChainId,
): ZuluswapGlobalConfig => {
  const data = responseData?.data?.config
  const aggregatorDomain = data?.aggregator ?? AGGREGATOR_API
  return {
    aggregatorDomain,
    aggregatorAPI: `${aggregatorDomain}/${NETWORKS_INFO[chainId].aggregatorRoute}/route/encode`,
  }
}
export const useLazyZuluswapConfig = (): ((customChainId?: ChainId) => Promise<ZuluswapConfig>) => {
  const storeChainId = useSelector<AppState, ChainId>(state => state.user.chainId) || ChainId.MAINNET // read directly from store instead of useActiveWeb3React to prevent circular loop
  const [getZuluswapConfiguration] = useLazyGetZuluswapConfigurationQuery()
  const fetchZuluswapConfig = useCallback(
    async (customChainId?: ChainId) => {
      const chainId = customChainId ?? storeChainId
      try {
        const { data } = await getZuluswapConfiguration({ chainId: chainId })
        return parseResponse(data, chainId)
      } catch {
        return parseResponse(undefined, chainId)
      }
    },
    [getZuluswapConfiguration, storeChainId],
  )
  return fetchZuluswapConfig
}

export const useZuluswapGlobalConfig = () => {
  const chainId = useSelector<AppState, ChainId>(state => state.user.chainId) || ChainId.MAINNET // read directly from store instead of useActiveWeb3React to prevent circular loop
  const { data } = useGetZuluswapGlobalConfigurationQuery(undefined)
  const result = useMemo(() => parseGlobalResponse(data, chainId), [data, chainId])
  return result
}

export const useAllZuluswapConfig = (): {
  [chain in ChainId]: ZuluswapConfig
} => {
  const [allZuluswapConfig, setAllZuluswapConfig] = useState<
    | {
        [chain in ChainId]: ZuluswapConfig
      }
    | null
  >(null)
  const [getZuluswapConfiguration] = useLazyGetZuluswapConfigurationQuery()

  useEffect(() => {
    const run = async () => {
      const fetches = SUPPORTED_NETWORKS.map(async chainId => {
        try {
          const { data } = await getZuluswapConfiguration({ chainId })
          return {
            chainId,
            result: parseResponse(data, chainId),
          }
        } catch {
          return {
            chainId,
            result: parseResponse(undefined, chainId),
          }
        }
      })
      const results = await Promise.all(fetches)
      setAllZuluswapConfig(
        results.reduce(
          (acc, cur) => {
            acc[cur.chainId] = cur.result
            return acc
          },
          {} as {
            [chainId in ChainId]: ZuluswapConfig
          },
        ),
      )
    }
    run()
  }, [getZuluswapConfiguration])

  const defaultConfig = useMemo(
    () =>
      SUPPORTED_NETWORKS.reduce(
        (acc, cur) => {
          acc[cur] = parseResponse(undefined, cur)
          return acc
        },
        {} as {
          [chainId in ChainId]: ZuluswapConfig
        },
      ),
    [],
  )

  return allZuluswapConfig ?? defaultConfig
}
