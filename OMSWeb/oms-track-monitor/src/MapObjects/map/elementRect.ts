import { reactive, readonly } from "vue";
import { ElementDefaultRect } from "./default";

const elementRect = reactive({
  width: ElementDefaultRect.width,
  height: ElementDefaultRect.height,
})
function setElementRect(width: number, height: number) {
  elementRect.width = width
  elementRect.height = height
}

const elementRectInfo = readonly(elementRect)

function getElementRatio() {
  return elementRectInfo.width / elementRectInfo.height
}

function getWidthFromHeightAndRatio(height: number) {
  return getElementRatio() * height
}

function getHeightFromWidthAndRatio(width: number) {
  return width / getElementRatio()
}


export { elementRectInfo, setElementRect, getElementRatio, getWidthFromHeightAndRatio, getHeightFromWidthAndRatio }