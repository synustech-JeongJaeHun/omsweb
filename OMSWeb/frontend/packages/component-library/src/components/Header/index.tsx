/** @jsxRuntime classic */
/** @jsx jsx */
// @ts-nocheck
import * as React from 'react'
import styled from '@emotion/styled'
import { css, jsx } from '@emotion/react'
import Icon from '../Icon'
import Button from '../Button'
import Avatar from '../Avatar'
import MultipleSelect from '../form/MultipleSelect'
import { zIndex } from '@synusdev/styles'

const HeaderBar = styled.header`
  flex: 0 0 65px;
  display: flex;
  background-color: #202943;
  /* height: 65px; */
  border-bottom: 1px solid #2d3e6a;
  z-index: ${zIndex.header};
`

const Col1 = styled.div`
  width: 250px;
  display: flex;
  align-items: center;
`

const Logo = styled.h1`
  margin-left: 10px;
  font-size: 20px;
  font-weight: 800;
`

const Col2 = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`

const headerButtonList = css`
  display: flex;
  height: 100%;

  li {
    width: 64px;
    height: 100%;
    border-left: 1px solid #2d3857;
  }
`

const Badge = styled.div`
  position: absolute;
  top: 14px;
  right: 8px;
  z-index: 1;
  padding: 3px 5px;
  background-color: #ff0000;
  border-radius: 10px;
  font-size: 10px;
  min-width: 20px;
  text-align: center;

  span {
    position: relative;
    top: -1px;
  }
`

const Header: React.FC<Props> = ({
  unreadCount = 0,
  onClickMenu,
  selectData,
  onClickProvider,
  onClickAlarm,
  onClickAvatar,
  onClickConfig,
}: Props) => {
  const isEmpty = unreadCount === 0

  return (
    <HeaderBar>
      <Col1>
        <Button
          transparent
          width='52px'
          height='52px'
          borderRadius='50%'
          css={css`
            margin-left: 4px;
          `}
          onClick={onClickMenu}
        >
          <Icon name='menu' size='35px' />
        </Button>
        <Logo>Symphony</Logo>
      </Col1>
      <Col2>
        <MultipleSelect data={selectData} onClick={onClickProvider} />
        <ul css={headerButtonList}>
          <li>
            <Button full transparent onClick={onClickAlarm}>
              {!isEmpty && (
                <Badge>
                  <span>{unreadCount}</span>
                </Badge>
              )}
              <Icon name='alarm' size='24px' />
            </Button>
          </li>
          {/*
            <li>
              <Button full transparent onClick={onClickConfig}>
                <Icon name='setting' size='24px' />
              </Button>
            </li>
          */}
          <li>
            <Button full transparent onClick={onClickAvatar}>
              <Avatar />
            </Button>
          </li>
        </ul>
      </Col2>
    </HeaderBar>
  )
}

interface Props {
  unreadCount?: number
  onClickMenu: (event: React.MouseEvent<HTMLElement>) => void
  selectData?: any
  onClickProvider?: (data?: any) => void
  onClickAlarm?: () => void
  onClickAvatar?: () => void
  onClickConfig?: () => void
}

export default Header
