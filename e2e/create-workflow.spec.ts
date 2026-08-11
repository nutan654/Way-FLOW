import { test, expect } from "@playwright/test";

test("create → generate → simulate happy path", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /executable workflows/i })).toBeVisible();
  await page.getByRole("link", { name: /create your first workflow/i }).click();

  await expect(page.getByRole("heading", { name: "Create Workflow" })).toBeVisible();
  await page.getByRole("button", { name: "Use example prompt" }).click();
  await page.getByRole("button", { name: "Generate Workflow" }).click();

  await expect(page.getByText("Support Ticket Triage").or(page.getByText("Generated Workflow"))).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Simulate" }).click();
  await page.getByRole("button", { name: "Run Simulation" }).click();

  await expect(page.getByText(/steps executed/i)).toBeVisible({ timeout: 10_000 });
});
