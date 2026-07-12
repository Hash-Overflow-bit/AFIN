# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investor-broker-journey.spec.ts >> Investor-Broker End-to-End Transaction Loop >> Investor registration to Broker Allocation Happy Path
- Location: e2e/investor-broker-journey.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('span:has-text("Review in Progress")')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('span:has-text("Review in Progress")')

```

```yaml
- banner:
  - link "afin":
    - /url: /dashboard
    - heading "afin" [level=1]
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "Marketplace":
      - /url: /marketplace
    - link "Portfolio":
      - /url: /portfolio
    - link "My Orders":
      - /url: /orders
  - button "Notifications"
  - button "Logout"
- main:
  - heading "Investor Profile & KYC" [level=1]
  - paragraph: Manage your personal information and verification documents.
  - heading "E2E Tester" [level=3]
  - paragraph: e2e.investor.1783632636701@afin.mz
  - text: Verification Required
  - heading "Required Documents" [level=3]
  - paragraph: To comply with Mozambican regulations, please upload all three required documents below.
  - heading "Proof of Identity Selected" [level=4]
  - paragraph: Bilhete de Identidade (BI), valid Passport, or DIRE.
  - paragraph: mock-doc.pdf
  - paragraph: Ready to upload on submit (0.00 MB)
  - button "Remove"
  - heading "Proof of Tax Number (NUIT) Selected" [level=4]
  - paragraph: Official NUIT declaration document.
  - paragraph: mock-doc.pdf
  - paragraph: Ready to upload on submit (0.00 MB)
  - button "Remove"
  - heading "Proof of Address Selected" [level=4]
  - paragraph: Recent utility bill or bank statement (within 3 months).
  - paragraph: mock-doc.pdf
  - paragraph: Ready to upload on submit (0.00 MB)
  - button "Remove"
  - paragraph: All required documents are ready for submission.
  - button "Submitting..." [disabled]
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as path from 'path';
  3   | 
  4   | test.describe('Investor-Broker End-to-End Transaction Loop', () => {
  5   |   // Unique email for each test run to ensure clean slate
  6   |   const testEmail = `e2e.investor.${Date.now()}@afin.mz`;
  7   |   const password = 'Password123!';
  8   | 
  9   |   test('Investor registration to Broker Allocation Happy Path', async ({ page, context, browser }) => {
  10  |     test.setTimeout(90000);
  11  |     page.on('console', msg => console.log('INVESTOR PAGE LOG:', msg.text()));
  12  |     page.on('pageerror', err => console.log('INVESTOR PAGE ERROR:', err.message));
  13  | 
  14  |     // 1. Investor Registration
  15  |     console.log('Step 1: Registering new investor account...');
  16  |     await page.goto('/register');
  17  |     await page.fill('#firstName', 'E2E');
  18  |     await page.fill('#lastName', 'Tester');
  19  |     await page.fill('#email', testEmail);
  20  |     await page.fill('#password', password);
  21  |     await page.click('button[type="submit"]');
  22  | 
  23  |     // Confirm application submitted
  24  |     await expect(page.locator('h1:has-text("Application Submitted")')).toBeVisible({ timeout: 15000 });
  25  | 
  26  |     // 2. Investor KYC Upload (requires logging in first)
  27  |     console.log('Step 2: Investor logging in for onboarding...');
  28  |     await page.goto('/login');
  29  |     await page.fill('#email', testEmail);
  30  |     await page.fill('#password', password);
  31  |     await page.click('button[type="submit"]');
  32  | 
  33  |     // Should redirect to profile/KYC onboarding page
  34  |     await expect(page).toHaveURL(/\/profile/, { timeout: 15000 });
  35  | 
  36  |     console.log('Uploading KYC documents...');
  37  |     const pdfPath = path.resolve(__dirname, 'assets/mock-doc.pdf');
  38  |     
  39  |     // Select all three file inputs and set mock PDF
  40  |     await expect(page.locator('input[type="file"]')).toHaveCount(3, { timeout: 15000 });
  41  |     
  42  |     // As files are uploaded, their FileUpload components are unmounted.
  43  |     // So we always target the first available file input in the DOM.
  44  |     await page.locator('input[type="file"]').nth(0).setInputFiles(pdfPath);
  45  |     await page.locator('input[type="file"]').nth(0).setInputFiles(pdfPath);
  46  |     await page.locator('input[type="file"]').nth(0).setInputFiles(pdfPath);
  47  | 
  48  |     // Submit for KYC Review
  49  |     await page.click('button:has-text("Submit for KYC Review")');
> 50  |     await expect(page.locator('span:has-text("Review in Progress")')).toBeVisible({ timeout: 15000 });
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  51  | 
  52  |     // 3. Broker KYC Approval (using independent browser context)
  53  |     console.log('Step 3: Broker logging in to approve KYC...');
  54  |     const brokerContext = await browser.newContext();
  55  |     const brokerPage = await brokerContext.newPage();
  56  |     brokerPage.on('console', msg => console.log('BROKER PAGE LOG:', msg.text()));
  57  |     brokerPage.on('pageerror', err => console.log('BROKER PAGE ERROR:', err.message));
  58  |     await brokerPage.goto('/login');
  59  |     await brokerPage.fill('#email', 'broker@afin.com');
  60  |     await brokerPage.fill('#password', 'Password123!');
  61  |     await brokerPage.click('button[type="submit"]');
  62  |     
  63  |     // Should go to KYC queue
  64  |     await expect(brokerPage).toHaveURL(/\/broker\/dashboard/, { timeout: 15000 });
  65  |     
  66  |     // Find the review link for the tester and click review
  67  |     const reviewLink = brokerPage.locator(`tr:has-text("${testEmail}") a:has-text("Review & Verify")`);
  68  |     await expect(reviewLink).toBeVisible();
  69  |     await reviewLink.click();
  70  | 
  71  |     // Approve the KYC
  72  |     const approveKycBtn = brokerPage.locator('button:has-text("Approve KYC")');
  73  |     await expect(approveKycBtn).toBeVisible();
  74  |     await approveKycBtn.click();
  75  |     
  76  |     // Redirects back to dashboard
  77  |     await expect(brokerPage).toHaveURL(/\/broker\/dashboard/);
  78  | 
  79  |     // 4. Investor Places Buy Order
  80  |     console.log('Step 4: Investor placing order for Mughal Steels...');
  81  |     // Refresh investor page to load approved state
  82  |     await page.reload();
  83  |     // Navigate to marketplace
  84  |     await page.goto('/marketplace');
  85  |     
  86  |     // Click Mughal Steels detail page
  87  |     const bondLink = page.locator('text=Mughal Steels');
  88  |     await expect(bondLink).toBeVisible({ timeout: 15000 });
  89  |     await bondLink.click();
  90  | 
  91  |     // Click Invest Now to open modal
  92  |     const investBtn = page.locator('button:has-text("Invest Now")');
  93  |     await expect(investBtn).toBeVisible();
  94  |     await investBtn.click();
  95  | 
  96  |     // Place an investment amount of 7000 (minimum for Mughal Steels)
  97  |     await page.fill('input[type="number"]', '7000');
  98  |     await page.click('button[type="submit"]'); // click confirm
  99  | 
  100 |     // Should redirect to orders page
  101 |     await expect(page).toHaveURL(/\/orders/, { timeout: 15000 });
  102 |     await expect(page.locator('span:has-text("Pending Review")')).toBeVisible();
  103 | 
  104 |     // Get order number/details
  105 |     const orderRow = page.locator('tr:has-text("Mughal Steels")');
  106 |     await expect(orderRow).toBeVisible();
  107 | 
  108 |     // 5. Broker Approves Buy Order
  109 |     console.log('Step 5: Broker approving the buy order...');
  110 |     
  111 |     // Accept dialogs automatically
  112 |     brokerPage.on('dialog', async dialog => {
  113 |       await dialog.accept();
  114 |     });
  115 | 
  116 |     await brokerPage.goto('/broker/orders');
  117 |     const brokerOrderRow = brokerPage.locator(`tr:has-text("${testEmail}")`);
  118 |     await expect(brokerOrderRow).toBeVisible();
  119 |     
  120 |     const approveOrderBtn = brokerOrderRow.locator('button:has-text("Approve")');
  121 |     await expect(approveOrderBtn).toBeVisible();
  122 |     await approveOrderBtn.click();
  123 | 
  124 |     // 6. Investor Uploads Payment Receipt
  125 |     console.log('Step 6: Investor uploading proof of bank transfer...');
  126 |     await page.goto('/orders');
  127 |     await expect(page.locator('span:has-text("Awaiting Payment")')).toBeVisible();
  128 | 
  129 |     // Open upload dialog or find upload button
  130 |     const uploadReceiptBtn = page.locator('button:has-text("Upload Receipt")');
  131 |     await expect(uploadReceiptBtn).toBeVisible();
  132 |     await uploadReceiptBtn.click();
  133 | 
  134 |     // Select file and upload
  135 |     const receiptInput = page.locator('input[type="file"]');
  136 |     await receiptInput.setInputFiles(pdfPath);
  137 |     await page.click('button:has-text("Submit Receipt")');
  138 | 
  139 |     await expect(page.locator('span:has-text("Payment Submitted")')).toBeVisible();
  140 | 
  141 |     // 7. Broker Verifies Payment
  142 |     console.log('Step 7: Broker verifying payment receipt...');
  143 |     await brokerPage.goto('/broker/payments');
  144 |     const brokerPaymentRow = brokerPage.locator(`tr:has-text("${testEmail}")`);
  145 |     await expect(brokerPaymentRow).toBeVisible();
  146 |     
  147 |     const verifyPaymentBtn = brokerPaymentRow.locator('button:has-text("Verify Payment")');
  148 |     await expect(verifyPaymentBtn).toBeVisible();
  149 |     await verifyPaymentBtn.click();
  150 | 
```