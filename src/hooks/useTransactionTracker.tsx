import React from 'react'
import { useCallback } from 'react'
import { SnackbarKey, useSnackbar } from 'notistack'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { getEtherscanLink } from '../utils'
import { ChainId } from '../constants'

export default function useTransactionTracker(chainId: ChainId) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const closeAction = useCallback((key: SnackbarKey | undefined) => (
    <IconButton onClick={() => closeSnackbar(key)}>
      <CloseIcon style={{ color: 'white' }} />
    </IconButton>
  ), [closeSnackbar])
  
  const txActions = useCallback((hash: string) => (key: SnackbarKey | undefined) => {
    const link = getEtherscanLink(chainId, hash, 'transaction')
    return (
      <>
        <IconButton href={link} target='_blank' rel='noopener noreferrer'>
          <OpenInNewIcon style={{ color: 'white' }} />
        </IconButton>
        <IconButton onClick={() => closeSnackbar(key)}>
          <CloseIcon style={{ color: 'white' }} />
        </IconButton>
      </>
    )
  }, [chainId, closeSnackbar])
  
  const track = useCallback(async (tx, stateMessage) => {
    const { signed, canceled, succeeded, failed } = stateMessage
    let response, key

    
    try {
      response = await tx
      key = enqueueSnackbar(signed, {
        persist: true,
        variant: 'info',
        action: txActions(response.hash)
      })
    } catch (err) {
      console.log(err)
      enqueueSnackbar(canceled, {
        persist: true,
        variant: 'error',
        action: closeAction
      })
      return
    }

    try {
      await response.wait()
      closeSnackbar(key)
      enqueueSnackbar(succeeded, {
        persist: true,
        variant: 'success',
        action: txActions(response.hash)
      })
    } catch {
      enqueueSnackbar(failed, {
        persist: true,
        variant: 'error',
        action: closeAction
      })
    }

  }, [closeAction, closeSnackbar, enqueueSnackbar, txActions])

  return track
}
