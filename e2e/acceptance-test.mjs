import { chromium } from 'playwright-core';
import { PDFParse } from 'pdf-parse';
import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

const ALL_SYMPTOMS = [
  "Hot flashes",
  "Night sweats",
  "Feeling overheated",
  "Brain fog",
  "Memory issues",
  "Difficulty concentrating",
  "Insomnia",
  "Early waking",
  "Poor sleep quality",
  "Anxiety",
  "Mood swings",
  "Irritability",
  "Crying spells",
  "Joint or muscle pain",
  "Heart palpitations",
  "Headaches",
  "Bloating or weight changes",
  "Irregular periods",
  "Heavier or lighter bleeding",
  "Longer or shorter cycles",
];

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const stripMarkers = (text) => text.replace(/-- \d+ of \d+ --/g, '');

let failures = 0;
let passes = 0;
let skips = 0;
let infos = 0;
const results = [];

function record(status, check, reason) {
    const row = `${status} ${check}: ${reason}`;
    results.push(row);
    console.log(row);
    if (status === 'FAIL') failures++;
    else if (status === 'SKIP') skips++;
    else if (status === 'PASS') passes++;
    else if (status === 'INFO') infos++;
}

async function saveArtifacts(page, prefix, pdfText = null) {
    const dir = 'e2e/test-artifacts';
    await fs.mkdir(dir, { recursive: true });
    const ts = Date.now();
    if (pdfText !== null) {
        try { await fs.writeFile(path.join(dir, `${prefix}-${ts}-pdf.txt`), pdfText); } catch (e) {}
    }
    if (page) {
        try { await page.screenshot({ path: path.join(dir, `${prefix}-${ts}.png`), fullPage: true }); } catch (e) {}
    }
}

async function newTestPage(browser) {
    const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    return { page, context };
}

async function fillStep1(page, { symptoms = [], narrative = '' } = {}) {
    for (const s of symptoms) {
        await page.locator(`input[name="symptoms"][value="${s}"]`).check();
    }
    if (narrative) {
        await page.fill('#patient-story', narrative);
    }
}

async function fillStep2(page, { lmp, age, cycleStatus, cycleLength, impact } = {}) {
    if (lmp) await page.fill('#last-period', lmp);
    if (age) await page.selectOption('#age-range', age);
    if (cycleStatus) await page.selectOption('#menstrual-status', cycleStatus);
    if (cycleLength) await page.fill('#cycle-length', String(cycleLength));
    if (impact) await page.locator(`input[name="impact"][value="${impact}"]`).check();
}

async function navigateToStep2(page) {
    await page.click('#continue-button');
    await page.waitForSelector('#last-period', { state: 'visible', timeout: 10000 });
}

async function navigateToStep4(page) {
    await page.click('#continue-step-two');
    await page.waitForTimeout(500);
    await page.click('#confirm-review-button');
    await page.waitForTimeout(500);
}

async function downloadPdf(page) {
    const p = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#print-briefing-button');
    const d = await p;
    const ts = Date.now();
    const target = `e2e/test-artifacts/sample-${ts}.pdf`;
    await fs.mkdir('e2e/test-artifacts', { recursive: true });
    await d.saveAs(target);
    return target;
}

async function parsePdf(target) {
    const buffer = await fs.readFile(target);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return { text: result.text, total: result.total };
}

async function withDialogConsole(page, fn) {
    let dialogSeen = false;
    const consoleMsgs = [];
    page.on('dialog', async (dialog) => {
        dialogSeen = true;
        await dialog.dismiss();
    });
    page.on('console', (msg) => {
        consoleMsgs.push({ type: msg.type(), text: msg.text() });
    });
    await fn();
    return { dialogSeen, consoleMsgs };
}

