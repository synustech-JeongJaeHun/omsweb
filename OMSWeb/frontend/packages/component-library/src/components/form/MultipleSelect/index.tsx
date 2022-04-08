/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { useImmer } from 'use-immer'
import Select from '../Select'
import Button from '../../Button'
import { isFullEmpty } from '@daimre/shared'

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  & > div {
    margin-right: 10px;
  }

  button {
    /* margin-left: 10px; */
  }
`

const selectLv1 = {
  name: 'providerType',
  id: 'provider-type-select',
  guider: '',
  options: [],
}

const selectLv2 = {
  name: 'provider',
  id: 'provider-select',
  guider: '',
  options: [],
}

const getValue = R.compose(R.prop('value'), R.head)
const getDefaultOrder = (keys) =>
  ['vmware', 'openstack', 'kubernetes']
    .map((item) => (R.includes(item, keys) ? item : undefined))
    .filter((item) => item !== undefined)
const getDefaultLv1 = (data) => {
  const keys = R.compose(getDefaultOrder, R.keys)(data)
  const options = keys.map((key) => ({ value: key, label: key }))
  const defaultValue = getValue(options)
  return [options, defaultValue]
}

const getDefaultLv2 = (value, data) => {
  const list = data[value]
  const options = list.map(({ nm, prvd_id }) => ({
    label: nm,
    value: prvd_id,
  }))
  const defaultValue = getValue(options)
  return [options, defaultValue]
}

const getName = (type, id, data) =>
  R.compose(R.prop('nm'), R.find(R.propEq('prvd_id', id)))(data[type])

const MultipleSelect: React.FC<Props> = ({ data, onClick }: Props) => {
  const [configLv1, setConfigLv1] = useImmer(selectLv1)
  const [configLv2, setConfigLv2] = useImmer(selectLv2)
  const selectLv1Ref = React.useRef({} as any)
  const selectLv2Ref = React.useRef({} as any)
  const [values, updateValues] = useImmer({
    provider: '',
    providerId: '',
  })
  const [isDisabled, updateDisabled] = React.useState(true)

  React.useEffect(() => {
    const [options, defaultValue] = getDefaultLv1(data)
    const [lv2Options, lv2Default] = getDefaultLv2(defaultValue, data)
    setConfigLv1((draft: any) => {
      draft.options = options
      draft.value = defaultValue
    })
    setConfigLv2((draft: any) => {
      draft.options = lv2Options
      draft.value = lv2Default
    })
    updateValues((draft: any) => {
      draft.provider = defaultValue
      draft.providerId = lv2Default
    })
  }, [data])

  const checkDisabled = (provider, providerId) => {
    updateDisabled(R.equals(values, { provider, providerId }))
  }

  const handleChangeLv1 = (key, value) => {
    const [options, defaultValue] = getDefaultLv2(value, data)
    setConfigLv2((draft: any) => {
      draft.options = options
      draft.value = defaultValue
    })

    checkDisabled(value, defaultValue)
  }

  const handleChangeLv2 = (key, value) => {
    const selectLv1Value = selectLv1Ref.current.value
    checkDisabled(selectLv1Value, value)
  }

  const handleClick = () => {
    const selectLv1Value = selectLv1Ref.current.value
    const selectLv2Value = selectLv2Ref.current.value

    updateValues((draft: any) => {
      draft.provider = selectLv1Value
      draft.providerId = selectLv2Value
    })

    // checkDisabled(selectLv1Value, selectLv2Value)
    updateDisabled(true)
    const ret = {
      type: selectLv1Value,
      id: selectLv2Value,
      name: getName(selectLv1Value, selectLv2Value, data),
    }

    onClick && onClick(ret)
  }

  return (
    <Wrapper>
      <Select
        ref={selectLv1Ref}
        data={configLv1}
        onChange={handleChangeLv1}
        size='lg'
        noGuide
      />
      <Select
        ref={selectLv2Ref}
        data={configLv2}
        onChange={handleChangeLv2}
        size='lg'
        noGuide
      />
      <Button onClick={handleClick} disabled={isDisabled} buttonType='line'>
        적용
      </Button>
    </Wrapper>
  )
}

interface Props {
  data?: any
  onClick?: (data: any) => void
}

export default MultipleSelect
