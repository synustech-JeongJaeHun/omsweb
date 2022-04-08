/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import * as React from 'react'
import styled from '@emotion/styled'
import Select from '../Select'
import { useImmer } from 'use-immer'

const Wrapper = styled.div<Pick<Props, 'align' | 'spacing'>>`
  display: flex;
  justify-content: ${({ align }) =>
    align === 'left' ? 'flex-start' : 'flex-end'};
  flex-wrap: wrap;

  & > div {
    margin-right: ${({ spacing }) => spacing || '30px'};
    margin-bottom: 10px;

    &:last-child {
      margin-right: 0;
    }
  }
`
const getInitalData = (data) =>
  data.map((item) => ({
    key: item.name,
    value: item.defaultValue,
    isSelected: false,
  }))

const SelectGroup: React.FC<Props> = ({
  data = [],
  align = 'left',
  isTop = false,
  noLabel = false,
  spacing,
  disabled = false,
  isRect = false,
  onChange,
}: Props) => {
  const [values, updateValues] = useImmer(getInitalData(data))

  const handleChange = (key, value) => {
    updateValues((draft) => {
      draft.forEach((item) => {
        if (item.key === key) {
          item.value = value
          item.isSelected = true
        } else {
          item.isSelected = false
        }
      })
    })
  }

  React.useEffect(() => {
    onChange && onChange(values)
  }, [values])

  return (
    <Wrapper align={align} spacing={spacing}>
      {data.map((item, i) => (
        <Select
          key={i.toString()}
          data={item}
          isTop={isTop}
          noLabel={noLabel}
          onChange={handleChange}
          disabled={disabled}
          isRect={isRect}
        />
      ))}
    </Wrapper>
  )
}

interface Props {
  data: any
  align?: 'left' | 'right'
  isTop?: boolean
  noLabel?: boolean
  disabled?: boolean
  spacing?: string
  isRect?: boolean
  onChange?: (
    values: {
      key: string
      value: string
    }[],
  ) => void
}

export default SelectGroup
