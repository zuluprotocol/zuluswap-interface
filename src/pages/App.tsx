import { datadogRum } from '@datadog/browser-rum'
import { ChainId } from '@zuluswap/zs-sdk-core'
import { Trans } from '@lingui/macro'
import * as Sentry from '@sentry/react'
import { Suspense, lazy, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { AlertTriangle } from 'react-feather'
import { Route, Routes } from 'react-router-dom'
import { useNetwork, usePrevious } from 'react-use'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import snow from 'assets/images/snow.png'
import Popups from 'components/Announcement/Popups'
import TopBanner from 'components/Announcement/Popups/TopBanner'
import AppHaveUpdate from 'components/AppHaveUpdate'
import ErrorBoundary from 'components/ErrorBoundary'
import Footer from 'components/Footer/Footer'
import Header from 'components/Header'
import Loader from 'components/LocalLoader'
import Modal from 'components/Modal'
import Snowfall from 'components/Snowflake/Snowfall'
import Web3ReactManager from 'components/Web3ReactManager'
import { APP_PATHS, BLACKLIST_WALLETS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { useGlobalMixpanelEvents } from 'hooks/useMixpanel'
import { useSyncNetworkParamWithStore } from 'hooks/useSyncNetworkParamWithStore'
import useTheme from 'hooks/useTheme'
import VerifyComponent from 'pages/Verify/VerifyComponent'
import { useHolidayMode } from 'state/user/hooks'
import DarkModeQueryParamReader from 'theme/DarkModeQueryParamReader'
import { getLimitOrderContract, isAddressString, shortenAddress } from 'utils'

import { RedirectDuplicateTokenIds } from './AddLiquidityV2/redirects'
import { RedirectPathToFarmNetwork } from './Farm/redirect'
import { RedirectPathToMyPoolsNetwork } from './Pool/redirect'
import { RedirectPathToPoolsNetwork } from './Pools/redirect'
import { RedirectPathToSwapV3Network } from './SwapV3/redirects'
import Verify from './Verify'

// Route-based code splitting

const SwapV2 = lazy(() => import(/* webpackChunkName: 'swapv2-page' */ './SwapV2'))
const SwapV3 = lazy(() => import(/* webpackChunkName: 'swapv3-page' */ './SwapV3'))
const Bridge = lazy(() => import(/* webpackChunkName: 'bridge-page' */ './Bridge'))
const Pools = lazy(() => import(/* webpackChunkName: 'pools-page' */ './Pools'))
const Pool = lazy(() => import(/* webpackChunkName: 'my-pool-page' */ './Pool'))

const Farm = lazy(() => import(/* webpackChunkName: 'yield-page' */ './Farm'))

const PoolFinder = lazy(() => import(/* webpackChunkName: 'pool-finder-page' */ './PoolFinder'))
const CreatePool = lazy(() => import(/* webpackChunkName: 'create-pool-page' */ './CreatePool'))
const ProAmmRemoveLiquidity = lazy(
  () => import(/* webpackChunkName: 'elastic-remove-liquidity-page' */ './RemoveLiquidityProAmm'),
)
const RedirectCreatePoolDuplicateTokenIds = lazy(
  () =>
    import(
      /* webpackChunkName: 'redirect-create-pool-duplicate-token-ids-page' */ './CreatePool/RedirectDuplicateTokenIds'
    ),
)
const RedirectOldCreatePoolPathStructure = lazy(
  () =>
    import(
      /* webpackChunkName: 'redirect-old-create-pool-path-structure-page' */ './CreatePool/RedirectOldCreatePoolPathStructure'
    ),
)

const AddLiquidity = lazy(() => import(/* webpackChunkName: 'add-liquidity-page' */ './AddLiquidity'))
const IncreaseLiquidity = lazy(() => import(/* webpackChunkName: 'add-liquidity-page' */ './IncreaseLiquidity'))

const RemoveLiquidity = lazy(() => import(/* webpackChunkName: 'remove-liquidity-page' */ './RemoveLiquidity'))

const ZuluDAOStakeZPX = lazy(() => import(/* webpackChunkName: 'stake-zpx' */ './ZuluDAO/StakeZPX'))
const ZuluDAOVote = lazy(() => import(/* webpackChunkName: 'vote' */ './ZuluDAO/Vote'))
const AboutZuluSwap = lazy(() => import(/* webpackChunkName: 'about-page' */ './About/AboutZuluSwap'))
const AboutZPX = lazy(() => import(/* webpackChunkName: 'about-zpx' */ './About/AboutZPX'))

const CreateReferral = lazy(() => import(/* webpackChunkName: 'create-referral-page' */ './CreateReferral'))

const TrueSight = lazy(() => import(/* webpackChunkName: 'true-sight-page' */ './TrueSight'))

const BuyCrypto = lazy(() => import(/* webpackChunkName: 'true-sight-page' */ './BuyCrypto'))

const Campaign = lazy(() => import(/* webpackChunkName: 'campaigns-page' */ './Campaign'))
const GrantProgramPage = lazy(() => import(/* webpackChunkName: 'grant-program-page' */ './GrantProgram'))

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  z-index: 3;
`

const BodyWrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  align-items: center;
  min-height: calc(100vh - 148px);
  flex: 1;

  ${isMobile && `overflow-x: hidden;`}
`

const SwapPage = () => {
  const { chainId } = useActiveWeb3React()
  useSyncNetworkParamWithStore()

  return (
    <>
      <VerifyComponent />
      {chainId === ChainId.SOLANA ? <SwapV2 /> : <SwapV3 />}
    </>
  )
}

export default function App() {
  const { account, chainId, networkInfo } = useActiveWeb3React()

  const { online } = useNetwork()
  const prevOnline = usePrevious(online)

  useEffect(() => {
    if (prevOnline === false && online && account) {
      // refresh page when network back to normal to prevent some issues: ex: stale data, ...
      window.location.reload()
    }
  }, [online, prevOnline, account])

  useEffect(() => {
    if (account) {
      Sentry.setUser({ id: account })
      datadogRum.setUser({ id: account })
    }
  }, [account])

  useEffect(() => {
    if (chainId) {
      Sentry.setTags({
        chainId: chainId,
        network: networkInfo.name,
      })
      datadogRum.setGlobalContext({
        chainId,
        networkName: networkInfo.name,
      })
    }
  }, [chainId, networkInfo.name])

  const theme = useTheme()

  useGlobalMixpanelEvents()
  const { pathname } = window.location
  const showFooter = !pathname.includes(APP_PATHS.ABOUT)
  const [holidayMode] = useHolidayMode()

  const snowflake = new Image()
  snowflake.src = snow

  return (
    <ErrorBoundary>
      <AppHaveUpdate />
      {(BLACKLIST_WALLETS.includes(isAddressString(chainId, account)) ||
        BLACKLIST_WALLETS.includes(account?.toLowerCase() || '')) && (
        <Modal
          isOpen
          onDismiss={function (): void {
            //
          }}
          maxWidth="600px"
          width="80vw"
        >
          <Flex flexDirection="column" padding="24px" width="100%">
            <Flex alignItems="center">
              <AlertTriangle color={theme.red} />
              <Text fontWeight="500" fontSize={24} color={theme.red} marginLeft="8px">
                <Trans>Warning</Trans>
              </Text>
            </Flex>
            <Text marginTop="24px" fontSize="14px" lineHeight={2}>
              The US Treasury&apos;s OFAC has published a list of addresses associated with Tornado Cash. Your wallet
              address below is flagged as one of the addresses on this list, provided by our compliance vendor. As a
              result, it is blocked from using ZuluSwap and all of its related services at this juncture.
            </Text>
            <Flex
              marginTop="24px"
              padding="12px"
              backgroundColor={theme.buttonBlack}
              sx={{ borderRadius: '12px' }}
              flexDirection="column"
            >
              <Text>Your wallet address</Text>
              <Text color={theme.subText} fontSize={20} marginTop="12px" fontWeight="500">
                {isMobile ? shortenAddress(chainId, account || '', 10) : account}
              </Text>
            </Flex>
          </Flex>
        </Modal>
      )}

      {(!account || !BLACKLIST_WALLETS.includes(account)) && (
        <>
          <AppWrapper>
            <TopBanner />
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            <Suspense fallback={<Loader />}>
              {holidayMode && (
                <Snowfall
                  speed={[0.5, 1]}
                  wind={[-0.5, 0.25]}
                  snowflakeCount={isMobile ? 13 : 31}
                  images={[snowflake]}
                  radius={[5, 15]}
                />
              )}

              <BodyWrapper>
                <Popups />
                <Web3ReactManager>
                  <Routes>
                    <Route element={<DarkModeQueryParamReader />} />

                    <Route path={`${APP_PATHS.SWAP}/:network/:fromCurrency-to-:toCurrency`} element={<SwapPage />} />
                    <Route path={`${APP_PATHS.SWAP}/:network/:fromCurrency`} element={<SwapPage />} />
                    <Route path={`${APP_PATHS.SWAP}/:network`} element={<SwapPage />} />

                    {getLimitOrderContract(chainId) && (
                      <>
                        <Route
                          path={`${APP_PATHS.LIMIT}/:network/:fromCurrency-to-:toCurrency`}
                          element={<SwapPage />}
                        />
                        <Route path={`${APP_PATHS.LIMIT}/:network/:fromCurrency`} element={<SwapPage />} />
                        <Route path={`${APP_PATHS.LIMIT}/:network`} element={<SwapPage />} />
                      </>
                    )}

                    <Route path={`${APP_PATHS.FIND_POOL}`} element={<PoolFinder />} />
                    <Route path={`${APP_PATHS.POOLS}/:network`} element={<Pools />} />
                    <Route path={`${APP_PATHS.POOLS}/:network/:currencyIdA`} element={<Pools />} />
                    <Route path={`${APP_PATHS.POOLS}`} element={<RedirectPathToPoolsNetwork />} />
                    <Route path={`${APP_PATHS.POOLS}/:network/:currencyIdA/:currencyIdB`} element={<Pools />} />
                    <Route path={`${APP_PATHS.FARMS}/:network`} element={<Farm />} />
                    <Route path={`${APP_PATHS.FARMS}`} element={<RedirectPathToFarmNetwork />} />
                    <Route path={`${APP_PATHS.MY_POOLS}/:network`} element={<Pool />} />
                    <Route path={`${APP_PATHS.MY_POOLS}`} element={<RedirectPathToMyPoolsNetwork />} />

                    <Route path={`${APP_PATHS.CLASSIC_CREATE_POOL}`} element={<CreatePool />} />
                    <Route
                      path={`${APP_PATHS.CLASSIC_CREATE_POOL}/:currencyIdA`}
                      element={<RedirectOldCreatePoolPathStructure />}
                    />
                    <Route
                      path={`${APP_PATHS.CLASSIC_CREATE_POOL}/:currencyIdA/:currencyIdB`}
                      element={<RedirectCreatePoolDuplicateTokenIds />}
                    />

                    <Route path={`${APP_PATHS.CLASSIC_ADD_LIQ}/:currencyIdA/`} element={<AddLiquidity />} />
                    <Route path={`${APP_PATHS.CLASSIC_ADD_LIQ}/:currencyIdA/:currencyIdB`} element={<AddLiquidity />} />
                    <Route
                      path={`${APP_PATHS.CLASSIC_ADD_LIQ}/:currencyIdA/:currencyIdB/:pairAddress`}
                      element={<AddLiquidity />}
                    />

                    <Route
                      path={`${APP_PATHS.CLASSIC_REMOVE_POOL}/:currencyIdA/:currencyIdB/:pairAddress`}
                      element={<RemoveLiquidity />}
                    />
                    <Route path={`${APP_PATHS.ELASTIC_REMOVE_POOL}/:tokenId`} element={<ProAmmRemoveLiquidity />} />

                    <Route path={`${APP_PATHS.ELASTIC_CREATE_POOL}/`} element={<RedirectDuplicateTokenIds />} />
                    <Route
                      path={`${APP_PATHS.ELASTIC_CREATE_POOL}/:currencyIdA`}
                      element={<RedirectDuplicateTokenIds />}
                    />
                    <Route
                      path={`${APP_PATHS.ELASTIC_CREATE_POOL}/:currencyIdA/:currencyIdB`}
                      element={<RedirectDuplicateTokenIds />}
                    />
                    <Route
                      path={`${APP_PATHS.ELASTIC_CREATE_POOL}/:currencyIdA/:currencyIdB/:feeAmount`}
                      element={<RedirectDuplicateTokenIds />}
                    />

                    <Route
                      path={`${APP_PATHS.ELASTIC_INCREASE_LIQ}/:currencyIdA/:currencyIdB/:feeAmount/:tokenId`}
                      element={<IncreaseLiquidity />}
                    />
                    <Route path={`${APP_PATHS.ZULUDAO_STAKE}`} element={<ZuluDAOStakeZPX />} />
                    <Route path={`${APP_PATHS.ZULUDAO_VOTE}`} element={<ZuluDAOVote />} />
                    <Route path={`${APP_PATHS.ABOUT}/zuluswap`} element={<AboutZuluSwap />} />
                    <Route path={`${APP_PATHS.ABOUT}/zpx`} element={<AboutZPX />} />
                    <Route path={`${APP_PATHS.REFERRAL}`} element={<CreateReferral />} />
                    <Route path={`${APP_PATHS.DISCOVER}`} element={<TrueSight />} />
                    <Route path={`${APP_PATHS.BUY_CRYPTO}`} element={<BuyCrypto />} />
                    <Route path={`${APP_PATHS.CAMPAIGN}`} element={<Campaign />} />
                    <Route path={`${APP_PATHS.CAMPAIGN}/:slug`} element={<Campaign />} />
                    <Route path={`${APP_PATHS.BRIDGE}`} element={<Bridge />} />
                    <Route path={`${APP_PATHS.VERIFY_EXTERNAL}`} element={<Verify />} />
                    <Route path={`${APP_PATHS.GRANT_PROGRAMS}`} element={<GrantProgramPage />} />
                    <Route path={`${APP_PATHS.GRANT_PROGRAMS}/:slug`} element={<GrantProgramPage />} />

                    <Route path="*" element={<RedirectPathToSwapV3Network />} />
                  </Routes>
                </Web3ReactManager>
              </BodyWrapper>
              {showFooter && <Footer />}
            </Suspense>
          </AppWrapper>
        </>
      )}
    </ErrorBoundary>
  )
}
