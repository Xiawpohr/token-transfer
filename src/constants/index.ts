import { AbstractConnector } from "@web3-react/abstract-connector"
import { injected, walletconnect } from "../connectors"
import MetamaskIcon from '../assets/metamask.png'
import WalletConnectIcon from '../assets/walletConnectIcon.svg'

export const NetworkContextName = 'NETWORK'

export enum ChainId {
  MAINNET = 1,
  RINKEBY = 3,
  ROPSTEN = 4,
  KOVAN = 5,
  GÖRLI = 42,
}

export const ChainNames: { [chainId in ChainId]: string } = {
  1: 'MainNet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan'
}


export enum WalletNames {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  icon: string
}

export const SUPPORT_WALLETS: { [walletName in WalletNames]: WalletInfo } = {
  [WalletNames.MetaMask]: {
    connector: injected,
    name: WalletNames.MetaMask,
    icon: MetamaskIcon,
  },
  [WalletNames.WalletConnect]: {
    connector: walletconnect,
    name: WalletNames.WalletConnect,
    icon: WalletConnectIcon,
  },
}
