"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertSeverities = exports.NotificationCount = void 0;
var NotificationCount = /** @class */ (function () {
  function NotificationCount(props) {
    this.level1 = 0;
    this.level2 = 0;
    this.level3 = 0;
    this.levelUnknown = 0;
    Object.assign(this, props);
  }
  Object.defineProperty(NotificationCount.prototype, "critical", {
    get: function () {
      return this.level3;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NotificationCount.prototype, "total", {
    get: function () {
      return this.level1 + this.level2 + this.level3 + this.levelUnknown;
    },
    enumerable: false,
    configurable: true
  });
  return NotificationCount;
}());
exports.NotificationCount = NotificationCount;
exports.alertSeverities = [
  {
    name: 'Warning',
    value: 0,
  },
  {
    name: 'Critical',
    value: 1,
  },
];
//# sourceMappingURL=notification.model.js.map
