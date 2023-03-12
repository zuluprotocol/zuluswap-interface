import { Currency } from '@zuluswap/zs-sdk-core'
import { createReducer } from '@reduxjs/toolkit'

import { CreateOrderParam } from 'components/swapv2/LimitOrder/type'

import { removeCurrentOrderUpdate, setCurrentOrderUpdate, setInputAmount, setLimitCurrency } from './actions'

export interface LimitState {
  inputAmount: string
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  ordersUpdating: CreateOrderParam[]
}

const initialState: LimitState = {
  inputAmount: '',
  currencyIn: undefined,
  currencyOut: undefined,
  ordersUpdating: [],
}

export default createReducer<LimitState>(initialState, builder =>
  builder
    .addCase(setInputAmount, (state, { payload: inputAmount }) => {
      state.inputAmount = inputAmount
    })
    .addCase(setLimitCurrency, (state, { payload: { currencyIn, currencyOut } }) => {
      state.currencyIn = currencyIn
      state.currencyOut = currencyOut
    })
    .addCase(setCurrentOrderUpdate, (state, { payload }) => {
      state.ordersUpdating = [...state.ordersUpdating, payload]
    })
    .addCase(removeCurrentOrderUpdate, (state, { payload: orderId }) => {
      state.ordersUpdating = state.ordersUpdating.filter(e => e.orderId !== orderId)
    }),
)