(async () => {
    const browser = await chromium.launch({ headless: false });

    try {
        // ============================================================
        // GATE 11 â€” first PDF generated
        // ============================================================
        console.log('\n=== GATE 11 ===');
        const { page: g11Page, context: g11Ctx } = await newTestPage(browser);
        await withDialogConsole(g11Page, async () => {
            await fillStep1(g11Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: 'I have hot flashes at night' });
            await navigateToStep2(g11Page);
            await fillStep2(g11Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(g11Page);
        });
        const g11Target = await downloadPdf(g11Page);
        const g11Parsed = await parsePdf(g11Target);
        const g11Text = stripMarkers(g11Parsed.text);
        if (g11Text.length > 200) {
            record('PASS', 'GATE 11', `PDF text length ${g11Text.length} > 200`);
        } else {
            record('FAIL', 'GATE 11', 'PDF text unextractable');
            await saveArtifacts(g11Page, 'GATE11-FAIL', g11Parsed.text);
        }
        await g11Ctx.close();

        // ============================================================
        // CHECK 1 â€” empty narrative
        // ============================================================
        console.log('\n=== CHECK 1 ===');
        const { page: c1Page, context: c1Ctx } = await newTestPage(browser);
        await withDialogConsole(c1Page, async () => {
            await fillStep1(c1Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: '' });
            await navigateToStep2(c1Page);
            await fillStep2(c1Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(c1Page);
        });
        const c1Target = await downloadPdf(c1Page);
        const c1Parsed = await parsePdf(c1Target);
        const c1Text = stripMarkers(c1Parsed.text);
        const c1Norm = norm(c1Text);
        const hasNoPersonalDesc = /No personal symptom description was provided/.test(c1Norm);
        const hasPatientAged = /Patient aged .+ reporting/i.test(c1Norm);
        if (!hasNoPersonalDesc && hasPatientAged) {
            record('PASS', 'CHECK 1', 'Empty narrative produces categorized summary, no fallback message');
        } else {
            const preview = c1Norm.slice(0, 200);
            record('FAIL', 'CHECK 1', `Summary format differs. NoPersonalDesc=${hasNoPersonalDesc}, PatientAged=${hasPatientAged}. First 200 chars: ${preview}`);
            await saveArtifacts(c1Page, 'CHECK1-FAIL', c1Parsed.text);
        }
        await c1Ctx.close();

        // ============================================================
        // CHECK 2 â€” filled narrative
        // ============================================================
        console.log('\n=== CHECK 2 ===');
        const { page: c2Page, context: c2Ctx } = await newTestPage(browser);
        await withDialogConsole(c2Page, async () => {
            await fillStep1(c2Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: 'I have hot flashes at night' });
            await navigateToStep2(c2Page);
            await fillStep2(c2Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(c2Page);
        });
        const c2Target = await downloadPdf(c2Page);
        const c2Parsed = await parsePdf(c2Target);
        const c2Norm = norm(stripMarkers(c2Parsed.text));
        const hasInPatientsWords = /In the patient['â€™]s words/i.test(c2Norm);
        const hasNarrative = c2Norm.includes('I have hot flashes at night');
        if (hasInPatientsWords && hasNarrative) {
            record('PASS', 'CHECK 2', 'Filled narrative shows "In the patient\'s words" and narrative content');
        } else {
            record('FAIL', 'CHECK 2', `Missing narrative header or content. InPatientsWords=${hasInPatientsWords}, HasNarrative=${hasNarrative}`);
            await saveArtifacts(c2Page, 'CHECK2-FAIL', c2Parsed.text);
        }
        await c2Ctx.close();

        // ============================================================
        // CHECK 3 â€” page count
        // ============================================================
        console.log('\n=== CHECK 3 ===');
        const { page: c3Page, context: c3Ctx } = await newTestPage(browser);
        await withDialogConsole(c3Page, async () => {
            await fillStep1(c3Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: 'I have hot flashes at night' });
            await navigateToStep2(c3Page);
            await fillStep2(c3Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(c3Page);
        });
        const c3Target = await downloadPdf(c3Page);
        const c3Parsed = await parsePdf(c3Target);
        const c3Total = c3Parsed.total;
        const c3Ok = (c3Total === 2 || c3Total === 3);
        let c3WorstTotal = null;
        let c3WorstOk = false;
        if (c3Ok) {
            // Worst-case: all 20 symptoms, 2000-char narrative, long medical history
            const { page: c3wPage, context: c3wCtx } = await newTestPage(browser);
            const allSymptoms = ALL_SYMPTOMS;
            let longNarrative = 'Long narrative text. ';
            while (longNarrative.length < 2000) longNarrative += longNarrative;
            longNarrative = longNarrative.slice(0, 2000);
            await withDialogConsole(c3wPage, async () => {
            await fillStep1(c3wPage, { symptoms: allSymptoms, narrative: longNarrative });
            await navigateToStep2(c3wPage);
            await fillStep2(c3wPage, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await c3wPage.fill('#medical-history', 'Long medical history entry. '.repeat(100));

const fieldLengths = await c3wPage.evaluate(() => ({
    narrative: document.querySelector('#patient-story').value.length,
    medicalHistory: document.querySelector('#medical-history').value.length,
    medicalHistoryEndsWith: document.querySelector('#medical-history').value.slice(-50)
}));

console.log('WORST-CASE INPUT LENGTHS:', fieldLengths);
            await navigateToStep4(c3wPage);
            });
            const c3wTarget = await downloadPdf(c3wPage);
            const c3wParsed = await parsePdf(c3wTarget);
            c3WorstTotal = c3wParsed.total;
            const c3wPages = c3wParsed.text.split(/-- \d+ of \d+ --/).filter(s => s.trim());
            c3wPages.forEach((p, i) => {
                console.log("[PAGE " + (i+1) + "] " + JSON.stringify(p.slice(0, 300)));
            });
            c3WorstOk = c3WorstTotal <= 4;
            await c3wCtx.close();
        }
        if (c3Ok && c3WorstOk) {
            record('PASS', 'CHECK 3', `Normal PDF pages=${c3Total}, worst-case pages=${c3WorstTotal} (<=4)`);
        } else {
            record('FAIL', 'CHECK 3', `Normal PDF pages=${c3Total} (expected 2 or 3), worst-case pages=${c3WorstTotal} (expected <=4)`);
        }
        await c3Ctx.close();

        // ============================================================
        // CHECK 6 â€” date formatting
        // ============================================================
        console.log('\n=== CHECK 6 ===');
        const { page: c6Page, context: c6Ctx } = await newTestPage(browser);
        await withDialogConsole(c6Page, async () => {
            await fillStep1(c6Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: 'I have hot flashes at night' });
            await navigateToStep2(c6Page);
            await fillStep2(c6Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(c6Page);
        });
        const c6Target = await downloadPdf(c6Page);
        const c6Parsed = await parsePdf(c6Target);
        const c6Norm = norm(stripMarkers(c6Parsed.text));
        const hasReadableDate = /\b\d{1,2} [A-Z][a-z]{2} 20\d{2}\b/.test(c6Norm);
        const hasIsoOrSlash = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(c6Norm);
        if (hasReadableDate && !hasIsoOrSlash) {
            record('PASS', 'CHECK 6', 'Readable date present (e.g. 2 Nov 2026), no ISO/slash dates');
        } else {
            record('FAIL', 'CHECK 6', `ReadableDate=${hasReadableDate}, HasIsoOrSlash=${hasIsoOrSlash}`);
            await saveArtifacts(c6Page, 'CHECK6-FAIL', c6Parsed.text);
        }
        await c6Ctx.close();

        // ============================================================
        // CHECK 7 â€” SKIP
        // ============================================================
        record('SKIP', 'CHECK 7', '#last-period is type=date; browser rejects malformed values like 2026-02-31 before app validation runs.');

        // ============================================================
        // CHECK 8 â€” future LMP date
        // ============================================================
        console.log('\n=== CHECK 8 ===');
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const futureStr = future.toISOString().slice(0, 10);
        const { page: c8Page, context: c8Ctx } = await newTestPage(browser);
        let advanced = false;
        await withDialogConsole(c8Page, async () => {
            await fillStep1(c8Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: '' });
            await navigateToStep2(c8Page);
            advanced = true;
            await fillStep2(c8Page, { lmp: futureStr, age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
        });
        if (!advanced) {
            record('PASS', 'CHECK 8', 'blocked at input');
        } else {
            await navigateToStep4(c8Page);
            const c8Target = await downloadPdf(c8Page);
            const c8Parsed = await parsePdf(c8Target);
            const c8Norm = norm(stripMarkers(c8Parsed.text));
            const hasNotProvided = /Last menstrual period\s*Not provided/.test(c8Norm);
            if (hasNotProvided) {
                record('PASS', 'CHECK 8', 'Future LMP shows "Not provided" in PDF');
            } else {
                record('FAIL', 'CHECK 8', 'Future LMP not shown as "Not provided" in PDF');
                await saveArtifacts(c8Page, 'CHECK8-FAIL', c8Parsed.text);
            }
        }
        await c8Ctx.close();

        // ============================================================
        // CHECK 9 â€” Download button class
        // ============================================================
        console.log('\n=== CHECK 9 ===');
        const { page: c9Page, context: c9Ctx } = await newTestPage(browser);
        await withDialogConsole(c9Page, async () => {
            await fillStep1(c9Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: 'I have hot flashes at night' });
            await navigateToStep2(c9Page);
            await fillStep2(c9Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(c9Page);
        });
        const btnClass = await c9Page.evaluate(() => document.querySelector('#print-briefing-button')?.className);
        if (btnClass === undefined || btnClass === null) {
            record('SKIP', 'CHECK 9', '#print-briefing-button element missing');
        } else if (btnClass.includes('primary-button')) {
            record('PASS', 'CHECK 9', `Button class includes "primary-button": ${btnClass}`);
        } else {
            record('FAIL', 'CHECK 9', `Button class does not include "primary-button": ${btnClass}`);
        }
        await c9Ctx.close();

        // ============================================================
        // CHECK 10a â€” beforeunload, fresh context
        // ============================================================
        console.log('\n=== CHECK 10a ===');
        const { page: c10aPage, context: c10aCtx } = await newTestPage(browser);
        let dialogSeen10a = false;
        let dialogType10a = null;
        c10aPage.on('dialog', async (d) => {
            dialogSeen10a = true;
            dialogType10a = d.type();
            try { await d.dismiss(); } catch (_) {}
        });

        const closePromise10a = c10aPage.close({ runBeforeUnload: true }).catch(() => {});
        await sleep(600);
        const closed10a = c10aPage.isClosed();
        if (!closed10a) await c10aPage.close().catch(() => {});
        await closePromise10a;

        if (!dialogSeen10a && closed10a) {
            record('PASS', 'CHECK 10a', 'No beforeunload dialog on fresh page');
        } else {
            record('FAIL', 'CHECK 10a', `Unexpected dialog: dialogSeen=${dialogSeen10a}, dialogType=${dialogType10a}, closed=${closed10a}`);
        }
        await c10aCtx.close().catch(() => {});

        // ============================================================
        // CHECK 10b â€” beforeunload, after checking one symptom
        // ============================================================
        console.log('\n=== CHECK 10b ===');
        const { page: c10bPage, context: c10bCtx } = await newTestPage(browser);
        let dialogSeen10b = false;
        let dialogType10b = null;
        c10bPage.on('dialog', async (d) => {
            dialogSeen10b = true;
            dialogType10b = d.type();
            try { await d.dismiss(); } catch (_) {}
        });
        await c10bPage.locator('input[name="symptoms"][value="Hot flashes"]').check();

        const closePromise10b = c10bPage.close({ runBeforeUnload: true }).catch(() => {});
        await sleep(600);
        const closed10b = c10bPage.isClosed();
        if (!closed10b) await c10bPage.close().catch(() => {});
        await closePromise10b;

        if (dialogSeen10b && dialogType10b === 'beforeunload') {
            record('PASS', 'CHECK 10b', 'Beforeunload dialog appeared after symptom selection');
        } else {
            record('FAIL', 'CHECK 10b', `No dialog after selecting a symptom: dialogSeen=${dialogSeen10b}, dialogType=${dialogType10b}`);
        }
        await c10bCtx.close().catch(() => {});

        // ============================================================
        // CHECK 10c â€” beforeunload, check then uncheck (INFO only)
        // ============================================================
        console.log('\n=== CHECK 10c ===');
        const { page: c10cPage, context: c10cCtx } = await newTestPage(browser);
        let dialogSeen10c = false;
        let dialogType10c = null;
        c10cPage.on('dialog', async (d) => {
            dialogSeen10c = true;
            dialogType10c = d.type();
            try { await d.dismiss(); } catch (_) {}
        });
        await c10cPage.locator('input[name="symptoms"][value="Hot flashes"]').check();
        await c10cPage.locator('input[name="symptoms"][value="Hot flashes"]').uncheck();

        const closePromise10c = c10cPage.close({ runBeforeUnload: true }).catch(() => {});
        await sleep(600);
        const closed10c = c10cPage.isClosed();
        if (!closed10c) await c10cPage.close().catch(() => {});
        await closePromise10c;

        if (dialogSeen10c) {
            record('INFO', 'CHECK 10c', `Prompt appeared after check+uncheck (dialogType=${dialogType10c})`);
        } else {
            record('INFO', 'CHECK 10c', 'No prompt after check+uncheck (isDirty reset correctly)');
        }
        await c10cCtx.close().catch(() => {});

        // ============================================================
        // CHECK 10d â€” beforeunload, after PDF download (isDirty cleared)
        // ============================================================
        console.log('\n=== CHECK 10d ===');
        const { page: c10dPage, context: c10dCtx } = await newTestPage(browser);
        let dialogSeen10d = false;
        let dialogType10d = null;
        c10dPage.on('dialog', async (d) => {
            dialogSeen10d = true;
            dialogType10d = d.type();
            try { await d.dismiss(); } catch (_) {}
        });
        c10dPage.on('console', (msg) => {});
        await fillStep1(c10dPage, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: 'I have hot flashes at night' });
        await navigateToStep2(c10dPage);
        await fillStep2(c10dPage, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
        await navigateToStep4(c10dPage);
        await downloadPdf(c10dPage);

        const closePromise10d = c10dPage.close({ runBeforeUnload: true }).catch(() => {});
        await sleep(600);
        const closed10d = c10dPage.isClosed();
        if (!closed10d) await c10dPage.close().catch(() => {});
        await closePromise10d;

        if (!dialogSeen10d && closed10d) {
            record('PASS', 'CHECK 10d', 'No beforeunload dialog after PDF download (isDirty cleared)');
        } else {
            record('FAIL', 'CHECK 10d', `Unexpected dialog after PDF: dialogSeen=${dialogSeen10d}, dialogType=${dialogType10d}, closed=${closed10d}`);
        }
        await c10dCtx.close().catch(() => {});

        // ============================================================
        // CHECK 12 â€” XSS narrative
        // ============================================================
        console.log('\n=== CHECK 12 ===');
        const { page: c12Page, context: c12Ctx } = await newTestPage(browser);
        const xssString = '<img src=x onerror=alert(1)>';
        let c12DialogSeen = false;
        c12Page.on('dialog', async (dialog) => {
            c12DialogSeen = true;
            await dialog.dismiss();
        });
        c12Page.on('console', (msg) => {});
        await fillStep1(c12Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: xssString });
        await navigateToStep2(c12Page);
        await fillStep2(c12Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
        await navigateToStep4(c12Page);
        const c12Target = await downloadPdf(c12Page);
        const c12Parsed = await parsePdf(c12Target);
        const c12Norm = norm(stripMarkers(c12Parsed.text));
        const hasLiteralXss = c12Norm.includes(xssString);
        const imgCount = await c12Page.locator('img[src="x"]').count();
        if (hasLiteralXss && imgCount === 0) {
            record('PASS', 'CHECK 12', 'XSS string treated as literal text in PDF, no img element on screen');
        } else {
            record('FAIL', 'CHECK 12', `LiteralXss=${hasLiteralXss}, ImgCount=${imgCount}`);
            await saveArtifacts(c12Page, 'CHECK12-FAIL', c12Parsed.text);
        }
        await c12Ctx.close();

        // ============================================================
        // CHECK 13 â€” unmapped symptom
        // ============================================================
        console.log('\n=== CHECK 13 ===');
        const { page: c13Page, context: c13Ctx } = await newTestPage(browser);
        let c13ConsoleWarn = false;
        c13Page.on('console', (msg) => {
            if (msg.type() === 'warning' || msg.type() === 'error') c13ConsoleWarn = true;
        });
        await withDialogConsole(c13Page, async () => {
            await fillStep1(c13Page, { symptoms: ['Hot flashes', 'Night sweats', 'Brain fog'], narrative: '' });
            await navigateToStep2(c13Page);
            await fillStep2(c13Page, { lmp: '2026-11-01', age: '45-49', cycleStatus: 'Irregular periods', cycleLength: 28, impact: 'Work or career' });
            await navigateToStep4(c13Page);
        });
        const stateResult = await c13Page.evaluate(() => {
            if (!window.MenoBriefState || !window.MenoBriefState.patient) return 'no-state';
            window.MenoBriefState.patient.symptoms.push('Test unmapped symptom');
            return 'ok';
        });
        if (stateResult === 'no-state') {
            record('SKIP', 'CHECK 13', 'window.MenoBriefState.patient not available');
        } else {
            const c13Target = await downloadPdf(c13Page);
            const c13Parsed = await parsePdf(c13Target);
            const c13Norm = norm(stripMarkers(c13Parsed.text));
            const hasUnmapped = c13Norm.includes('Test unmapped');
            if (hasUnmapped || c13ConsoleWarn) {
                record('PASS', 'CHECK 13', `Unmapped symptom handled: inText=${hasUnmapped}, consoleWarn=${c13ConsoleWarn}`);
            } else {
                record('FAIL', 'CHECK 13', 'Unmapped symptom not reflected in PDF and no console warning');
                await saveArtifacts(c13Page, 'CHECK13-FAIL', c13Parsed.text);
            }
        }
        await c13Ctx.close();

        // ============================================================
        // Summary
        // ============================================================
        console.log('\n=== SUMMARY ===');
        console.log(`PASS: ${passes}, FAIL: ${failures}, SKIP: ${skips}, INFO: ${infos}`);
        if (failures > 0) {
            console.log('\nFAILED CHECKS:');
            results.filter(r => r.startsWith('FAIL')).forEach(r => console.log('  ' + r));
            process.exit(1);
        }
    } finally {
        try { await browser.close(); } catch (e) {}
    }
})();
