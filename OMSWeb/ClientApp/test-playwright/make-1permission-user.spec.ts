import { Page } from "@playwright/test";

const { test } = require('@playwright/test');
test('test', async ({ page }) => {
  await delay(10000);
  // Go to http://localhost:5000/
  await page.goto('http://localhost:5000/');
  // Go to http://localhost:5000/monitor/public
  await page.goto('http://localhost:5000/monitor/public');
  // Click button:has-text("person Login")
  await page.click('button:has-text("person Login")');
  // Fill input
  await page.fill('input', 'admin');
  // Press Tab
  await page.press('input', 'Tab');
  // Fill input[type="password"]
  await page.fill('input[type="password"]', 'admin');
  // Press Enter
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:5000/monitor/status' }*/),
    page.press('input[type="password"]', 'Enter')
  ]);
  // Click button:has-text("settings")
  await page.click('button:has-text("settings")');
  // Click text=User Management
  await page.click('text=User Management');

  for await (const roleName of roleNames) {
    await addUser(page, roleName);
  }

  await delay(1200)

  // Click button:has-text("Save")
  await page.click('button:has-text("Save")');

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



const PASSWORD = '==========PASSWORD YOU WANT TO ENTER==========';
async function addUser(page: Page, roleName: string) {
  const nospaceRoleName = roleName.replace(/\s/g, '');

  // Click :nth-match(button:has-text("add"), 3)
  await delay(100)
  await page.click(':nth-match(button:has-text("add"), 3)');
  await delay(100)
  await page.fill('input[formcontrolname="userId"]', nospaceRoleName);
  await delay(100)
  await page.fill('input[formcontrolname="firstName"]', nospaceRoleName);
  await delay(100)
  await page.fill('input[formcontrolname="lastName"]', nospaceRoleName);
  await delay(100)
  await page.fill('input[formcontrolname="email"]', `${nospaceRoleName}@email.com`);
  await delay(100)
  await page.fill('input[formcontrolname="password"]', PASSWORD);
  await delay(100)
  await page.fill('input[formcontrolname="passwordConfirm"]', PASSWORD);
  await delay(100)
  await page.click('mat-select[role="combobox"]');
  await delay(100)
  await page.click(`mat-option[role="option"]:has-text("${roleName}")`, { force: true });
  await delay(100)
  await page.click('text=Save Cancel >> button');
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}
