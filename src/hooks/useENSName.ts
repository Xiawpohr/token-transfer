import { useState, useEffect, useRef } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { getAddress } from '@ethersproject/address'
import useLocalStorage from './useLocalStorage'
import { useActiveWeb3React } from './index'

const lookupAddress = async (provider: Web3Provider, address: string) => {
  try {
    // Accuracy of reverse resolution is not enforced.
    // We then manually ensure that the reported ens name resolves to address
    const reportedName = await provider.lookupAddress(address)
    
    const resolvedAddress = await provider.resolveName(reportedName)

    if (getAddress(address) === getAddress(resolvedAddress)) {
      return reportedName
    } else {
      throw Error('no ENS name')
    }
  } catch (err) {
    throw err
  }
}

const useENSName = (address: string | undefined) => {
  const { library: provider } = useActiveWeb3React()
  const [ensName, setEnsName] = useState('')
  const [ensCache, setEnsCache] = useLocalStorage(`ensCache_${address}`)
  const prevAddress = useRef(address)
  
  useEffect(() => {
    if(ensCache && ensCache.timestamp>Date.now()){
      setEnsName(ensCache.name)
    } else {
      if (provider && address) {
        lookupAddress(provider, address).then((name) => {
          if (name && prevAddress.current === address) {
            setEnsName(name)
            setEnsCache({
              timestamp:Date.now()+360000,
              name:name
            })
          }
        }).catch(() => {
          setEnsName('')
        })
      } else {
        setEnsName('')
      }
    }
    prevAddress.current = address
  }, [ensCache, provider, address, setEnsName, setEnsCache])

  return ensName
}

export default useENSName
