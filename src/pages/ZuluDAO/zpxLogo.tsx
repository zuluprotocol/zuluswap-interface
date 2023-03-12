import { ChainId } from '@zuluswap/zs-sdk-core'

import { ZPX_ADDRESS } from 'constants/tokens'
import { getTokenLogoURL } from 'utils'

export default function ZPXLogo({ size }: { size?: number }) {
  return (
    <img
      src={`${getTokenLogoURL(ZPX_ADDRESS, ChainId.MAINNET)}`}
      alt="zpx-logo"
      width={size ? `${size}px` : '24px'}
      height={size ? `${size}px` : '24px'}
    />
  )
}
