/* Optional real-browser acceptance suite. See README for the isolated test-tool setup. */
const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");

(async () => {
    const base = process.env.SITE_URL || "http://127.0.0.1:4173";
    const output = process.env.ARTIFACT_DIR || "/tmp/portfolio-review";
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    try {
        const context = await browser.newContext({
            viewport: { width: 1440, height: 1000 },
            reducedMotion: "reduce",
            permissions: ["clipboard-read", "clipboard-write"],
        });
        const page = await context.newPage();
        const errors = [],
            badResponses = [],
            remoteRequests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("response", (response) => {
            if (response.status() >= 400) badResponses.push(response.url());
        });
        page.on("request", (request) => {
            if (!request.url().startsWith(base))
                remoteRequests.push(request.url());
        });
        await page.goto(base, { waitUntil: "networkidle" });
        await page.locator("body.js-ready").waitFor();
        assert.match(await page.title(), /Wasif Hussain/);
        assert.ok(
            (await page
                .locator('.case-study a[href="https://namasteroving.com/"]')
                .count()) > 0,
            "Featured work must link to the actual Namaste Roving website",
        );
        console.log(
            "PASS professional work includes the live Namaste Roving reference",
        );

        await page
            .getByRole("button", { name: "Applied ML", exact: true })
            .click();
        assert.equal(await page.locator(".project-card:visible").count(), 2);
        assert.equal(
            await page.locator("#ordering-project").isVisible(),
            false,
        );
        await page
            .getByRole("button", { name: "Web & mobile", exact: true })
            .click();
        assert.equal(await page.locator(".project-card:visible").count(), 2);
        assert.equal(
            await page.locator("#restaurant-project").isVisible(),
            false,
        );
        await page.getByRole("button", { name: "All projects" }).click();
        assert.equal(await page.locator(".project-card:visible").count(), 3);
        console.log("PASS project filters and restoration");

        for (const [id, title] of [
            ["healthcare", "Connecting clinical systems"],
            ["prizm", "Search behind the healthcare data"],
            ["namaste", "Namaste Roving"],
            ["restaurant", "Restaurant Recommendation System"],
            ["ordering", "Online Food Ordering System"],
            ["tutor", "Tutor Hiring Application"],
        ]) {
            const trigger = page.locator(`[data-project="${id}"]`);
            await trigger.click();
            assert.equal(await page.locator("dialog").isVisible(), true);
            assert.equal(
                await page.locator("#dialog-title").textContent(),
                title,
            );
            const violations = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
                .analyze();
            assert.deepEqual(
                violations.violations.map((x) => x.id),
                [],
                `dialog ${id} accessibility`,
            );
            const credit = await page.locator("#dialog-credit").textContent();
            if (id === "healthcare") {
                assert.match(
                    credit,
                    /Qure4u Inc\..*Contract Software Engineer/,
                );
                assert.equal(
                    await page.locator("#dialog-link").getAttribute("href"),
                    "https://www.qure4u.com/",
                );
            }
            if (id === "prizm") {
                assert.match(credit, /Deerhold Ltd\..*Software Engineer/);
                assert.equal(
                    await page.locator("#dialog-link").getAttribute("href"),
                    "https://deerhold.com/",
                );
            }
            if (id === "namaste") {
                assert.match(credit, /Astra Technology.*Software Engineer/);
                assert.equal(
                    await page.locator("#dialog-link").getAttribute("href"),
                    "https://namasteroving.com/",
                );
                const reference = page.locator(
                    '#dialog-credit a[href="https://astratechnology.com.np/portfolio/5"]',
                );
                assert.equal(
                    await reference.count(),
                    1,
                    "Credit must link to Astra's supplied project reference",
                );
                assert.equal(await reference.getAttribute("target"), "_blank");
                const relations = (await reference.getAttribute("rel")).split(
                    /\s+/,
                );
                assert.ok(relations.includes("noopener"));
                assert.ok(relations.includes("noreferrer"));
            }
            if (id === "ordering")
                assert.match(
                    await page.locator("#dialog-link").textContent(),
                    /project notes/,
                );
            await page.keyboard.press("Escape");
            await page.locator("dialog").waitFor({ state: "hidden" });
            assert.equal(
                await trigger.evaluate(
                    (element) => document.activeElement === element,
                ),
                true,
            );
        }
        await page.locator('[data-project="restaurant"]').click();
        await page
            .getByRole("button", { name: "Close project details" })
            .click();
        await page.locator("dialog").waitFor({ state: "hidden" });
        await page.locator('[data-project="restaurant"]').click();
        await page.mouse.click(5, 5);
        await page.locator("dialog").waitFor({ state: "hidden" });
        console.log(
            "PASS all project dialogs, WCAG checks, Escape/outside/button close and focus restoration",
        );

        await page
            .locator(".experience-item")
            .nth(2)
            .locator("summary")
            .click();
        assert.match(
            await page.locator(".experience-item").nth(2).innerText(),
            /Cerner and Athenahealth/,
        );
        console.log("PASS experience disclosure");
        await page.getByRole("button", { name: "Copy email address" }).click();
        await page.locator(".toast.visible").waitFor();
        assert.equal(
            await page.evaluate(() => navigator.clipboard.readText()),
            "hussainwasif1999@gmail.com",
        );
        console.log("PASS email clipboard and success feedback");
        await page.evaluate(() =>
            Object.defineProperty(navigator, "clipboard", {
                configurable: true,
                value: {
                    writeText: async () => {
                        throw new Error("Denied");
                    },
                },
            }),
        );
        await page.getByRole("button", { name: "Copy email address" }).click();
        assert.match(
            await page.locator(".toast").innerText(),
            /copied|Copy this email/,
        );
        console.log("PASS denied-clipboard fallback");

        const download = await Promise.all([
            page.waitForEvent("download"),
            page.getByRole("link", { name: "Download résumé" }).click(),
        ]);
        assert.equal(
            download[0].suggestedFilename(),
            "Wasif-Hussain-Resume.pdf",
        );
        assert.equal(
            (
                await context.request.get(
                    `${base}/assets/Wasif-Hussain-Resume.pdf`,
                )
            ).status(),
            200,
        );
        console.log("PASS résumé download");

        for (
            let y = 0;
            y < (await page.evaluate(() => document.body.scrollHeight));
            y += 700
        ) {
            await page.evaluate((value) => scrollTo(0, value), y);
            await page.waitForTimeout(45);
        }
        await page
            .locator(".portrait-wrap img")
            .evaluate((image) => image.decode());
        for (const width of [320, 360, 390, 620, 621, 768, 1024, 1440, 1920]) {
            await page.setViewportSize({ width, height: 900 });
            assert.equal(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth,
                ),
                true,
                `overflow at ${width}px`,
            );
        }
        console.log("PASS nine responsive viewport widths (320–1920px)");
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
            path: `${output}/desktop.png`,
            fullPage: true,
        });
        const desktopAxe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
        assert.deepEqual(
            desktopAxe.violations.map((x) => ({
                id: x.id,
                nodes: x.nodes.map((n) => n.target),
            })),
            [],
            "desktop accessibility",
        );

        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => scrollTo(0, 0));
        const menu = page.getByRole("button", { name: "Menu", exact: true });
        assert.equal(await page.locator("#primary-nav").isVisible(), false);
        await menu.click();
        assert.equal(await menu.getAttribute("aria-expanded"), "true");
        assert.equal(await page.locator("#primary-nav").isVisible(), true);
        await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
        await menu.click();
        await page
            .locator("#primary-nav")
            .getByRole("link", { name: "Selected work" })
            .click();
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
        await page.evaluate(() => scrollTo(0, 0));
        console.log("PASS mobile menu toggle/Escape/link closing");
        await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
        const mobileAxe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
        assert.deepEqual(
            mobileAxe.violations.map((x) => ({
                id: x.id,
                nodes: x.nodes.map((n) => n.target),
            })),
            [],
            "mobile accessibility",
        );
        console.log(
            "PASS desktop/mobile automated WCAG audits (zero violations)",
        );
        assert.deepEqual(errors, [], "browser runtime errors");
        assert.deepEqual(badResponses, [], "HTTP asset failures");
        assert.deepEqual(remoteRequests, [], "unexpected external requests");
        console.log(
            "PASS zero runtime errors, failed assets, or third-party requests",
        );
        const noJsContext = await browser.newContext({
            javaScriptEnabled: false,
            viewport: { width: 390, height: 844 },
        });
        const noJsPage = await noJsContext.newPage();
        await noJsPage.goto(base);
        assert.equal(await noJsPage.locator("#primary-nav").isVisible(), true);
        assert.equal(await noJsPage.locator(".project-card").count(), 3);
        assert.equal(
            await noJsPage.locator(".project-details:visible").count(),
            0,
        );
        assert.equal(
            await noJsPage.locator(".work-filters").isVisible(),
            false,
        );
        await noJsContext.close();
        console.log(
            "PASS core content and mobile navigation without JavaScript",
        );
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
