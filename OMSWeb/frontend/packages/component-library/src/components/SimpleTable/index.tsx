import * as React from 'react'
import styled from '@emotion/styled'
import { CompTitle } from '../StyledElement'
import { color } from '@daimre/styles'

const Wrapper = styled.div`
  table {
    font-size: 15px;
    border-spacing: 0px;
    border-bottom: 1px solid ${color.line};

    thead {
      background-color: #EFEFEF;
      color: #434343;
      text-align: center;

      td {
        padding: 23px 30px;
        border-left: 1px solid #EFEFEF;
        border-right: 1px solid ${color.line};

        &:last-of-type {
          border-right: none;
        }
      }
    }

    tbody {
      text-align: center;

      td {
        padding: 10px;

        &.percent {
          &:after {
            content: '%';
          }
        }
      }
    }
  }
`

const exData = {
  min: 15.1852662873,
  max: 17.6951871817,
  usage: 16.4402267345,
  prediction: 1.0,
  score: 1.0,
  model: 'xgboost',
}

const SimpleTable: React.FC<Props> = ({ data = exData }: Props) => {
  return (
    <Wrapper>
      <CompTitle>상세정보</CompTitle>
      <table>
        <thead>
          <tr>
            <td>신뢰구간(Min)</td>
            <td>신뢰구간(Max)</td>
            <td>예측값</td>
            <td>예측정확도</td>
            <td>상태</td>
            <td>예측모델</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.min}</td>
            <td>{data.max}</td>
            <td>{data.usage}</td>
            <td className='percent'>{data.prediction}</td>
            <td>{data.score}</td>
            <td>{data.model}</td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  )
}

interface Props {
  data?: any
}

export default SimpleTable
