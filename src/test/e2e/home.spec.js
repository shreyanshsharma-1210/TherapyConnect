import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TherapyConnect|Charushri/i);
  });

  test('has Book Session CTA', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /book/i }).first();
    await expect(cta).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('book page is reachable', async ({ page }) => {
    await page.goto('/book');
    await expect(page).toHaveURL(/\/book/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Blog', () => {
  test('blog listing loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/blog/);
  });
});

test.describe('SEO', () => {
  test('has meta description', async ({ page }) => {
    await page.goto('/');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.length).toBeGreaterThan(10);
  });

  test('has OG tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('canonical tag present', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('therapyconnect.in');
  });
});

test.describe('Accessibility', () => {
  test('has skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('.skip-link, [href="#main-content"]');
    await expect(skip).toBeAttached();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const imgs = await page.locator('img').all();
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});

test.describe('Auth pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('redirects /dashboard to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth\/login|dashboard/);
  });
});
