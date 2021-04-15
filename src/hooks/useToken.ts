import { useState, useEffect } from 'react'
import { useActiveWeb3React } from './index'
import { getTokenName, getTokenSymbol, getTokenDecimals } from '../utils'

export default function useToken(token: string) {
  const { library } = useActiveWeb3React()
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState(18)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    let stale = false

    if (library) {
      if (token === 'ETH') {
        setName('Ether')
        setSymbol(token)
        setDecimals(18)
        setIsValid(true)
      } else {
        Promise.all([
          getTokenName(token, library),
          getTokenSymbol(token, library),
          getTokenDecimals(token, library),
        ])
          .then(([tokenName, tokenSymbol, tokenDecimals]) => {
            if (!stale) {
              setName(tokenName)
              setSymbol(tokenSymbol)
              setDecimals(parseInt(tokenDecimals.toString()))
              setIsValid(true)
            }
          })
          .catch(() => {
            if (!stale) {
              setName('')
              setSymbol('')
              setDecimals(0)
              setIsValid(false)
            }
          })
      }
    }

    return () => {
      stale = true
    }
  }, [library, token])

  return {
    name, symbol, decimals, isValid
  }
}
