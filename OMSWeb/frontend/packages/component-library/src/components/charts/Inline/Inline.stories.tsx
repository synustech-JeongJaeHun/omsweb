import * as React from 'react'
import { genBaseline } from '@daimre/shared'
import Inline from './index'

export default {
  title: '@daimre-ui/charts/Inline',
  component: Inline,
}

const exData = [
  {
    name: '실제값',
    data: genBaseline(),
  },
]

export const Basic = (args) => <Inline {...args} />
Basic.args = {
  data: exData,
}
