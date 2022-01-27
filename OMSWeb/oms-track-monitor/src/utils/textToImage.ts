
const
  Type = 'image/webp',
  EncoderOptions = 0.1,
  DefaultFontSize = 20

type Style = {
  fontStyle?: string,
  textAlign?: "start" | "end" | "left" | "right" | "center"
  textBaseline?: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"
  direction?: "ltr" | "rtl" | "inherit"
}

function convertStringToImageDataUrl(text: string, size: number = DefaultFontSize, style?: Style) {
  const
    VerticalMargin = 0.3 * size,
    HorizontalMargin = 0.1 * size,
    canvasElement = document.createElement('canvas'),
    context = canvasElement.getContext('2d')!

  canvasElement.width = text.length * size + HorizontalMargin
  canvasElement.height = size + VerticalMargin
  context.clearRect(0, 0, canvasElement.width, canvasElement.height)

  // https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Drawing_text
  // https://developer.mozilla.org/ko/docs/Web/CSS/font-family
  context.font = `${size}px ${style?.fontStyle ?? "system-ui"}`;
  if (style?.textAlign) context.textAlign = style.textAlign
  if (style?.textBaseline) context.textBaseline = style.textBaseline
  if (style?.direction) context.direction = style.direction
  context.fillText(text, 0, size, canvasElement.width)

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
  // https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap
  return canvasElement.toDataURL(Type, EncoderOptions)
}

export { convertStringToImageDataUrl }