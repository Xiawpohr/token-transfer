import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import { SUPPORT_WALLETS, WalletNames } from '../constants'
import React from 'react'
import { DialogActions } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import DialogContent from '@material-ui/core/DialogContent'
import { walletconnect } from '../connectors'

type ModalProps = {
  open: boolean;
  onClose: () => void;
}

export default function Web3Modal(props: ModalProps) {
  const { onClose, open } = props

  const { activate, connector } = useWeb3React()

  const tryActivate = async (connector: AbstractConnector | undefined) => {
    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined
    }

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        }
      })
    onClose()
  }

  return (
    <Dialog
      maxWidth='md'
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Connect Your Wallet</DialogTitle>
      <DialogContent>

        <List>
          {Object.keys(SUPPORT_WALLETS).map((walletName) => {
            const wallet = SUPPORT_WALLETS[walletName as WalletNames]
            return (
              <ListItem
                key={wallet.name}
                button
                onClick={() => tryActivate(wallet.connector)}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={wallet.name}
                    src={wallet.icon}
                    imgProps={{ style: { width: '70%', height: 'auto' } }}
                  />
                </ListItemAvatar>
                <ListItemText primary={wallet.name} />
              </ListItem>
            )}
          )}
        </List>
      </DialogContent>
      {connector === walletconnect && (
        <DialogActions>
          <Button variant='text' onClick={() => {
            ;(connector as any).close()
          }}>
            Disconnect
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
