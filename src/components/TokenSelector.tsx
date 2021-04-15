import React, { useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'

type TokenSelectorProps = {
  value: string,
  onTokenChange: (token: string) => void,
  balance: string,
  symbol: string,
  error: boolean,
  helperText?: string,
}

export default function TokenSelector(props: TokenSelectorProps) {
  const { value, onTokenChange, balance, symbol, error, helperText } = props
  const [tokenType, setTokenType] = useState('ETH')
  const [tokenAddress, setTokenAddress] = useState('')

  useEffect(() => {
    if (value === 'ETH') {
      setTokenType('ETH')
    } else {
      setTokenType('ERC20')
      setTokenAddress(value)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (tokenType === 'ETH') {
      onTokenChange('ETH')
    } else {
      onTokenChange(tokenAddress)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenType, tokenAddress])

  return (
    <FormControl component='fieldset' fullWidth error={error}>
      <FormLabel component='legend'>Token</FormLabel>
      <RadioGroup
        row
        name='token'
        value={tokenType}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenType(e.target.value)}
      >
        <FormControlLabel
          label='ETH'
          value='ETH'
          control={<Radio />}
        />
        <FormControlLabel
          value='ERC20'
          control={<Radio />}
          label='ERC20'
        />
      </RadioGroup>
      {tokenType === 'ERC20' && (
        <TextField
          fullWidth
          variant='outlined'
          name='ERC20 Address'
          label='ERC20 Address'
          placeholder='0x...'
          value={tokenAddress}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenAddress(e.target.value)}
        />
      )}
      <FormHelperText>{error ? helperText : `Balance: ${balance} ${symbol}`}</FormHelperText>
    </FormControl>
  )
}