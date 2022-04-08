/* eslint-disable @typescript-eslint/no-empty-interface */
import * as React from 'react'
import styled from '@emotion/styled'
import Icon from '../Icon'

const Wrapper = styled.div``

const Avatar: React.FC<Props> = () => {

  return (
    <Wrapper>
      <Icon name='avatar' size='26px' />
    </Wrapper>
  )
}

interface Props {}

export default Avatar
