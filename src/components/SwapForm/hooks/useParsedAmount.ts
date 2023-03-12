import { Currency } from '@zuluswap/zs-sdk-core'
import { useMemo } from 'react'

import { tryParseAmount } from 'state/swap/hooks'

const useParsedAmount = (currency: Currency | undefined, typedValue: string) => {
  const parsedAmount = useMemo(() => {
    return tryParseAmount(typedValue, currency)
  }, [typedValue, currency])

  return parsedAmount
}

export default useParsedAmount
