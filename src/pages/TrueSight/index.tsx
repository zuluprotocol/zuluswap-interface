import { ChainId } from '@zuluswap/zs-sdk-core'
import { Trans } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'

import SubscribeNotificationButton from 'components/SubscribeButton'
import { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useParsedQueryString from 'hooks/useParsedQueryString'
import useTheme from 'hooks/useTheme'
import TrendingHero from 'pages/TrueSight/TrendingHero'
import TrendingSoonHero from 'pages/TrueSight/TrendingSoonHero'
import TrueSightTab from 'pages/TrueSight/TrueSightTab'
import FilterBar from 'pages/TrueSight/components/FilterBar'
import TrendingLayout from 'pages/TrueSight/components/TrendingLayout'
import TrendingSoonLayout from 'pages/TrueSight/components/TrendingSoonLayout'
import { TrueSightTokenData } from 'pages/TrueSight/hooks/useGetTrendingSoonData'
import { TrueSightPageWrapper } from 'pages/TrueSight/styled'

export enum TrueSightTabs {
  TRENDING_SOON = 'trending_soon',
  TRENDING = 'trending',
}

export enum TrueSightChartCategory {
  TRADING_VOLUME,
  PRICE,
}

export enum TrueSightTimeframe {
  ONE_DAY = '1D',
  ONE_WEEK = '7D',
}

export interface TrueSightFilter {
  isShowTrueSightOnly: boolean
  timeframe: TrueSightTimeframe
  selectedTag: string | undefined
  selectedTokenData: TrueSightTokenData | undefined
  selectedNetwork: ChainId | undefined
}

export interface TrueSightSortSettings {
  sortBy: 'rank' | 'name' | 'discovered_on'
  sortDirection: 'asc' | 'desc'
}

export default function TrueSight() {
  const navigate = useNavigate()
  const { tab } = useParsedQueryString()
  const [activeTab, setActiveTab] = useState<TrueSightTabs>()

  const [filter, setFilter] = useState<TrueSightFilter>({
    isShowTrueSightOnly: false,
    timeframe: TrueSightTimeframe.ONE_DAY,
    selectedTag: undefined,
    selectedTokenData: undefined,
    selectedNetwork: undefined,
  })
  const [sortSettings, setSortSettings] = useState<TrueSightSortSettings>({ sortBy: 'rank', sortDirection: 'asc' })

  useEffect(() => {
    if (tab === undefined) {
      navigate({ search: '?tab=' + TrueSightTabs.TRENDING_SOON })
    } else {
      setActiveTab(tab as TrueSightTabs)
      setFilter({
        isShowTrueSightOnly: false,
        timeframe: TrueSightTimeframe.ONE_DAY,
        selectedTag: undefined,
        selectedTokenData: undefined,
        selectedNetwork: undefined,
      })
      setSortSettings({ sortBy: 'rank', sortDirection: 'asc' })
    }
  }, [navigate, tab])

  const theme = useTheme()

  const upTo992 = useMedia('(max-width: 992px)')

  const subscribeContent = (
    <Flex
      sx={{ gap: upTo992 ? '8px' : '12px', borderBottom: upTo992 ? `1px solid ${theme.border}` : 0 }}
      alignItems="center"
      justifyContent="space-between"
      paddingY={upTo992 ? '16px' : 0}
    >
      <Text textAlign={upTo992 ? 'start' : 'end'} fontSize="10px">
        <Trans>Tired of missing out on tokens that could be Trending Soon?</Trans>
        <br />
        <Text fontWeight="500">Subscribe now to receive email notifications!</Text>
      </Text>
      <SubscribeNotificationButton trackingEvent={MIXPANEL_TYPE.DISCOVER_CLICK_SUBSCRIBE_TRENDING_SOON} />
    </Flex>
  )

  return (
    <TrueSightPageWrapper>
      <Flex justifyContent="space-between" alignItems="center">
        <TrueSightTab activeTab={activeTab} />

        {!upTo992 && subscribeContent}
      </Flex>

      {activeTab === TrueSightTabs.TRENDING_SOON && (
        <>
          <div>
            <TrendingSoonHero />
            {upTo992 && subscribeContent}
          </div>
          <Flex
            flexDirection="column"
            sx={{
              gap: upTo992 ? undefined : '16px',
            }}
          >
            <FilterBar activeTab={TrueSightTabs.TRENDING_SOON} filter={filter} setFilter={setFilter} />
            <TrendingSoonLayout
              filter={filter}
              setFilter={setFilter}
              sortSettings={sortSettings}
              setSortSettings={setSortSettings}
            />
          </Flex>
        </>
      )}
      {activeTab === TrueSightTabs.TRENDING && (
        <>
          <div>
            <TrendingHero />
          </div>
          <Flex
            flexDirection="column"
            sx={{
              gap: upTo992 ? undefined : '16px',
            }}
          >
            <FilterBar activeTab={TrueSightTabs.TRENDING} filter={filter} setFilter={setFilter} />
            <TrendingLayout filter={filter} setFilter={setFilter} />
          </Flex>
        </>
      )}
    </TrueSightPageWrapper>
  )
}
