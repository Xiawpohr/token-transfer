import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress';
import { useWeb3React } from '@web3-react/core'
import { network } from '../connectors'
import { useEagerConnect, useInactiveListener } from '../hooks'
import { NetworkContextName } from '../constants'

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { active } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network)
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      <Grid container alignItems='center' justify='center'>
        <Typography variant='h2' gutterBottom>Unkwon Error</Typography>
      </Grid>
    )
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    return showLoader ? (
      <Grid container alignItems='center' justify='center'>
        <CircularProgress />
      </Grid>
    ) : null
  }

  return children
}
