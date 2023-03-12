import { Trans } from '@lingui/macro'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import Column from 'components/Column'
import LightBulb from 'components/Icons/LightBulb'
import StakeIcon from 'components/Icons/Stake'
import VoteIcon from 'components/Icons/Vote'
import { APP_PATHS } from 'constants/index'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'

import { DropdownTextAnchor, StyledNavExternalLink, StyledNavLink } from '../styleds'
import NavGroup from './NavGroup'

const ZuluDaoWrapper = styled.span`
  display: inline-flex;
  @media (max-width: 1040px) {
    display: none;
  }
`

const ZuluDAONavGroup = () => {
  const { pathname } = useLocation()
  const isActive = pathname.includes(APP_PATHS.ZULUDAO_STAKE)
  const { mixpanelHandler } = useMixpanel()

  return (
    <ZuluDaoWrapper>
      <NavGroup
        isActive={isActive}
        anchor={
          <DropdownTextAnchor>
            <Trans>ZuluDAO</Trans>
          </DropdownTextAnchor>
        }
        dropdownContent={
          <Column>
            <StyledNavLink id={`zuludao-stake-zpx`} to={APP_PATHS.ZULUDAO_STAKE} style={{ gap: '4px' }}>
              <StakeIcon />
              <Trans>Stake ZPX</Trans>
            </StyledNavLink>
            <StyledNavLink id={`zuludao-vote`} to={APP_PATHS.ZULUDAO_VOTE} style={{ gap: '4px' }}>
              <VoteIcon />
              <Trans>Vote</Trans>
            </StyledNavLink>
            <StyledNavExternalLink
              id={`zuludao-feature-request`}
              href={'https://zuluswap.canny.io/feature-request'}
              target="_blank"
              style={{ gap: '4px' }}
              onClick={() => {
                mixpanelHandler(MIXPANEL_TYPE.ZULU_DAO_FEATURE_REQUEST_CLICK)
              }}
            >
              <LightBulb />
              <Trans>Feature Request</Trans>
            </StyledNavExternalLink>
          </Column>
        }
      />
    </ZuluDaoWrapper>
  )
}

export default ZuluDAONavGroup
