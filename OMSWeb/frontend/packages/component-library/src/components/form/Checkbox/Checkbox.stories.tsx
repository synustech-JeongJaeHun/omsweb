import * as React from 'react'
import styled from '@emotion/styled'
import Checkbox from './index'

export default {
  title: '@daimre-ui/Form/Checkbox',
  component: Checkbox,
}

export const Basic = (args) => <Checkbox {...args} />
Basic.args = {
  name: 'hello',
  label: 'CPU',
  checked: true,
  disabled: false,
}

const CheckboxWrapper = styled.div`
  /* display: flex; */
`

export const Multiple = (args) => (
  <>
    <Checkbox name='cpu' label='CPU' />
    <Checkbox name='memory' label='메모리' checked />
    <Checkbox name='disk' label='디스크' />
    <Checkbox name='network' label='네트워크' />
  </>
)

export const Disabled = (args) => (
  <>
    <Checkbox name='cpu' label='CPU' disabled />
    <Checkbox name='memory' label='메모리' />
    <Checkbox name='disk' label='디스크' />
    <Checkbox name='network' label='네트워크' />
  </>
)
