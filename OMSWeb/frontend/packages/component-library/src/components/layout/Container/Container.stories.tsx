import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import faker from 'faker'
import { StatBoxListWrapper } from '../../StyledElement'
import Container from './index'
import Col from '../Col'

export default {
  title: '@synusdev-ui/layout/Container',
  component: Container,
}

type StyledProps = {
  height?: string
}

const Wrapper = styled.div<StyledProps>`
  background-color: rgba(0, 0, 0, 0.05);
  color: black;
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
  <Container {...args}>
    <Col col={6}>
      <Wrapper>col1 6</Wrapper>
    </Col>
    <Col col={6}>
      <Wrapper>col2 6</Wrapper>
    </Col>
    <Col col={6}>
      <Wrapper>col3 6</Wrapper>
    </Col>
    <Col col={6}>
      <Wrapper>col4 6</Wrapper>
    </Col>
  </Container>
)

export const SingleControlCenter = (args) => (
  <Container {...args}>
    <Col col={6}>
      <Wrapper>single control</Wrapper>
    </Col>
  </Container>
)
SingleControlCenter.args = {
  h: 'center',
}

export const SingleControlRight = (args) => (
  <Container {...args}>
    <Col col={6}>
      <Wrapper>single control</Wrapper>
    </Col>
  </Container>
)
SingleControlRight.args = {
  h: 'right',
}

export const NotEqual = (args) => (
  <Container {...args}>
    <Col col={6}>
      <Wrapper>single control</Wrapper>
    </Col>
    <Col col={6}>
      <Wrapper>{faker.lorem.paragraphs()}</Wrapper>
    </Col>
  </Container>
)

export const Equal = (args) => (
  <Container {...args}>
    <Col col={6}>
      <Wrapper>single control</Wrapper>
    </Col>
    <Col col={6}>
      <Wrapper>{faker.lorem.paragraphs()}</Wrapper>
    </Col>
  </Container>
)
Equal.args = {
  equalHeight: true,
}

export const PositionVTop = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper>single control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='300px'>single control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='200px'>single control</Wrapper>
    </Col>
  </Container>
)

PositionVTop.args = {
  v: 'top',
}

export const PositionVMiddle = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper>single control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='300px'>single control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='200px'>single control</Wrapper>
    </Col>
  </Container>
)

PositionVMiddle.args = {
  v: 'middle',
}

export const PositionVBottom = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper>single control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='300px'>single control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='200px'>single control</Wrapper>
    </Col>
  </Container>
)

PositionVBottom.args = {
  v: 'bottom',
}

export const Nested = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper height='100px'>single control</Wrapper>
    </Col>
    <Col col={8}>
      <Container>
        <Col col={6}>
          <Wrapper>nested col1</Wrapper>
        </Col>
        <Col col={6}>
          <Wrapper>nested col2</Wrapper>
        </Col>
        <Col col={6}>
          <Wrapper>nested col3</Wrapper>
        </Col>
        <Col col={6}>
          <Wrapper>nested col4</Wrapper>
        </Col>
      </Container>
    </Col>
  </Container>
)

export const ReversedBefore = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper>col1 reversed control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='100px'>col2 reversed control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col3 reversed control</Wrapper>
    </Col>
  </Container>
)

export const ReversedAfter = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper>col1 reversed control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='100px'>col2 reversed control</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col3 reversed control</Wrapper>
    </Col>
  </Container>
)
ReversedAfter.args = {
  reverse: true,
}

export const Offset = (args) => (
  <Container {...args}>
    <Col col={4} off={1}>
      <Wrapper height='80px'>offseted col1</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col2</Wrapper>
    </Col>
  </Container>
)

export const Gutter20 = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper height='80px'>col1</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col2</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col3</Wrapper>
    </Col>
  </Container>
)
Gutter20.args = {
  gutter: 20,
}

export const GutterBottom = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper height='80px'>col1</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col2</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col3</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col1</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col2</Wrapper>
    </Col>
    <Col col={4}>
      <Wrapper height='80px'>col3</Wrapper>
    </Col>
  </Container>
)
GutterBottom.args = {
  gutter: 10,
  bottomGutter: 20,
}

export const NestedGutter = (args) => (
  <Container {...args}>
    <Col col={4}>
      <Wrapper height='80px'>col1</Wrapper>
    </Col>
    <Col col={8}>
      <Container gutter={5}>
        <Col col={6}>
          <Wrapper height='80px'>col2</Wrapper>
        </Col>
        <Col col={6}>
          <Wrapper height='80px'>col3</Wrapper>
        </Col>
        <Col col={6}>
          <Wrapper height='80px'>col2</Wrapper>
        </Col>
        <Col col={6}>
          <Wrapper height='80px'>col3</Wrapper>
        </Col>
      </Container>
    </Col>
  </Container>
)
NestedGutter.args = {
  gutter: 10,
}
