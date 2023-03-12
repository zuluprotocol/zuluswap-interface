import { commify, formatUnits } from '@ethersproject/units'
import { Trans } from '@lingui/macro'
import { isMobile } from 'react-device-detect'
import Skeleton from 'react-loading-skeleton'
import { NavLink, useNavigate } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'

import bgimg from 'assets/images/about_background.png'
import governancePNG from 'assets/images/zuludao/governance.png'
import zpxUtilityPNG from 'assets/images/zuludao/zpx_utility.png'
import zuluCrystal from 'assets/images/zuludao/zulu_crystal.png'
import zuludaoPNG from 'assets/images/zuludao/zuludao.png'
import migratePNG from 'assets/images/zuludao/migrate.png'
import stakevotePNG from 'assets/images/zuludao/stake_vote.png'
import { ButtonLight, ButtonPrimary } from 'components/Button'
import Divider from 'components/Divider'
import Row, { RowBetween, RowFit } from 'components/Row'
import { APP_PATHS } from 'constants/index'
import { useStakingInfo } from 'hooks/zuludao'
import useTotalVotingReward from 'hooks/zuludao/useTotalVotingRewards'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { ApplicationModal } from 'state/application/actions'
import { useToggleModal } from 'state/application/hooks'
import { ExternalLink } from 'theme'

import ZPXLogo from '../zpxLogo'
import StakeZPXComponent from './StakeZPXComponent'
import { useSwitchToEthereum } from './SwitchToEthereumModal'

const Wrapper = styled.div`
  width: 100%;
  background-image: url(${bgimg}), url(${bgimg});
  background-size: 100% auto;
  background-repeat: no-repeat, no-repeat;
  z-index: 1;
  background-color: transparent, transparent;
  background-position: top, bottom;
`
const Container = styled.div`
  margin: auto;
  width: 1224px;
  min-height: 1100px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  gap: 40px;
  padding-top: 60px;
  padding-bottom: 160px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
    width: 100%;
    align-items: center;
    align-content: center;
  `}
`

const Information = styled.div`
  display: flex;
  flex-direction: column;
  width: 772px;
  order: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100vw;
    padding: 0 16px;
  `}
`
const CardGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 772px;
  order: 3;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100vw;
    padding: 0 16px;
  `}
`
const Card = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  gap: 12px;
  width: 100%;
  padding: 24px 16px;
`
const Image = styled.img`
  height: 44px;
  width: 44px;
