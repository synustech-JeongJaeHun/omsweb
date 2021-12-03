"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmModeEnums = exports.TscModeEnums = exports.HostModeEnums = exports.HostSessionStatusEnums = exports.UserPermissions = exports.AlertSeverities = exports.MapTypes = exports.ViewModes = exports.NodeDirectionNames = exports.SteerDirections = exports.ObjectDirections = void 0;
var ObjectDirections;
(function (ObjectDirections) {
  ObjectDirections["left"] = "L";
  ObjectDirections["right"] = "R";
  ObjectDirections["up"] = "U";
  ObjectDirections["down"] = "D";
})(ObjectDirections = exports.ObjectDirections || (exports.ObjectDirections = {}));
var SteerDirections;
(function (SteerDirections) {
  SteerDirections["left"] = "L";
  SteerDirections["right"] = "R";
  SteerDirections["none"] = "";
})(SteerDirections = exports.SteerDirections || (exports.SteerDirections = {}));
var NodeDirectionNames;
(function (NodeDirectionNames) {
  NodeDirectionNames[NodeDirectionNames["None"] = 0] = "None";
  NodeDirectionNames[NodeDirectionNames["Right"] = 1] = "Right";
  NodeDirectionNames[NodeDirectionNames["Left"] = 2] = "Left";
  NodeDirectionNames[NodeDirectionNames["Up"] = 3] = "Up";
  NodeDirectionNames[NodeDirectionNames["Down"] = 4] = "Down";
})(NodeDirectionNames = exports.NodeDirectionNames || (exports.NodeDirectionNames = {}));
var ViewModes;
(function (ViewModes) {
  ViewModes["minimal"] = "MINIMAL";
  ViewModes["editor"] = "EDITOR";
  ViewModes["viewer"] = "VIEWER";
  ViewModes["public"] = "PUBLIC";
  ViewModes["playback"] = "PLAYBACK";
})(ViewModes = exports.ViewModes || (exports.ViewModes = {}));
var MapTypes;
(function (MapTypes) {
  MapTypes["MIN_MAX"] = "MIN_MAX";
  MapTypes["MAIN"] = "MAIN";
  MapTypes["MINIMAP"] = "MINIMAP";
  MapTypes["FILE"] = "FILE";
  MapTypes["DB"] = "DB";
})(MapTypes = exports.MapTypes || (exports.MapTypes = {}));
// export enum MapToolbarStatusKeys {
//   minimap,
//   controlTable,
//   vehicleLines,
//   expectedPaths,
//   pointLabels,
//   segmentDirections,
//   stations,
//   buffers,
//   groups,
//   clusters,
//   overlaps,
// }
var AlertSeverities;
(function (AlertSeverities) {
  AlertSeverities[AlertSeverities["normal"] = 0] = "normal";
  AlertSeverities[AlertSeverities["warning"] = 1] = "warning";
  AlertSeverities[AlertSeverities["critical"] = 2] = "critical";
})(AlertSeverities = exports.AlertSeverities || (exports.AlertSeverities = {}));
var UserPermissions;
(function (UserPermissions) {
  UserPermissions[UserPermissions["none"] = 0] = "none";
  UserPermissions[UserPermissions["gnb"] = 1] = "gnb";
  UserPermissions[UserPermissions["controlActions"] = 2] = "controlActions";
})(UserPermissions = exports.UserPermissions || (exports.UserPermissions = {}));
var HostSessionStatusEnums;
(function (HostSessionStatusEnums) {
  HostSessionStatusEnums[HostSessionStatusEnums["DISCONNECTED"] = 0] = "DISCONNECTED";
  HostSessionStatusEnums[HostSessionStatusEnums["CONNECTED"] = 1] = "CONNECTED";
})(HostSessionStatusEnums = exports.HostSessionStatusEnums || (exports.HostSessionStatusEnums = {}));
var HostModeEnums;
(function (HostModeEnums) {
  HostModeEnums[HostModeEnums["LOCAL"] = 0] = "LOCAL";
  HostModeEnums[HostModeEnums["HOST"] = 1] = "HOST";
})(HostModeEnums = exports.HostModeEnums || (exports.HostModeEnums = {}));
var TscModeEnums;
(function (TscModeEnums) {
  TscModeEnums[TscModeEnums["INIT"] = 1] = "INIT";
  TscModeEnums[TscModeEnums["PAUSED"] = 2] = "PAUSED";
  TscModeEnums[TscModeEnums["AUTO"] = 3] = "AUTO";
  TscModeEnums[TscModeEnums["PAUSING"] = 4] = "PAUSING";
})(TscModeEnums = exports.TscModeEnums || (exports.TscModeEnums = {}));
var PmModeEnums;
(function (PmModeEnums) {
  PmModeEnums[PmModeEnums["offline"] = 0] = "offline";
  PmModeEnums[PmModeEnums["online"] = 1] = "online";
})(PmModeEnums = exports.PmModeEnums || (exports.PmModeEnums = {}));
//# sourceMappingURL=enums.js.map
