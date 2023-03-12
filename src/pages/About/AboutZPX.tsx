import { Trans } from '@lingui/macro'
import { Archive, Repeat } from 'react-feather'
import { Link } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'

import GeckoterminalIcon from 'assets/images/geckoterminal_dark.png'
import GeckoterminalIconLight from 'assets/images/geckoterminal_light.png'
import ZPXGraphic from 'assets/images/zpx-graphic.png'
import CoinGecko from 'assets/svg/coingecko_color.svg'
import CoinGeckoLight from 'assets/svg/coingecko_color_light.svg'
import CoinMarketCap from 'assets/svg/coinmarketcap.svg'
import CoinMarketCapLight from 'assets/svg/coinmarketcap_light.svg'
import ZuluDaoLight from 'assets/svg/zulu-dao-light.svg'
import ZuluDao from 'assets/svg/zulu-dao.svg'
import RocketIcon from 'assets/svg/rocket.svg'
import TrophyIcon from 'assets/svg/trophy.svg'
import {
  Binance,
  Bithumb,
  Bitrue,
  Coinbase,
  Etoro,
  Gate,
  Gemini,
  Huobi,
  Kraken,
  Krystal,
  Kucoin,
  ZuluSwap,
  Mexc,
  Okx,
  TokyoCrypto,
  Upbit,
} from 'components/ExchangeIcons'
import { FooterSocialLink } from 'components/Footer/Footer'
import {
  Arbitrum,
  Avalanche,
  BestPrice,
  Binance as BinanceIcon,
  Bttc,
  Ethereum,
  OptimismLogo,
  Polygon,
} from 'components/Icons'
import { APP_PATHS } from 'constants/index'
import { useActiveWeb3React } from 'hooks/index'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { useDarkModeManager } from 'state/user/hooks'
import { ExternalLink, StyledInternalLink } from 'theme'

import {
  AboutPage,
  BtnPrimary,
  Exchange,
  ExchangeWrapper,
  Footer,
  FooterContainer,
  ForLiquidityProviderItem,
  GridWrapper,
  MoreInfoWrapper,
  SupportedChain,
  VerticalDivider,
  Wrapper,
} from './styleds'

const LIST_EXCHANGES = [
  { name: 'ZuluSwap', logo: <ZuluSwap /> },
  { name: 'Krystal', logo: <Krystal /> },
  { name: 'Binance', logo: <Binance /> },
  { name: 'Mexc', logo: <Mexc /> },
  { name: 'Etoro', logo: <Etoro /> },
  { name: 'Huobi', logo: <Huobi /> },
  { name: 'Upbit', logo: <Upbit /> },
  { name: 'Kraken', logo: <Kraken /> },
  { name: 'Kucoin', logo: <Kucoin /> },
  { name: 'Gate', logo: <Gate /> },
  { name: 'Coinbase', logo: <Coinbase width={160} /> },
  { name: 'Bithumb', logo: <Bithumb /> },
  { name: 'Gemini', logo: <Gemini /> },
  { name: 'Okx', logo: <Okx /> },
  { name: 'TokyoCrypto', logo: <TokyoCrypto /> },
  { name: 'Bitrue', logo: <Bitrue /> },
]

const LIST_WALLETS = [
  { logo: 'ledger', lightLogo: 'ledger_light' },
  { logo: 'metamask', lightLogo: 'metamask_light' },
  { logo: 'coin98', lightLogo: 'coin98' },
  { logo: 'krystal', lightLogo: 'krystal_light' },
  { logo: 'trezor', lightLogo: 'trezor_light' },
  { logo: 'mew', lightLogo: 'mew' },
  { logo: 'trust', lightLogo: 'trust_light' },
  { logo: 'enjin', lightLogo: 'enjin' },
  { logo: 'torus', lightLogo: 'torus' },
  { logo: 'argent', lightLogo: 'argent_light' },
  { logo: 'eidoo', lightLogo: 'eidoo' },
]

