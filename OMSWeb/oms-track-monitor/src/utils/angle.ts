import { Position } from "../types/Position";

function getAngleFromTwoPoints(startPoint: Position, endPoint: Position) {
  const dy = endPoint.y - startPoint.y;
  const dx = endPoint.x - startPoint.x;
  const theta = Math.atan2(dy, dx); // range (-PI, PI]
  return theta * 180 / Math.PI - 90; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
}

export { getAngleFromTwoPoints }