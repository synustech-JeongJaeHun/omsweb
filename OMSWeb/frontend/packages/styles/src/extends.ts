import { css } from '@emotion/react'

export const ellip = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const pointer = css`
  cursor: pointer;
`

export const grab = css`
  cursor: -moz-grab;
  cursor: -webkit-grab;
  cursor: grab;
`

export const grabbing = css`
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
  cursor: grabbing;
`

export const scrollFreeze = css``

export const flexCenterCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const size = (width: string, height: string) => css`
  width: ${width};
  height: ${height};
`
