import { ChainId } from '@zuluswap/zs-sdk-core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from 'react-use'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'

import DaoABI from 'constants/abis/zuludao/dao.json'
import MigrateABI from 'constants/abis/zuludao/migrate.json'
import RewardDistributorABI from 'constants/abis/zuludao/reward_distributor.json'
import StakingABI from 'constants/abis/zuludao/staking.json'
import { CONTRACT_NOT_FOUND_MSG } from 'constants/messages'
import { NETWORKS_INFO, NETWORKS_INFO_CONFIG, isEVM } from 'constants/networks'
import { EVMNetworkInfo } from 'constants/networks/type'
import { useActiveWeb3React } from 'hooks'
import { useContract, useContractForReading, useTokenContractForReading } from 'hooks/useContract'
import useTokenBalance from 'hooks/useTokenBalance'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TRANSACTION_TYPE } from 'state/transactions/type'
import { calculateGasMargin } from 'utils'

import { ProposalDetail, ProposalStatus, StakerAction, StakerInfo, VoteInfo } from './types'

export function isSupportZuluDao(chainId: ChainId) {
  return isEVM(chainId) && (NETWORKS_INFO_CONFIG[chainId] as EVMNetworkInfo).zuluDAO
}

export function useZuluDAOInfo() {
  const { chainId } = useActiveWeb3React()
  const zuluDaoInfo = NETWORKS_INFO[chainId !== ChainId.GÖRLI ? ChainId.MAINNET : ChainId.GÖRLI].zuluDAO
  return zuluDaoInfo
}

