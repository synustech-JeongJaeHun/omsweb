// @ts-nocheck
/**
 *
 * TimeRangePicker
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import Icon from '../Icon'
import classNames from 'classnames'

type StyleType = {
  
}

const Wrapper = styled.div`
  font-size: 12px;
  width: 320px;
  position: relative;

  .picker-trigger {
    &-inner {
      display: flex;
      align-items: center;
      border: 1px solid #31497C;
      border-radius: 3px;
      width: 100%;
      height: 30px;
    }

    &-head {
      width: 50px;
      flex-shrink: 0;
      border-right: 1px solid #31497C;
      color: #6C80B9;
      text-align: right;
      padding-right: 6px;
    }

    &-body {
      flex: 1 1 auto;
      display: flex;
      padding-left: 9px;
      padding-right: 10px;

      &-text {
        flex: 1 1 auto;
      }

      &-icon {
      }
    }
  }

  .picker-list {
    width: 320px;
    background-color: ${color.bg};
    margin-top: 3px;
    position: absolute;
    top: 30px;
    left: 0;
    z-index: 5;
    visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};

    ul { 
      border: 1px solid #678CF4;

      li {
        height: 28px;

        & > a {
          display: flex;
          align-items: center;
          height: 100%;

          .abbr {
            width: 50px;
            text-align: right;
            color: #6C80B9;
            padding-right: 6px;
          }

          .label {
            padding-left: 10px;
          }

          &:hover, &.preview {
            background-color: #283862;
          }

          &.selected {
            background-color: #4560A7;

            &:hover {
              background-color: #4560A7;
            }
          }
        }
      }
    }
  }
`

const list = [
  {
    label: '지난 1시간',
    value: '1h'
  },
  {
    label: '지난 2시간',
    value: '2h'
  },
  {
    label: '지난 4시간',
    value: '4h'
  },
  {
    label: '지난 하루',
    value: '1d'
  },
]

const TimeRangePicker: React.FC<Props> = ({ 
  onChange, 
  isReset = false 
}:Props) => {
  const [isOpen, updateOpen] = React.useState(false)
  const [currentIdx, updateIdx] = React.useState(0)
  const [previewIdx, updatePreviewIdx] = React.useState(0)
  const [currentItem, updateItem] = React.useState(list[currentIdx])
  const tempIdx = React.useRef(0)

  const watchKeyup = React.useCallback((e) => {
    if (isOpen) {
      if (e.keyCode === 38) {
        tempIdx.current = previewIdx <= 0 ? list.length - 1 : previewIdx - 1
        updatePreviewIdx(tempIdx.current)
      }

      if (e.keyCode === 40) {
        tempIdx.current = previewIdx >= list.length - 1 ? 0 : previewIdx + 1
        updatePreviewIdx(tempIdx.current)
      }
    }

    if (e.keyCode === 13) {
      updateIdx(tempIdx.current)
    }
  }, [previewIdx, isOpen])

  React.useEffect(() => {
    if(isReset) {
      updateIdx(0)
    }
  }, [isReset])

  React.useEffect(() => {
    window.addEventListener('keyup', watchKeyup)
    return () => window.removeEventListener('keyup', watchKeyup)
  }, [previewIdx, isOpen])

  React.useEffect(() => {
    const value = list[currentIdx]
    updateItem(value)
    onChange && onChange(value)
  }, [currentIdx])

  const handleInputClick = (e) => {
    e.preventDefault()
    updatePreviewIdx(currentIdx)
    updateOpen(!isOpen)
  }

  const handleItemClick = (index) => (e) => {
    e.preventDefault()
    updateIdx(index)
    updatePreviewIdx(index)
    updateOpen(false)
  }

  const handleBlur = () => {
    setTimeout(() => {
      updateOpen(false)
    }, 200)
  }

  const getItemClass = (i) => {
    return classNames({ preview: previewIdx === i, selected: currentIdx === i })
  }

  return (
    <Wrapper isOpen={isOpen}>
      <div className="picker-trigger">
        <a 
          className='picker-trigger-inner' 
          href="#" 
          onClick={handleInputClick} 
          onBlur={handleBlur}>
          <div className="picker-trigger-head">{currentItem.value}</div>
          <div className="picker-trigger-body">
            <div className="picker-trigger-body-text">{currentItem.label}</div>
            <div className="picker-trigger-body-icon">
              <Icon name='selectMore' size='14px' />
            </div>
          </div>
        </a>
      </div>
      <div className="picker-list">
        <ul>
          {list.map(({ label, value }, i) => {
            return (
              <li key={i.toString()}>
                <a 
                  href="#" 
                  className={getItemClass(i)} 
                  onClick={handleItemClick(i)}>
                  <div className="abbr">{value}</div>
                  <div className="label">{label}</div>
                </a>
              </li>    
            )
          })}
        </ul>
      </div>
    </Wrapper>
  )
}

TimeRangePicker.defaultProps = {
  onChange: () => {}
}

interface Props {
  onChange: (value: any) => void
  isReset: boolean
}

export default TimeRangePicker
