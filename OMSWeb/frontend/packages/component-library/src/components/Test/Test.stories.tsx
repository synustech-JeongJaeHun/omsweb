import * as React from 'react'
import Test from './index'

export default {
  title: '@daimre-ui/Test',
  component: Test
}

export const Basic = (args) => <Test {...args} />
Basic.args = {}