export function useZuluDaoStakeActions() {
  const addTransactionWithType = useTransactionAdder()
  const zuluDaoInfo = useZuluDAOInfo()
  const stakingContract = useContract(zuluDaoInfo?.staking, StakingABI)
  const migrateContract = useContract(zuluDaoInfo?.ZPXAddress, MigrateABI)

  const stake = useCallback(
    async (amount: BigNumber, votingPower: string) => {
      if (!stakingContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const estimateGas = await stakingContract.estimateGas.deposit(amount)
        const tx = await stakingContract.deposit(amount, {
          gasLimit: calculateGasMargin(estimateGas),
        })
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_STAKE,
          extraInfo: {
            tokenSymbol: 'ZPX',
            tokenAddress: zuluDaoInfo?.ZPXAddress ?? '',
            tokenAmount: formatUnits(amount),
            arbitrary: { amount: formatUnits(amount), votingPower },
          },
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [addTransactionWithType, stakingContract, zuluDaoInfo],
  )
  const unstake = useCallback(
    async (amount: BigNumber) => {
      if (!stakingContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const estimateGas = await stakingContract.estimateGas.withdraw(amount)
        const tx = await stakingContract.withdraw(amount, {
          gasLimit: calculateGasMargin(estimateGas),
        })
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_UNSTAKE,
          extraInfo: {
            tokenSymbol: 'ZPX',
            tokenAddress: zuluDaoInfo?.ZPXAddress ?? '',
            tokenAmount: formatUnits(amount),
            arbitrary: { amount: formatUnits(amount) },
          },
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [addTransactionWithType, stakingContract, zuluDaoInfo?.ZPXAddress],
  )
  const migrate = useCallback(
    async (amount: BigNumber, rawAmount: string) => {
      if (!migrateContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const estimateGas = await migrateContract.estimateGas.mintWithOldZpx(amount)
        const tx = await migrateContract.mintWithOldZpx(amount, {
          gasLimit: calculateGasMargin(estimateGas),
        })
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_MIGRATE,
          extraInfo: zuluDaoInfo
            ? {
                tokenAddressIn: zuluDaoInfo.ZPXLAddress,
                tokenAddressOut: zuluDaoInfo.ZPXAddress,
                tokenAmountIn: rawAmount,
                tokenAmountOut: rawAmount,
                tokenSymbolIn: 'ZPXL',
                tokenSymbolOut: 'ZPX',
              }
            : undefined,
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [addTransactionWithType, migrateContract, zuluDaoInfo],
  )
  const delegate = useCallback(
    async (address: string) => {
      if (!stakingContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const estimateGas = await stakingContract.estimateGas.delegate(address)
        const tx = await stakingContract.delegate(address, {
          gasLimit: calculateGasMargin(estimateGas),
        })
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_DELEGATE,
          extraInfo: { contract: address },
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [addTransactionWithType, stakingContract],
  )
  const undelegate = useCallback(
    // address here alway should be user's address
    async (address: string) => {
      if (!stakingContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const estimateGas = await stakingContract.estimateGas.delegate(address)
        const tx = await stakingContract.delegate(address, {
          gasLimit: calculateGasMargin(estimateGas),
        })
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_UNDELEGATE,
          extraInfo: { contract: address },
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [addTransactionWithType, stakingContract],
  )

  return { stake, unstake, migrate, delegate, undelegate }
}

export function useClaimRewardActions() {
  const zuluDaoInfo = useZuluDAOInfo()
  const rewardDistributorContract = useContract(zuluDaoInfo?.rewardsDistributor, RewardDistributorABI)
  const addTransactionWithType = useTransactionAdder()

  const claim = useCallback(
    async ({
      cycle,
      index,
      address,
      tokens,
      cumulativeAmounts,
      merkleProof,
      formatAmount,
    }: {
      cycle: number
      index: number
      address: string
      tokens: string[]
      cumulativeAmounts: string[]
      merkleProof: string[]
      formatAmount: string
    }) => {
      if (!rewardDistributorContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const isValidClaim = await rewardDistributorContract.isValidClaim(
          cycle,
          index,
          address,
          tokens,
          cumulativeAmounts,
          merkleProof,
        )
        if (!isValidClaim) {
          throw new Error('Invalid claim')
        }
        const estimateGas = await rewardDistributorContract.estimateGas.claim(
          cycle,
          index,
          address,
          tokens,
          cumulativeAmounts,
          merkleProof,
        )
        const tx = await rewardDistributorContract.claim(
          cycle,
          index,
          address,
          tokens,
          cumulativeAmounts,
          merkleProof,
          {
            gasLimit: calculateGasMargin(estimateGas),
          },
        )
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_CLAIM,
          extraInfo: {
            contract: zuluDaoInfo?.rewardsDistributor,
            tokenAmount: formatAmount,
            tokenSymbol: 'ZPX',
            tokenAddress: zuluDaoInfo?.ZPXAddress,
          },
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [rewardDistributorContract, addTransactionWithType, zuluDaoInfo],
  )
  return { claim }
}

export const useVotingActions = () => {
  const zuluDaoInfo = useZuluDAOInfo()
  const daoContract = useContract(zuluDaoInfo?.dao, DaoABI)
  const addTransactionWithType = useTransactionAdder()

  const vote = useCallback(
    async (campId: number, option: number) => {
      if (!daoContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }
      try {
        const estimateGas = await daoContract.estimateGas.submitVote(campId, option)
        const tx = await daoContract.submitVote(campId, option, {
          gasLimit: calculateGasMargin(estimateGas),
        })
        addTransactionWithType({
          hash: tx.hash,
          type: TRANSACTION_TYPE.ZULUDAO_VOTE,
          extraInfo: { contract: zuluDaoInfo?.dao },
        })
        return tx.hash
      } catch (error) {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          throw new Error('Transaction rejected.')
        } else {
          throw error
        }
      }
    },
    [daoContract, addTransactionWithType, zuluDaoInfo?.dao],
  )
  return { vote }
}

const fetcher = (url: string) => {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

export function useStakingInfo() {
  const { account } = useActiveWeb3React()
  const zuluDaoInfo = useZuluDAOInfo()
  const stakingContract = useContract(zuluDaoInfo?.staking, StakingABI)
  const zpxContract = useTokenContractForReading(zuluDaoInfo?.ZPXAddress, ChainId.MAINNET)
  const stakedBalance = useSingleCallResult(stakingContract, 'getLatestStakeBalance', [account ?? undefined])
  const delegatedAddress = useSingleCallResult(stakingContract, 'getLatestRepresentative', [account ?? undefined])
  const ZPXBalance = useTokenBalance(zuluDaoInfo?.ZPXAddress || '')
  const isDelegated = useMemo(() => {
    return delegatedAddress.result?.[0] && delegatedAddress.result?.[0] !== account
  }, [delegatedAddress, account])

  const { data: stakerActions } = useSWR<StakerAction[]>(
    account && zuluDaoInfo?.daoStatsApi + '/stakers/' + account + '/actions',
    fetcher,
  )

  const [totalSupply, setTotalSupply] = useState()
  useEffect(() => {
    zpxContract
      ?.totalSupply()
      .then((res: any) => setTotalSupply(res))
      .catch((err: any) => console.log(err))
  }, [zpxContract])

  return {
    stakedBalance: stakedBalance.result?.[0] || 0,
    ZPXBalance: ZPXBalance.value || 0,
    delegatedAddress: delegatedAddress.result?.[0],
    isDelegated,
    stakerActions,
    totalMigratedZPX: totalSupply,
  }
}

export function useVotingInfo() {
  const { account } = useActiveWeb3React()
  const zuluDaoInfo = useZuluDAOInfo()
  const rewardsDistributorContract = useContractForReading(
    zuluDaoInfo?.rewardsDistributor,
    RewardDistributorABI,
    ChainId.MAINNET,
  )
  const { data: daoInfo } = useSWR(zuluDaoInfo?.daoStatsApi + '/dao-info', fetcher)
  const [localStoredDaoInfo, setLocalStoredDaoInfo] = useLocalStorage('zuludao-daoInfo')
  const [merkleData, setMerkleData] = useState<any>()
  useEffect(() => {
    rewardsDistributorContract
      ?.getMerkleData?.()
      .then((res: any) => {
        setMerkleData(res)
      })
      .catch((err: any) => console.log(err))
  }, [rewardsDistributorContract])

  useEffect(() => {
    if (daoInfo) {
      setLocalStoredDaoInfo(daoInfo)
    }
  }, [daoInfo, setLocalStoredDaoInfo])

  const merkleDataFileUrl = useMemo(() => {
    if (!merkleData) return
    const cycle = parseInt(merkleData?.[0]?.toString())
    const merkleDataFileUrl = merkleData?.[2]
    if (!cycle || !merkleDataFileUrl) {
      return
    }
    return merkleDataFileUrl
  }, [merkleData])

  const { data: userRewards } = useSWRImmutable(
    account && merkleDataFileUrl ? [merkleDataFileUrl, account] : null,
    (url: string, address: string) => {
      return fetch(url)
        .then(res => res.json())
        .then(res => {
          res.userReward = address ? res.userRewards[address] : undefined
          delete res.userRewards
          return res
        })
    },
  )

  const [claimedRewardAmounts, setClaimedRewardAmounts] = useState<any>()
  useEffect(() => {
    rewardsDistributorContract
      ?.getClaimedAmounts?.(account, userRewards?.userReward?.tokens)
      .then((res: any) => setClaimedRewardAmounts(res))
      .catch((err: any) => console.log(err))
  }, [rewardsDistributorContract, account, userRewards?.userReward?.tokens])

  const remainingCumulativeAmount: BigNumber = useMemo(() => {
    if (!userRewards?.userReward?.tokens || !claimedRewardAmounts) return BigNumber.from(0)
    return (
      userRewards?.userReward?.tokens?.map((_: string, index: number) => {
        const cummulativeAmount =
          userRewards.userReward &&
          userRewards.userReward.cumulativeAmounts &&
          userRewards.userReward.cumulativeAmounts[index]

        if (!cummulativeAmount) {
          return BigNumber.from(0)
        }
        const claimedAmount = claimedRewardAmounts?.[0]?.[index] || 0

        return BigNumber.from(cummulativeAmount).sub(BigNumber.from(claimedAmount))
      })[0] || BigNumber.from(0)
    )
  }, [claimedRewardAmounts, userRewards?.userReward])

  const { data: proposals } = useSWR<ProposalDetail[]>(
    zuluDaoInfo?.daoStatsApi + '/proposals',
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res =>
          res.data.map((p: ProposalDetail) => {
            let mappedStatus
            switch (p.status) {
              case 'Succeeded':
              case 'Queued':
              case 'Finalized':
                mappedStatus = ProposalStatus.Approved
                break
              case 'Expired':
                mappedStatus = ProposalStatus.Failed
                break
              default:
                mappedStatus = p.status
                break
            }
            return { ...p, status: mappedStatus }
          }),
        ),
    {
      refreshInterval: 15000,
    },
  )

  const { data: stakerInfo } = useSWR<StakerInfo>(
    daoInfo?.current_epoch &&
      account &&
      zuluDaoInfo?.daoStatsApi + '/stakers/' + account + '?epoch=' + daoInfo?.current_epoch,
    fetcher,
  )
  const { data: stakerInfoNextEpoch } = useSWR<StakerInfo>(
    daoInfo?.current_epoch &&
      account &&
      zuluDaoInfo?.daoStatsApi + '/stakers/' + account + '?epoch=' + (parseFloat(daoInfo?.current_epoch) + 1),
    fetcher,
  )

  const calculateVotingPower = useCallback(
    (zpxAmount: string, newStakingAmount?: string) => {
      if (!daoInfo?.total_staked) return '0'
      const totalStakedZPX = daoInfo?.total_staked
      if (parseFloat(totalStakedZPX) === 0) return '0'

      const votingPower =
        newStakingAmount && parseFloat(newStakingAmount) > 0
          ? ((parseFloat(zpxAmount) + parseFloat(newStakingAmount)) / (totalStakedZPX + parseFloat(newStakingAmount))) *
            100
          : (parseFloat(zpxAmount) / totalStakedZPX) * 100
      if (votingPower <= 0) return '0'
      if (votingPower < 0.000001) {
        return '0.000001'
      } else {
        return parseFloat(votingPower.toPrecision(3)).toString()
      }
    },
    [daoInfo],
  )

  const { data: votesInfo } = useSWR<VoteInfo[]>(
    account ? zuluDaoInfo?.daoStatsApi + '/stakers/' + account + '/votes' : null,
    fetcher,
  )

  return {
    daoInfo: daoInfo || localStoredDaoInfo || undefined,
    userRewards,
    calculateVotingPower,
    proposals,
    userReward: userRewards?.userReward,
    remainingCumulativeAmount,
    stakerInfo,
    stakerInfoNextEpoch,
    votesInfo,
  }
}

export function useProposalInfoById(id?: number): { proposalInfo?: ProposalDetail } {
  const zuluDaoInfo = useZuluDAOInfo()
  const { data } = useSWRImmutable(
    id !== undefined ? zuluDaoInfo?.daoStatsApi + '/proposals/' + id : undefined,
    fetcher,
    { refreshInterval: 15000 },
  )
  return { proposalInfo: data }
}
