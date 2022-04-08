import { test, Page } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(60 * 60 * 1000)
  page.setDefaultTimeout(60 * 60 * 1000)
  // Go to http://localhost:5000/
  await page.goto('http://localhost:5000/');
  // Go to http://localhost:5000/monitor/public
  await page.goto('http://localhost:5000/monitor/public');

  await delay(10000);

  // await page.pause();
  // Click button:has-text("person Login")
  await page.click('button:has-text("person Login")');
  // Click text=User IDperson >> div
  await page.click('text=User IDperson >> div');
  // Fill input
  await page.fill('input', 'admin');
  // Click input[type="password"]
  await page.click('input[type="password"]');
  // Fill input[type="password"]
  await page.fill('input[type="password"]', 'admin');
  // Click mat-dialog-container[role="dialog"] button:has-text("Login")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:5000/monitor/status' }*/),
    page.click('mat-dialog-container[role="dialog"] button:has-text("Login")')
  ]);
  // Click button:has-text("settings")
  await page.click('button:has-text("settings")');
  // Click text=User Management
  await page.click('text=User Management');
  // Click text=Roles Setting...
  await page.click('text=Roles Setting...');

  for await (const roleName of roleNames) {
    await makeRole(page, roleName);
  }

  // Click text=Save Cancel >> button
  await page.click('text=Save Cancel >> button');

  await page.pause();
});

const roleNames = [
  "Host Mode",
  "TSC Mode",
  "AI Mode",
  "View monitor status",
  "View history",
  "View playback",
  "View report",
  "View log",
  "View control",
  "View settings",
  "View Alarm",
  "View Warning",
  "Manual Transfer",
  "Delete Order",
  "Cancel Order",
  "Abort Order",
  "Estop Vehicle",
  "Reset Vehicle",
  "Reset All Vehicle",
  "Auto Vehicle",
  "Auto All Vehicle",
  "Host Order Enable",
  "Push Enable",
  "Rail In",
  "Rail Out",
  "Set ZCU Go",
  "Set ZCU Using Type",
  "Set Home Point",
  "View buffer",
  "View Vehicle Status",
  "View Item Details",
  "Segment Unuse",
  "User management",
  "Setting Preference",
  "Setting Group",
  "Setting Cluster",
  "Setting Alarm List",
  "Setting Segment",
  "Setting Station",
  "Setting Buffer",
  "Setting ZCU",
  "Setting Vehicle",
]

async function makeRole(page: Page, roleName: string) {
  // Click text=addremove Save Cancel >> button
  await page.click('text=addremove Save Cancel >> button');
  // Fill input[name="roleName"]
  await page.fill('input[name="roleName"]', roleName);
  // Press Enter
  await page.press('input[name="roleName"]', 'Enter');
  await page.click(`mat-list-option[role="option"] >> text=${roleName}`, { force: true });
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}
