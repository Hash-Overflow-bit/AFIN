import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Investor-Broker End-to-End Transaction Loop', () => {
  // Unique email for each test run to ensure clean slate
  const testEmail = `e2e.investor.${Date.now()}@afin.mz`;
  const password = 'Password123!';

  test('Investor registration to Broker Allocation Happy Path', async ({ page, context, browser }) => {
    test.setTimeout(90000);
    page.on('console', msg => console.log('INVESTOR PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('INVESTOR PAGE ERROR:', err.message));

    // 1. Investor Registration
    console.log('Step 1: Registering new investor account...');
    await page.goto('/register');
    await page.fill('#firstName', 'E2E');
    await page.fill('#lastName', 'Tester');
    await page.fill('#email', testEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // Confirm application submitted
    await expect(page.locator('h1:has-text("Application Submitted")')).toBeVisible({ timeout: 15000 });

    // 2. Investor KYC Upload (requires logging in first)
    console.log('Step 2: Investor logging in for onboarding...');
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // Should redirect to profile/KYC onboarding page
    await expect(page).toHaveURL(/\/profile/, { timeout: 15000 });

    console.log('Uploading KYC documents...');
    const pdfPath = path.resolve(__dirname, 'assets/mock-doc.pdf');
    
    // Select all three file inputs and set mock PDF
    await expect(page.locator('input[type="file"]')).toHaveCount(3, { timeout: 15000 });
    
    // As files are uploaded, their FileUpload components are unmounted.
    // So we always target the first available file input in the DOM.
    await page.locator('input[type="file"]').nth(0).setInputFiles(pdfPath);
    await page.locator('input[type="file"]').nth(0).setInputFiles(pdfPath);
    await page.locator('input[type="file"]').nth(0).setInputFiles(pdfPath);

    // Submit for KYC Review
    await page.click('button:has-text("Submit for KYC Review")');
    await expect(page.locator('span:has-text("Review in Progress")')).toBeVisible({ timeout: 15000 });

    // 3. Broker KYC Approval (using independent browser context)
    console.log('Step 3: Broker logging in to approve KYC...');
    const brokerContext = await browser.newContext();
    const brokerPage = await brokerContext.newPage();
    brokerPage.on('console', msg => console.log('BROKER PAGE LOG:', msg.text()));
    brokerPage.on('pageerror', err => console.log('BROKER PAGE ERROR:', err.message));
    await brokerPage.goto('/login');
    await brokerPage.fill('#email', 'broker@afin.com');
    await brokerPage.fill('#password', 'Password123!');
    await brokerPage.click('button[type="submit"]');
    
    // Should go to KYC queue
    await expect(brokerPage).toHaveURL(/\/broker\/dashboard/, { timeout: 15000 });
    
    // Find the review link for the tester and click review
    const reviewLink = brokerPage.locator(`tr:has-text("${testEmail}") a:has-text("Review & Verify")`);
    await expect(reviewLink).toBeVisible();
    await reviewLink.click();

    // Approve the KYC
    const approveKycBtn = brokerPage.locator('button:has-text("Approve KYC")');
    await expect(approveKycBtn).toBeVisible();
    await approveKycBtn.click();
    
    // Redirects back to dashboard
    await expect(brokerPage).toHaveURL(/\/broker\/dashboard/);

    // 4. Investor Places Buy Order
    console.log('Step 4: Investor placing order for Mughal Steels...');
    // Refresh investor page to load approved state
    await page.reload();
    // Navigate to marketplace
    await page.goto('/marketplace');
    
    // Click Mughal Steels detail page
    const bondLink = page.locator('text=Mughal Steels');
    await expect(bondLink).toBeVisible({ timeout: 15000 });
    await bondLink.click();

    // Click Invest Now to open modal
    const investBtn = page.locator('button:has-text("Invest Now")');
    await expect(investBtn).toBeVisible();
    await investBtn.click();

    // Place an investment amount of 7000 (minimum for Mughal Steels)
    await page.fill('input[type="number"]', '7000');
    await page.click('button[type="submit"]'); // click confirm

    // Should redirect to orders page
    await expect(page).toHaveURL(/\/orders/, { timeout: 15000 });
    await expect(page.locator('span:has-text("Pending Review")')).toBeVisible();

    // Get order number/details
    const orderRow = page.locator('tr:has-text("Mughal Steels")');
    await expect(orderRow).toBeVisible();

    // 5. Broker Approves Buy Order
    console.log('Step 5: Broker approving the buy order...');
    
    // Accept dialogs automatically
    brokerPage.on('dialog', async dialog => {
      await dialog.accept();
    });

    await brokerPage.goto('/broker/orders');
    const brokerOrderRow = brokerPage.locator(`tr:has-text("${testEmail}")`);
    await expect(brokerOrderRow).toBeVisible();
    
    const approveOrderBtn = brokerOrderRow.locator('button:has-text("Approve")');
    await expect(approveOrderBtn).toBeVisible();
    await approveOrderBtn.click();

    // 6. Investor Uploads Payment Receipt
    console.log('Step 6: Investor uploading proof of bank transfer...');
    await page.goto('/orders');
    await expect(page.locator('span:has-text("Awaiting Payment")')).toBeVisible();

    // Open upload dialog or find upload button
    const uploadReceiptBtn = page.locator('button:has-text("Upload Receipt")');
    await expect(uploadReceiptBtn).toBeVisible();
    await uploadReceiptBtn.click();

    // Select file and upload
    const receiptInput = page.locator('input[type="file"]');
    await receiptInput.setInputFiles(pdfPath);
    await page.click('button:has-text("Submit Receipt")');

    await expect(page.locator('span:has-text("Payment Submitted")')).toBeVisible();

    // 7. Broker Verifies Payment
    console.log('Step 7: Broker verifying payment receipt...');
    await brokerPage.goto('/broker/payments');
    const brokerPaymentRow = brokerPage.locator(`tr:has-text("${testEmail}")`);
    await expect(brokerPaymentRow).toBeVisible();
    
    const verifyPaymentBtn = brokerPaymentRow.locator('button:has-text("Verify Payment")');
    await expect(verifyPaymentBtn).toBeVisible();
    await verifyPaymentBtn.click();

    await expect(brokerPaymentRow.locator('span:has-text("Verified")')).toBeVisible();

    // 8. Broker Executes Pro-Rata Allocation Engine
    console.log('Step 8: Broker running pro-rata allocation...');
    await brokerPage.goto('/broker/allocations');
    
    // Select Mughal Steels bond option by finding the option with matching text and selecting by value
    const bondOption = brokerPage.locator('select option', { hasText: 'Mughal Steels' });
    const bondVal = await bondOption.getAttribute('value');
    if (bondVal) {
      await brokerPage.selectOption('select', bondVal);
    }
    
    // Wait for preview to load
    await expect(brokerPage.locator('button:has-text("Execute Allocation")')).toBeVisible();
    
    // Execute allocation
    await brokerPage.click('button:has-text("Execute Allocation")');

    // 9. Investor Portfolio Verification
    console.log('Step 9: Investor checking portfolio holdings...');
    await page.goto('/dashboard');
    
    // Assert active holdings and portfolio elements are displayed
    await expect(page.locator('h1:has-text("Portfolio Dashboard")')).toBeVisible();
    await expect(page.locator('div:has-text("Mughal Steels")')).toBeVisible();
  });
});
