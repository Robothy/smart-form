import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Form CRUD Operations
 *
 * These tests verify critical user journeys for form management.
 * They require a running dev server (`npm run dev`) and use the test database.
 */

test.describe('Form List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect from root to forms list', async ({ page }) => {
    await expect(page).toHaveURL('/forms')
  })

  test('should display page title and toolbar', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: 'My Forms' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create New Form' })).toBeVisible()
  })

  test('should display filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /All/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Drafts/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Published/ })).toBeVisible()
  })

  test('should show empty state when no forms exist', async ({ page }) => {
    await expect(page.getByText(/No forms yet|No forms found/)).toBeVisible()
  })

  test('should navigate to create new form page', async ({ page }) => {
    await page.getByRole('button', { name: 'Create New Form' }).click()
    await expect(page).toHaveURL('/forms/new')
  })

  test('should switch between filters', async ({ page }) => {
    // Click on Drafts filter
    await page.getByRole('button', { name: /Drafts/ }).click()
    await expect(page.getByRole('button', { name: /Drafts/ })).toHaveAttribute('aria-pressed', 'true')

    // Click on Published filter
    await page.getByRole('button', { name: /Published/ }).click()
    await expect(page.getByRole('button', { name: /Published/ })).toHaveAttribute('aria-pressed', 'true')

    // Click on All filter
    await page.getByRole('button', { name: /All/ }).click()
    await expect(page.getByRole('button', { name: /All/ })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('Create Form Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forms/new')
  })

  test('should display form builder heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Create New Form|Create Form/ })).toBeVisible()
  })

  test('should display form title and description inputs', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Form Title|Title/ })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /Description/ })).toBeVisible()
  })

  test('should display Add Field button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Field/ })).toBeVisible()
  })

  test('should display save button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Create Form|Save/ })).toBeVisible()
  })

  test('should show empty fields message', async ({ page }) => {
    await expect(page.getByText(/No fields added yet/)).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    // Start at forms list
    await page.goto('/forms')
    await expect(page).toHaveURL('/forms')

    // Go to create form
    await page.getByRole('button', { name: 'Create New Form' }).click()
    await expect(page).toHaveURL('/forms/new')

    // Go back to forms list
    await page.goto('/forms')
    await expect(page).toHaveURL('/forms')
  })

  test('should handle browser back button', async ({ page }) => {
    await page.goto('/forms')
    await page.getByRole('button', { name: 'Create New Form' }).click()
    await expect(page).toHaveURL('/forms/new')

    await page.goBack()
    await expect(page).toHaveURL('/forms')
  })
})

test.describe('Page Layout', () => {
  test('should have responsive layout', async ({ page }) => {
    await page.goto('/forms')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('button', { name: 'Create New Form' })).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByRole('button', { name: 'Create New Form' })).toBeVisible()
  })

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/forms')
    await page.waitForLoadState('networkidle')

    expect(errors.filter(e => !e.includes('Warning') && !e.includes('DevTools failed')).length).toBe(0)
  })
})
