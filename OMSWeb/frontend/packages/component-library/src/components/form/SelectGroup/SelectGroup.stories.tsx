import * as React from 'react'
import SelectGroup from './index'

export default {
  title: '@synusdev-ui/form/SelectGroup',
  component: SelectGroup,
}

const commonData = [
  {
    name: 'cpu',
    label: 'CPU',
    id: 'cpu-select',
    guider: 'cpu parameter',
    defaultValue: '',
    options: [
      { value: 'cpu-1', label: 'cpu-1' },
      { value: 'cpu-2', label: 'cpu-2' },
      { value: 'cpu-3', label: 'cpu-3' },
      { value: 'cpu-4', label: 'cpu-4' },
      { value: 'cpu-5', label: 'cpu-5' },
    ],
  },
  {
    name: 'memory',
    label: '메모리',
    id: 'memory-select',
    guider: '메모리 parameter',
    defaultValue: '',
    options: [
      { value: 'memory-1', label: 'memory-1' },
      { value: 'memory-2', label: 'memory-2' },
      { value: 'memory-3', label: 'memory-3' },
      { value: 'memory-4', label: 'memory-4' },
      { value: 'memory-5', label: 'memory-5' },
    ],
  },
  {
    name: 'network',
    label: '네트워크',
    id: 'network-select',
    guider: '네트워크 parameter',
    defaultValue: '',
    options: [
      { value: 'network-1', label: 'network-1' },
      { value: 'network-2', label: 'network-2' },
      { value: 'network-3', label: 'network-3' },
      { value: 'network-4', label: 'network-4' },
      { value: 'network-5', label: 'network-5' },
    ],
  },
]

export const Basic = (args) => <SelectGroup {...args} />
Basic.args = {
  data: commonData,
}

export const AlignRight = (args) => <SelectGroup {...args} />
AlignRight.args = {
  data: commonData,
  align: 'right',
}

export const IsTop = (args) => <SelectGroup {...args} />
IsTop.args = {
  data: commonData,
  isTop: true,
}

export const Callback = (args) => <SelectGroup {...args} />
Callback.args = {
  data: commonData,
  isTop: true,
  onChange: (values) => {
  },
}

export const Disabled = (args) => <SelectGroup {...args} />
Disabled.args = {
  data: commonData,
  isTop: true,
  disabled: true,
}
