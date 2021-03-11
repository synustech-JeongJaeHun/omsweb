// Copyright 2018 Zinnotech, all rights reserved
// var log_layout_part = logdown("oms.layout_part");
var log_layout_part = console;

export const LayoutParts = function () {
  let default_segment_geometries = {
    D: {
      length: 1,
      short_side: 1,
      long_side: 1,
    },
    E: {
      length: 1085,
      short_side: 650,
      long_side: 650,
    },
    U: {
      length: 1870,
      short_side: 650,
      long_side: 1000,
    },
    S: {
      length: 1430,
      short_side: 610,
      long_side: 1200,
    },
  };

  let segment_geometries =
    setting && setting.segment_geometries
      ? setting.segment_geometries
      : default_segment_geometries;

  function create_coord_objects(x, y, invert_factor_y) {
    // Make station object
    let coord = {};
    let is_error = false;

    // Remove error case
    if (x === undefined || x === null || y === undefined || y === null) {
      x = x === undefined || x === null ? 0 : x;
      y = y === undefined || y === null ? 0 : y;

      is_error = true;
    }

    if (x < 0 || y < 0) {
      is_error = true;
    }

    // Create coords
    coord.x = x;
    coord.y = y;

    let inverted_coord = {};

    if (invert_factor_y != null) {
      inverted_coord.x = x;
      inverted_coord.y = invert_factor_y - y;
    } else {
      inverted_coord.x = x;
      inverted_coord.y = y;
    }

    return {
      coord,
      inverted_coord,
      is_error,
    };
  }

  function Point(
    id,
    physical_id,
    logical_id,
    coord,
    inverted_coord,
    is_validate,
    update_state
  ) {
    this.id = id;
    if (
      physical_id !== undefined &&
      physical_id !== null &&
      physical_id.length > 0
    ) {
      this.physical_id = physical_id;
    } else {
      this.physical_id = null;
    }
    if (
      logical_id !== undefined &&
      logical_id !== null &&
      logical_id.length > 0
    ) {
      this.logical_id = logical_id;
    } else this.logical_id = null;

    this.coord = {
      x: parseInt(coord.x),
      y: parseInt(coord.y),
    };
    this.inverted_coord = {
      x: parseInt(inverted_coord.x),
      y: parseInt(inverted_coord.y),
    };

    this.is_validate = is_validate;
    this.validate_text;
    this.update_state = update_state;

    this.apply_offset = function (offset, snap_dist, invert_factor_y) {
      this.coord.x += offset.x;
      this.coord.y += offset.y;

      // Snap original coord
      // this.coord = Util.layout.calc_snap_coord(this.coord, snap_dist)

      this.inverted_coord.x = this.coord.x;
      this.inverted_coord.y = invert_factor_y - this.coord.y;
    };

    this.copy = function (new_id) {
      let id,
        physical_id,
        logical_id,
        coord,
        inverted_coord,
        is_validate,
        update_state,
        validate_text;

      // Replace ID
      if (new_id === null || new_id === undefined) {
        id = this.id;
      } else {
        id = new_id;
      }

      physical_id = this.physical_id;
      logical_id = this.logical_id;

      is_validate = this.is_validate;
      update_state = this.update_state;

      // Object
      coord = { ...this.coord };
      inverted_coord = { ...this.inverted_coord };

      let copied_point = new Point(
        id,
        physical_id,
        logical_id,
        coord,
        inverted_coord,
        is_validate,
        update_state
      );
      copied_point.validate_text = this.validate_text;

      return copied_point;
    };
  }

  function Segment(
    id,
    physical_id,
    logical_id,
    point_from,
    point_to,
    type,
    location,
    direction,
    speed,
    length,
    travel_time,
    is_validate,
    update_state
  ) {
    this.id = id;
    if (
      physical_id !== undefined &&
      physical_id !== null &&
      physical_id.length > 0
    ) {
      this.physical_id = physical_id;
    } else {
      this.physical_id = null;
    }
    if (
      logical_id !== undefined &&
      logical_id !== null &&
      logical_id.length > 0
    ) {
      this.logical_id = logical_id;
    } else this.logical_id = null;

    this.point_from = point_from;
    this.point_to = point_to;

    this.type = type; //90, 180, S, STRAIGHT
    this.location = location; //q1, q2, q3, q4
    this.direction = direction; //clock, counterclock

    this.segment_parts = [];
    this.path = "";
    this.dir_coord = {};
    this.dir_angle;
    this.bezier_points = [];

    this.length = length;
    this.speed = speed ? speed : null;
    this.travel_time = travel_time ? travel_time : null;

    // Disable
    this.disable_state = null;

    // For layout editor
    this.candidates = [];
    this.is_validate = is_validate;
    this.validate_text;
    this.update_state = update_state;

    this.set_path = function () {
      this.path = "";

      if (this.type === "D") {
        // Straight segment
        // Get path
        this.path = get_path(
          this.point_from.inverted_coord,
          this.point_to.inverted_coord,
          this.direction,
          this.type,
          this.location
        );

        // Get arrow
        let arrow = get_direction_arrow(
          this.point_from.inverted_coord,
          this.point_to.inverted_coord,
          this.direction,
          this.type,
          this.location
        );
        this.dir_coord = arrow.dir_coord;
        this.dir_angle = arrow.dir_angle;
      } else {
        // Curve segment
        // Get path for each segparts
        for (let i = 0; i < this.segment_parts.length; i++) {
          let segpart = { ...this.segment_parts[i] };

          // invert segpart geometry to draw
          let inverted_geometry = Util.layout.invert_geometry(
            segpart.location,
            segpart.direction
          );

          segpart.path = get_path(
            segpart.coord_from.inverted_coord,
            segpart.coord_to.inverted_coord,
            inverted_geometry.direction,
            segpart.type,
            inverted_geometry.location
          );

          // Combine segpart's path to main path
          if (this.path.length > 0) {
            this.path += " ";
          }
          this.path += segpart.path;

          // Add direction arrow for middle segpart
          if (i === parseInt(this.segment_parts.length * 0.5)) {
            // Get arrow
            let arrow = get_direction_arrow(
              segpart.coord_from.inverted_coord,
              segpart.coord_to.inverted_coord,
              inverted_geometry.direction,
              segpart.type,
              inverted_geometry.location
            );
            this.dir_coord = arrow.dir_coord;
            this.dir_angle = arrow.dir_angle;
          }
        }
      }
    };

    this.get_offset_path = function (offset) {
      let new_path = "";

      if (this.type == "D") {
        // Straight segment
        let new_coord_from = {};
        let new_coord_to = {};

        new_coord_from.x = this.point_from.inverted_coord.x + offset.x;
        new_coord_from.y = this.point_from.inverted_coord.y + offset.y;

        new_coord_to.x = this.point_to.inverted_coord.x + offset.x;
        new_coord_to.y = this.point_to.inverted_coord.y + offset.y;

        // Get path
        new_path = get_path(
          new_coord_from,
          new_coord_to,
          this.direction,
          this.type,
          this.location
        );
      } else {
        // Get path for each segparts
        for (let i = 0; i < this.segment_parts.length; i++) {
          let segpart = this.segment_parts[i];

          let new_coord_from = {};
          let new_coord_to = {};

          new_coord_from.x = segpart.coord_from.inverted_coord.x + offset.x;
          new_coord_from.y = segpart.coord_from.inverted_coord.y + offset.y;

          new_coord_to.x = segpart.coord_to.inverted_coord.x + offset.x;
          new_coord_to.y = segpart.coord_to.inverted_coord.y + offset.y;

          // invert segpart geometry to draw
          let inverted_geometry = Util.layout.invert_geometry(
            segpart.location,
            segpart.direction
          );

          let part_path = get_path(
            new_coord_from,
            new_coord_to,
            inverted_geometry.direction,
            segpart.type,
            inverted_geometry.location
          );

          // Combine segpart's path to main path
          if (new_path.length > 0) {
            new_path += " ";
          }
          new_path += part_path;
        }
      }
      return new_path;
    };

    this.get_arrow_path = function (width, length) {
      let path;
      let r, dx, dy;

      length = parseInt(length);
      r = width;

      dx = parseInt(r * Math.abs(Math.cos(Math.PI / 3)));
      dy = parseInt(r * Math.abs(Math.sin(Math.PI / 3)));

      path = `M0 0 m -${dx} -${dy} l 0 ${2 * dy} l ${dx + length} -${dy} Z`;

      return path;
    };

    this.create_segparts = function (coord_adjustment) {
      let segparts = [];

      if (this.type === "D") {
        let direction = Util.layout.detect_direction(
          this.point_from.coord,
          this.point_to.coord
        );
        let segpart = this.create_segpart(
          this.type,
          null,
          null,
          direction,
          this.point_from.coord.x,
          this.point_from.coord.y,
          this.point_to.coord.x,
          this.point_to.coord.y,
          coord_adjustment
        );
        segparts.push(segpart);

        // Update direction to summary also
        this.direction = direction;
      } else {
        // Calculate segpart detail coords
        let segparts_info = Util.layout.create_segpart_info(
          this.type,
          this.direction,
          this.location,
          this.point_from.coord,
          this.point_to.coord
        );

        for (let i = 0; i < segparts_info.length; i++) {
          let segpart = this.create_segpart(
            segparts_info[i].type,
            null,
            segparts_info[i].location,
            segparts_info[i].direction,
            segparts_info[i].from.x,
            segparts_info[i].from.y,
            segparts_info[i].to.x,
            segparts_info[i].to.y,
            coord_adjustment
          );
          segparts.push(segpart);
        }
      }

      if (segparts.length > 0) {
        this.segment_parts = segparts;
        this.set_bezier_points();
      }
    };

    this.create_segpart = function (
      type,
      radius,
      location,
      direction,
      x1,
      y1,
      x2,
      y2,
      adjustment
    ) {
      // Fix type, location, direction -> since JSON, DB schema has different value
      if (type === "STRAIGHT") {
        type = "D";
      } else if (type === "90") {
        type = "E";
      }

      if (location === "Q1") {
        location = "1";
      } else if (location === "Q2") {
        location = "2";
      } else if (location === "Q3") {
        location = "3";
      } else if (location === "Q4") {
        location = "4";
      }

      if (direction === "CLOCK") {
        direction = "C";
      } else if (direction === "COUNTER_CLOCK") {
        direction = "A";
      }

      // Create segpart object
      let segpart = {};
      segpart.radius = radius;
      segpart.type = type ? type : null;
      segpart.direction = direction ? direction : null;
      segpart.location = location ? location : null;

      // Point data
      let coord_from = {};
      let coord_to = {};

      let coords;
      let coord = {};
      let inverted_coord = {};

      coords = create_coord_objects(x1, y1, adjustment);
      coord = coords.coord;
      inverted_coord = coords.inverted_coord;

      coord_from.coord = coord;
      coord_from.inverted_coord = inverted_coord;

      coords = {};
      coord = {};
      inverted_coord = {};

      coords = create_coord_objects(x2, y2, adjustment);
      coord = coords.coord;
      inverted_coord = coords.inverted_coord;

      coord_to.coord = coord;
      coord_to.inverted_coord = inverted_coord;

      segpart.coord_from = coord_from;
      segpart.coord_to = coord_to;

      if (type == null) {
        segpart.type = "D";
      }

      return segpart;
    };

    this.add_segpart = function (segpart) {
      this.segment_parts.push(segpart);
    };

    this.remove_segpart = function () {
      this.segment_parts = [];
      // this.type = 'D'
    };

    this.set_candidates = function (candidates) {
      if (candidates !== null) {
        this.candidates = candidates;
      } else {
        this.candidates = [];
      }
    };

    this.get_candidates = function () {
      return this.candidates;
    };

    this.add_summary = function (summary) {
      this.type = summary.type;
      this.location = summary.location;
      this.direction = summary.direction;
    };

    this.apply_offset = function (offset, snap_dist, invert_factor_y) {
      this.point_from.coord.x += offset.x;
      this.point_from.coord.y += offset.y;

      // Snap original from coord
      this.point_from.coord = Util.layout.calc_snap_coord(
        this.point_from.coord,
        snap_dist
      );

      this.point_from.inverted_coord.x = this.point_from.coord.x;
      this.point_from.inverted_coord.y =
        invert_factor_y - this.point_from.coord.y;

      this.point_to.coord.x += offset.x;
      this.point_to.coord.y += offset.y;

      // Snap original from coord
      this.point_to.coord = Util.layout.calc_snap_coord(
        this.point_to.coord,
        snap_dist
      );

      this.point_to.inverted_coord.x = this.point_to.coord.x;
      this.point_to.inverted_coord.y = invert_factor_y - this.point_to.coord.y;

      this.dir_coord.x += offset.x;
      this.dir_coord.y += offset.y;

      // Re-create segpart
      this.create_segparts(invert_factor_y);

      // Reset path
      this.set_path();
    };

    this.recalculate_path = function (
      invert_factor_y,
      connected_segments,
      all_segments
    ) {
      // Re calculate segment candidate
      if (this.candidates.length === 0) {
        let candidates;
        let segments = connected_segments ? connected_segments : all_segments;
        candidates = Util.layout.find_segment_candidate(
          this.id,
          this.point_from,
          this.point_to,
          segments
        );

        this.type = candidates[0].type;
        this.location = candidates[0].location;
        this.direction = candidates[0].direction;
      }

      // Check null coord
      if (this.point_from === null) {
        this.point_from = {};
        let coord = {};
        coord.x = 0;
        coord.y = 0;

        this.point_from.coord = coord;
        this.point_from.inverted_coord = coord;
      }
      if (this.point_to === null) {
        this.point_to = {};
        let coord = {};
        coord.x = 0;
        coord.y = 0;

        this.point_to.coord = coord;
        this.point_to.inverted_coord = coord;
      }

      this.create_segparts(invert_factor_y);

      // Create path
      this.set_path();
    };

    this.calculate_length = function () {
      let width = Math.abs(this.point_to.coord.x - this.point_from.coord.x);
      let height = Math.abs(this.point_to.coord.y - this.point_from.coord.y);
      let length = 0;

      let standard_dimensions = segment_geometries[this.type];

      if (this.type === "D" || !this.type) {
        // Straight segment calculation

        // Calculate segment length
        length = parseInt(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
      } else {
        // Curved segment calculations

        // Choose comparison sides depending of type of curve and direction of the curve
        if (
          (this.type === "U" &&
            (this.location === "T" || this.location === "B")) ||
          (this.type === "S" && this.direction === "H")
        ) {
          // U Top/Bottom and S Horizontal

          width = width / standard_dimensions.long_side;
          height = height / standard_dimensions.short_side;
        } else if (
          (this.type === "U" &&
            (this.location === "L" || this.location === "R")) ||
          (this.type === "S" && this.direction === "V")
        ) {
          // U Right/Left and S Vertical

          width = width / standard_dimensions.short_side;
          height = height / standard_dimensions.long_side;
        } else {
          // 90 degree curve

          width = width / standard_dimensions.short_side;
          height = height / standard_dimensions.long_side;
        }

        length = parseInt(((width + height) * standard_dimensions.length) / 2);
      }

      return length;
    };

    this.set_length = function (new_length) {
      if (this.length && this.length !== new_length) {
        log_layout_part.log(
          `segment ${this.id} length mismatch: original=${this.length} calculated=${new_length}`
        );
      }
      this.length = new_length;
    };

    this.set_speed = function (new_speed) {
      this.speed = new_speed;
    };

    this.set_travel_time = function () {
      // Set travel time
      if (this.speed) {
        if (this.length !== 0 && this.speed !== 0) {
          this.travel_time = this.length / this.speed;
        } else {
          this.travel_time = 0;
        }
      }
    };

    this.set_disable = function (disable_info) {
      if (disable_info) {
        this.disable_state = {};
        this.disable_state.id = disable_info.id;
        this.disable_state.segment_id = disable_info.segment_id;
        this.disable_state.user = disable_info.user;
        this.disable_state.vehicle = disable_info.vehicle;
        this.disable_state.segment = disable_info.segment;
      } else {
        this.disable_state = null;
      }
    };

    this.check_disable_segment_disable_control = function () {
      return (
        this.disable_state &&
        (this.disable_state.segment.length > 0 ||
          this.disable_state.vehicle.length > 0)
      );
    };

    this.copy = function (new_id) {
      let id,
        physical_id,
        logical_id,
        type,
        location,
        direction,
        path,
        bezier_points;
      let speed, length, travel_time;
      let disable_state;
      let is_validate, update_state;

      let point_from, point_to;
      let dir_coord, dir_angle;
      let candidates;

      // Replace ID
      if (new_id === null || new_id === undefined) {
        id = this.id;
      } else {
        id = new_id;
      }

      physical_id = this.physical_id;
      logical_id = this.logical_id;
      type = this.type;
      location = this.location;
      direction = this.direction;
      path = this.path;
      bezier_points = this.bezier_points;

      speed = this.speed;
      length = this.length;
      travel_time = this.travel_time;
      disable_state = this.disable_state ? { ...this.disable_state } : null;

      if (this.disable_state) {
        disable_state.user = this.disable_state.user.map((d) => {
          return { ...d };
        });
        disable_state.vehicle = this.disable_state.vehicle.map((d) => {
          return { ...d };
        });
        disable_state.segment = this.disable_state.segment.map((d) => {
          return { ...d };
        });
      }

      dir_angle = this.dir_angle;
      dir_coord = { ...this.dir_coord };

      update_state = this.update_state;
      is_validate = this.is_validate;

      // Object
      if (this.point_from !== undefined) {
        point_from = {};
        point_from.id = this.point_from.id;
        point_from.coord = { ...this.point_from.coord };
        point_from.inverted_coord = { ...this.point_from.inverted_coord };
      }

      if (this.point_to !== undefined) {
        point_to = {};
        point_to.id = this.point_to.id;
        point_to.coord = { ...this.point_to.coord };
        point_to.inverted_coord = { ...this.point_to.inverted_coord };
      }

      // copy segment
      let copied_segment = new Segment(
        id,
        physical_id,
        logical_id,
        point_from,
        point_to,
        type,
        location,
        direction,
        speed,
        length,
        travel_time,
        is_validate,
        update_state
      );

      // add segpart
      for (let i = 0; i < this.segment_parts.length; i++) {
        let segpart = { ...this.segment_parts[i] };

        segpart.coord_from = {};
        segpart.coord_to = {};

        segpart.coord_from.coord = {
          ...this.segment_parts[i].coord_from.coord,
        };
        segpart.coord_from.inverted_coord = {
          ...this.segment_parts[i].coord_from.inverted_coord,
        };

        segpart.coord_to.coord = { ...this.segment_parts[i].coord_to.coord };
        segpart.coord_to.inverted_coord = {
          ...this.segment_parts[i].coord_to.inverted_coord,
        };

        copied_segment.add_segpart(segpart);
      }

      // Add path
      copied_segment.path = path;

      // Add path
      copied_segment.bezier_points = bezier_points;

      // add candidates
      candidates = [];
      for (let i = 0; i < this.candidates.length; i++) {
        let candidate = { ...this.candidates[i] };

        candidates.push(candidate);
      }

      // Add disabled info
      copied_segment.disable_state = disable_state;

      copied_segment.set_candidates(candidates);

      copied_segment.dir_angle = dir_angle;
      copied_segment.dir_coord = dir_coord;

      copied_segment.validate_text = this.validate_text;

      return copied_segment;
    };

    this.reassign_segpart_id = function (start_id) {
      for (let i = 0; i < this.segment_parts.length; i++) {
        let segpart = this.segment_parts[i];

        segpart.id = start_id++;
      }
    };

    this.set_bezier_points = function () {
      let bezier_points = [];
      for (let i = 0; i < this.segment_parts.length; i++) {
        let segpart = this.segment_parts[i];
        let start_point = [
          segpart.coord_from.inverted_coord.x,
          segpart.coord_from.inverted_coord.y,
        ];
        bezier_points.push(start_point);

        if (segpart.type === "E") {
          // Find the segement curve segpart's anchor bezier points
          let inverted_geometry = Util.layout.invert_geometry(
            segpart.location,
            segpart.direction
          );
          let matrix = Util.layout.get_bezier_matrix(
            inverted_geometry.direction,
            segpart.type,
            inverted_geometry.location
          );
          matrix = matrix.map((item) => {
            return item * 1.3;
          });
          let bezier_point = calc_bezier_point(
            matrix,
            segpart.coord_from.inverted_coord,
            segpart.coord_to.inverted_coord
          );

          // Add the curved seg part anchor bezier points
          bezier_points.push([bezier_point.point1.x, bezier_point.point1.y]);
          bezier_points.push([bezier_point.point2.x, bezier_point.point2.y]);
        }

        if (i === this.segment_parts.length - 1) {
          let end_point = [
            segpart.coord_to.inverted_coord.x,
            segpart.coord_to.inverted_coord.y,
          ];
          bezier_points.push(end_point);
        }
      }
      this.bezier_points = bezier_points;
    };

    function get_direction_arrow(
      point_from,
      point_to,
      direction,
      type,
      location
    ) {
      let arrow = {};

      if (type == "D") {
        arrow.dir_coord = {
          x: parseInt((point_from.x + point_to.x) * 0.5),
          y: parseInt((point_from.y + point_to.y) * 0.5),
        };

        arrow.dir_angle = Math.atan2(
          point_to.y - point_from.y,
          point_to.x - point_from.x
        );
      } else {
        let matrix = Util.layout.get_bezier_matrix(direction, type, location);
        let bezier_point = calc_bezier_point(matrix, point_from, point_to);

        arrow.dir_coord = getBezier_inner_coord(
          0.5,
          point_from,
          bezier_point.point1,
          bezier_point.point2,
          point_to
        );
        arrow.dir_angle = getBezier_angle(
          0.5,
          point_from,
          bezier_point.point1,
          bezier_point.point2,
          point_to
        );
      }

      return arrow;
    }

    function get_path(point_from, point_to, direction, type, location) {
      let path;

      if (type == "D") {
        // Straight segment
        path = `M${point_from.x} ${point_from.y} L${point_to.x} ${point_to.y}`;
      } else {
        // Curve segment
        let matrix = Util.layout.get_bezier_matrix(direction, type, location);
        let bezier_point = calc_bezier_point(matrix, point_from, point_to);
        path = `M${point_from.x} ${point_from.y} C${bezier_point.point1.x} ${bezier_point.point1.y} ${bezier_point.point2.x} ${bezier_point.point2.y} ${point_to.x} ${point_to.y}`;
      }

      return path;
    }

    function calc_bezier_point(matrix, coord_from, coord_to) {
      let dist_x, dist_y;

      // Calculate main_css.distance for X coord & Y coord
      dist_x = Math.abs(coord_to.x - coord_from.x);
      dist_y = Math.abs(coord_to.y - coord_from.y);

      let point1 = {};
      let point2 = {};

      point1.x = coord_from.x + dist_x * matrix[0];
      point1.y = coord_from.y + dist_y * matrix[1];

      point2.x = coord_to.x + dist_x * matrix[2];
      point2.y = coord_to.y + dist_y * matrix[3];

      return {
        point1,
        point2,
      };
    }

    function getBezier_inner_coord(
      t,
      start,
      control_point1,
      control_point2,
      end
    ) {
      let x = parseInt(
        Math.pow(1 - t, 3) * start.x +
          3 * t * Math.pow(1 - t, 2) * control_point1.x +
          3 * t * t * (1 - t) * control_point2.x +
          t * t * t * end.x
      );
      let y = parseInt(
        Math.pow(1 - t, 3) * start.y +
          3 * t * Math.pow(1 - t, 2) * control_point1.y +
          3 * t * t * (1 - t) * control_point2.y +
          t * t * t * end.y
      );

      return { x, y };
    }

    function getBezier_angle(t, start, control_point1, control_point2, end) {
      let dx =
        Math.pow(1 - t, 2) * (control_point1.x - start.x) +
        2 * t * (1 - t) * (control_point2.x - control_point1.x) +
        t * t * (end.x - control_point2.x);
      let dy =
        Math.pow(1 - t, 2) * (control_point1.y - start.y) +
        2 * t * (1 - t) * (control_point2.y - control_point1.y) +
        t * t * (end.y - control_point2.y);
      return -Math.atan2(dx, dy) + 0.5 * Math.PI;
    }
  }

  function Station(
    id,
    physical_id,
    logical_id,
    point_id,
    direction,
    carrier_type,
    coord,
    inverted_coord,
    is_validate,
    update_state,
    group
  ) {
    this.id = id;
    if (
      physical_id !== undefined &&
      physical_id !== null &&
      physical_id.length > 0
    ) {
      this.physical_id = physical_id;
    } else {
      this.physical_id = null;
    }
    if (
      logical_id !== undefined &&
      logical_id !== null &&
      logical_id.length > 0
    ) {
      this.logical_id = logical_id;
    } else this.logical_id = null;
    this.point_id = point_id;

    this.coord = {
      x: parseInt(coord.x),
      y: parseInt(coord.y),
    };
    this.inverted_coord = {
      x: parseInt(inverted_coord.x),
      y: parseInt(inverted_coord.y),
    };
    if (direction === null) {
      this.direction = "U";
    } else {
      this.direction = direction;
    }
    this.carrier_type = carrier_type;

    this.is_validate = is_validate;
    this.update_state = update_state;
    this.group = group ? group : null;

    this.set_direction_attr = function (all_segments) {
      this.segment_direction = Util.layout.find_location_object_direction_at_point(
        this.point_id,
        all_segments
      ); // returns inverted 'T' and 'B' due to map inversion
      this.direction_offset = Util.layout.get_location_object_direction_offset(
        this.direction,
        this.segment_direction,
        this.constructor.name
      );
    };

    this.copy = function (new_id) {
      let id,
        physical_id,
        logical_id,
        point_id,
        coord,
        inverted_coord,
        location,
        direction,
        carrier_type,
        group;
      let is_validate, update_state;

      // Replace ID
      if (new_id === null || new_id === undefined) {
        id = this.id;
      } else {
        id = new_id;
      }

      physical_id = this.physical_id;
      logical_id = this.logical_id;
      point_id = this.point_id;
      direction = this.direction;
      carrier_type = this.carrier_type;

      is_validate = this.is_validate;
      update_state = this.update_state;
      group = this.group;

      // Object
      coord = { ...this.coord };
      inverted_coord = { ...this.inverted_coord };

      let copied_station = new Station(
        id,
        physical_id,
        logical_id,
        point_id,
        direction,
        carrier_type,
        coord,
        inverted_coord,
        is_validate,
        update_state,
        group
      );

      copied_station.segment_direction = this.segment_direction;
      copied_station.direction_offset = this.direction_offset;

      return copied_station;
    };

    this.apply_offset = function (offset, snap_dist, invert_factor_y) {
      this.coord.x += offset.x;
      this.coord.y += offset.y;

      // Snap original coord
      this.coord = Util.layout.calc_snap_coord(this.coord, snap_dist);

      this.inverted_coord.x = this.coord.x;
      this.inverted_coord.y = invert_factor_y - this.coord.y;
    };
  }

  function Buffer(
    id,
    physical_id,
    logical_id,
    point_id,
    direction,
    coord,
    inverted_coord,
    is_validate,
    update_state,
    group
  ) {
    this.id = id;
    if (
      physical_id !== undefined &&
      physical_id !== null &&
      physical_id.length > 0
    ) {
      this.physical_id = physical_id;
    } else {
      this.physical_id = null;
    }
    if (
      logical_id !== undefined &&
      logical_id !== null &&
      logical_id.length > 0
    ) {
      this.logical_id = logical_id;
    } else this.logical_id = null;
    this.point_id = point_id;

    this.coord = {
      x: parseInt(coord.x),
      y: parseInt(coord.y),
    };
    this.inverted_coord = {
      x: parseInt(inverted_coord.x),
      y: parseInt(inverted_coord.y),
    };

    if (direction === null) {
      this.direction = "U";
    } else {
      this.direction = direction;
    }

    this.is_validate = is_validate;
    this.update_state = update_state;
    this.group = group ? group : null;

    this.set_direction_attr = function (all_segments) {
      this.segment_direction = Util.layout.find_location_object_direction_at_point(
        this.point_id,
        all_segments
      ); // returns inverted 'T' and 'B' due to map inversion
      this.direction_offset = Util.layout.get_location_object_direction_offset(
        this.direction,
        this.segment_direction,
        this.constructor.name
      );
    };

    this.copy = function (new_id) {
      let id,
        physical_id,
        logical_id,
        point_id,
        coord,
        inverted_coord,
        direction,
        group;
      let is_validate, update_state;

      // Replace ID
      if (new_id === null || new_id === undefined) {
        id = this.id;
      } else {
        id = new_id;
      }

      physical_id = this.physical_id;
      logical_id = this.logical_id;
      point_id = this.point_id;
      direction = this.direction;

      is_validate = this.is_validate;
      update_state = this.update_state;
      group = this.group;

      // Object
      coord = { ...this.coord };
      inverted_coord = { ...this.inverted_coord };

      let copied_buffer = new Buffer(
        id,
        physical_id,
        logical_id,
        point_id,
        direction,
        coord,
        inverted_coord,
        is_validate,
        update_state,
        group
      );

      copied_buffer.segment_direction = this.segment_direction;
      copied_buffer.direction_offset = this.direction_offset;

      return copied_buffer;
    };

    this.apply_offset = function (offset, snap_dist, invert_factor_y) {
      this.coord.x += offset.x;
      this.coord.y += offset.y;

      // Snap original coord
      this.coord = Util.layout.calc_snap_coord(this.coord, snap_dist);

      this.inverted_coord.x = this.coord.x;
      this.inverted_coord.y = invert_factor_y - this.coord.y;
    };
  }

  function MTL(
    id,
    physical_id,
    logical_id,
    point_id,
    coord,
    inverted_coord,
    in_use,
    position,
    mode,
    error_list,
    is_validate,
    update_state,
    group
  ) {
    this.id = id;
    if (
      physical_id !== undefined &&
      physical_id !== null &&
      physical_id.length > 0
    ) {
      this.physical_id = physical_id;
    } else {
      this.physical_id = null;
    }
    if (
      logical_id !== undefined &&
      logical_id !== null &&
      logical_id.length > 0
    ) {
      this.logical_id = logical_id;
    } else this.logical_id = null;
    this.point_id = point_id;

    this.coord = {
      x: parseInt(coord.x),
      y: parseInt(coord.y),
    };
    this.inverted_coord = {
      x: parseInt(inverted_coord.x),
      y: parseInt(inverted_coord.y),
    };
    this.in_use = in_use;
    this.position = position;
    this.mode = mode;
    this.error_list = error_list;

    this.is_validate = is_validate;
    this.update_state = update_state;
    this.group = group ? group : null;

    this.copy = function (new_id) {
      let id,
        physical_id,
        logical_id,
        point_id,
        coord,
        inverted_coord,
        in_use,
        position,
        mode,
        error_list;
      let is_validate, update_state;

      // Replace ID
      if (new_id === null || new_id === undefined) {
        id = this.id;
      } else {
        id = new_id;
      }

      physical_id = this.physical_id;
      logical_id = this.logical_id;
      point_id = this.point_id;
      in_use = this.in_use;
      position = this.position;
      mode = this.mode;
      error_list = this.error_list;

      is_validate = this.is_validate;
      update_state = this.update_state;

      // Object
      coord = { ...this.coord };
      inverted_coord = { ...this.inverted_coord };
      group = this.group;

      let copied_mtl = new MTL(
        id,
        physical_id,
        logical_id,
        point_id,
        coord,
        inverted_coord,
        in_use,
        position,
        mode,
        error_list,
        is_validate,
        update_state,
        group
      );

      return copied_mtl;
    };

    this.apply_offset = function (offset, snap_dist, invert_factor_y) {
      this.coord.x += offset.x;
      this.coord.y += offset.y;

      // Snap original coord
      this.coord = Util.layout.calc_snap_coord(this.coord, snap_dist);

      this.inverted_coord.x = this.coord.x;
      this.inverted_coord.y = invert_factor_y - this.coord.y;
    };
  }

  function Cluster(id, logical_id, max_vehicles, point_id_list, color) {
    this.id = id;
    this.logical_id = logical_id;
    this.max_vehicles = max_vehicles;
    this.point_id_list = point_id_list;
    this.segment_id_list;
    this.path;
    this.inverted_coord_from;
    this.inverted_coord_to;
    this.min_x;
    this.max_x;
    this.min_y;
    this.max_y;
    this.color = color;

    function curve_offset(
      coords,
      rx1,
      ry1,
      rx2,
      ry2,
      rsx,
      rsy,
      rex,
      rey,
      lx1,
      ly1,
      lx2,
      ly2,
      lsx,
      lsy,
      lex,
      ley,
      border_offset
    ) {
      return {
        right_side: {
          x: coords.x + rsx * border_offset,
          y: coords.y + rsy * border_offset,
          x1: coords.x1 + rx1 * border_offset,
          y1: coords.y1 + ry1 * border_offset,
          x2: coords.x2 + rx2 * border_offset,
          y2: coords.y2 + ry2 * border_offset,
          xf: coords.xf + rex * border_offset,
          yf: coords.yf + rey * border_offset,
        },
        left_side: {
          x: coords.x + lsx * border_offset,
          y: coords.y + lsy * border_offset,
          x1: coords.x1 + lx1 * border_offset,
          y1: coords.y1 + ly1 * border_offset,
          x2: coords.x2 + lx2 * border_offset,
          y2: coords.y2 + ly2 * border_offset,
          xf: coords.xf + lex * border_offset,
          yf: coords.yf + ley * border_offset,
        },
      };
    }

    function find_curve_boundary_coords(
      start_dir,
      end_dir,
      coords,
      border_offset
    ) {
      let boundary_coords;
      if (start_dir === "T" && end_dir === "R") {
        boundary_coords = curve_offset(
          coords,
          1,
          0.5,
          0.5,
          1,
          1,
          0,
          0,
          1,
          -1,
          -0.5,
          -0.5,
          -1,
          -1,
          0,
          0,
          -1,
          border_offset
        );
      } else if (start_dir === "R" && end_dir === "B") {
        boundary_coords = curve_offset(
          coords,
          -0.5,
          1,
          -1,
          0.5,
          0,
          1,
          -1,
          0,
          0.5,
          -1,
          1,
          -0.5,
          0,
          -1,
          1,
          0,
          border_offset
        );
      } else if (start_dir === "B" && end_dir === "L") {
        boundary_coords = curve_offset(
          coords,
          -1,
          -0.5,
          -0.5,
          -1,
          -1,
          0,
          0,
          -1,
          1,
          0.5,
          0.5,
          1,
          1,
          0,
          0,
          1,
          border_offset
        );
      } else if (start_dir === "L" && end_dir === "T") {
        boundary_coords = curve_offset(
          coords,
          0.5,
          -1,
          1,
          -0.5,
          0,
          -1,
          1,
          0,
          -0.5,
          1,
          -1,
          0.5,
          0,
          1,
          -1,
          0,
          border_offset
        );
      } else if (start_dir === "R" && end_dir === "T") {
        boundary_coords = curve_offset(
          coords,
          0.5,
          1,
          1,
          0.5,
          0,
          1,
          1,
          0,
          -0.5,
          -1,
          -1,
          -0.5,
          0,
          -1,
          -1,
          0,
          border_offset
        );
      } else if (start_dir === "B" && end_dir === "R") {
        boundary_coords = curve_offset(
          coords,
          -1,
          0.5,
          -0.5,
          1,
          -1,
          0,
          0,
          1,
          1,
          -0.5,
          0.5,
          -1,
          1,
          0,
          0,
          -1,
          border_offset
        );
      } else if (start_dir === "L" && end_dir === "B") {
        boundary_coords = curve_offset(
          coords,
          -0.5,
          -1,
          -1,
          -0.5,
          0,
          -1,
          -1,
          0,
          0.5,
          1,
          1,
          0.5,
          0,
          1,
          1,
          0,
          border_offset
        );
      } else if (start_dir === "T" && end_dir === "L") {
        boundary_coords = curve_offset(
          coords,
          1,
          -0.5,
          0.5,
          -1,
          1,
          0,
          0,
          -1,
          -1,
          0.5,
          -0.5,
          1,
          -1,
          0,
          0,
          1,
          border_offset
        );
      }

      return boundary_coords;
    }

    function make_boundary_coordinates(
      from,
      to,
      rx,
      ry,
      lx,
      ly,
      border_offset
    ) {
      return {
        right_side: {
          x: from.x + rx * border_offset,
          y: from.y + ry * border_offset,
          xf: to.x + rx * border_offset,
          yf: to.y + ry * border_offset,
        },
        left_side: {
          x: from.x + lx * border_offset,
          y: from.y + ly * border_offset,
          xf: to.x + lx * border_offset,
          yf: to.y + ly * border_offset,
        },
      };
    }

    function set_min_max(cluster_path_string, cluster_object, border_offset) {
      let cluster_path_list = cluster_path_string.split(" ");

      cluster_object.min_x = parseInt(
        cluster_path_list[0].match(/[0-9.-]/g).join("")
      );
      cluster_object.max_x = 0;
      cluster_object.min_y = parseInt(
        cluster_path_list[0].match(/[0-9.-]/g).join("")
      );
      cluster_object.max_y = 0;

      for (let i = 0; i < cluster_path_list.length; i++) {
        // Find edge coordinates of cluster
        if (i < cluster_path_list.length - 1) {
          let x = parseInt(cluster_path_list[i].match(/[0-9.-]/g).join("")),
            y = parseInt(cluster_path_list[i + 1].match(/[0-9.-]/g).join(""));

          // Maximum corners
          if (cluster_object.max_x < x) cluster_object.max_x = x;
          if (cluster_object.max_y < y) cluster_object.max_y = y;

          // Minimum corners
          if (cluster_object.min_x > x) cluster_object.min_x = x;
          if (cluster_object.min_y > y) cluster_object.min_y = y;

          i++;
        }
      }

      cluster_object.min_x -= parseInt(border_offset);
      cluster_object.max_x += parseInt(border_offset);
      cluster_object.min_y -= parseInt(border_offset);
      cluster_object.max_y += parseInt(border_offset);
    }

    function get_end_curves(
      start,
      bezier_1,
      center,
      bezier_2,
      end,
      direction_type
    ) {
      let dist = Math.sqrt(
        Math.pow(end.xf - start.xf, 2) + Math.pow(end.yf - start.yf, 2)
      );
      let mid_length = dist / 2;
      let quarter_length = mid_length / 2;
      let anchor_pt = {};
      if (direction_type === "FORWARD") {
        anchor_pt.x = "xf";
        anchor_pt.y = "yf";
      } else if (direction_type === "REVERSE") {
        anchor_pt.x = "x";
        anchor_pt.y = "y";
      }

      let mid_curve_coord = {
          x: start[anchor_pt.x] + center.x * mid_length,
          y: start[anchor_pt.y] + center.y * mid_length,
        },
        first_half_control_pt = {
          x1: start[anchor_pt.x] + bezier_1.x1 * quarter_length,
          y1: start[anchor_pt.y] + bezier_1.y1 * quarter_length,
          x2: mid_curve_coord.x + bezier_1.x2 * quarter_length,
          y2: mid_curve_coord.y + bezier_1.y2 * quarter_length,
        },
        second_half_control_pt = {
          x1: mid_curve_coord.x + bezier_2.x1 * quarter_length,
          y1: mid_curve_coord.y + bezier_2.y1 * quarter_length,
          x2: end[anchor_pt.x] + bezier_2.x2 * quarter_length,
          y2: end[anchor_pt.y] + bezier_2.y2 * quarter_length,
        };

      // First Curve
      let first_curve = `C${first_half_control_pt.x1} ${first_half_control_pt.y1} ${first_half_control_pt.x2} ${first_half_control_pt.y2} ${mid_curve_coord.x} ${mid_curve_coord.y} `;

      // Second Curve
      let second_curve = `C${second_half_control_pt.x1} ${
        second_half_control_pt.y1
      } ${second_half_control_pt.x2} ${second_half_control_pt.y2} ${
        end[anchor_pt.x]
      } ${end[anchor_pt.y]} `;

      return first_curve + second_curve;
    }

    this.set_path = function (segments_list, border_offset) {
      // If cluster does not have any point information
      if (
        !Array.isArray(segments_list) ||
        segments_list.length === 0 ||
        segments_list == null ||
        segments_list == undefined
      ) {
        this.path = "";
        this.inverted_coord_from = { x: 0, y: 0 };
        this.inverted_coord_to = { x: 0, y: 0 };
        this.min_x = 0;
        this.max_x = 0;
        this.min_y = 0;
        this.max_y = 0;
        return;
      }

      this.path = "";

      if (segments_list.length > 0) {
        this.segment_id_list = [];
        this.inverted_coord_from = segments_list[0].point_from;
        this.inverted_coord_to =
          segments_list[segments_list.length - 1].point_to;
        let path = "";
        let path_container = [];
        let path_string = "";
        for (let i = 0; i < segments_list.length; i++) {
          // Add the list of segment ids to the cluster object
          this.segment_id_list.push(segments_list[i].id);

          // Make a combined path string from the segments list
          path += segments_list[i].path + " ";
          path_string += segments_list[i].path + " ";
          if (
            i < segments_list.length - 1 &&
            segments_list[i].point_to.id !== segments_list[i + 1].point_from.id
          ) {
            path_container.push(path_string);
            path_string = "";
          }
        }

        set_min_max(path, this, border_offset);

        path_container.push(path_string);
        for (let i = 0; i < path_container.length; i++) {
          let path_list = path_container[i].split(" ");
          let seg_parts = [];
          // Find direction

          for (let j = 0; j < path_list.length; j++) {
            let part = {};
            if (path_list[j][0] === "C") {
              let coords = {
                x: parseInt(path_list[j - 2].match(/[0-9.-]/g).join("")),
                y: parseInt(path_list[j - 1].match(/[0-9.-]/g).join("")),
                x1: parseInt(path_list[j].match(/[0-9.-]/g).join("")),
                y1: parseInt(path_list[j + 1].match(/[0-9.-]/g).join("")),
                x2: parseInt(path_list[j + 2].match(/[0-9.-]/g).join("")),
                y2: parseInt(path_list[j + 3].match(/[0-9.-]/g).join("")),
                xf: parseInt(path_list[j + 4].match(/[0-9.-]/g).join("")),
                yf: parseInt(path_list[j + 5].match(/[0-9.-]/g).join("")),
              };
              part.coordinates = coords;
              let start_dir = Util.layout.detect_direction(
                { x: coords.x, y: coords.y },
                { x: coords.x1, y: coords.y1 }
              );
              let end_dir = Util.layout.detect_direction(
                { x: coords.x2, y: coords.y2 },
                { x: coords.xf, y: coords.yf }
              );
              part.boundary_coord = find_curve_boundary_coords(
                start_dir,
                end_dir,
                coords,
                border_offset
              );
              part.type = "CURVE";
              seg_parts.push(part);
            }
            if (
              (path_list[j][0] === "M" || path_list[j][0] === "L") &&
              path_list[j + 2][0] !== "M" &&
              path_list[j + 2][0] !== "C"
            ) {
              if (j < path_list.length - 3) {
                part.type = "D";
                let from = {
                  x: parseInt(path_list[j].match(/[0-9.-]/g).join("")),
                  y: parseInt(path_list[j + 1].match(/[0-9.-]/g).join("")),
                };
                let to = {
                  x: parseInt(path_list[j + 2].match(/[0-9.-]/g).join("")),
                  y: parseInt(path_list[j + 3].match(/[0-9.-]/g).join("")),
                };
                if (from.x === to.x && from.y === to.y) {
                  continue;
                }
                part.dir = Util.layout.detect_direction(from, to);

                // Set boundary coordinates
                if (part.dir === "R") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    0,
                    1,
                    0,
                    -1,
                    border_offset
                  );
                } else if (part.dir === "L") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    0,
                    -1,
                    0,
                    1,
                    border_offset
                  );
                } else if (part.dir === "T") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    1,
                    0,
                    -1,
                    0,
                    border_offset
                  );
                } else if (part.dir === "B") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    -1,
                    0,
                    1,
                    0,
                    border_offset
                  );
                } else if (part.dir === "TR") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    0.75,
                    0.75,
                    -0.75,
                    -0.75,
                    border_offset
                  );
                } else if (part.dir === "TL") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    0.75,
                    -0.75,
                    -0.75,
                    0.75,
                    border_offset
                  );
                } else if (part.dir === "BL") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    -0.75,
                    -0.75,
                    0.75,
                    0.75,
                    border_offset
                  );
                } else if (part.dir === "BR") {
                  part.boundary_coord = make_boundary_coordinates(
                    from,
                    to,
                    -0.75,
                    0.75,
                    0.75,
                    -0.75,
                    border_offset
                  );
                }
                seg_parts.push(part);
              }
            }
          }

          // Right border
          for (let j = 0; j < seg_parts.length; j++) {
            let part = seg_parts[j];
            let coord = part.boundary_coord.right_side;

            if (j === 0) {
              this.path += `M${coord.x} ${coord.y} `;
            }

            if (part.type === "CURVE") {
              this.path += `L${coord.x} ${coord.y} C${coord.x1} ${coord.y1} ${coord.x2} ${coord.y2} ${coord.xf} ${coord.yf} `;
            } else {
              this.path += `L${coord.x} ${coord.y} L${coord.xf} ${coord.yf} `;
            }

            if (j === seg_parts.length - 1) {
              let last_coord = part.boundary_coord.left_side;
              // this.path += `L${last_coord.xf} ${last_coord.yf} `

              let bezier_1, center_coord, bezier_2;

              if (part.dir === "T") {
                (bezier_1 = { x1: 0, y1: -1, x2: 1, y2: 0 }),
                  (center_coord = { x: -1, y: -1 });
                bezier_2 = { x1: -1, y1: 0, x2: 0, y2: -1 };
              } else if (part.dir === "B") {
                (bezier_1 = { x1: 0, y1: 1, x2: -1, y2: 0 }),
                  (center_coord = { x: 1, y: 1 });
                bezier_2 = { x1: 1, y1: 0, x2: 0, y2: 1 };
              } else if (part.dir === "R") {
                (bezier_1 = { x1: 1, y1: 0, x2: 0, y2: 1 }),
                  (center_coord = { x: 1, y: -1 });
                bezier_2 = { x1: 0, y1: -1, x2: 1, y2: 0 };
              } else if (part.dir === "L") {
                (bezier_1 = { x1: -1, y1: 0, x2: 0, y2: -1 }),
                  (center_coord = { x: -1, y: 1 });
                bezier_2 = { x1: 0, y1: 1, x2: -1, y2: 0 };
              } else if (part.dir === "TR") {
                (bezier_1 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 }),
                  (center_coord = { x: 0, y: -1.5 });
                bezier_2 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 };
              } else if (part.dir === "TL") {
                (bezier_1 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 }),
                  (center_coord = { x: -1.5, y: 0 });
                bezier_2 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 };
              } else if (part.dir === "BL") {
                (bezier_1 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 }),
                  (center_coord = { x: 0, y: 1.5 });
                bezier_2 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 };
              } else if (part.dir === "BR") {
                (bezier_1 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 }),
                  (center_coord = { x: 1.5, y: 0 });
                bezier_2 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 };
              }

              let curves = get_end_curves(
                coord,
                bezier_1,
                center_coord,
                bezier_2,
                last_coord,
                "FORWARD"
              );

              this.path += curves;
            }
          }

          // Left border
          for (let j = seg_parts.length - 1; j > -1; j--) {
            let part = seg_parts[j];
            let coord = part.boundary_coord.left_side;

            if (part.type === "CURVE") {
              this.path += `L${coord.xf} ${coord.yf} C${coord.x2} ${coord.y2} ${coord.x1} ${coord.y1} ${coord.x} ${coord.y} `;
            } else {
              this.path += `L${coord.xf} ${coord.yf} L${coord.x} ${coord.y} `;
            }

            if (j === 0) {
              let last_coord = part.boundary_coord.right_side;
              // this.path += `L${last_coord.x} ${last_coord.y} `

              let bezier_1, center_coord, bezier_2;

              if (part.dir === "T") {
                (bezier_1 = { x1: 0, y1: 1, x2: -1, y2: 0 }),
                  (center_coord = { x: 1, y: 1 });
                bezier_2 = { x1: 1, y1: 0, x2: 0, y2: 1 };
              } else if (part.dir === "B") {
                (bezier_1 = { x1: 0, y1: -1, x2: 1, y2: 0 }),
                  (center_coord = { x: -1, y: -1 });
                bezier_2 = { x1: -1, y1: 0, x2: 0, y2: -1 };
              } else if (part.dir === "R") {
                (bezier_1 = { x1: -1, y1: 0, x2: 0, y2: -1 }),
                  (center_coord = { x: -1, y: 1 });
                bezier_2 = { x1: 0, y1: 1, x2: -1, y2: 0 };
              } else if (part.dir === "L") {
                (bezier_1 = { x1: 1, y1: 0, x2: 0, y2: 1 }),
                  (center_coord = { x: 1, y: -1 });
                bezier_2 = { x1: 0, y1: -1, x2: 1, y2: 0 };
              } else if (part.dir === "TR") {
                (bezier_1 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 }),
                  (center_coord = { x: 0, y: 1.5 });
                bezier_2 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 };
              } else if (part.dir === "TL") {
                (bezier_1 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 }),
                  (center_coord = { x: 1.5, y: 0 });
                bezier_2 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 };
              } else if (part.dir === "BL") {
                (bezier_1 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 }),
                  (center_coord = { x: 0, y: -1.5 });
                bezier_2 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 };
              } else if (part.dir === "BR") {
                (bezier_1 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 }),
                  (center_coord = { x: -1.5, y: 0 });
                bezier_2 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 };
              }

              let curves = get_end_curves(
                coord,
                bezier_1,
                center_coord,
                bezier_2,
                last_coord,
                "REVERSE"
              );

              this.path += curves;
            }
          }
        }
        this.path += "Z";
      }
    };

    this.copy = function () {
      let copied_cluster = new Cluster(
        this.id,
        this.logical_id,
        this.max_vehicles,
        this.point_id_list,
        this.color
      );
      copied_cluster.segment_id_list = this.segment_id_list;
      copied_cluster.min_x = this.min_x;
      copied_cluster.max_x = this.max_x;
      copied_cluster.min_y = this.min_y;
      copied_cluster.max_y = this.max_y;
      copied_cluster.path = this.path;
      copied_cluster.inverted_coord_from = { ...this.inverted_coord_from };
      copied_cluster.inverted_coord_to = { ...this.inverted_coord_to };

      return copied_cluster;
    };
  }

  function Vehicle(
    id,
    physical_id,
    logical_id,
    cur_point,
    next_point,
    command_point,
    cargo_state,
    moving_state,
    hotlot,
    mode,
    push,
    call,
    error_list,
    is_blocked,
    order_id,
    order_logical_id,
    last_contact,
    type,
    group,
    cargo_transfer_result,
    map_db
  ) {
    this.id = id;
    this.physical_id = physical_id;
    this.logical_id = logical_id;

    this.cur_point = cur_point;
    this.next_point = next_point;
    this.command_point = command_point;

    this.cargo_state = cargo_state;
    this.moving_state = moving_state;
    this.hotlot = hotlot;
    this.mode = mode;
    this.push = push;
    this.call = call ? (Array.isArray(call) ? call : call.split(",")) : [];
    this.error_list = error_list;
    this.is_blocked = is_blocked;
    this.order_id = order_id;
    this.order_logical_id = order_logical_id;
    this.last_contact = last_contact;
    this.is_stale = false;
    this.is_moved = false;
    this.type = type;
    this.group = group ? group : null;
    this.cargo_transfer_result = cargo_transfer_result;
    this.map_db = map_db;

    this.copy = function () {
      let cur_point;
      if (this.cur_point != undefined) {
        cur_point = {};
        cur_point = { ...this.cur_point };
        cur_point.coord = { ...this.cur_point.coord };
        cur_point.inverted_coord = { ...this.cur_point.inverted_coord };
      }

      let next_point;
      if (this.next_point != undefined) {
        next_point = {};
        next_point = { ...this.next_point };
        next_point.coord = { ...this.next_point.coord };
        next_point.inverted_coord = { ...this.next_point.inverted_coord };
      }

      let command_point;
      if (this.command_point != undefined) {
        command_point = {};
        command_point = { ...this.command_point };
        command_point.coord = { ...this.command_point.coord };
        command_point.inverted_coord = { ...this.command_point.inverted_coord };
      }

      let copied_vehicle = new Vehicle(
        this.id,
        this.physical_id,
        this.logical_id,
        cur_point,
        next_point,
        command_point,
        this.cargo_state,
        this.moving_state,
        this.hotlot,
        this.mode,
        this.push,
        this.call,
        this.error_list,
        this.is_blocked,
        this.order_id,
        this.order_logical_id,
        this.last_contact,
        this.type,
        this.group,
        this.cargo_transfer_result,
        this.map_db
      );

      return copied_vehicle;
    };
    this.check_stale = function (stale_inverval, custom_time) {
      // custome_time must come in a epoch format
      let now;

      // update sec to ms
      stale_inverval = stale_inverval * 1000;

      if (custom_time && custom_time > -1) {
        now = custom_time;
      } else {
        now = new Date().getTime();
      }

      if (now - this.last_contact > stale_inverval) {
        this.is_stale = true;
      } else {
        this.is_stale = false;
      }
    };
  }

  function Group(id, logical_id, color, objects) {
    this.id = id;
    this.logical_id = logical_id ? logical_id : `Group_${this.id}`;
    this.color = color;
    this.objects = {
      station: objects && objects.station ? objects.station : [],
      buffer: objects && objects.buffer ? objects.buffer : [],
      mtl: objects && objects.mtl ? objects.mtl : [],
      vehicle: objects && objects.vehicle ? objects.vehicle : [],
    };
    this.get_track_objects = function () {
      if (this.objects.station === undefined) {
        this.objects.station = [];
      }
      if (this.objects.buffer === undefined) {
        this.objects.buffer = [];
      }
      if (this.objects.mtl === undefined) {
        this.objects.mtl = [];
      }
      return this.objects.buffer.concat(
        this.objects.station.concat(this.objects.mtl)
      );
    };
    this.get_stations = function () {
      if (this.objects.station === undefined) {
        this.objects.station = [];
      }
      return this.objects.station;
    };
    this.get_buffers = function () {
      if (this.objects.buffer === undefined) {
        this.objects.buffer = [];
      }
      return this.objects.buffer;
    };
    this.get_mtls = function () {
      if (this.objects.mtl === undefined) {
        this.objects.mtl = [];
      }
      return this.objects.mtl;
    };
    this.get_vehicles = function () {
      if (this.objects.vehicle === undefined) {
        this.objects.vehicle = [];
      }
      return this.objects.vehicle;
    };
    this.messagefy = function () {
      let message_arr = [];
      for (let type in this.objects) {
        for (let id of this.objects[type]) {
          message_arr.push(`"${type.charAt(0)}id-${id}"`);
        }
      }
      return message_arr;
    };

    this.copy = function () {
      let id = this.id;
      let logical_id = this.logical_id;
      let color = this.color;
      let objects = {};
      for (type in this.objects) {
        objects[type] = [...this.objects[type]];
      }

      let copied_group = new Group(id, logical_id, color, objects);

      return copied_group;
    };
  }

  return {
    // Parts functions
    create_coord_objects,

    // Layout objects
    create_point: function (
      id,
      physical_id,
      logical_id,
      x,
      y,
      coord_adjustment,
      is_validate,
      update_state
    ) {
      // Create coord and invert_coord object
      let coords = create_coord_objects(x, y, coord_adjustment);

      if (coords.is_error) {
        // log_layout_part.log(`point coordinates error - id:${id}(${x}, ${y})`)
      }

      return new Point(
        id,
        physical_id,
        logical_id,
        coords.coord,
        coords.inverted_coord,
        is_validate,
        update_state
      );
    },
    create_segment: function (
      id,
      physical_id,
      logical_id,
      type,
      location,
      direction,
      candidates,
      point_id1,
      point_id2,
      speed,
      length,
      travel_time,
      is_validate,
      update_state,
      coords_from,
      coords_to
    ) {
      let point_from = {};
      let point_to = {};

      if (coords_from !== null && coords_to !== null) {
        // From point
        point_from.id = point_id1;
        point_from.coord = coords_from.coord;
        point_from.inverted_coord = coords_from.inverted_coord;

        // To point
        point_to.id = point_id2;
        point_to.coord = coords_to.coord;
        point_to.inverted_coord = coords_to.inverted_coord;

        // Create segment
        let segment = new Segment(
          id,
          physical_id,
          logical_id,
          point_from,
          point_to,
          type,
          location,
          direction,
          speed,
          length,
          travel_time,
          is_validate,
          update_state
        );

        // Store candidate to segment
        segment.set_candidates(candidates);

        // Set length
        let calculated_length = segment.calculate_length();
        segment.set_length(calculated_length);

        // Set speed
        segment.set_speed(speed);

        // Set travel time
        segment.set_travel_time();

        return segment;
      } else {
        log_layout_part.log(
          `segment coordinates error - point_from id:${id} x:${x1} y:${y1}, point_to id:${id} x:${x2} y:${y2}`
        );

        return null;
      }
    },
    create_station: function (
      id,
      physical_id,
      logical_id,
      point_id,
      direction,
      carrier_type,
      is_validate,
      update_state,
      group,
      coords,
      all_segments
    ) {
      if (coords !== null) {
        let station = new Station(
          id,
          physical_id,
          logical_id,
          point_id,
          direction,
          carrier_type,
          coords.coord,
          coords.inverted_coord,
          is_validate,
          update_state,
          group
        );
        station.set_direction_attr(all_segments);
        return station;
      } else {
        log_layout_part.log(
          `station coordinates error - id:${id} x:${x} y:${y}`
        );
        return null;
      }
    },
    create_buffer: function (
      id,
      physical_id,
      logical_id,
      point_id,
      direction,
      is_validate,
      update_state,
      group,
      coords,
      all_segments
    ) {
      if (coords !== null) {
        let buffer = new Buffer(
          id,
          physical_id,
          logical_id,
          point_id,
          direction,
          coords.coord,
          coords.inverted_coord,
          is_validate,
          update_state,
          group
        );
        buffer.set_direction_attr(all_segments);
        return buffer;
      } else {
        log_layout_part.log(
          `buffer coordinates error - id:${id} x:${x} y:${y}`
        );
        return null;
      }
    },
    create_mtl: function (
      id,
      physical_id,
      logical_id,
      point_id,
      in_use,
      position,
      mode,
      error_list,
      is_validate,
      update_state,
      group,
      coords
    ) {
      if (coords !== null) {
        return new MTL(
          id,
          physical_id,
          logical_id,
          point_id,
          coords.coord,
          coords.inverted_coord,
          in_use,
          position,
          mode,
          error_list,
          is_validate,
          update_state,
          group
        );
      } else {
        log_layout_part.log(`mtl coordinates error - id:${id} x:${x} y:${y}`);
        return null;
      }
    },

    create_cluster: function (
      id,
      logical_id,
      max_vehicles,
      point_id_list,
      color
    ) {
      return new Cluster(id, logical_id, max_vehicles, point_id_list, color);
    },

    create_vehicle: function (
      id,
      physical_id,
      logical_id,
      cargo_state,
      moving_state,
      hotlot,
      mode,
      push,
      call,
      error_list,
      is_blocked,
      order_id,
      order_logical_id,
      current_point,
      next_point,
      command_point,
      last_contact,
      type,
      group,
      cargo_transfer_result,
      map_db
    ) {
      // Convert time to UTC
      if (last_contact) {
        last_contact = Date.parse(last_contact);
      }

      if (!type) {
        type = "STANDARD";
      }

      return new Vehicle(
        id,
        physical_id,
        logical_id,
        current_point,
        next_point,
        command_point,
        cargo_state,
        moving_state,
        hotlot,
        mode,
        push,
        call,
        error_list,
        is_blocked,
        order_id,
        order_logical_id,
        last_contact,
        type,
        group,
        cargo_transfer_result,
        map_db
      );
    },

    create_group: function (id, logical_id, color, objects) {
      return new Group(id, logical_id, color, objects);
    },
  };
};
