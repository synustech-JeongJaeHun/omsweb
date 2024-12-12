import * as React from 'react'
import MultipleSelect from './index'

export default {
  title: '@synusdev-ui/form/MultipleSelect',
  component: MultipleSelect,
}

const exData = {
  vmware: [
    {
      name: 'vcenter-1',
      id: 'vmware12313',
    },
    {
      name: 'vcenter-3',
      id: 'vmware32424',
    },
  ],
  openstack: [
    {
      name: 'openstack-1',
      id: 'openstack20200709080543',
    },
    {
      name: 'openstack-3',
      id: 'openstack202007021342314',
    },
  ],
}

export const Basic = (args) => <MultipleSelect {...args} />
Basic.args = {
  data: exData,
}
