import React, { useMemo, useState } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import Button from '@material-ui/core/Button';
import Web3Model from './Web3Modal'
import { NetworkContextName } from '../constants'
import useENSName from '../hooks/useENSName'
import { shortenAddress } from '../utils'

export default function Web3Status() {
  const { active, account, error } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const ENSName = useENSName(account ?? undefined)

  const [openModal, setOpenModal] = useState(false)

  const buttonText = useMemo(() => {
    if (error) {
      return error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'
    } else if (account) {
      return ENSName || shortenAddress(account)
    } else {
      return 'Connect'
    }
  }, [ENSName, account, error])

  if (!contextNetwork.active && !active) {
    return null
  } else {
    return (
      <>
        <Button
          variant='outlined'
          onClick={() => setOpenModal(!openModal)}
        >{buttonText}</Button>
        <Web3Model
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      </>
    )
  }
}
