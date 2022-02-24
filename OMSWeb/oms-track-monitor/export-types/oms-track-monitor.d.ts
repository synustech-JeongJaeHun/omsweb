// @ts-ignore
import { IOmsTrackMonitor } from './IOmsTrackMonitor'
import { EventDetails } from '../src/types/RootEmits'

interface OmsTrackMonitorEventMap {
  tooltipon: CustomEvent<EventDetails.TooltipOn[]>
  tooltipoff: CustomEvent<EventDetails.TooltipOff[]>
  focus: CustomEvent<EventDetails.Focus[]>
  contextmenu: CustomEvent<EventDetails.ContextmenuOn[]>
  backdrop: CustomEvent<EventDetails.Backdrop[]>
}

interface OmsTrackMonitorElement extends HTMLElement {
  addEventListener<K extends keyof OmsTrackMonitorEventMap>(
    type: K,
    listener: (
      this: HTMLDivElement,
      ev: OmsTrackMonitorEventMap[K]
    ) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof OmsTrackMonitorEventMap>(
    type: K,
    listener: (
      this: HTMLDivElement,
      ev: OmsTrackMonitorEventMap[K]
    ) => any,
    options?: boolean | EventListenerOptions
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void
}

declare var OmsTrackMonitorElement: {
  prototype: OmsTrackMonitorElement
  new(): OmsTrackMonitorElement
}

declare global {
  interface HTMLElementTagNameMap {
    'oms-track-monitor': OmsTrackMonitorElement
  }
}

export { IOmsTrackMonitor, OmsTrackMonitorElement }
