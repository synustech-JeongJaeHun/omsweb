export namespace CommonUtil {
  export const degrees = function (radians: number): number {
    return (radians * 180) / Math.PI;
  };

  export function is_empty(x) {
    return (
      x == null ||
      x == undefined ||
      `${x}`.trim() == '' ||
      x == 'null' ||
      x == 'undefined'
    );
  }
}
