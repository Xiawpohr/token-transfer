import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { parseUnits } from '@ethersproject/units'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import TokenSelector from './TokenSelector'
import NumberInput from './NumberInput'
import { useActiveWeb3React } from '../hooks'
import useToken from '../hooks/useToken'
import useTokenBalance from '../hooks/useTokenBalance'
import useTransactionTracker from '../hooks/useTransactionTracker'
import { amountFormatter, getTokenContract, getSigner, shortenAddress } from '../utils'

type IFormInputs = {
  token: string,
  amount: string,
  recipient: string,
}

export default function SendForm() {
  const { account, library, chainId = 1 } = useActiveWeb3React()

  const { handleSubmit, control, watch, formState: { errors } } = useForm<IFormInputs>()
  const token = watch('token', 'ETH')

  const { symbol, decimals, isValid } = useToken(token)
  const balance = useTokenBalance(token)

  const track = useTransactionTracker(chainId)

  const send = async (data: IFormInputs) => {
    if (account && library) {
      const token = data.token
      const to = data.recipient
      const value = parseUnits(data.amount, decimals)
      let tx
      if (token === 'ETH') {
        const signer = getSigner(library, account)
        tx = signer.sendTransaction({ to, value })
      } else {
        const contract = getTokenContract(token, library, account)
        tx = contract.transfer(data.recipient, value)
      }
      await track(tx, {
        signed: `Sending ${data.amount} ${symbol} to ${shortenAddress(data.recipient)}`, 
        canceled: 'Transaction rejected',
        succeeded: 'Send succeeded',
        failed: 'Transaction failed'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(send)}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name='token'
                control={control}
                defaultValue='ETH'
                rules={{
                  required: 'token is required',
                  pattern: {
                    value: /^(ETH)|(0x[0-9a-fA-F]{40})$/,
                    message: 'wrong address format'
                  },
                }}
                render={({ field }) => (
                  <TokenSelector
                    value={field.value}
                    onTokenChange={(token) => field.onChange(token)}
                    balance={balance ? amountFormatter(balance, decimals) : '-'}
                    symbol={symbol}
                    error={!isValid || !!errors.token}
                    helperText={
                      token && isValid === false ? 'It is not ERC20 token' : errors?.token?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='amount'
                control={control}
                rules={{ required: 'amount is required' }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label='Amount'
                    placeholder='0.0'
                    unit={symbol}
                    error={!!errors.amount}
                    helperText={errors?.amount?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='recipient'
                control={control}
                rules={{
                  required: 'recipient is required',
                  pattern: {
                    value: /^0x[0-9a-fA-F]{40}$/,
                    message: 'wrong address format'
                  },
                }}
                defaultValue=''
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant='outlined'
                    label='Recipient'
                    placeholder='0x...'
                    error={!!errors.recipient}
                    helperText={errors?.recipient?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={!account || !isValid}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}
