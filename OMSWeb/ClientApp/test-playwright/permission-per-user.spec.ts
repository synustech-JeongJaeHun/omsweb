import { test, expect, Page, devices, chromium } from "@playwright/test";

const PAGE_URL = 'http://localhost:5000/monitor/public';

const password = "1234"
const userIds = [
  "HostMode",
  "TSCMode",
  "AIMode",
  "Viewmonitorstatus",
  "Viewhistory",
  "Viewplayback",
  "Viewreport",
  "Viewlog",
  "Viewcontrol",
  "Viewsettings",
  "ViewAlarm",
  "ViewWarning",
  "ManualTransfer",
  "DeleteOrder",
  "CancelOrder",
  "AbortOrder",
  "EstopVehicle",
  "ResetVehicle",
  "ResetAllVehicle",
  "AutoVehicle",
  "AutoAllVehicle",
  "HostOrderEnable",
  "PushEnable",
  "RailIn",
  "RailOut",
  "SetZCU Go",
  "SetZCUUsingType",
  "SetHomePoint",
  "Viewbuffer",
  "ViewVehicleStatus",
  "ViewItemDetails",
  "SegmentUnuse",
  "Usermanagement",
  "SettingPreference",
  "SettingGroup",
  "SettingCluster",
  "SettingAlarmList",
  "SettingSegment",
  "SettingStation",
  "SettingBuffer",
  "SettingZCU",
  "SettingVehicle",
]

async function login(page: Page, userId: string, password: string) {
  await page.goto(PAGE_URL);
  await page.click('button:has-text("person Login")');
  // Fill input
  await page.fill('input', userId);
  // Press Tab
  await page.press('input', 'Tab');
  // Fill input[type="password"]
  await page.fill('input[type="password"]', password);
  // Press Enter
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:5000/monitor/status' }*/),
    page.press('input[type="password"]', 'Enter')
  ]);
}

