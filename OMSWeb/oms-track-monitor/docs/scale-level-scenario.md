# Scale Level별 시각화/이벤트 시나리오

컴포넌트의 가시성, 가독성, 성능 향상을 위해, mm per pixel 상태에 따라 scale level을 부여하며, 해당 level에 따라 오브젝트의 시각화를 변경한다.

## Buffer | Station

|                  | Base   | BELOW15 | BELOW14 | BELOW13 | BELOW12 | BELOW11 | BELOW10 | BELOW9 | BELOW8 | BELOW7 | BELOW6 | BELOW5 |
| ---------------- | ------ | ------- | ------- | ------- | ------- | ------- | ------- | ------ | ------ | ------ | ------ | ------ |
| total visibility |        |         |         |         |         |         |         |        |        |        |        |        |
| label visibility | hidden | visible | -       | -       | -       | -       | -       | -      | -      | -      | -      | -      |
| label scale      | -      | 0.1em   | -       | 0.2em   | -       | 0.4em   | -       | 0.6em  | -      | 0.8em  |        | 1em    |
| scale            | 0.25   | 1       | -       | -       | -       | -       | -       | -      | -      | -      | -      | -      |
| event fire       |        |         |         |         |         |         |         |        |        |        |        |        |

## Zcu | Mtl

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW15 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility |        |      |         |         |         |
| label visibility | hidden | -    | -       | -       | visible |
| scale            | 0.25   | -    | -       | -       | 1       |
| event fire       |        |      |         |         |         |

## Group

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW15 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Point

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW15 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility | hidden | -    | -       | visible | -       |
| label visibility | -      | -    | -       | -       | -       |
| scale            | 1      | -    | -       | -       | -       |
| event fire       | -      | -    | -       | -       | -       |

## Segment

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW15 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| width scale      | 1    | -    | -       | -       | -       |
| direction scale  | 1    | -    | -       | -       | -       |
| event fire       |      |      |         |         |         |

## Cluster

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW15 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            | 1    | -    | -       | -       | -       |
| event fire       |      |      |         |         |         |

## Vehicle

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW15 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility | -    | -    | -       | -       | -       |
| label visibility | -    | -    | -       | -       | -       |
| scale            | 1    | -    | -       | -       | -       |
| event fire       | -    | -    | -       | -       | -       |
