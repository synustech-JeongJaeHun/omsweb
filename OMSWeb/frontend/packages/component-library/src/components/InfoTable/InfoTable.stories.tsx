import * as React from 'react'
import InfoTable from './index'

export default {
  title: '@synusdev-ui/InfoTable',
  component: InfoTable,
}

const emptyData = [
  [
    {
      label: '계층',
      value: '',
    },
  ],
  [
    {
      label: 'VM명',
      value: '',
    },
    {
      label: '신뢰구간 선정',
      value: '',
    },
  ],
  [
    {
      label: '상태',
      value: '',
    },
    {
      label: '예측모델',
      value: '',
    },
  ],
  [
    {
      label: '분석내용',
      value: '',
    },
    {
      label: '적용시 예상 효과',
      value: '',
    },
  ],
  [
    {
      label: '진단',
      value: '',
    },
  ],
]

const exData = [
  [
    {
      label: 'Range',
      value: '2021-09-06 09:05:24(1)~2021-09-06 09:15:24(10,367)',
    },
  ],
  [
    {
      label: 'Utilization',
      value: '67.78%',
    },
  ],
  [
    {
      label: 'Delivery Time (created ~ completed)',
      value: '87.10s, order count: 10,191',
    },
  ],
  [
    {
      label: 'Wait Time (created ~ loaded)',
      value: '29.28s, order count: 10,310',
    },
  ],
  [
    {
      label: 'Transfer time (loaded ~ completed)',
      value: '57.84s, order count: 10,191',
    },
  ],
  [
    {
      label: 'Assign time (created ~ assigned)',
      value: '1.84s, order count: 10,191',
    },
  ],
  [
    {
      label: 'Order Change',
      value: '65.61% (6,792/10,368)',
    },
  ],
  [
    {
      label: 'Number of order requests',
      value: 'per second: 2.0011, estimated per day: 172,894',
    },
  ],
]

export const Basic = (args) => <InfoTable {...args} />
Basic.args = {
  data: exData,
}

export const Empty = (args) => <InfoTable {...args} />
Empty.args = {
  data: emptyData,
}

export const Placeholder = (args) => <InfoTable {...args} />
Placeholder.args = {
  data: undefined,
	isPlaceholder: true
}
