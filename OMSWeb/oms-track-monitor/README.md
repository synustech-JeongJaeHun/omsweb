# **oms-track-monitor**

## 프로젝트 목적

1. 이 프로젝트는 기존의 viewer-helper를 중심으로한 oms track visualizer 컴포넌트를 대체한다.
1. 유지보수가 가능한 코드를 유지한다.
1. Web Component 기반의 인터페이스로 기존 프레임워크와 관계없이 사용할 수 있게 한다.

## 기반 기술

1. [Vue 3.2](https://vuejs.org/)
   1. [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html#script-setup)
   1. [Web Components](https://vuejs.org/guide/extras/web-components.html#vue-and-web-components)
1. [Typescript 4.5](https://www.typescriptlang.org/)
1. [Vite 2.8](https://vitejs.dev/)
   1. [Library Mode](https://vitejs.dev/guide/build.html#library-mode)
   1. [Web Workers](https://vitejs.dev/guide/features.html#web-workers)

## 컴포넌트 기능

[컴포넌트 기능](./docs/component-feature.md)

## 인터페이스

[oms-track-monitor 인터페이스](./docs/component-interface.md)

## 시나리오

- [Component Setup 시나리오](./docs/component-setup.md)
- [Scale Level별 Visibility 시나리오](./docs/scale-level-visibility.md)
- [Scale Level별 Event 시나리오](./docs/scale-level-event.md)
- [Realtime Track Data Update 시나리오](./docs/realtime-update.md)
- [Playback Track Data Update 시나리오](./docs/playback-update.md)
