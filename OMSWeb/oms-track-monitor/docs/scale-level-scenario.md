# Scale Level별 시각화/이벤트 시나리오

컴포넌트의 가시성, 가독성, 성능 향상을 위해, mm per pixel 상태에 따라 scale level을 부여하며, 해당 level에 따라 오브젝트의 시각화를 변경한다.

## Buffer

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility |        |      |         |         |         |
| label visibility | hidden | -    | -       | -       | visible |
| scale            | 0.25   | -    | -       | -       | 1       |
| event fire       |        |      |         |         |         |

## Station

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility |        |      |         |         |         |
| label visibility | hidden | -    | -       | -       | visible |
| scale            | 0.25   | -    | -       | -       | 1       |
| event fire       |        |      |         |         |         |

## Zcu

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility |        |      |         |         |         |
| label visibility | hidden | -    | -       | -       | visible |
| scale            | 0.25   | -    | -       | -       | 1       |
| event fire       |        |      |         |         |         |

## Mtl

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility |        |      |         |         |         |
| label visibility | hidden | -    | -       | -       | visible |
| scale            | 0.25   | -    | -       | -       | 1       |
| event fire       |        |      |         |         |         |

## Group

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Point

|                  | Base   | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ------ | ---- | ------- | ------- | ------- |
| total visibility | hidden | -    | -       | visible | -       |
| label visibility | -      | -    | -       | -       | -       |
| scale            | 1      | -    | -       | -       | -       |
| event fire       | -      | -    | -       | -       | -       |

## Segment

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| width scale      | 1    | -    | -       | -       | -       |
| direction scale  | 1    | -    | -       | -       | -       |
| event fire       |      |      |         |         |         |

## Cluster

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            | 1    | -    | -       | -       | -       |
| event fire       |      |      |         |         |         |

## Vehicle

|                  | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility | -    | -    | -       | -       | -       |
| label visibility | -    | -    | -       | -       | -       |
| scale            | 1    | -    | -       | -       | -       |
| event fire       | -    | -    | -       | -       | -       |
