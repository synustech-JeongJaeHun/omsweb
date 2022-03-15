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

### 디렉토리 구조

#### `📁legacies`

viewer-helper에서 사용한 타입 파일들.

단계적으로 제거한다.

#### `📁styles`

컴포넌트에 적용되는 스타일시트와 변경가능한 스타일 값의 모음.

#### `📁types`

컴포넌트 전역적으로 사용하는 타입과 루트 컴포넌트에서 사용하는 타입의 모음.

#### `📁utils`

컴포넌트 전역적으로 사용하는 함수와 루트 컴포넌트에서 사용하는 함수의 모음.

#### `📁TrackObjects`

Track 내에 실재하는 요소들의 모음.

- `📁buffer`
- `📁cluster`
- `📁group`
- `📁mtl`
- `📁point`
- `📁segment`
- `📁station`
- `📁vehicle`
- `📁zcu`
- _`📁utils`_: Buffer와 Station이 공용으로 사용하는 함수가 포함되어 있음

각 요소는 공통으로 아래 형태의 구조를 가진다.

- `📁object`
  - `📁components`
  - `📁types`
  - `📁utils`
  - ...`🗒️instacne.ts`

#### `📁MapObjects`

Track 내에 실재하는 요소는 아니나, 컴포넌트의 시각적 정보를 담고있는 요소들의 모음.

- `📁focus`: Focus된 오브젝트를 관리하기 위한 요소
- `📁track`: Track된 오브젝트를 관리하기 위한 요소
- `📁map`: 맵의 메타데이터와 카메라 등 메인 맵을 관리하기 위한 요소
- `📁minimap`: 미니맵을 관리하는 요소
- `📁rotate`: 맵의 회전을 관리하는 요소
- `📁scale`: 카메라의 확대를 관리하는 요소

각 요소는 공통으로 아래 형태의 구조를 가진다.

- `📁object`
  - `📁components`
  - `📁types`
  - `📁utils`
  - ...`🗒️instacne.ts`

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

### 빌드

본 프로젝트는 Vite와 Vite Library Mode를 사용하며, 프로젝트 Entry File은 `src/oms-track-monitor.ts`이다. [vite.config.ts](./vite.config.ts) 파일 확인.

본 프로젝트 위치에서 `npm run build` 명령을 내리면 `dist` 폴더로 빌드 결과물이 출력된다.
