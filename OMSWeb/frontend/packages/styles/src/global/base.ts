import { css } from '@emotion/react'
import { color } from '../constants'

const base = css`
  h1,
  h2,
  h3,
  h4,
  h5 {
    margin-top: 0;
    margin-bottom: 0;
    line-height: 1.2;
  }

  #root {
    height: 100%;
  }

  a {
    color: ${color.text};
    text-decoration: none;
    cursor: pointer;
  }

  ol,
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  p {
    margin: 0;
  }

  em {
    font-style: normal;
  }

  figure {
    margin: 0;
  }

  dl {
    margin: 0;

    dt,
    dd {
      margin: 0;
    }
  }

  img {
    vertical-align: text-bottom;
  }

  button {
    cursor: pointer;
  }

  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button,
  input {
    overflow: visible;
  }

  button,
  select {
    text-transform: none;
  }

  button,
  [type='button'],
  [type='reset'],
  [type='submit'] {
    -webkit-appearance: button;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: none;
    border-radius: none;
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(78, 78, 78, 0.6);

    &:hover {
      background-color: rgba(78, 78, 78, 1);
    }
  }

  ::-webkit-scrollbar-corner {
    background: transparent;
  }
`

export default base
