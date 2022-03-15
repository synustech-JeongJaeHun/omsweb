# Scale Level별 시각화/이벤트 시나리오

컴포넌트의 가시성, 가독성, 성능 향상을 위해, mm per pixel 상태에 따라 scale level을 부여하며, 해당 level에 따라 오브젝트의 시각화를 변경한다.

## Buffer

| Buffer           | Base  | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ----- | ---- | ------- | ------- | ------- |
| total visibility | TRUE  |      |         |         |         |
| label visibility | FALSE |      |         |         | TRUE    |
| scale            | 0.25  |      |         |         | 1       |
| event fire       |       |      |         |         |         |

## Cluster

| Cluster          | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Group

| Group            | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Mtl

| Mtl              | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Point

| Point            | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Segment

| Segment          | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| width scale      |      |      |         |         |         |
| direction scale  |      |      |         |         |         |
| event fire       |      |      |         |         |         |

## Station

| Station          | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |

| Vehicle          | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            | 1    |      |         |         |         |
| event fire       |      |      |         |         |         |

| Zcu              | Base | ELSE | BELOW80 | BELOW20 | BELOW17 |
| ---------------- | ---- | ---- | ------- | ------- | ------- |
| total visibility |      |      |         |         |         |
| label visibility |      |      |         |         |         |
| scale            |      |      |         |         |         |
| event fire       |      |      |         |         |         |
