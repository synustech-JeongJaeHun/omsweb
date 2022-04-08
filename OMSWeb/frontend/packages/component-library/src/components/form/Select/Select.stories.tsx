import * as React from 'react'
import Select from './index'

export default {
  title: '@daimre-ui/form/Select',
  component: Select,
}

const basicData = {
  name: 'pets',
  id: 'pet-select',
  guider: '제외한 VM보기',
  defaultValue: 'cat',
  options: [
    { value: 'dog', label: 'dog' },
    { value: 'cat', label: 'cat' },
    { value: 'hamster', label: 'hamster' },
    { value: 'parrot', label: 'parrot' },
    { value: 'spider', label: 'spider' },
  ],
}

const noGuideData = {
  name: 'providerType',
  id: 'provider-type-select',
  guider: '프로파이더 타입을 선택해주세요',
  defaultValue: 'cat',
  options: [
    { value: 'vmware', label: 'vmware' },
    { value: 'openstack', label: 'openstack' },
  ],
}

export const Basic = (args) => <Select {...args} />
Basic.args = {
  data: basicData,
}

export const Rect = (args) => <Select {...args} />
Rect.args = {
  data: basicData,
  isRect: true,
}

export const LabelSelect = (args) => <Select {...args} />
LabelSelect.args = {
  data: { ...basicData, label: '반려동물' },
}

export const TopLabelSelect = (args) => <Select {...args} />
TopLabelSelect.args = {
  data: { ...basicData, label: '반려동물' },
  isTop: true,
}

export const DisabledSelect = (args) => <Select {...args} />
DisabledSelect.args = {
  data: { ...basicData, label: '반려동물' },
  isTop: true,
  disabled: true,
}

export const NoGuideSelect = (args) => <Select {...args} />
NoGuideSelect.args = {
  data: { ...noGuideData },
  size: 'lg',
  noGuide: true,
}
