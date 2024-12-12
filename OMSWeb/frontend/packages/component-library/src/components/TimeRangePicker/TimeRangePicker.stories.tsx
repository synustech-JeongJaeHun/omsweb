import * as React from 'react'
import TimeRangePicker from './index'

export default {
  title: '@synusdev-ui/TimeRangePicker',
  component: TimeRangePicker
}

export const Basic = (args) => <TimeRangePicker {...args} />
Basic.args = {
  onChange: console.log
}
