import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { darken, lighten } from '@daimre/shared'

type ButtonTypes = Partial<Omit<Props, 'onClick' | 'props'>>

const CommanButton = styled.button<ButtonTypes>`

  ${({ full }) =>
    full &&
    css`
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      background: transparent;
    `}
  background-color: rgba(30, 38, 60, 1);
  padding: 5px 10px;

  ${({ transparent }) =>
    transparent &&
    css`
      background: transparent;
      padding: 0;
    `}

  ${({ backgroundColor }) =>
    backgroundColor &&
    css`
      background-color: ${backgroundColor};
    `}
  ${({ borderRadius }) =>
    borderRadius &&
    css`
      border-radius: ${borderRadius};
    `}

  border: none;
  color: white;
  transition: background-color 0.2s;
  width: ${({ width, full }) => width || (full ? '100%' : 'auto')};
  height: ${({ height, full }) => height || (full ? '100%' : 'auto')};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: 0;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  ${({ buttonType, backgroundColor, hoverColor, selected, selectedBg }) => {
    switch (buttonType) {
      case 'basic':
        return css`
          background-color: ${backgroundColor || '#1E263C'};

          &:hover {
            background-color: ${lighten(backgroundColor, 0.5) ||
            lighten('#1E263C', 0.5)};
          }

          &:disabled {
            background-color: ${backgroundColor || '#1E263C'};
          }
        `
      case 'line':
        return css`
          font-size: 14px;
          background-color: transparent;
          border: 1px solid ${color.inputLine};
          color: white;
          padding: 9px 20px;
          border-radius: 40px;

          &:hover {
            border-color: #31497c;
            background-color: rgba(48, 72, 121, 0.4);
          }
        `
      case 'solid':
        return css`
          font-size: 14px;
          background-color: ${backgroundColor || '#586EAD'};
          padding: 7px 11px;
          border-radius: 3px;

          &:hover {
            background-color: ${hoverColor || '#798BBE'};
          }
        `
      case 'tabbed':
        return css`
          background-color: #1f283c;
          color: #5e6f93;
          transition: color 0.25 ease;

          &:hover {
            color: rgba(255, 255, 255, 0.8);
            background-color: #1f283c;
          }

          ${selected &&
          css`
            color: white;
            background-color: ${selectedBg};

            &:hover {
              background-color: ${darken(selectedBg, 0.2)};
            }
          `}
        `
      case 'lnb':
        return css`
          ${selected &&
          css`
            color: white;
            background-color: #2e426c;

            &:hover {
              background-color: ${darken('#2E426C', 0.2)};
            }
          `}
        `
      default:
        return css``
    }
  }}
`

const Button: React.FC<Props> = ({
  buttonType = 'default',
  width,
  height,
  backgroundColor,
  hoverColor,
  borderRadius,
  full,
  transparent,
  selected,
  selectedBg,
  children,
  disabled,
  onClick,
  ...props
}: Props) => (
  <CommanButton
    buttonType={buttonType}
    width={width}
    height={height}
    transparent={transparent}
    backgroundColor={backgroundColor}
    hoverColor={hoverColor}
    borderRadius={borderRadius}
    full={full}
    selected={selected}
    selectedBg={selectedBg}
    disabled={disabled}
    onClick={onClick}
    {...props}
  >
    {children}
  </CommanButton>
)

interface Props {
  children: React.ReactNode
  buttonType?: 'default' | 'basic' | 'line' | 'solid' | 'tabbed' | 'lnb'
  full?: boolean
  transparent?: boolean
  width?: string
  height?: string
  backgroundColor?: string
  hoverColor?: string
  borderRadius?: string
  selected?: boolean
  selectedBg?: string
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  props?: any
}

export default Button
