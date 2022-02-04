import { reactive, readonly } from "vue";
import { DefaultHeight, DefaultWidth } from "./default";

const elementRect = reactive({
  width: DefaultWidth,
  height: DefaultHeight,
})
function setElementRect(width: number, height: number) {
  elementRect.width = width
  elementRect.height = height
}

const elementRectInfo = readonly(elementRect)

export { elementRectInfo, setElementRect }