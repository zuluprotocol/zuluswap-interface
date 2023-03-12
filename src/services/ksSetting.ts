import { ChainId } from '@zuluswap/zs-sdk-core'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { KS_SETTING_API } from 'constants/env'

export type ZuluswapConfigurationResponse = {
  data: {
    config: {
      prochart: boolean
      rpc: string
      blockSubgraph: string
      classicSubgraph: string
      elasticSubgraph: string
    }
  }
}

export type ZuluswapGlobalConfigurationResponse = {
  data: {
    config: {
      aggregator: string
    }
  }
}

const ksSettingApi = createApi({
  reducerPath: 'ksSettingConfigurationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${KS_SETTING_API}/v1`,
  }),
  endpoints: builder => ({
    getZuluswapConfiguration: builder.query<ZuluswapConfigurationResponse, { chainId: ChainId }>({
      query: ({ chainId }) => ({
        url: '/configurations/fetch',
        params: {
          serviceCode: `zuluswap-${chainId}`,
        },
      }),
    }),

    getZuluswapGlobalConfiguration: builder.query<ZuluswapGlobalConfigurationResponse, void>({
      query: () => ({
        url: '/configurations/fetch',
        params: {
          serviceCode: `zuluswap`,
        },
      }),
    }),
  }),
})

export const { useLazyGetZuluswapConfigurationQuery, useGetZuluswapGlobalConfigurationQuery } = ksSettingApi

export default ksSettingApi
