export const getCss = (name:string) => {
  const styles = window.getComputedStyle(document.body);
  return styles.getPropertyValue(name);
}

export const setCssValue = (name: string, value: any) => {
  document.documentElement.style.setProperty(name, value);
}
export const removeCssValue = (name: string) => {
  document.documentElement.style.removeProperty(name);
}

// @NOTE css1_root.css => getCss
export const main_css = {
  general: {
    highlight_hover: getCss('--highlight-hover-color'),
    highlight_select: getCss('--highlight-select-color'),
    highlight_weight_thin: parseInt(getCss('--highlight-weight-thin')),
    highlight_weight_mid: parseInt(getCss('--highlight-weight-mid')),
    highlight_weight_thick: parseInt(getCss('--highlight-weight-thick')),
    transparency: parseFloat(getCss('--transparency')),
    mask_weight: parseInt(getCss('--mask-weight')),
    selection_weight: parseInt(getCss('--selection-weight')),
    expected_path_weight: parseInt(getCss('--expected-path-weight')),
    expected_path_color: getCss('--expected-path-color'),
    ghost_path_color: getCss('--ghost-path-color'),
    overlap_scroll_bar_width: parseInt(
      getCss('--overlap-scroll-bar-width')
    ),
    overlap_scroll_bar_color: getCss('--overlap-scroll-bar-color'),
    unassigned_status: parseInt(getCss('--unassigned-status')),
    unassigned_width: parseInt(getCss('--unassigned-width')),
    unassigned_height: parseInt(getCss('--unassigned-height')),
    unassigned_top: parseInt(getCss('--unassigned-top')),
    unassigned_right: parseInt(getCss('--unassigned-right')),
    minimap_padding: 0,
  },
  scale: {
    color: getCss('--scale-color'),
    font_size: getCss('--font-size'),
  },
  grid: {
    line_weight: parseInt(getCss('--grid-line-weight')),
    color: getCss('--grid-color'),
    render_distance: parseInt(getCss('--grid-rendering-distance')),
    axis_count: parseInt(getCss('--grid-axis-min-pixel')),
    num_of_ticks: parseInt(getCss('--grid-number_of_ticks')),
    text_color: getCss('--grid-text-color'),
    text_color_hide: getCss('--grid-text-color-hide'),
    text_color_show: getCss('--grid-text-color-show'),
    tick_display: getCss('--grid-domain-display'),
  },
  point: {
    radius: parseInt(getCss('--point-radius')),
    color: getCss('--point-color'),
    label_color: getCss('--point-label-color'),
    label_font_size: parseInt(getCss('--element-font-size')),
    label_offset: parseInt(getCss('--point-label-offset')),
  },
  segment: {
    // color: getCss('--segment-color'),
    line_weight: parseInt(getCss('--segment-line-weight')),
    direction_width: parseInt(getCss('--segment-direction-width')),
    direction_length: parseInt(getCss('--segment-direction-length')),
    direction_color: getCss('--segment-direction-color'),
    label_color: getCss('--segment-label-color'),
    label_font_size: parseInt(getCss('--element-font-size')),
    label_offset: parseInt(getCss('--segment-label-offset')),
    direction_path: undefined,
  },
  station: {
    radius: parseInt(getCss('--station-radius')),
    width: parseInt(getCss('--station-width')),
    radius_foup: parseInt(getCss('--station-radius-foup')),
    line_weight: parseInt(getCss('--station-line-weight')),
    line_weight_foup: parseInt(getCss('--station-line-weight-foup')),
    color_station: getCss('--station-color'),
    color_foup: getCss('--station-color-foup'),
    color_foup_full: getCss('--station-color-foup-full'),
    color_foup_empty: getCss('--station-color-foup-empty'),
    label_color: getCss('--station-label-color'),
    label_color_foup: getCss('--station-label-color-foup'),
    font_size: parseInt(getCss('--element-font-size')),
    text_offset: parseInt(getCss('--station-text-offset')),
    icon_level1: convert_path_to_str(getCss('--station-icon-level1')),
    icon_level2: convert_path_to_str(getCss('--station-icon-level2')),
    icon_level3: convert_path_to_str(getCss('--station-icon-level3')),
  },
  buffer: {
    radius: parseInt(getCss('--buffer-radius')),
    width: parseInt(getCss('--buffer-width')),
    radius_foup: parseInt(getCss('--buffer-radius-foup')),
    line_weight: parseInt(getCss('--buffer-line-weight')),
    line_weight_foup: parseInt(getCss('--buffer-line-weight-foup')),
    color_buffer: getCss('--buffer-color'),
    color_foup: getCss('--buffer-color-foup'),
    color_foup_full: getCss('--buffer-color-foup-full'),
    color_foup_empty: getCss('--buffer-color-foup-empty'),
    label_color: getCss('--buffer-label-color'),
    label_color_foup: getCss('--buffer-label-color-foup'),
    font_size: parseInt(getCss('--element-font-size')),
    text_offset: parseInt(getCss('--buffer-text-offset')),
    icon_level1: convert_path_to_str(getCss('--buffer-icon-level1')),
    icon_level2: convert_path_to_str(getCss('--buffer-icon-level2')),
    icon_level3: convert_path_to_str(getCss('--buffer-icon-level3')),
  },
  mtl: {
    radius: parseInt(getCss('--mtl-radius')),
    width: parseInt(getCss('--mtl-width')),
    line_weight: parseInt(getCss('--mtl-line-weight')),
    color_mtl: getCss('--mtl-color'),
    label_color: getCss('--mtl-label-color'),
    font_size: parseInt(getCss('--element-font-size')),
    text_offset: parseInt(getCss('--mtl-text-offset')),
    icon_level1: convert_path_to_str(getCss('--mtl-icon-level1')),
    icon_level2: convert_path_to_str(getCss('--mtl-icon-level2')),
    icon_level3: convert_path_to_str(getCss('--mtl-icon-level3')),
  },
  cluster: {
    line_weight: parseInt(getCss('--cluster-line-weight')),
    font_size: parseInt(getCss('--element-font-size')),
    text_offset: parseInt(getCss('--cluster-text-offset')),
    stroke_color: getCss('--cluster-stroke-color'),
    fill_color: getCss('--cluster-fill-color'),
    borderOffset: Math.trunc(parseInt(getCss('--cluster-size')) * 0.5),
  },
  vehicle: {
    line_weight: parseInt(getCss('--vehicle-line-weight')),
    icon_clean_dash: convert_path_to_str(getCss('--vehicle-clean-dash')),
    icon_error: convert_path_to_str(getCss('--vehicle-error')),
    radius: parseInt(getCss('--vehicle-radius')),
    clean_radius: parseInt(getCss('--vehicle-clean-radius')),
    foup_radius: parseInt(getCss('--vehicle-foup-radius')),
    corner_radius: parseInt(getCss('--vehicle-corner-radius')),
    clean_line_weight: parseInt(getCss('--vehicle-clean-line-weight')),
    mask_weight: parseInt(getCss('--vehicle-mask-weight')),
    color_mode_auto_outline: getCss('--vehicle-color-mode-auto-outline'),
    color_mode_auto: getCss('--vehicle-color-mode-auto'),
    color_mode_manual: getCss('--vehicle-color-mode-manual'),
    color_mode_manual_outline: getCss(
      '--vehicle-color-mode-manual-outline'
    ),
    color_mode_error: getCss('--vehicle-color-mode-error'),
    color_mode_error_outline: getCss(
      '--vehicle-color-mode-error-outline'
    ),
    color_mode_sloppy_manual: getCss(
      '--vehicle-color-mode-sloppy-manual'
    ),
    color_mode_sloppy_manual_outline: getCss(
      '--vehicle-color-mode-sloppy-manual-outline'
    ),
    color_mode_prevent_push: getCss('--vehicle-color-mode-prevent-push'),
    color_mode_prevent_push_outline: getCss(
      '--vehicle-color-mode-prevent-push-outline'
    ),
    color_mode_prevent_call: getCss('--vehicle-color-mode-prevent-call'),
    color_mode_prevent_call_outline: getCss(
      '--vehicle-color-mode-prevent-call-outline'
    ),
    color_mode_none: getCss('--vehicle-color-mode-none'),
    color_mode_none_outline: getCss('--vehicle-color-mode-none-outline'),
    color_blocked: getCss('--vehicle-color-blocked'),
    color_load: getCss('--vehicle-color-load'),
    color_hotlot: getCss('--vehicle-color-hotlot'),
    label_color: getCss('--vehicle-color-label'),
    label_hotlot_color: getCss('--vehicle-color-label-hotlot'),
    blocked_radius: parseInt(getCss('--vehicle-blocked-radius')),
    animation_duration: parseInt(getCss('--vehicle-animation-duration')),
    display_label: getCss('--vehicle-display-label'),
    draw_next: getCss('--vehicle-draw-next'),
    next_weight: parseInt(getCss('--vehicle-next-weight')),
    next_color: getCss('--vehicle-next-color'),
    draw_order: getCss('--vehicle-draw-order'),
    order_weight: parseInt(getCss('--vehicle-order-weight')),
    order_pickup_color: getCss('--vehicle-order-pickup-color'),
    order_dropoff_color: getCss('--vehicle-order-dropoff-color'),
    font_size: parseInt(getCss('--element-font-size')),
    text_offset: parseInt(getCss('--vehicle-text-offset')),
    stale_path: convert_path_to_str(getCss('--vehicle-stale-path')),
    fail_path: convert_path_to_str(getCss('--vehicle-fail-path')),
    prevent_path: convert_path_to_str(getCss('--vehicle-prevent-path')),
    prevent_call_path: convert_path_to_str(
      getCss('--vehicle-prevent-call-path')
    ),
    prevent_push_path: convert_path_to_str(
      getCss('--vehicle-prevent-push-path')
    ),
    prevent_outer_color: convert_path_to_str(
      getCss('--vehicle-prevent-outer-color')
    ),
    prevent_inner_color: convert_path_to_str(
      getCss('--vehicle-prevent-inner-color')
    ),
  },
  group: {
    track_group_size: {
      // {zoom_level : value}
      0: parseInt(getCss('--track-size-level1')),
      1: parseInt(getCss('--track-size-level1')),
      2: parseInt(getCss('--track-size-level2')),
      3: parseInt(getCss('--track-size-level3')),
    },
    vehicle_group_size: parseInt(getCss('--vehicle-size')) - 1,
    opacity: parseFloat(getCss('--group-opacity')),
  },
  color_palette: {
    colors: (function () {
      // create the color palette using the colorN items from css
      let num_colors = parseInt(getCss('--num-palette-colors'));
      let color_info = {};
      for (let i = 0; i < num_colors; i++) {
        let color_id = `color${i + 1}`;
        let color = getCss(`--${color_id}`);
        let color_name = getCss(`--${color_id}-name`);
        color_info[color_id] = {
          color: color ? color.trim() : color_id,
          name: color_name ? color_name.trim() : `${color_id}-name`,
        };
      }
      return color_info;
    })(),
    tile_dimensions: {
      width: parseInt(getCss('--color-tile-width')),
      height: parseInt(getCss('--color-tile-height')),
    },
    num_rows: 3,
  },
};

// Copyright 2019 Zinnotech, all rights reserved

function convert_path_to_str(original) {
  // Remove ' "' and '"'
  return original.replace(/ "|"/gi, '')
}
