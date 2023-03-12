import { Trans } from '@lingui/macro'
import { useLocation } from 'react-router-dom'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { APP_PATHS } from 'constants/index'

import { DropdownTextAnchor, StyledNavLink } from '../styleds'
import NavGroup from './NavGroup'

const AboutWrapper = styled.span`
  display: inline-flex;
  @media (max-width: 1440px) {
    display: none;
  }
`

const AboutNavGroup = () => {
  const { pathname } = useLocation()
  const isActive = pathname.includes(APP_PATHS.ABOUT)

  return (
    <AboutWrapper>
      <NavGroup
        isActive={isActive}
        anchor={
          <DropdownTextAnchor>
            <Trans>About</Trans>
          </DropdownTextAnchor>
        }
        dropdownContent={
          <Flex
            sx={{
              flexDirection: 'column',
            }}
          >
            <StyledNavLink id="about-zuluswap" to={`${APP_PATHS.ABOUT}/zuluswap`}>
              <Trans>ZuluSwap</Trans>
            </StyledNavLink>

            <StyledNavLink id="about-zpx" to={`${APP_PATHS.ABOUT}/zpx`}>
              <Trans> ZPX</Trans>
            </StyledNavLink>
          </Flex>
        }
      />
    </AboutWrapper>
  )
}

export default AboutNavGroup
