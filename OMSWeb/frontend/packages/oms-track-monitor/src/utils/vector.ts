type Vector2 = { x: number, y: number }

const ZeroVector: Vector2 = { x: 0, y: 0 }

function getUnitVector(vector: Vector2) {
  const magnitude = Math.hypot(vector.x, vector.y)
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  }
}
function getNegativeVector(vector: Vector2) {
  return { x: (-1) * vector.x, y: (-1) * vector.y }
}

function multipleVector(vector: Vector2, multiple: number) {
  return {
    x: vector.x * multiple,
    y: vector.y * multiple
  }
}

function addVectors(...vectors: Vector2[]) {
  return vectors.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { ...ZeroVector })
}

function getOrthogonalVector(vector: Vector2, directon: "clockwise" | "counterclockwise") {
  if (directon === "clockwise") {
    return {
      x: vector.y,
      y: vector.x * (-1),
    }
  }
  else {
    return {
      x: vector.y * (-1),
      y: vector.x,
    }
  }
}
export { ZeroVector, getUnitVector, getNegativeVector, multipleVector, addVectors, getOrthogonalVector }