const testPerUser = (userId: string) => () => {
  test.beforeEach(async ({ page }) => {
    await login(page, userId, password)
    await page.goto(PAGE_URL);
  })

  test('Host Mode', async ({ page }) => {
    // Click button:has-text("Local")
    await page.click('button:has-text("Local"), button:has-text("Host")');
    // Click button:has-text("Confirm")
    await page.click('button:has-text("Confirm")');
  });
  test("TSC Mode", async ({ page }) => {
    // Click button:has-text("Paused")
    await page.click('button:has-text("Paused"), button:has-text("Auto")');
    // Click button:has-text("Confirm")
    await page.click('button:has-text("Confirm")');
  });
  test("AI Mode", async ({ page }) => {
    // Click button:has-text("AI")
    await page.click('button:has-text("AI")');
    // Click button:has-text("Confirm")
    await page.click('button:has-text("Confirm")');
  });
  test("View monitor status", async ({ page }) => {
    test.skip(true, "test your self")
  });
  test("View history", async ({ page }) => {
    await page.click('button:has-text("history")');
    await expect(page).toHaveURL('http://localhost:5000/histories/orders');
  });
  test("View playback", async ({ page }) => {
    // Click button:has-text("play_circle_outline")
    await page.click('button:has-text("play_circle_outline")');
    await expect(page).toHaveURL('http://localhost:5000/playback');
  });
  test("View report", async ({ page }) => {
    // Click button:has-text("bar_chart")
    await page.click('button:has-text("bar_chart")');
    await expect(page).toHaveURL('http://localhost:5000/reports/normalTR');
  });
  test("View log", async ({ page }) => {
    // Click button:has-text("receipt_long")
    await page.click('button:has-text("receipt_long")');
    await expect(page).toHaveURL('http://localhost:5000/logs');
  });
  test("View control", async ({ page }) => {
    // Click button:has-text("receipt_long")
    await page.click('button:has-text("layers")');
    await expect(page).toHaveURL('http://localhost:5000/controls/vehicles');
  });
  test("View settings", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  });
  test("View Alarm", async ({ page }) => {
    // Click button:has-text("notifications0")
    await page.click('button:has-text("notifications0")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  });
  test("View Warning", async ({ page }) => {
    // Click button:has-text("warning_amber0")
    await page.click('button:has-text("warning_amber0")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  });
  test("Manual Transfer", async ({ page }) => {
    // Click button:has-text("post_add")
    await page.click('button:has-text("post_add")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  });
  test("Delete Order", async ({ page }) => {
    // do with oms-order.exe

    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Orders")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // Click button:has-text("EStop")
    await page.click('button:has-text("Delete")');
  });
  test("Cancel Order", async ({ page }) => {
    test.skip(true, "not visualized")
  });
  test("Abort Order", async ({ page }) => {
    test.skip(true, "not visualized")
  });
  test("Estop Vehicle", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Vehicles")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // Click button:has-text("EStop")
    await page.click('button:has-text("EStop")');
  })
  test("Reset Vehicle", async ({ page }) => {

    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Vehicles")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // div[role="toolbar"] button:has-text("Reset")
    await page.click('oms-vehicle-control-table button:has-text("reset")');
  })
  test("Reset All Vehicle", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click button:has-text("settings_backup_restoreReset All Vehicles")
    await page.click('button:has-text("settings_backup_restoreReset All Vehicles")');
    // Click button:has-text("Confirm")
    await page.click('button:has-text("Confirm")');
  })
  test("Auto Vehicle", async ({ page }) => {

    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tablist"] >> text=Vehicles
    await page.click('div[role="tablist"] >> text=Vehicles');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // div[role="toolbar"] button:has-text("Auto")
    await page.click('oms-vehicle-control-table button:has-text("Auto")');
  })
  test("Auto All Vehicle", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click button:has-text("brightness_autoAuto All Vehicles")
    await page.click('button:has-text("brightness_autoAuto All Vehicles")');
    // Click button:has-text("Confirm")
    await page.click('button:has-text("Confirm")');
  })
  test("Host Order Enable", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Vehicles")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // Click button:has-text("Host Order Disable")
    await page.click('button:has-text("Host Order Disable")');
  })
  test("Push Enable", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Vehicles")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // Click button:has-text("Push Disable")
    await page.click('button:has-text("Push Disable")');
  })
  test("Rail In", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Vehicles")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // Click button:has-text("Rail In")
    await page.click('button:has-text("Rail In")');
  })
  test("Rail Out", async ({ page }) => {
    // Click button:has-text("window")
    await page.click('button:has-text("window")');
    // Click div[role="tab"]:has-text("Vehicles")
    await page.click('div[role="tab"]:has-text("Vehicles")');
    // Click [aria-label="Select row"] div[role="checkbox"]
    await page.click('[aria-label="Select row"] div[role="checkbox"]');
    // Click button:has-text("Rail Out")
    await page.click('button:has-text("Rail Out")');
  })
  test("Set ZCU Go", async ({ page }) => {
    test.skip(true, "svg test");
  })
  test("Set ZCU Using Type", async ({ page }) => {
    test.skip(true, "svg test");
  })
  test("Set Home Point", async ({ page }) => {
    test.skip(true, "svg test")
  })
  test("View buffer", async ({ page }) => {
    // Click button:has-text("sensor_window")
    await page.click('button:has-text("sensor_window")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');

  })
  test("View Vehicle Status", async ({ page }) => {
    // Click button:has-text("security_update_warning")
    await page.click('button:has-text("security_update_warning")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("View Item Details", async ({ page }) => {
    // Click #map-toolbar button:has-text("info")
    await page.click('#map-toolbar button:has-text("info")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Segment Unuse", async ({ page }) => {
    test.skip(true, "svg test");
  })
  test("User management", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click text=User Management
    await page.click('mat-nav-list[role="navigation"] >> text=User Management');
    // Click :nth-match(button:has-text("add"), 3)
    await page.click('button mat-icon:has-text("add")');
    // Click text=closeAdd UserUser IDFirst NameLast NameEmailNew PasswordConfirm Password Role Sa >> [aria-label="Close"]
    await page.click('text=closeAdd UserUser IDFirst NameLast NameEmailNew PasswordConfirm Password Role Sa >> [aria-label="Close"]');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Preference", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click text=Show left toolbar text Show OMS version >> div
    await page.click('text=Show left toolbar text Show OMS version >> div');
    // Click text=Show left toolbar text Show OMS version >> div div div
    await page.click('text=Show left toolbar text Show OMS version >> div div div');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Group", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click mat-nav-list[role="navigation"] >> text=Group
    await page.click('mat-nav-list[role="navigation"] >> text=Group');
    // Click text=Point 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 >> div[role="checkbox"]
    await page.click('text=Point 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 >> div[role="checkbox"]');
    // Click text=Point 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 >> div[role="checkbox"]
    await page.click('text=Point 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 >> div[role="checkbox"]');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Cluster", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click text=Cluster
    await page.click('mat-nav-list[role="navigation"] >> text=Cluster');
    // Click input[type="number"]
    await page.click('input[type="number"]');
    // Fill input[type="number"]
    await page.fill('input[type="number"]', '12');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Alarm List", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click text=Alarm List
    await page.click('mat-nav-list[role="navigation"] >> text=Alarm List');
    // Click text=CodeAlarm NameResolutionAction1000ERR_1000_SERVO1_ERROR 2000ERR_2000_SERVO2_ERRO >> [aria-label="Search in the data grid"]
    await page.click('text=CodeAlarm NameResolutionAction1000ERR_1000_SERVO1_ERROR 2000ERR_2000_SERVO2_ERRO >> [aria-label="Search in the data grid"]');
    // Fill text=CodeAlarm NameResolutionAction1000ERR_1000_SERVO1_ERROR 2000ERR_2000_SERVO2_ERRO >> [aria-label="Search in the data grid"]
    await page.fill('text=CodeAlarm NameResolutionAction1000ERR_1000_SERVO1_ERROR 2000ERR_2000_SERVO2_ERRO >> [aria-label="Search in the data grid"]', '123');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Segment", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click text=Segment
    await page.click('mat-nav-list[role="navigation"] >> text=Segment');
    // Click text=All Speed Ratio
    await page.click('text=All Speed Ratio');
    // Click input[type="number"]
    await page.click('input[type="number"]');
    // Press a with modifiers
    await page.press('input[type="number"]', 'Control+a');
    // Fill input[type="number"]
    await page.fill('input[type="number"]', '123');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Station", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click mat-nav-list[role="navigation"] >> text=Station
    await page.click('mat-nav-list[role="navigation"] >> text=Station');
    // Click text=1S1OHT01_P01 >> div[role="checkbox"]
    await page.click('text=1S1OHT01_P01 >> div[role="checkbox"]');
    // Click button:has-text("Revert")
    await page.click('button:has-text("Revert")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Buffer", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click mat-nav-list[role="navigation"] >> text=Buffer
    await page.click('mat-nav-list[role="navigation"] >> text=Buffer');
    // Click text=13S1OHT01_B09 >> div[role="checkbox"]
    await page.click('text=13S1OHT01_B09 >> div[role="checkbox"]');
    // Click button:has-text("Revert")
    await page.click('button:has-text("Revert")');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting ZCU", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click text=ZCU
    await page.click('mat-nav-list[role="navigation"] >> text=ZCU');
    // Click text=ZCU Setting Save Revert
    await page.click('text=ZCU Setting Save Revert');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
  test("Setting Vehicle", async ({ page }) => {
    // Click button:has-text("settings")
    await page.click('button:has-text("settings")');
    // Click mat-nav-list[role="navigation"] >> :nth-match(:text("Vehicle"), 2)
    await page.click('mat-nav-list[role="navigation"] >> text=Vehicle');
    // Click text=Vehicle Setting Save Revert
    await page.click('text=Vehicle Setting Save Revert');
    // Click text=IdOnline Name >> div[role="checkbox"]
    await page.click('text=IdOnline Name >> div[role="checkbox"]');
    // Click text=IdOnline Name >> div[role="checkbox"]
    await page.click('text=IdOnline Name >> div[role="checkbox"]');
    // Click [aria-label="Close"]
    await page.click('[aria-label="Close"]');
  })
}

// test("blank", async ({ page }) => {
//   test.fail()
// });

for (const userId of userIds)
  test.describe.parallel(`permission for "${userId}" user tests`, testPerUser(userId))
