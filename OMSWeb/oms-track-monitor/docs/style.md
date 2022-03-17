# 스타일 가이드

## `inline` vs `stylesheet`

oms-track-monitor 컴포넌트에서 사용하는 스타일은 아래 중 하나를 통해 적용된다.

1. id, class, data 등의 element attribute를 통한 stylesheet rule 적용
1. inline style

별도의 파일로 관리하기에 너무 적거나, 중요하지 않은 경우, 그리고 컴포넌트의 퍼포먼스에 영향을 주지 않는 경우 inline style을 적용하며 그외의 경우에는 stylesheet rule을 적용한다.

## `root style` vs `stylesheet file`

[Shadow DOM의 특수성](https://developer.mozilla.org/ko/docs/Web/Web_Components/Using_shadow_DOM)과 [Vue 프레임워크](https://vuejs.org/guide/extras/web-components.html#building-custom-elements-with-vue)의 [버그](https://github.com/vuejs/core/issues/4662)로 인하여 Root Component에서만 SFC Style을 사용할 수 있다.

그에 따라 CSS Rule의 특성에 따라 선언 위치를 구분한다.

- **root component [SFC style](https://vuejs.org/api/sfc-spec.html#sfc-syntax-specification)**
  - 컴포넌트의 configurable 속성을 사용하는 경우
  - 외부 스타일시트에서 사용해야하는 css variable을 선언할 경우
  - 룰은 간단하나, 컴포넌트 내부의 computed value를 사용하고, 퍼포먼스가 중요한 경우
- **external stylesheet file**
  - 시나리오가 복잡하고 computed value를 사용하는 경우
  - computed value를 사용하지 않는 경우

## stylesheet file의 위치

- `styles/sheets`: 프로젝트 내부에서 가장 공통적으로 사용할 경우
- `MapObjects/styles`: MapObject가 공통적으로 사용할 경우
- `TrackObjects/styles`: TrackObject가 공통적으로 사용할 경우
- `TrackObjects/...object.../styles`: 해당 object에서 사용할 경우
