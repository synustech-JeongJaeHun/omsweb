import { main_css } from './css-loader';

export namespace ColorPalette {
  const palette = main_css.color_palette;
  // must ensure that 'color1' always exists!
  const DEFAULT_COLOR = 'color1';

  export function get_color(color_key) {
    if (palette.colors[color_key]) return palette.colors[color_key].color;
    return 'white';
  }
  export function validate_color(target_color) {
    let is_found = false;
    for (let color in main_css.color_palette.colors) {
      if (color == target_color) {
        is_found = true;
        break;
      }
    }
    return is_found;
  }

  export function get_next_available_color(objects_arr) {
    let keys = get_color_keys();
    let candidate_keys = [...keys];
    let next_color;

    for (let i = 0; i < objects_arr.length; i++) {
      let obj = objects_arr[i];
      for (let j = candidate_keys.length - 1; j > -1; j--) {
        let color = candidate_keys[j];
        if (obj.color === color) {
          candidate_keys.splice(j, 1);
          break;
        }
      }
      if (candidate_keys.length === 0) {
        candidate_keys = [...keys];
      }
    }
    if (candidate_keys.length === 0) {
      next_color = keys[0];
    } else {
      next_color = candidate_keys[0];
    }
    return next_color;
  }

  export function get_color_keys() {
    let keys = [];
    for (let cinfo in palette.colors) {
      keys.push(cinfo);
    }
    return keys;
  }

  export function get_color_names() {
    let names = [];
    for (let cinfo in palette.colors) names.push(palette.colors[cinfo].name);
    return names;
  }

  export function get_num_colors() {
    return Object.keys(palette.colors).length;
  }
}
