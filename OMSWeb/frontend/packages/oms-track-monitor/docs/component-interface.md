# 컴포넌트 인터페이스

## Attribute

Attribute는 DOM에 컴포넌트를 삽입한 후 언제든지 변경 가능하며 해당 변경사항이 바로 반영된다.

| 속성 이름                 | 타입         | 기본값             | 역할                                          |
| ------------------------- | ------------ | ------------------ | --------------------------------------------- |
| viewMode                  | `ViewMode`   | `undefined`        | // Not Impletmented                           |
| mapType                   | `MapType`    | `undefined`        | // Not Impletmented                           |
| **width**                 | `Numberlish` | `1000`             | 본 엘리먼트의 폭                              |
| **height**                | `Numberlish` | `1000`             | 본 엘리먼트의 높이                            |
| rotation                  | `Numberlish` | `0`                | Track의 Rotation 값                           |
| vehicleSize               | `Numberlish` | `10`               | Vehicle이 표시되는 크기                       |
| segmentWidth              | `Numberlish` | `3`                | Segment가 표시되는 폭의 크기                  |
| segmentDirectionSize      | `Numberlish` | `6`                | Segment의 방향을 나타내는 Object의 크기       |
| isMinimapVisible          | `Boolish`    | `true`             | 미니맵의 표시 여부                            |
| isVehicleLineVisible      | `Boolish`    | `true`             | Vehicle의 진행방향 라인의 표시 여부           |
| isSegmentDirectionVisible | `Boolish`    | `true`             | Segment의 방향을 나타내는 Object의 표시 여부  |
| isPointLabelVisible       | `Boolish`    | `true`             | Point의 ID text 표시 여부                     |
| isStationVisible          | `Boolish`    | `true`             | Station 표시 여부                             |
| isBufferVisible           | `Boolish`    | `true`             | Buffer 표시 여부                              |
| isGroupVisible            | `Boolish`    | `true`             | Group 표시 여부                               |
| isClusterVisible          | `Boolish`    | `true`             | Cluster 표시 여부                             |
| backgroundColor           | `Stringlish` | `"white"`          | 배경 색상                                     |
| stationColor              | `Stringlish` | `"black"`          | Station 색상                                  |
| bufferColor               | `Stringlish` | `"black"`          | Buffer 색상                                   |
| pointColor                | `Stringlish` | `"black"`          | Point 색상                                    |
| normalSegmentColor        | `Stringlish` | `"grey"`           | Normal 상태의 Segment 색상                    |
| disabledSegmentColor      | `Stringlish` | `"purple"`         | Disabled 상태의 Segment 색상                  |
| segmentDirectionColor     | `Stringlish` | `"grey"`           | Segment의 방향을 나타내는 Object의 색상       |
| autoModeVehicleColor      | `Stringlish` | `"grey"`           | Auto Mode 상태의 Vehicle 채우기 색상          |
| manualModeVehicleColor    | `Stringlish` | `"green"`          | Manual Mode 상태의 Vehicle 채우기 색상        |
| noneModeVehicleColor      | `Stringlish` | `"transparent"`    | None Mode 상태의 Vehicle 채우기 색상          |
| cargoLoadingColor         | `Stringlish` | `"rgb(0, 0, 205)"` | Cargo Loading 상태의 Vehicle 내부 원의 색상   |
| cargoFullColor            | `Stringlish` | `"rgb(50,50,50)"`  | Cargo Full 상태의 Vehicle 내부 원의 색상      |
| cargoUnloadingColor       | `Stringlish` | `"blue"`           | Cargo Unloading 상태의 Vehicle 내부 원의 색상 |

## Event

| `mainClickOnObject` | .                                                  |
| ------------------- | -------------------------------------------------- |
| 이벤트 이름         | `mainClickOnObject`                                |
| 이벤트 대상         | Point, Segment, Station, Buffer, Mtl, Zcu, Vehicle |
| 발생 조건           | 마우스 메인 버튼으로 오브젝트를 클릭하였을 때      |
| 이벤트 타입         | `CustomEvent<MainClickOnObject[]>` index 0 만 활용 |

| `secondaryClickOnObject` | .                                                       |
| ------------------------ | ------------------------------------------------------- |
| 이벤트 이름              | `secondaryClickOnObject`                                |
| 이벤트 대상              | Point, Segment, Station, Buffer, Mtl, Zcu, Vehicle      |
| 발생 조건                | 마우스 보조 버튼으로 오브젝트를 클릭하였을 때           |
| 이벤트 타입              | `CustomEvent<SecondaryClickOnObject[]>` index 0 만 활용 |

