import * as React from 'react'
import CheckboxGroup from './index'

export default {
  title: '@synusdev-ui/form/CheckboxGroup',
  component: CheckboxGroup,
}

const checkboxData = [
  {
    checked: false,
    name: 'cpu',
    label: 'CPU',
  },
  {
    checked: true,
    name: 'memory',
    label: '메모리',
  },
  {
    checked: false,
    name: 'disk',
    label: '디스크',
  },
  {
    checked: false,
    name: 'network',
    label: '네트워크',
  },
]
export const Basic = (args) => <CheckboxGroup {...args} />
Basic.args = {
  data: checkboxData,
}

export const Disabled = (args) => <CheckboxGroup {...args} />
Disabled.args = {
  data: checkboxData,
  disabled: true,
}
