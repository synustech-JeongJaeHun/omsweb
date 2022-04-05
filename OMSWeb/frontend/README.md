# yarn-workspace-starter
이 프로젝트는 yarn 2.0(프로젝트명 berry) workspace를 이용해서 monorepo로 만들어진 boilerplate 입니다.

### 쓰이는 기술
- node 14.7.0
- yarn 2.0(berry)
- react 17
- emotion 11
- typescript 4.x
- webpack 5.x
- storybook 6.x

### packages
- app : 최종 프로덕션되는 react-app
- component-library : react component library
  - internal 
    - d3, react component generator: 빠르게 기반 코드를 만들어 줄 수 있음 
  - components: react components
  - dataviz: d3 components
  - extra-stories: other stories
- shared : react app 과 component-library 공통으로 쓰이는 모듈
  - utils
  - styles
- styles

### 설치되어야 할 것들
- nodejs 14.7.0 +
- yarn berry


### jest
- shared util 함수 테스트 - ts, es6+로 된 소스 테스트

### done
- watch 병렬 처리


### icon svg data 추가
- 어도비 일러스트레이터(AI)로 1024px x 1024px 사이즈 canvas에 아이콘을 배치한다
- 아이콘 배치시 형태는 하나의 형태로 구성되어야 하기에 compound path로 단일화된 패스로 구성한다. 
- https://jakearchibald.github.io/svgomg/ 에 svg를 로딩하면 최적화가 안된 부분들을 제거하고 svg path 확인 가능
- svg > path 에 보면 d attribute값을 카피한다. 
- styles > src > icons 에 해당값을 넣는다. 


### todo
- eslint
- prettier
- etc
