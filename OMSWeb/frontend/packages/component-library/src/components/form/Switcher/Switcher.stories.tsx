import * as React from 'react'
import Switcher from './index'

export default {
  title: '@daimre-ui/form/Switcher',
  component: Switcher,
}

export const Basic = (args) => <Switcher {...args} />
Basic.args = {
  title: '모아보기',
  checked: true,
}

export const Disabled = (args) => <Switcher {...args} />
Disabled.args = {
  title: '모아보기',
  checked: true,
  disabled: true,
}
