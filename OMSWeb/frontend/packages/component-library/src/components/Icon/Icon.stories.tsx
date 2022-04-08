import React, { FC } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

import { icons } from '@daimre/styles'
import Icon from './index'

interface Item {
  minimal?: boolean
}

const Meta = styled.div`
  color: #666;
  font-size: 12px;
`

const Item = styled.li<Item>`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  flex: 0 1 20%;
  min-width: 120px;

  padding: 0 7.5px 20px;

  svg {
    margin-right: 10px;
    width: 24px;
    height: 24px;
  }

  ${(props) =>
    props.minimal &&
    css`
      flex: none;
      min-width: auto;
      padding: 0;
      /* background: #fff; */
      border: 1px solid #666;

      svg {
        display: block;
        margin-right: 0;
        width: 48px;
        height: 48px;
      }
    `}
`

const List = styled.ul`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
`

export default {
  title: '@daimre-ui/Icon',
  component: Icon,
}

export const Basic = (args) => <Icon {...args} />
Basic.args = { name: 'dashboard' }

export const Labels: FC = () => (
  <>
    There are {Object.keys(icons).length} icons
    <List>
      {Object.keys(icons).map((key) => (
        <Item key={key}>
          <Icon name={key as keyof typeof icons} aria-hidden />
          <Meta>{key}</Meta>
        </Item>
      ))}
    </List>
  </>
)

export const NoLabel = () => (
  <List>
    {Object.keys(icons).map((key) => (
      <Item minimal key={key}>
        <Icon name={key as keyof typeof icons} aria-label={key} />
      </Item>
    ))}
  </List>
)

export const Inline = () => (
  <>
    인라인 아이콘 예제 입니다. <Icon name='dashboard' aria-label='dashboard' />{' '}
    icon (default)
  </>
)

export const Block = () => (
  <>
    this is a block <Icon name='dashboard' aria-label='dashboard' block /> icon
  </>
)

export const Color = (args) => <Icon {...args} />
Color.args = { name: 'dashboard', color: 'red', size: '40px' }
