import { getExtent } from '../dataviz/base' 

const exData = {
  a: [
    [12313, 1],
    [12314, 2],
    [12315, 3],
  ],
  b: [
    [12313, 20],
    [12314, 30],
    [12315, 50],
  ],
  c: [
    [12313, 120],
    [12314, 130],
    [12315, 150],
  ]
}

it("getExtent basic", () => {
  const { xExtent, yExtentP } = getExtent(exData)
  const [min, max] = [1, 150]

  const delta = (max - min) / 15
  expect({ xExtent, yExtentP }).toEqual({
    xExtent: [12313, 12315],
    yExtentP: [min - delta, max + delta]
  })
})

it("getExtent extra", () => {
  const { xExtent, yExtentP } = getExtent(exData, [1000, 1800])
  const [min, max] = [1, 1800]

  const delta = (max - min) / 15
  expect({ xExtent, yExtentP }).toEqual({
    xExtent: [12313, 12315],
    yExtentP: [min - delta, max + delta]
  })
})