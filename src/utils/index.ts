import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { AddressZero } from '@ethersproject/constants'
import { parseBytes32String } from '@ethersproject/strings'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { Contract } from 'ethers'
import { ChainId } from '../constants'
import ERC20_ABI from '../constants/abis/erc20.json'
import ERC20_BYTES32_ABI from '../constants/abis/erc20_bytes32.json'

export enum ErrorCodes {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_DECIMALS,
}

export interface TokenError extends Error {
  code?: ErrorCodes
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.'
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function getTokenContract(address: string, library: Web3Provider, account?: string) {
  return getContract(address, ERC20_ABI, library, account)
}

// get token name
export async function getTokenName(
  tokenAddress: string,
  library: Web3Provider
): Promise<string> {
  if (!isAddress(tokenAddress)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
  }

  return getContract(tokenAddress, ERC20_ABI, library)
    .name()
    .catch(() =>
      getContract(tokenAddress, ERC20_BYTES32_ABI, library)
        .name()
        .then((bytes32: string) => parseBytes32String(bytes32)),
    )
    .catch((error: TokenError) => {
      error.code = ErrorCodes.TOKEN_SYMBOL
      throw error
    })
}

// get token symbol
export async function getTokenSymbol(
  tokenAddress: string,
  library: Web3Provider
): Promise<string> {
  if (!isAddress(tokenAddress)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
  }

  return getContract(tokenAddress, ERC20_ABI, library)
    .symbol()
    .catch(() => {
      const contractBytes32 = getContract(
        tokenAddress,
        ERC20_BYTES32_ABI,
        library,
      )
      return contractBytes32
        .symbol()
        .then((bytes32: string) => parseBytes32String(bytes32))
    })
    .catch((error: TokenError) => {
      error.code = ErrorCodes.TOKEN_SYMBOL
      throw error
    })
}

// get token decimals
export async function getTokenDecimals(
  tokenAddress: string,
  library: Web3Provider
): Promise<BigNumber> {
  if (!isAddress(tokenAddress)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
  }

  return getContract(tokenAddress, ERC20_ABI, library)
    .decimals()
    .catch((error: TokenError) => {
      error.code = ErrorCodes.TOKEN_DECIMALS
      throw error
    })
}

// get the token balance of an address
export function getTokenBalance(tokenAddress: string, account: string, library: Web3Provider) {
  if (!isAddress(tokenAddress) || !isAddress(account)) {
    throw Error(
      `Invalid 'tokenAddress' or 'address' parameter '${tokenAddress}' or '${account}'.`,
    )
  }

  return getContract(tokenAddress, ERC20_ABI, library).balanceOf(account)
}

// get the token allowance
export async function getTokenAllowance(
  address: string,
  tokenAddress: string,
  spenderAddress: string,
  library: Web3Provider,
): Promise<BigNumber> {
  if (
    !isAddress(address) ||
    !isAddress(tokenAddress) ||
    !isAddress(spenderAddress)
  ) {
    throw Error(
      "Invalid 'address' or 'tokenAddress' or 'spenderAddress' parameter" +
        `'${address}' or '${tokenAddress}' or '${spenderAddress}'.`,
    )
  }

  return getContract(tokenAddress, ERC20_ABI, library).allowance(
    address,
    spenderAddress,
  )
}

export function amountFormatter(amount: BigNumber, baseDecimals: number, displayDecimals: number = 4): string {
  if (
    baseDecimals > 18 ||
    displayDecimals > 18 ||
    displayDecimals > baseDecimals
  ) {
    throw Error(
      `Invalid combination of baseDecimals '${baseDecimals}' and displayDecimals '${displayDecimals}.`,
    )
  }

  if (amount.isZero()) {
    return '0'
  }

  const amountDecimals = baseDecimals - amount.toString().length + 1

  return parseFloat(formatUnits(amount, baseDecimals))
    .toFixed(amountDecimals >= displayDecimals ? amountDecimals + 1 : displayDecimals)
}
