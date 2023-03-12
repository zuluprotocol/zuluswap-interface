import { ChainId } from '@zuluswap/zs-sdk-core'
import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'

import { TokenMap } from 'hooks/Tokens'

export const setTokenList: ActionCreatorWithPayload<{ chainId: ChainId; tokenList: TokenMap }> =
  createAction('lists/setTokenList')
