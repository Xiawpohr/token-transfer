import { useWeb3React } from '@web3-react/core'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Web3Status from './Web3Status'
import { ChainId, ChainNames } from '../constants'

export default function Header() {
  const { chainId } = useWeb3React()

  return (
    <AppBar position='static' color='inherit'>
      <Toolbar>
        <Typography variant='h6' style={{ flex: '1' }}>Token Transfer</Typography>
        <Web3Status />
      </Toolbar>
      <Typography variant='subtitle1' align='center' color='textSecondary'>{ChainNames[chainId as ChainId]}</Typography>
    </AppBar>
  )
}
