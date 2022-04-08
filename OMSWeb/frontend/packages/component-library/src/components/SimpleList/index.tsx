/**
 *
 * SimpleList
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import classNames from 'classnames'

type StyleType = {
  
}

const Wrapper = styled.div`
  .title {
    padding-left: 30px;
    margin-bottom: 7px;
    opacity: 0.72;
  }

  ul { 
    font-size: 14px;
    line-height: 24px;

    li {

      a {
        display: block;
        padding-left: 16px;

        .text {
          position: relative;
          display: block;
          padding-left: 14px;
          opacity: 0.72;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          height: 24px;

          &:before {
            content: '';
            position: absolute;
            bottom: 9px;
            left: 0;
            width: 5px;
            height: 5px;
            background-color: white;
            border-radius: 50%;
          }
        }
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      &.selected {
        a {
          background-color: #586EAD;

          .text {
            opacity: 1;
          }
        }
      }
    }
  }
`

const exData = [
  {
    name: 'project-1',
    value: 'project-1',
  },
  {
    name: 'project-2',
    value: 'project-2'
  },
  {
    name: 'project-3',
    value: 'project-3'
  },
  {
    name: 'project-4',
    value: 'project-4'
  },
  {
    name: 'project-5',
    value: 'project-5'
  }
]

const SimpleList: React.FC<Props> = ({
  title,
  data, 
  onClick
}:Props) => {
  const [idx, updateIdx] = React.useState(0)

  const handleClick = idx => (e) => {
    e.preventDefault()
    updateIdx(idx)
    onClick && onClick(data[idx])
  }

  return (
    <Wrapper>
      <div className="title">{title}</div>
      <ul>
        {data.map(({ name }, i) => {
          const className = classNames({ selected: i === idx })
          return (
            <li key={i.toString()} className={className}>
              <a href="#" onClick={handleClick(i)}>
                <span className='text'>{name}</span>
              </a>
            </li>    
          )
        })}
      </ul>
    </Wrapper>
  )
}

SimpleList.defaultProps = {
  onClick: () => {},
  data: exData,
  title: 'projects'
}

interface Props {
  title: string
  data?: any
  onClick?: (value: any) => void
}

export default SimpleList
