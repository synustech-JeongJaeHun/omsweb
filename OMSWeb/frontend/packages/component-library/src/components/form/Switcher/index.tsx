/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/label-has-associated-control */
/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react'
import styled from '@emotion/styled'
import { css, jsx } from '@emotion/react'

const Wrapper = styled.div<Pick<Props, 'disabled'>>`
  display: inline-flex;

  .input-group {
    display: inline-block;
  }

  .input-label {
    font-size: 12px;
    position: relative;
    top: 1px;

    & + .input-group {
      margin-left: 5px;
    }
  }

  input[type='checkbox'] {
    height: 0;
    width: 0;
    display: none;

    &:checked + label {
      background: #4a78fc;

      span {
        left: calc(100% - 3px);
        transform: translateX(-100%);
      }
    }

    &:disabled {
      pointer-events: none;
    }
  }

  input ~ label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    width: 40px;
    height: 22px;
    background: #60687c;
    border-radius: 40px;
    position: relative;
    transition: background-color 0.2s;

    span {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 16px;
      transition: 0.1s;
      background: #fff;
      box-shadow: 0 0 2px 0 rgba(10, 10, 10, 0.29);
    }

    &:active {
      span {
        width: 20px;
      }
    }
  }

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.6;
    `}
`

const Switcher: React.FC<Props> = ({
  title = '모아보기',
  checked = false,
  disabled = false,
  onChange,
}: Props) => {
  const [isChecked, setIsChecked] = React.useState(checked)

  const handleChange = (e) => {
    setIsChecked(e.target.checked)
    onChange && onChange(e.target.checked)
  }

  return (
    <Wrapper disabled={disabled}>
      {title && <span className='input-label'>{title}</span>}
      <span className='input-group'>
        <input
          id='switch-checkbox'
          type='checkbox'
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
        />
        <label htmlFor='switch-checkbox'>
          <span />
        </label>
      </span>
    </Wrapper>
  )
}

interface Props {
  title?: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export default Switcher
