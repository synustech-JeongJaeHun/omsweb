import * as React from 'react'
import styled from '@emotion/styled'
import Scrollable from './index'

export default {
  title: '@daimre-ui/Scrollable',
  component: Scrollable,
}

const TestComp = styled.div`
  width: 600px;
  height: 600px;
  background-color: yellow;
  color: black;
  padding: 20px;
`

export const Basic = (args) => (
  <Scrollable {...args}>
    <TestComp>hello world</TestComp>
  </Scrollable>
)

Basic.args = {
  scroll: 'both',
}
