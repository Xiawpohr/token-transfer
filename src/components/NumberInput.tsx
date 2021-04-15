import React from 'react'
import TextField from '@material-ui/core/TextField'
import NumberFormat from 'react-number-format'

type NumberFormatInputProps = {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  suffix: string;
}

function NumberFormatInput(props: NumberFormatInputProps) {
  const { inputRef, onChange, name, suffix, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      suffix={` ${suffix}`}
    />
  )
}

type NumberInputProps = {
  label: string,
  placeholder: string,
  unit: string,
  error: boolean,
  helperText?: string,
  value: string | undefined,
  onChange: React.ChangeEventHandler<HTMLInputElement>,
}

export default React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
  const { label, placeholder, unit, error, helperText, value, onChange } = props

  return (
    <TextField
      fullWidth
      variant='outlined'
      name={label}
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      value={value}
      onChange={onChange}
      inputRef={ref}
      inputProps={{
        suffix: unit,
      }}
      InputProps={{
        inputComponent: NumberFormatInput as any,
      }}
    />
  )
})
