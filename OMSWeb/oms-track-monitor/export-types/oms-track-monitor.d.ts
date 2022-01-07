// @ts-ignore
import { IOmsTrackMonitor } from './IOmsTrackMonitor'

interface OmsTrackMonitorEventMap extends HTMLElementEventMap {
    "apple": CustomEvent<{ "A": "A" }>;
    "blue": CustomEvent<{ B: number }>;
}

interface OmsTrackMonitorElement extends HTMLElement {
    addEventListener<K extends keyof OmsTrackMonitorEventMap>(type: K, listener: (this: HTMLDivElement, ev: OmsTrackMonitorEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof OmsTrackMonitorEventMap>(type: K, listener: (this: HTMLDivElement, ev: OmsTrackMonitorEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var OmsTrackMonitorElement: {
    prototype: OmsTrackMonitorElement;
    new(): OmsTrackMonitorElement;
};

declare global {
    interface HTMLElementTagNameMap {
        "oms-track-monitor": OmsTrackMonitorElement;
    }
}

export { IOmsTrackMonitor, OmsTrackMonitorElement };