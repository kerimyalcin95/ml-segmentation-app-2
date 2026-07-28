import { test, expect, _electron as electron } from "@playwright/test";

test.describe("Application Startup", () => {

    test("connects to the Python server", async () => {

        const app = await electron.launch({
            args: ["."]
        });

        const window = await app.firstWindow();

        await expect(
            window.getByText("Python server: Online")
        ).toBeVisible();

        await app.close();

    });

});