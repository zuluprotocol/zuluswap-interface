import { Price, Token } from '@zuluswap/zs-sdk-core'
import { tickToPrice } from '@zuluswap/zs-sdk-elastic'

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
