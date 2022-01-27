const RootEmitInjectionKey = "RootEmit"
interface RootEmits {
  (e: 'backdrop', value: {}): void
  (e: 'leftclick', value: {}): void
  (e: 'rightclick', value: {}): void
  (e: 'mouseover', value: {}): void
  (e: 'rotate', value: {}): void
  (e: 'pan', value: {}): void
}

export { RootEmitInjectionKey, RootEmits }