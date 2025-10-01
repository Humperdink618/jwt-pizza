// import { test, expect } from '@playwright/test' <- Replace this with the line below
import { test, expect } from 'playwright-test-coverage';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('JWT Pizza');
});

