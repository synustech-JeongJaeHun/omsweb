import * as React from 'react'
import Input from './index'

export default {
  title: '@daimre-ui/form/Input',
  component: Input,
}

export const Basic = (args) => <Input {...args} />
Basic.args = {
  name: 'search',
}

export const Search = (args) => <Input {...args} />
Search.args = {
  name: 'search',
  type: 'search',
}

export const Disabled = (args) => <Input {...args} />
Disabled.args = {
  name: 'search',
  type: 'search',
  disabled: true,
}

export const Label = (args) => <Input {...args} />
Label.args = {
  name: 'min',
  type: 'basic',
  label: '최소',
}