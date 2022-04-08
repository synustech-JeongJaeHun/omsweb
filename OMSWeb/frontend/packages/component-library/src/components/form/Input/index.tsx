/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-expressions */
import * as React from 'react'
import styled from '@emotion/styled'
import { color } from '@daimre/styles'
import Icon from '../../Icon'
import Button from '../../Button'

const Wrapper = styled.div`
  display: inline-block;
  position: relative;
  

  label {
    margin-right: 7px;
    color: rgba(255, 255, 255, 0.71);
  }

  input[type='text'] {
    font-size: 12px;
    outline-style: none;
    box-shadow: none;
    border-color: transparent;
    background-color: transparent;

    border: 1px solid ${color.inputLine};
    border-radius: 2px;
    color: ${color.text};
    padding: 8px 24px 8px 9px;
    min-width: 145px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    &:hover {
      border-color: #63759a;
    }

    &:focus {
      border-color: #89afff;
    }

    &:disabled {
      pointer-events: none;
      border-color: ${color.inputLine};
      opacity: 0.6;

      & + button {
        pointer-events: none;
        opacity: 0.4;
      }
    }

    & + button {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 23px;
      height: 23px;
    }
  }
`

const Input: React.FC<Props> = ({
  type = 'basic',
  name,
  label,
  placeholder = 'search',
  disabled = false,
  onClick,
  onChange,
  isReset = false,
}: Props) => {
  const inputRef = React.useRef(null)
  const [isSearch, toggleSearch] = React.useState(true)
  const [value, updateValue] = React.useState('')
  const rand = Math.floor(Math.random() * 1000)
  

  const handleChange = (e) => {
    updateValue(e.target.value)
    onChange && onChange(name, e.target.value)
  }

  const handleClick = (e) => {
    toggleSearch(!isSearch)
    if (!isSearch) {
      inputRef.current.value = ''
      updateValue('')
    }
    onClick && onClick(inputRef.current.value)
  }

  React.useEffect(() => {
    if (isReset) {
      updateValue('')
    }
  }, [isReset])

  const getOtherProps = () => {
    switch (type) {
      case 'search':
        return {
          // onClick: handleClick,
          onKeyDown: (e) => {
            if (e.key === 'Enter') {
              handleClick('_')
            }
          },
          onChange: (e) => {
            if (e.target.value === '') {
              toggleSearch(true)
              updateValue('')
              onClick && onClick(inputRef.current.value)
            }
          },
        }
      default:
        return { onChange: handleChange }
    }
  }

  return (
    <Wrapper>
      {label && <label htmlFor={`${name}-input-id-${rand}`}>{label}</label>}
      <input
        ref={inputRef}
        name={name}
        id={`${name}-input-id-${rand}`}
        type='text'
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        {...getOtherProps()}
      />
      {type === 'search' && (
        <Button transparent onClick={handleClick}>
          <Icon
            name={isSearch ? 'search' : 'close'}
            size='18px'
            color='rgba(255,255, 255, 0.4)'
          />
        </Button>
      )}
    </Wrapper>
  )
}

interface Props {
  label?: string
  name: string
  disabled?: boolean
  placeholder?: string
  type?: 'basic' | 'search'
  isReset?: boolean
  onClick?: (value: string) => void
  onChange?: (name: string, value: string) => void
  setValue?: (value: string) => void
}

export default Input
