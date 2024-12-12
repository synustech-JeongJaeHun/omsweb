import * as React from 'react'
import styled from '@emotion/styled'
import { icons } from '@synusdev/styles'

const Svg = styled.svg<Partial<Props>>`
  display: ${(props) => (props.block ? 'block' : 'inline-block')};
  vertical-align: middle;

  shape-rendering: inherit;
  transform: translate3d(0, 0, 0);
`

const Path = styled.path`
  fill: currentColor;
`

const Icon: React.FC<Props> = ({
  name,
  size = '20px',
  block = false,
  ...props
}: Props) => (
  <Svg
    viewBox='0 0 1024 1024'
    width={size}
    height={size}
    block={block}
    {...props}
  >
    <Path d={icons[name]} />
  </Svg>
)

interface Props {
  name: keyof typeof icons
  /** 아이콘 사이즈. 정사각형 개념임 */
  size?: string
  /** 원하는 값을 집어 넣으면 설명으로 나온다 */
  block?: boolean
  color?: string
}

export default Icon
