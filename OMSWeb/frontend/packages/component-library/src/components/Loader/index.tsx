/**
 *
 * Loader
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@synusdev/styles'
import MoonLoader from 'react-spinners/MoonLoader'

type StyleType = {
  
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
`

const Loader: React.FC<Props> = ({ 
  size = 25,
}:Props) => {

  return (
    <Wrapper>
      <MoonLoader size={size} color={color.primary} />
    </Wrapper>
  )
}

interface Props {
  size: number
}

export default Loader
