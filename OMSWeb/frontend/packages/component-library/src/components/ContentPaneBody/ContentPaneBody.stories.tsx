/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react'
import styled from '@emotion/styled'
import { css, jsx } from '@emotion/react'
import Container from '../layout/Container'
import RCol from '../layout/RCol'
import ContentPaneBody from './index'

export default {
  title: '@daimre-ui/ContentPaneBody',
  component: ContentPaneBody,
}

type StyledProps = {
  height?: string
}

const Wrapper = styled.div<StyledProps>`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px;
  width: 100%;
  ${({ height }) =>
    height
      ? css`
          height: ${height};
        `
      : css``}
`

export const Basic = (args) => (
  <ContentPaneBody>
    <Container>
      <RCol col={6} sm={12} md={6} lg={6}>
        <Wrapper height='100px'>responsive col1</Wrapper>
      </RCol>
      <RCol col={6} sm={12} md={6} lg={6}>
        <Wrapper height='100px'>responsive col2</Wrapper>
      </RCol>
    </Container>
  </ContentPaneBody>
)

export const Complex = (args) => (
  <ContentPaneBody>
    <Container>
      <RCol col={6} sm={12} md={6} lg={6}>
        <Wrapper height='100px'>responsive col1</Wrapper>
      </RCol>
      <RCol col={6} sm={12} md={6} lg={6}>
        <Container>
          <RCol col={4} sm={4} md={4} lg={4}>
            <Wrapper height='100px'>responsive nested col1</Wrapper>
          </RCol>
          <RCol col={4} sm={4} md={4} lg={4}>
            <Wrapper height='100px'>responsive nested col2</Wrapper>
          </RCol>
          <RCol col={4} sm={4} md={4} lg={4}>
            <Wrapper height='100px'>responsive nested col3</Wrapper>
          </RCol>
        </Container>
      </RCol>
    </Container>
  </ContentPaneBody>
)
