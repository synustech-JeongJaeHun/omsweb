import { css } from '@emotion/react'

const fontFace = css`
  @font-face {
    font-family: 'NS';
    font-weight: 300;
    src: url(/assets/fonts/NanumSquareL.eot);
    src: url(/assets/fonts/NanumSquareL.eot?#iefix) format('embedded-opentype'),
      url(/assets/fonts/NanumSquareL.woff) format('woff'),
      url(/assets/fonts/NanumSquareL.ttf) format('truetype');
  }
  @font-face {
    font-family: 'NS';
    font-weight: 400;
    src: url(/assets/fonts/NanumSquareR.eot);
    src: url(/assets/fonts/NanumSquareR.eot?#iefix) format('embedded-opentype'),
      url(/assets/fonts/NanumSquareR.woff) format('woff'),
      url(/assets/fonts/NanumSquareR.ttf) format('truetype');
  }
  @font-face {
    font-family: 'NS';
    font-weight: 700;
    src: url(/assets/fonts/NanumSquareB.eot);
    src: url(/assets/fonts/NanumSquareB.eot?#iefix) format('embedded-opentype'),
      url(/assets/fonts/NanumSquareB.woff) format('woff'),
      url(/assets/fonts/NanumSquareB.ttf) format('truetype');
  }
  @font-face {
    font-family: 'NS';
    font-weight: 800;
    src: url(/assets/fonts/NanumSquareEB.eot);
    src: url(/assets/fonts/NanumSquareEB.eot?#iefix) format('embedded-opentype'),
      url(/assets/fonts/NanumSquareEB.woff) format('woff'),
      url(/assets/fonts/NanumSquareEB.ttf) format('truetype');
  }
`

export default fontFace
