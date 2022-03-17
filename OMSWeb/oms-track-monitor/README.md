# **oms-track-monitor**

## 프로젝트 목적

1. 이 프로젝트는 기존의 viewer-helper를 중심으로한 oms track visualizer 컴포넌트를 대체한다.
1. 유지보수가 가능한 상태를 유지한다.
1. Web Component 기반의 인터페이스로 기존 프레임워크와 관계없이 사용할 수 있게 한다.

---

## 컴포넌트 사용하기

### 컴포넌트

- [로컬 패키지 사용하기](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#local-paths)
- [웹 컴포넌트 사용하기](./docs/using-web-component.md)
- [컴포넌트 기능](./docs/component-feature.md)

### 인터페이스

- [oms-track-monitor 인터페이스](./docs/component-interface.md)
- [데이터 타입](./docs/types.md)

### 시나리오

- [Scale Level별 시각화/이벤트 시나리오 (excel)](./docs/scale-level-scenario.xlsx)

---

## 컴포넌트 개발하기

### 기반 기술

1. [Vue 3.2](https://vuejs.org/)
   1. [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html#script-setup)
   1. [Web Components](https://vuejs.org/guide/extras/web-components.html#vue-and-web-components)
1. [Typescript 4.5](https://www.typescriptlang.org/)
1. [Vite 2.8](https://vitejs.dev/)
   1. [Library Mode](https://vitejs.dev/guide/build.html#library-mode)
   1. [Web Workers](https://vitejs.dev/guide/features.html#web-workers)
   1. [vite-svg-loader](https://github.com/jpkleemans/vite-svg-loader#readme)

### 개발 환경

- `npm: 6`
- `node: 14`
- `google chrome: evergreen`

1. 프로젝트에 바로 적용하여 개발
   - 핫 리로딩 적용되지 않음
   - 별도의 테스트용 코드 없이 개발 가능
1. `npm run dev`를 통해 테스트 페이지에서 개발
   - esmodule 기반 핫리로딩 적용
   - 별도의 테스트용 코드 필요

### 프로젝트 가이드

- [프로젝트 구조 문서](./docs/structure.md)
- [컴포넌트 스타일](./docs/style.md)

### 빌드

본 프로젝트는 Vite와 Vite Library Mode를 사용하며, 프로젝트 Entry File은 `src/oms-track-monitor.ts`이다. [vite.config.ts](./vite.config.ts) 파일 확인.

본 프로젝트 위치에서 `npm run build` 명령을 내리면 `dist` 폴더로 빌드 결과물이 출력된다.
