import { BigNumber } from '@ethersproject/bignumber'
import { useState, useEffect } from 'react'
import { useActiveWeb3React } from './index'
import { getTokenBalance, isAddress } from '../utils'

export default function useTokenBalance(token: string) {
  const { account, library } = useActiveWeb3React()
  const [balance, setBalance] = useState<BigNumber>()

  useEffect(() => {
    let stale = false
    if (
      (token === 'ETH' || isAddress(token)) &&
      (account && isAddress(account)) &&
      library
    ) {
      (token === 'ETH' 
        ? library.getBalance(account) 
        : getTokenBalance(token, account, library)
      )
        .then((balance: BigNumber) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(undefined)
          }
        })
    } else {
      setBalance(undefined)
    }

    return () => {
      stale = false
    }
  }, [account, library, token])

  return balance
}
