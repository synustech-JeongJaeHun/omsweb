# Scale Level별 시각화 시나리오

컴포넌트의 가시성, 가독성, 성능 향상을 위해, mm per pixel 상태에 따라 scale level을 부여하며, 해당 level에 따라 오브젝트의 시각화를 변경한다.

**적용 대상**

- Buffer
- Cluster
- Group
- Mtl
- Point
- Segment
- Station
- Vehicle
- Zcu

## Any Level

**화면 고정 크기**

- (1/1)
  - Vehicle Size
  - Segment Width
  - Segment Direction Size
  - Cluster Width
- (1/4)
  - Buffer
  - Station
  - Zcu
  - Mtl

**화면 미표시**

- Point (all)

## Any Level + Level: `"ELSE"`

## Any Level + Level: `"BELOW20"`

**화면 미표시**

- Buffer (label)
- Station (label)
- Zcu (label)
- Mtl (label)

## Any Level + Level: `"BELOW17"`

**화면 미표시**

- Point (label)

**화면 고정 크기**

- (1/1)
  - Buffer
  - Station
  - Zcu
  - Mtl
