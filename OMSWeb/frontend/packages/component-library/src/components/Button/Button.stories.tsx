import * as React from 'react'
import styled from '@emotion/styled'
import Icon from '../Icon'
import Button from './index'

export default {
  title: '@synusdev-ui/Button',
  component: Button,
}

export const Basic = (args) => <Button {...args}>hello world</Button>

const ButtonWrapper = styled.div`
  display: flex;
`

export const Transparent = (args) => (
  <ButtonWrapper>
    <Button {...args}>
      <Icon name='menu' size='35px' />
    </Button>
    <Button {...args} borderRadius='none'>
      <Icon name='setting' size='24px' />
    </Button>
  </ButtonWrapper>
)
Transparent.args = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  full: true,
  transparent: true,
}

export const BasicButton = (args) => <Button {...args}>hello world</Button>
BasicButton.args = {
  buttonType: 'basic',
  backgroundColor: '#1E263C',
}

export const LineButton = (args) => <Button {...args}>hello world</Button>
LineButton.args = {
  buttonType: 'line',
}

export const SolidButton = (args) => <Button {...args}>hello world</Button>
SolidButton.args = {
  buttonType: 'solid',
}

export const SolidBgButton = (args) => <Button {...args}>hello world</Button>
SolidBgButton.args = {
  buttonType: 'solid',
  backgroundColor: '#2A3658',
  hoverColor: '#555E79',
}

const DisabledWrapper = styled.div`
  /* display: flex;
  flex-wrap: nowrap; */

  button {
    margin-right: 10px;

    &:last-child {
      margin-right: 10px;
    }
  }
`

export const DisabledButton = (args) => (
  <DisabledWrapper>
    <Button buttonType='basic' backgroundColor='#1E263C' disabled>
      hello world
    </Button>
    <Button buttonType='line' disabled>
      hello world
    </Button>
    <Button buttonType='solid' disabled>
      hello world
    </Button>
    <Button
      buttonType='solid'
      backgroundColor='#2A3658'
      hoverColor='#555E79'
      disabled
    >
      hello world
    </Button>
  </DisabledWrapper>
)