function AboutZPX() {
  const { networkInfo } = useActiveWeb3React()
  const theme = useTheme()
  const [isDarkMode] = useDarkModeManager()
  const above768 = useMedia('(min-width: 768px)')
  const above500 = useMedia('(min-width: 500px)')

  const { mixpanelHandler } = useMixpanel()

  const DynamicTokenModel = ({ width }: { width?: string }) => (
    <ForLiquidityProviderItem
      flexDirection="column"
      flex={1}
      alignItems={above768 ? 'flex-start' : 'center'}
      width={width}
      minHeight="360px"
    >
      <img width="64px" src={RocketIcon} alt="rocket_icon" />
      <Text
        marginTop="28px"
        fontWeight="500"
        fontSize="16"
        color={theme.primary}
        style={{ textTransform: 'uppercase' }}
      >
        <Trans>Dynamic Token Model</Trans>
      </Text>

      <Text color={theme.text} marginTop="24px" textAlign={above500 ? 'start' : 'center'} lineHeight={1.5}>
        <Trans>
          ZPX enables ZuluDAO to shape token behaviour and upgrades, making ZPX much more adaptable and providing
          better support for innovation and growth.
        </Trans>
      </Text>
    </ForLiquidityProviderItem>
  )

  const ParticipationRewards = ({ width }: { width?: string }) => (
    <ForLiquidityProviderItem
      flexDirection="column"
      flex={1}
      alignItems={above768 ? 'flex-start' : 'center'}
      width={width}
      minHeight="360px"
    >
      <img width="64px" src={TrophyIcon} alt="trophy_icon" />
      <Text
        marginTop="28px"
        fontWeight="500"
        fontSize="16"
        color={theme.primary}
        style={{ textTransform: 'uppercase' }}
      >
        <Trans>Participation Rewards</Trans>
      </Text>

      <Text color={theme.text} marginTop="24px" textAlign={above500 ? 'start' : 'center'} lineHeight={1.5}>
        <Trans>
          ZPX holders can stake ZPX in ZuluDAO and vote on important decisions. Voters receive trading fees generated
          on ZuluSwap and other benefits from ecosystem collaborations on Zulu.
        </Trans>
      </Text>
    </ForLiquidityProviderItem>
  )

  const LiquidityIncentitives = ({ width }: { width?: string }) => (
    <ForLiquidityProviderItem
      flexDirection="column"
      flex={1}
      alignItems={above768 ? 'flex-start' : 'center'}
      width={width}
      minHeight="360px"
    >
      <BestPrice size={64} />
      <Text marginTop="28px" fontWeight="500" color={theme.primary}>
        <Trans>LIQUIDITY INCENTIVES</Trans>
      </Text>

      <Text color={theme.text} marginTop="24px" textAlign={above500 ? 'start' : 'center'} lineHeight={1.5}>
        <Trans>
          ZuluDAO can propose various ZPX incentives like liquidity mining rewards on ZuluSwap on top of standard
          trading fees to provide more value to liquidity providers.
        </Trans>
      </Text>
    </ForLiquidityProviderItem>
  )

  return (
    <div
      style={{
        position: 'relative',
        background: isDarkMode ? theme.buttonBlack : theme.white,
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <AboutPage>
        <Wrapper>
          <Text as="h1" fontSize={['28px', '48px']} textAlign="center" lineHeight={['32px', '60px']} fontWeight="300">
            <Trans>
              Zulu Network Crystal{' '}
              <Text fontWeight="500" color={theme.primary} as="span">
                (ZPX)
              </Text>
            </Trans>
          </Text>

          <Text
            color={theme.text}
            fontSize={['1rem', '1.25rem']}
            marginTop={['40px', '48px']}
            textAlign="center"
            lineHeight={1.5}
          >
            <Trans>
              ZPX is a utility and governance token and an integral part of Zulu Network and its product ZuluSwap -
              the multi-chain decentralized exchange (DEX) protocol that provides the best rates for traders and
              maximizes earnings for liquidity providers.
            </Trans>
          </Text>

          <SupportedChain>
            <Ethereum />
            <Polygon />
            <BinanceIcon />
            <Avalanche />
            <Bttc />
            <Arbitrum />
            <OptimismLogo />
          </SupportedChain>

          <Text
            color={theme.primary}
            marginTop={['100px', '160px']}
            fontWeight="500"
            fontSize={'20px'}
            textAlign="center"
          >
            <Trans>TOKEN UTILITY</Trans>
          </Text>
          <Text as="h2" marginTop="12px" fontWeight="500" fontSize={['28px', '36px']} textAlign="center">
            <Trans>What is ZPX used for?</Trans>
          </Text>
          <Text color={theme.text} marginTop={['40px', '48px']} fontSize="1rem" textAlign="center" lineHeight={1.5}>
            <Trans>
              ZPX token holders can benefit from our flagship product ZuluSwap. Holders can stake their ZPX & vote on
              initiatives to receive trading fees generated on ZuluSwap! More trades on ZuluSwap can generate more
              rewards for ZPX holders!
              <br />
              <br />
              ZPX token is dynamic - it can be upgraded, minted or burned by ZuluDAO to better support liquidity and
              growth.
            </Trans>
          </Text>

          {above768 ? (
            <Flex sx={{ gap: '24px' }} marginTop={['40px', '48px']} flexDirection="row">
              <ParticipationRewards width="392px" />
              <DynamicTokenModel width="392px" />
              <LiquidityIncentitives width="392px" />
            </Flex>
          ) : (
            <GridWrapper>
              <ParticipationRewards />
              <DynamicTokenModel />
              <LiquidityIncentitives />
            </GridWrapper>
          )}

          <Flex
            justifyContent="center"
            width={above768 ? '236px' : '100%'}
            margin="auto"
            marginTop={['40px', '48px']}
            sx={{ gap: above768 ? '24px' : '16px' }}
          >
            <BtnPrimary
              width="216px"
              as={Link}
              to={APP_PATHS.SWAP + '/' + networkInfo.route}
              onClick={() => mixpanelHandler(MIXPANEL_TYPE.ABOUT_SWAP_CLICKED)}
            >
              <Repeat />
              <Text fontSize="16px" marginLeft="8px">
                <Trans>Swap Now</Trans>
              </Text>
            </BtnPrimary>
          </Flex>

          <Flex
            sx={{ gap: '24px' }}
            marginTop={['100px', '160px']}
            alignItems="center"
            flexDirection={above768 ? 'row' : 'column'}
          >
            <img
              width="85%"
              src={isDarkMode ? ZuluDao : ZuluDaoLight}
              alt="ZuluDao"
              style={{ display: above768 ? 'block' : 'none' }}
            />
            <Flex width="100%" flexDirection="column" height="max-content">
              <Text fontSize={['20px', '24px']} fontWeight={500} color={theme.primary}>
                <Trans>ZULU DAO</Trans>
              </Text>
              <Text as="h2" marginTop="12px" fontWeight="500" fontSize={['28px', '36px']}>
                <Trans>Stake ZPX, Vote, Earn Rewards.</Trans>
              </Text>
              <Text fontSize="16px" marginTop={['40px', '48px']} color={theme.text} lineHeight="24px" textAlign="left">
                <Trans>
                  ZuluDAO is a community platform that allows ZPX token holders to participate in governance. ZPX
                  holders can stake ZPX to vote on proposals. In return, they receive rewards from fees generated on
                  ZuluSwap through trading activities in Zulu Network.
                </Trans>
              </Text>
              <img
                width="100%"
                src={ZuluDao}
                alt="ZuluDao"
                style={{ display: above768 ? 'none' : 'block', marginTop: '40px' }}
              />

              <BtnPrimary
                width={above768 ? '236px' : '100%'}
                margin="40px 0 0"
                as={Link}
                to={APP_PATHS.ZULUDAO_STAKE}
                onClick={() => mixpanelHandler(MIXPANEL_TYPE.ABOUT_STAKE_ZPX_CLICKED)}
              >
                <Archive />
                <Text fontSize="16px" marginLeft="8px">
                  <Trans>Stake ZPX</Trans>
                </Text>
              </BtnPrimary>
            </Flex>
          </Flex>
          <Text
            as="h2"
            fontWeight="500"
            marginTop={above768 ? '160px' : '100px'}
            fontSize={['28px', '36px']}
            textAlign="center"
          >
            <Trans>Where you can buy ZPX</Trans>
          </Text>

          {above768 ? (
            <Exchange>
              {LIST_EXCHANGES.map(exchange => (
                <Flex key={exchange.name} margin="auto">
                  {exchange.logo}
                </Flex>
              ))}
            </Exchange>
          ) : (
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              modules={[Pagination]}
              loop={true}
              pagination={{
                clickable: true,
              }}
              style={{ marginTop: '24px' }}
            >
              {LIST_EXCHANGES.map(exchange => (
                <SwiperSlide key={exchange.name}>
                  <ExchangeWrapper>
                    <Flex margin="auto">{exchange.logo}</Flex>
                  </ExchangeWrapper>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <Text
            as="h2"
            fontWeight="500"
            marginTop={above768 ? '160px' : '100px'}
            fontSize={['28px', '36px']}
            textAlign="center"
          >
            <Trans>Where you can store ZPX</Trans>
          </Text>
          <Text fontSize="16px" marginTop={['40px', '48px']} color={theme.text} lineHeight="24px" textAlign="center">
            <Trans>
              ZPX is an ERC-20 token, so it can be stored in many Web3 wallets you control. Below are some examples.
            </Trans>
          </Text>

          {above768 ? (
            <Exchange>
              {LIST_WALLETS.map(wallet => (
                <img
                  key={wallet.logo}
                  src={require(`assets/wallets/${isDarkMode ? wallet.logo : wallet.lightLogo}.svg`).default}
                  alt={wallet.logo}
                  style={{ margin: 'auto' }}
                />
              ))}
            </Exchange>
          ) : (
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              modules={[Pagination]}
              loop={true}
              pagination={{
                clickable: true,
              }}
              style={{ marginTop: '24px' }}
            >
              {LIST_WALLETS.map(wallet => (
                <SwiperSlide key={wallet.logo}>
                  <ExchangeWrapper>
                    <img
                      src={require(`assets/wallets/${isDarkMode ? wallet.logo : wallet.lightLogo}.svg`).default}
                      alt={wallet.logo}
                      width="160px"
                      style={{ margin: 'auto' }}
                    />
                  </ExchangeWrapper>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <MoreInfoWrapper>
            <Flex
              marginRight={above768 ? '180px' : '0px'}
              alignItems={!above768 ? 'center' : 'flex-start'}
              flexDirection={'column'}
            >
              <Text as="h2" fontWeight="500" fontSize={['28px', '36px']}>
                <Trans>More information about ZPX is available on:</Trans>
              </Text>
              <Flex
                flexDirection={above768 ? 'row' : 'column'}
                marginTop="48px"
                style={{ gap: '48px', alignItems: 'center' }}
              >
                <ExternalLink href={`https://www.coingecko.com/en/coins/zulu-network-crystal`}>
                  <img src={isDarkMode ? CoinGecko : CoinGeckoLight} alt="CoinGecko" width="165px" />
                </ExternalLink>
                <ExternalLink href={`https://coinmarketcap.com/currencies/zulu-network-crystal-v2/`}>
                  <img src={isDarkMode ? CoinMarketCap : CoinMarketCapLight} alt="CoinMarketCap" width="227px" />
                </ExternalLink>
                <ExternalLink href="https://www.geckoterminal.com/eth/pools/0xa38a0165e82b7a5e8650109e9e54087a34c93020">
                  <img
                    src={isDarkMode ? GeckoterminalIcon : GeckoterminalIconLight}
                    alt="Geckoterminal"
                    width="235px"
                  />
                </ExternalLink>
              </Flex>
            </Flex>
            <img width={above768 ? '218px' : '287px'} src={ZPXGraphic} alt="ZPXGraphic" />
          </MoreInfoWrapper>
        </Wrapper>
      </AboutPage>
      <Footer background={isDarkMode ? theme.background : theme.white}>
        <FooterContainer>
          <Flex flexWrap="wrap" sx={{ gap: '12px' }} justifyContent="center">
            <ExternalLink href={`https://docs.zuluswap.com`}>
              <Trans>Docs</Trans>
            </ExternalLink>
            <VerticalDivider />
            <ExternalLink href={`https://github.com/ZuluNetwork`}>
              <Trans>Github</Trans>
            </ExternalLink>
            <VerticalDivider />
            <ExternalLink href={`https://zulu.org`}>ZuluDAO</ExternalLink>
            <VerticalDivider />
            <ExternalLink href={`https://gov.zulu.org`}>
              <Trans>Forum</Trans>
            </ExternalLink>
            {!above500 ? <div /> : <VerticalDivider />}
            <ExternalLink href={`https://zulu.network`}>Zulu Network</ExternalLink>
            <VerticalDivider />
            <StyledInternalLink to={`/about/zpx`}>ZPX</StyledInternalLink>
          </Flex>
          <FooterSocialLink />
        </FooterContainer>
      </Footer>
    </div>
  )
}

export default AboutZPX
