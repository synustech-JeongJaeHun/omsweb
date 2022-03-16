# 프로젝트 구조

## `📁src`

### `📁legacies`

viewer-helper에서 사용한 타입 파일들.

단계적으로 제거한다.

### `📁styles`

컴포넌트에 적용되는 스타일시트와 변경가능한 스타일 값의 모음.

### `📁types`

컴포넌트 전역적으로 사용하는 타입과 루트 컴포넌트에서 사용하는 타입의 모음.

### `📁utils`

컴포넌트 전역적으로 사용하는 함수와 루트 컴포넌트에서 사용하는 함수의 모음.

### `📁TrackObjects`

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

### `📁MapObjects`

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