| `clickOutObject` | .                                                |
| ---------------- | ------------------------------------------------ |
| 이벤트 이름      | `clickOutObject`                                 |
| 이벤트 대상      | Map                                              |
| 발생 조건        | 오브젝트가 없는 맵 영역을 패닝없이 클릭하였을 때 |
| 이벤트 타입      | `CustomEvent<ClickOutObject[]>` index 0 만 활용  |

| `mouseoverOnObject` | .                                                           |
| ------------------- | ----------------------------------------------------------- |
| 이벤트 이름         | `mouseoverOnObject`                                         |
| 이벤트 대상         | Point, Segment, Cluster, Station, Buffer, Mtl, Zcu, Vehicle |
| 발생 조건           | 마우스가 오브젝트 안으로 진입하였을 때                      |
| 이벤트 타입         | `CustomEvent<MouseoverOnObject>` index 0 만 활용            |

| `mouseleaveOnObject` | .                                                     |
| -------------------- | ----------------------------------------------------- |
| 이벤트 이름          | `mouseleaveOnObject`                                  |
| 이벤트 대상          | `mouseoverOnObject` 이벤트 대상과 동일                |
| 발생 조건            | mouseoverOnObject 후 마우스가 오브젝트 밖으로 나갈 때 |
| 이벤트 타입          | `CustomEvent<MouseleaveOnObject[]>` index 0 만 활용   |

## Method

컴포넌트의 메소드를 쓰기위해서는 컴포넌트의 `_instance.exposed`에 접근해야한다.

```ts
const component = document.getElementById('track-canvas')
const methods = component._instance.exposed

const result = methods.getCameraAndRotation()
methods.centerZoom()
...
...
```

### `getCameraAndRotation`

```typescript
declare function getCameraAndRotation(): {
  position: { x: number; y: number }
  viewBox: { width: number; height: number }
  rotation: number
}
```

컴포넌트의 현재 1)카메라센터좌표 2)카메라크기 3)맵회전각도를 받아온다.

### `setTrack`

```typescript
function setTrack(track: ITrackData): void
```

Track의 기초 데이터를 설정한다.

### `centerZoom`

```typescript
function centerZoom(): void
```

카메라의 위치 목표는 맵의 중앙, 크기 목표는 카메라의 비율에 따라 폭을 맵 폭의 2배 혹은 높이를 맵 높이의 2배로 설정하여 카메라를 단계적으로 이동한다.

### `find`

```typescript
function find(type: 'vehicle', id: Vehicle['id']): void
function find(type: 'point', id: Point['id']): void
function find(type: 'segment', id: Segment['id']): void
function find(type: 'station', id: Station['id']): void
function find(type: 'buffer', id: Buffer['id']): void
function find(type: 'mtl', id: Mtl['id']): void
```

해당 오브젝트의 좌표(Segment의 경우 중간 위치)를 찾아 카메라를 단계적으로 이동한다.

### `focus`

```typescript
function focus(type: 'vehicle', id: Vehicle['id']): void
function focus(type: 'point', id: Point['id']): void
function focus(type: 'segment', id: Segment['id']): void
function focus(type: 'station', id: Station['id']): void
function focus(type: 'buffer', id: Buffer['id']): void
function focus(type: 'mtl', id: Mtl['id']): void
function focus(type: 'zcu', id: Zcu['id']): void
```

해당 오브젝트에 포커스 효과를 준다.

### `dropFocus`

```typescript
function dropFocus(): void
```

맵에 포커스된 오브젝트가 없도록 한다.

### `track`

```typescript
function track(type: 'vehicle', id: Vehicle['id']): void
```

카메라 센터가 계속 해당 오브젝트를 바라보도록 설정한다.

### `stopTrack`

```typescript
function stopTrack(): void
```

오브젝트를 바라보도록 한 설정을 해제한다.

### `updateVehicle`

```typescript
function updateVehicle(
  operation: UpdateDto.Operation,
  vehicle: UpdateDto.Vehicle
): void
```

Vehicle의 상태를 업데이트한다.

### `updateSegmentDisabled`

```typescript
function updateSegmentDisabled(
  operation: UpdateDto.Operation,
  segmentDisabled: UpdateDto.SegmentDisabled
): void
```

Segment의 상태를 업데이트한다.

### `updateZcu`

```typescript
function updateZcu(
  operation: UpdateDto.Operation,
  zcu: UpdateDto.Zcu
): void
```

Zcu의 상태를 업데이트한다.
