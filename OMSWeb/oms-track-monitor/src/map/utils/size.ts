import { Point } from "../../point/types/Point";

function calculateMinMaxXYFromPoints(points: Point[]) {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  // find the extends of map data using the coordinates of points
  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }

  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY,
  };
}

export { calculateMinMaxXYFromPoints }