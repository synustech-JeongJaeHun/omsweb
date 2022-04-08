/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react'
import styled from '@emotion/styled'
import { jsx, css } from '@emotion/react'
import { color } from '@daimre/styles'
import { isFullEmpty } from '@daimre/shared'
import Icon from '../../Icon'

const Wrapper = styled.div<Pick<Props, 'isTop' | 'size' | 'isRect' | 'noPadding' | 'weight'>>`
  display: inline-flex;
  align-items: center;

  select {
    border: 1px solid ${color.inputLine};
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    color: ${color.text};
    font-size: 12px;
    font-weight: bold;
    padding: 9px 30px 9px 15px;
    border-radius: 20px;

    &:hover {
      background-color: rgba(28, 72, 121, 0.4);
      border-color: #31497c;
    }

    &:focus {
      outline: 0;
    }

    &:disabled {
      pointer-events: none;
      opacity: 0.5;
      background-color: transparent;

      & + svg {
        opacity: 0.5;
      }
    }
  }

  span.label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  span.label ~ div {
    select {
      margin-left: 11px;
      border-radius: 2px;
      padding: 6px 30px 5px 11px;
    }
  }

  ${({ isTop }) =>
    isTop &&
    css`
      flex-direction: column;
      align-items: flex-start;

      span.label {
        margin-left: 11px;
      }

      span.label ~ div {
        select {
          margin-left: 0;
          margin-top: 6px;
        }

        svg {
          top: 3px;
        }
      }
    `}

  ${({ size }) =>
    size === 'lg' &&
    css`
      select {
        font-size: 20px;
        font-weight: 700;
        padding: 9px 35px 9px 21px;
        border: none;
      }
    `}

  ${({ isRect }) =>
    isRect &&
    css`
      select {
        border-radius: 2px;
        padding: 6px 30px 5px 11px;
      }
    `}

  ${({ noPadding }) => noPadding && css`
    select {
      padding-top: 0;
      padding-bottom: 0;
      padding-left: 0;
    }
  `}

  ${({ weight }) => weight === 'light' && css`
    select {
      font-weight: normal;
    }
  `}
`

const SelectWrapper = styled.div`
  position: relative;

  svg {
    position: absolute;
    height: 100%;
    right: 10px;
  }
`

const Select = React.forwardRef(
  (
    {
      data,
      isTop,
      disabled = false,
      noGuide = false,
      noPadding = false,
      noLabel = false,
      size = 'sm',
      isRect = false,
      onChange,
      weight = 'bold'
    }: Props,
    ref: React.RefObject<HTMLSelectElement>,
  ) => {
    const [options, updateOptions] = React.useState(data.options)
    const [value, updateValue] = React.useState(data.defaultValue)
    const { label } = data

    React.useEffect(() => {
      if (isFullEmpty(label) && !noGuide) {
        updateOptions([{ label: data.guider, value: '' }, ...options])
      }
    }, [])

    React.useEffect(() => {
      if (isFullEmpty(label) && !noGuide) {
        updateOptions([{ label: data.guider, value: '' }, ...data.options])
      } else {
        updateOptions(data.options)
      }
      updateValue(data.value)
    }, [data])

    React.useEffect(() => {
      updateValue(data.value)
    }, [data.value])

    const handleChange = (e) => {
      updateValue(e.target.value)
      onChange && onChange(data.name, e.target.value)
    }

    return (
      <Wrapper 
        isTop={isTop} 
        size={size} 
        isRect={isRect} 
        noPadding={noPadding}
        weight={weight}>
        {!noLabel && label && <span className='label'>{label}</span>}
        <SelectWrapper>
          <select
            name={data.name}
            id={data.id}
            onChange={handleChange}
            value={value}
            disabled={disabled}
            ref={ref}
          >
            {options.map((option, i) => (
              <option key={i.toString()} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name='selectMore' size='14px' />
        </SelectWrapper>
      </Wrapper>
    )
  },
)

interface Props {
  // data: {
  //   name: string
  //   id: string
  //   label?: string
  //   guider: string
  //   defaultValue: string
  //   options: {
  //     value: string
  //     label: string
  //   }[]
  // }
  data: any
  disabled?: boolean
  isTop?: boolean
  isRect?: boolean
  noGuide?: boolean
  noPadding?: boolean
  noLabel?: boolean
  size?: 'sm' | 'lg'
  weight?: 'light' | 'bold'
  onChange?: (name: string, event: React.FormEvent<HTMLSelectElement>) => void
}

export default Select
