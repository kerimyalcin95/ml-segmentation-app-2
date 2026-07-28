import { test, expect, _electron as electron, ElectronApplication, Page } from "@playwright/test";

test.describe("Application Launch", () => {

    let app: ElectronApplication;
    let window: Page;

    test.beforeEach(async () => {

        app = await electron.launch({
            args: ["."]
        });

        window = await app.firstWindow();

    });

    test.afterEach(async () => {

        await app.close();

    });

    test("opens the main window", async () => {

        await expect(window).toHaveTitle(/.+/);

        expect(await app.windows()).toHaveLength(1);

    });

    test("displays the correct application title", async () => {

        await expect(window).toHaveTitle("ML-Segmentation");

    });

    test("displays the main application layout", async () => {

        await expect(
            window.locator('[data-e2e="sidebar"]')
        ).toBeVisible();

        await expect(
            window.locator('[data-e2e="mode-selector"]')
        ).toBeVisible();

        await expect(
            window.locator('[data-e2e="canvas-view"]')
        ).toBeVisible();

        await expect(
            window.locator('[data-e2e="canvas"]')
        ).toBeVisible();

        await expect(
            window.locator('[data-e2e="statusbar"]')
        ).toBeVisible();

    });

});