`
const ZuluImageWrapper = styled.div`
  width: 404px;
  display: flex;
  justify-content: center;
  order: 2;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none;
  `}
`
const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`

export default function StakeZPX() {
  const theme = useTheme()
  const toggleMigrationModal = useToggleModal(ApplicationModal.MIGRATE_ZPX)
  const { switchToEthereum } = useSwitchToEthereum()
  const { zpxPriceETH } = useTotalVotingReward()
  const { totalMigratedZPX } = useStakingInfo()
  const navigate = useNavigate()
  const { mixpanelHandler } = useMixpanel()
  const handleMigrateClick = () => {
    switchToEthereum().then(() => {
      toggleMigrationModal()
    })
  }
  return (
    <Wrapper>
      <Container>
        <Information>
          <RowBetween>
            <Text fontSize={24} lineHeight="28px" fontWeight={500}>
              <Trans>Stake ZPX</Trans>
            </Text>
            <RowFit gap="4px">
              <ZPXLogo size={20} />
              <Text fontSize={16}>ZPX: ${zpxPriceETH ? zpxPriceETH.toPrecision(4) : '--'}</Text>
            </RowFit>
          </RowBetween>
          <Divider margin={isMobile ? '20px 0' : '28px 0'} />
          <Text fontSize={16} lineHeight="24px" fontWeight={400} color={theme.subText} marginBottom="16px">
            <Trans>
              Zulu Network and its products like ZuluSwap are governed by the community through ZuluDAO, a
              Decentralized Autonomous Organization. ZPX holders stake ZPX tokens to vote on governance proposals that
              shape Zulu&lsquo;s future and earn ZPX rewards from trading fees.
            </Trans>
          </Text>
          <RowBetween align={isMobile ? 'flex-start' : 'center'} flexDirection={isMobile ? 'column' : 'row'} gap="12px">
            <Text fontSize={16} lineHeight="24px" fontWeight={400} color={theme.warning}>
              <Trans>Note: Staking ZPX is only available on Ethereum chain</Trans>
            </Text>
            <NavLink to={APP_PATHS.ABOUT + '/zpx'}>Read about ZPX ↗</NavLink>
          </RowBetween>
        </Information>
        <ZuluImageWrapper>
          <img src={zuluCrystal} alt="ZuluDAO" width="186px" />
        </ZuluImageWrapper>
        <CardGroup>
          <Card>
            <Image src={governancePNG} alt="DAO Governance" />
            <CardInfo>
              <Text fontSize={20} lineHeight="24px" fontWeight={500} color={theme.text}>
                <Trans>DAO Governance</Trans>
              </Text>
              <Text fontSize={12} lineHeight="16px" fontWeight={500} color={theme.subText}>
                <Trans>ZPX holders can stake their tokens to vote on proposals and receive rewards in ZPX. </Trans>{' '}
                <ExternalLink href={'https://docs.zuluswap.com/zulu-dao/zulu-dao-introduction'}>FAQ ↗</ExternalLink>
              </Text>
            </CardInfo>
          </Card>
          <Card>
            <Image src={stakevotePNG} alt="Stake + Vote" />
            <CardInfo>
              <Text fontSize={20} lineHeight="24px" fontWeight={500} color={theme.text}>
                <Trans>Stake + Vote</Trans>
              </Text>
              <Text fontSize={12} lineHeight="16px" fontWeight={500} color={theme.subText}>
                <Trans>The more you stake and vote, the more ZPX you will earn. </Trans>
              </Text>
            </CardInfo>
            <ButtonPrimary
              onClick={() => {
                mixpanelHandler(MIXPANEL_TYPE.ZULU_DAO_VOTE_CLICK)
                navigate('/zuludao/vote')
              }}
              width="120px"
              height="44px"
            >
              Vote
            </ButtonPrimary>
          </Card>
          <Card>
            <Image src={migratePNG} alt="Migrate" />
            <CardInfo>
              <Text fontSize={20} lineHeight="24px" fontWeight={500} color={theme.text}>
                <Trans>Migrate</Trans>
              </Text>
              <Row gap="4px">
                <Text fontSize={12} lineHeight="16px" fontWeight={500} textAlign="left" color={theme.subText}>
                  <Trans>Total ZPX migrated from ZPXL </Trans>
                </Text>
                {totalMigratedZPX ? (
                  <Text fontSize={12} lineHeight="16px">
                    {commify(formatUnits(totalMigratedZPX).split('.')[0]) + ' ZPX'}
                  </Text>
                ) : (
                  <div style={{ lineHeight: 1 }}>
                    <Skeleton
                      height="12px"
                      width="90px"
                      baseColor={theme.background}
                      highlightColor={theme.buttonGray}
                      borderRadius="1rem"
                      inline
                    />
                  </div>
                )}
              </Row>
            </CardInfo>
            <ButtonLight width="120px" height="44px" onClick={handleMigrateClick}>
              Migrate
            </ButtonLight>
          </Card>
          <Card>
            <Image src={zuludaoPNG} alt="ZuluDAO v1" />
            <CardInfo>
              <Text fontSize={20} lineHeight="24px" fontWeight={500} color={theme.text}>
                ZuluDAO v1
              </Text>
              <Text fontSize={12} lineHeight="16px" fontWeight={500} color={theme.subText}>
                <Trans>
                  You can access legacy ZuluDAO v1 to read about previous KIPs{' '}
                  <a href="https://legacy.zulu.org/vote" target="_blank" rel="noreferrer">
                    here ↗
                  </a>
                </Trans>
              </Text>
            </CardInfo>
          </Card>
          <Card>
            <Image src={zpxUtilityPNG} alt="ZPX Utility" />
            <CardInfo>
              <Text fontSize={20} lineHeight="24px" fontWeight={500} color={theme.text}>
                <Trans>ZPX Utility</Trans>
              </Text>
              <Text fontSize={12} lineHeight="16px" fontWeight={500} color={theme.subText}>
                <Trans>Coming soon</Trans>
              </Text>
            </CardInfo>
          </Card>
          <Text fontSize={12} lineHeight="14px" fontWeight={400} color={theme.subText} fontStyle="italic">
            <Trans>Note: Staking ZPX is only available on Ethereum chain</Trans>
          </Text>
        </CardGroup>
        <StakeZPXComponent />
      </Container>
    </Wrapper>
  )
}
