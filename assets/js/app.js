document.addEventListener("DOMContentLoaded", () => {

    const state = window.MenoBriefState;

    const stepOnePanel = document.getElementById("step-one-panel");
    const stepTwoPanel = document.getElementById("step-two-panel");
    const stepThreePanel = document.getElementById("step-three-panel");
    const stepFourPanel = document.getElementById("step-four-panel");

    const continueButton = document.getElementById("continue-button");
    const backButton = document.getElementById("back-button");
    const continueStepTwo = document.getElementById("continue-step-two");

    const story = document.getElementById("patient-story");
    const storyCount = document.getElementById("story-count");

    const progressSteps = document.querySelectorAll(
        ".step-progress .step"
    );

    if (!state || !stepOnePanel || !stepTwoPanel || !stepThreePanel || !stepFourPanel ||
        !continueButton || !backButton || !continueStepTwo ||
        !story || !storyCount) {

        console.error("MenoBrief: Required HTML elements are missing.");
        return;
    }

    const stepOneFeedback =
        document.getElementById("form-feedback");

    const stepTwoFeedback =
        document.getElementById("step-two-feedback");


    function showFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = type;
    }

function clearFeedback(element) {
    if (!element) return;
    element.textContent = "";
    element.className = "";
}



    // STEP NAVIGATION
    function showStep(stepNumber) {

        state.currentStep = stepNumber;

        stepOnePanel.hidden = stepNumber !== 1;
        stepTwoPanel.hidden = stepNumber !== 2;
        stepThreePanel.hidden = stepNumber !== 3;
        stepFourPanel.hidden = stepNumber !== 4;

        progressSteps.forEach((step, index) => {

            const number = index + 1;

            step.classList.toggle(
                "active",
                number === stepNumber
            );

            step.classList.toggle(
                "completed",
                number < stepNumber
            );
        });

        clearFeedback(stepOneFeedback);
        clearFeedback(stepTwoFeedback);

        const workspace = document.querySelector(".workspace");

        if (workspace) {
            window.scrollTo({
                top: workspace.getBoundingClientRect().top +
                    window.scrollY - 85,
                behavior: "smooth"
            });
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }


    // NARRATIVE COUNTER
    function updateNarrative() {

        storyCount.textContent = story.value.length;

        state.setNarrative(story.value);
    }

    story.addEventListener("input", updateNarrative);


    // COLLECT STEP 2 DETAILS
    function collectDetails() {

        const fieldIds = [
            "age-range",
            "menstrual-status",
            "last-period",
            "cycle-length",
            "hormonal-treatment",
            "medication-details",
            "medical-history"
        ];

        const details = {};

        fieldIds.forEach(id => {

            const field = document.getElementById(id);

            if (field) {
                details[id] = field.value.trim();
            }
        });

        details.impact = Array.from(
            document.querySelectorAll(
                'input[name="impact"]:checked'
            )
        ).map(input => input.value);

        state.setDetails(details);
    }


    // KEEP STEP 2 FIELDS UPDATED
    const detailFieldIds = [
        "age-range",
        "menstrual-status",
        "last-period",
        "cycle-length",
        "hormonal-treatment",
        "medication-details",
        "medical-history"
    ];

    detailFieldIds.forEach(id => {

        const field = document.getElementById(id);

        if (!field) return;

        field.addEventListener("input", collectDetails);
        field.addEventListener("change", collectDetails);
    });

    document.querySelectorAll(
        'input[name="impact"]'
    ).forEach(input => {
        input.addEventListener("change", collectDetails);
    });


    // STEP 1: CONTINUE TO STEP 2
    continueButton.addEventListener("click", () => {

        clearFeedback(stepOneFeedback);

        const symptoms = Array.from(
            document.querySelectorAll(
                'input[name="symptoms"]:checked'
            )
        ).map(input => input.value);

        const narrative = story.value.trim();

        state.setSymptoms(symptoms);
        state.setNarrative(narrative);

        if (symptoms.length === 0 && narrative.length === 0) {

            showFeedback(
                stepOneFeedback,
                "Please select at least one symptom or describe your experience before continuing.",
                "form-error"
            );

            return;
        }

        showStep(2);
    });


    // STEP 2: BACK TO STEP 1
    backButton.addEventListener("click", () => {

        collectDetails();

        showStep(1);
    });


    // REVIEW DISPLAY HELPERS
    function addReviewRow(containerId, label, value) {

        const container = document.getElementById(containerId);
        if (!container) return;

        const row = document.createElement("div");
        row.className = "review-row";

        const heading = document.createElement("strong");
        heading.textContent = label;

        const content = document.createElement("span");
        content.textContent =
            value && String(value).trim()
                ? String(value)
                : "Not provided";

        row.appendChild(heading);
        row.appendChild(content);
        container.appendChild(row);
    }


    function renderReview() {

        collectDetails();

        const patient = state.patient;
        const details = patient.details || {};

        const reviewContainers = [
            "review-symptoms",
            "review-narrative",
            "review-ai",
            "review-personal",
            "review-menstrual",
            "review-medication",
            "review-medical",
            "review-impact"
        ];

        reviewContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.replaceChildren();
        });

        const symptoms = patient.symptoms || [];

        addReviewRow(
            "review-symptoms",
            "Selected symptoms",
            symptoms.length ? symptoms.join(", ") : "None selected"
        );

        addReviewRow(
            "review-narrative",
            "Your description",
            patient.narrative
        );

        addReviewRow(
            "review-personal",
            "Age range",
            details["age-range"]
        );

        addReviewRow(
            "review-menstrual",
            "Menstrual cycle status",
            details["menstrual-status"]
        );

        addReviewRow(
            "review-menstrual",
            "Last menstrual period",
            details["last-period"]
        );

        addReviewRow(
            "review-menstrual",
            "Typical cycle length",
            details["cycle-length"]
                ? details["cycle-length"] + " days"
                : ""
        );

        addReviewRow(
            "review-medication",
            "Hormonal medication or contraception",
            details["hormonal-treatment"]
        );

        addReviewRow(
            "review-medication",
            "Medication or treatment details",
            details["medication-details"]
        );

        addReviewRow(
            "review-medical",
            "Relevant medical history",
            details["medical-history"]
        );

        addReviewRow(
            "review-impact",
            "Areas affected",
            details.impact && details.impact.length
                ? details.impact.join(", ")
                : "Not provided"
        );
    }


    // STEP 2: CONTINUE TO STEP 3
    continueStepTwo.addEventListener("click", () => {

        clearFeedback(stepTwoFeedback);

        const cycleLength =
            document.getElementById("cycle-length");

        if (cycleLength && !cycleLength.checkValidity()) {

            showFeedback(
                stepTwoFeedback,
                "Please enter a cycle length between 1 and 120 days, or leave it blank.",
                "form-error"
            );

            cycleLength.focus();
            return;
        }

        collectDetails();
        renderReview();
        showStep(3);
    });


    // STEP 3: EDIT STEP 1
    document.getElementById("edit-step-one")
        .addEventListener("click", () => {
            showStep(1);
        });


    // STEP 3: EDIT STEP 2
    document.getElementById("edit-step-two")
        .addEventListener("click", () => {
            showStep(2);
        });


    // STEP 3: BACK TO STEP 2
    document.getElementById("review-back-button")
        .addEventListener("click", () => {
            showStep(2);
        });


    // STEP 4: BRIEFING GENERATION

    function addBriefingRow(containerId, label, value) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const row = document.createElement("div");
        row.className = "review-row";

        const heading = document.createElement("strong");
        heading.textContent = label;

        const content = document.createElement("span");

        if (Array.isArray(value)) {
            content.textContent = value.length
                ? value.join(", ")
                : "Not provided";
        } else {
            content.textContent =
                value && String(value).trim()
                    ? String(value)
                    : "Not provided";
        }

        row.appendChild(heading);
        row.appendChild(content);
        container.appendChild(row);
    }

    function generateBriefing() {
        collectDetails();

        const patient = state.patient;
        const details = patient.details || {};
        const symptoms = patient.symptoms || [];
        const narrative = patient.narrative || "";
        const impact = details.impact || [];

        const containers = [
            "briefing-summary",
            "briefing-symptoms",
            "briefing-personal",
            "briefing-medication",
            "briefing-medical",
            "briefing-impact",
            "briefing-discussion-points"
        ];

        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.replaceChildren();
        });

        document.getElementById("briefing-date").textContent =
            new Date().toLocaleDateString();

        const summary = document.getElementById("briefing-summary");

        const summaryText = document.createElement("p");
        summaryText.textContent = narrative.trim()
            ? narrative
            : "No personal symptom description was provided.";

        summary.appendChild(summaryText);

        addBriefingRow(
            "briefing-symptoms",
            "Reported symptoms",
            symptoms
        );

        addBriefingRow(
            "briefing-personal",
            "Age range",
            details["age-range"]
        );

        addBriefingRow(
            "briefing-personal",
            "Menstrual cycle status",
            details["menstrual-status"]
        );

        addBriefingRow(
            "briefing-personal",
            "Last menstrual period",
            details["last-period"]
        );

        addBriefingRow(
            "briefing-personal",
            "Typical cycle length",
            details["cycle-length"]
                ? details["cycle-length"] + " days"
                : ""
        );

        addBriefingRow(
            "briefing-medication",
            "Hormonal medication or contraception",
            details["hormonal-treatment"]
        );

        addBriefingRow(
            "briefing-medication",
            "Medication or treatment details",
            details["medication-details"]
        );

        addBriefingRow(
            "briefing-medical",
            "Relevant medical history",
            details["medical-history"]
        );

        addBriefingRow(
            "briefing-impact",
            "Areas affected",
            impact
        );

        const discussionPoints = [
            "Discuss the reported symptoms and their possible causes.",
            "Discuss whether further assessment or investigations are appropriate.",
            "Review current medication, hormonal treatment and relevant medical history.",
            "Discuss suitable management options, including their potential benefits and risks.",
            "Agree on appropriate follow-up and monitoring."
        ];

        const list = document.getElementById(
            "briefing-discussion-points"
        );

        discussionPoints.forEach(point => {
            const item = document.createElement("li");
            item.textContent = point;
            list.appendChild(item);
        });
    }

    // STEP 4: BACK TO REVIEW
    document.getElementById("briefing-back-button")
        .addEventListener("click", () => {
            renderReview();
            showStep(3);
        });

    // SHARED HOME RESET FUNCTION
    function resetToHome() {

        const hasData =
            state.currentStep > 1 ||
            (state.patient.symptoms || []).length > 0 ||
            Boolean(state.patient.narrative) ||
            Object.values(state.patient.details || {}).some(value =>
                Array.isArray(value) ? value.length > 0 : Boolean(value)
            );

        if (hasData) {
            const confirmed = window.confirm(
                "Return to Home? Your current briefing information will be cleared."
            );

            if (!confirmed) return;
        }

        state.clear();

        document.querySelectorAll(
            'input[name="symptoms"], input[name="impact"]'
        ).forEach(input => {
            input.checked = false;
        });

        story.value = "";

        detailFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = "";
        });

        updateNarrative();
        showStep(1);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // HEADER HOME NAVIGATION
    const headerHomeLink = document.querySelector(
        '.top-navigation a[href="#home"]'
    );

    if (headerHomeLink) {
        headerHomeLink.addEventListener("click", event => {
            event.preventDefault();
            resetToHome();
        });
    }

    // STEP 4: BACK TO HOME
    document.getElementById("briefing-home-button")
        .addEventListener("click", resetToHome);
// STEP 4: HOMEPAGE-INSPIRED NATIVE PDF DOWNLOAD
document.getElementById("print-briefing-button")
    .addEventListener("click", async () => {

        const button = document.getElementById("print-briefing-button");

        if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
            alert("PDF library is unavailable. Please refresh the page.");
            return;
        }

        const originalContent = button.innerHTML;

        try {
            button.disabled = true;
            button.textContent = "Preparing your briefing...";

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const patient = state.patient || {};
            const details = patient.details || {};
            const symptoms = patient.symptoms || [];
            const narrative = patient.narrative || "";
            const impact = details.impact || [];

            const W = doc.internal.pageSize.getWidth();
            const H = doc.internal.pageSize.getHeight();
            const M = 16;
            const CW = W - M * 2;
            const FOOTER_LIMIT = H - 19;

            const C = {
                green: [8, 121, 91],
                greenDark: [6, 102, 77],
                greenLight: [229, 245, 236],
                greenBorder: [220, 237, 224],
                pink: [233, 138, 155],
                pinkLight: [252, 236, 241],
                pinkBorder: [245, 218, 226],
                purple: [128, 102, 201],
                purpleLight: [248, 243, 252],
                purpleBorder: [234, 225, 242],
                blue: [57, 121, 216],
                blueLight: [239, 245, 253],
                yellow: [214, 155, 0],
                yellowLight: [255, 249, 231],
                navy: [23, 37, 84],
                text: [31, 41, 55],
                secondary: [71, 85, 105],
                muted: [132, 144, 158],
                border: [232, 229, 237],
                page: [248, 249, 250],
                white: [255, 255, 255]
            };

            let y = 17;

            let pageBackground = null;

            function background() {
                if (pageBackground) {
                    doc.addImage(
                        pageBackground,
                        "PNG",
                        0, 0, W, H,
                        undefined,
                        "FAST"
                    );
                } else {
                    doc.setFillColor(...C.page);
                    doc.rect(0, 0, W, H, "F");
                }
            }

            function newPage() {
                doc.addPage();
                background();
                y = 19;
            }

            function ensureSpace(height) {
                if (y + height > FOOTER_LIMIT) {
                    newPage();
                }
            }

            function textBlock(text, options = {}) {
                const value = String(text || "");
                const fontSize = options.fontSize || 9.5;
                const lineHeight = options.lineHeight || 4.8;
                const x = options.x ?? M;
                const width = options.width || CW;

                doc.setFont("helvetica", options.bold ? "bold" : "normal");
                doc.setFontSize(fontSize);
                doc.setTextColor(...(options.color || C.text));

                const lines = doc.splitTextToSize(value, width);

                lines.forEach(line => {
                    ensureSpace(lineHeight);
                    doc.text(line, x, y);
                    y += lineHeight;
                });

                if (options.after) y += options.after;
            }

            // Load the existing lotus logo and hero photograph.
            async function imageAsPng(path, crop = false) {
                try {
                    const response = await fetch(path);
                    if (!response.ok) throw new Error("Image could not be loaded.");

                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);

                    try {
                        const image = new Image();
                        image.src = objectUrl;

                        await new Promise((resolve, reject) => {
                            image.onload = resolve;
                            image.onerror = reject;
                        });

                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d");

                        if (crop) {
                            canvas.width = 1400;
                            canvas.height = 360;

                            const targetRatio = canvas.width / canvas.height;
                            const imageRatio = image.width / image.height;

                            let sx = 0;
                            let sy = 0;
                            let sw = image.width;
                            let sh = image.height;

                            if (imageRatio > targetRatio) {
                                sw = image.height * targetRatio;
                                sx = (image.width - sw) / 2;
                            } else {
                                sh = image.width / targetRatio;
                                sy = (image.height - sh) / 2;
                            }

                            context.drawImage(
                                image,
                                sx, sy, sw, sh,
                                0, 0, canvas.width, canvas.height
                            );
                        } else {
                            canvas.width = image.width * 3;
                            canvas.height = image.height * 3;
                            context.drawImage(
                                image, 0, 0, canvas.width, canvas.height
                            );
                        }

                        return canvas.toDataURL("image/png");
                    } finally {
                        URL.revokeObjectURL(objectUrl);
                    }
                } catch (error) {
                    console.warn("Optional PDF image unavailable:", path, error);
                    return null;
                }
            }

            // Create a soft botanical background using the existing SVG artwork.
            async function createBotanicalPageBackground(pinkData, greenData, lotusData) {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 1240;
                    canvas.height = 1754;

                    const ctx = canvas.getContext("2d");

                    // Warm ivory base.
                    ctx.fillStyle = "#F8F9FA";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    async function loadImage(dataUrl) {
                        if (!dataUrl) return null;

                        const image = new Image();
                        image.src = dataUrl;

                        await new Promise((resolve, reject) => {
                            image.onload = resolve;
                            image.onerror = reject;
                        });

                        return image;
                    }

                    const pink = await loadImage(pinkData);
                    const green = await loadImage(greenData);
                    const lotus = await loadImage(lotusData);

                    // Pale pink botanical decoration: upper-right.
                    if (pink) {
                        ctx.save();
                        ctx.globalAlpha = 0.35;
                        ctx.drawImage(pink, 825, -35, 415, 519);
                        ctx.restore();
                    }

                    // Soft green botanical decoration: lower-left.
                    if (green) {
                        ctx.save();
                        ctx.globalAlpha = 0.32;
                        ctx.drawImage(green, -45, 1210, 430, 537);
                        ctx.restore();
                    }

                    // Large faded MenoBrief lotus: lower-right.
                    if (lotus) {
                        ctx.save();
                        ctx.globalAlpha = 0.18;
                        ctx.drawImage(lotus, 965, 1430, 245, 196);
                        ctx.restore();

                        // Smaller lotus accent near the upper-left edge.
                        ctx.save();
                        ctx.globalAlpha = 0.12;
                        ctx.drawImage(lotus, 15, 365, 165, 132);
                        ctx.restore();
                    }

                    return canvas.toDataURL("image/png");
                } catch (error) {
                    console.warn("Botanical PDF background unavailable:", error);
                    return null;
                }
            }

            const lotus = await imageAsPng("assets/images/lotus.svg");
            const hero = await imageAsPng("assets/images/hero-woman.jpg", true);

            const pinkBotanical = await imageAsPng(
                "assets/images/botanical-pink.svg"
            );

            const greenBotanical = await imageAsPng(
                "assets/images/botanical-green.svg"
            );

            pageBackground = await createBotanicalPageBackground(
                pinkBotanical,
                greenBotanical,
                lotus
            );

            background();

            // BRAND HEADER
            doc.setFillColor(...C.white);
            doc.setDrawColor(...C.border);
            doc.roundedRect(M, y, CW, 25, 3, 3, "FD");

            if (lotus) {
                doc.addImage(lotus, "PNG", M + 5, y + 3, 15, 17);
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(...C.navy);
            doc.text("MenoBrief", M + 23, y + 11);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...C.secondary);
            doc.text("Menopause Clinical Briefing Tool", M + 23, y + 17);

            doc.setFillColor(...C.greenLight);
            doc.roundedRect(W - M - 40, y + 8, 35, 9, 4, 4, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.7);
            doc.setTextColor(...C.greenDark);
            doc.text("YOUR HEALTH BRIEF", W - M - 22.5, y + 13.5, {
                align: "center"
            });

            y += 30;

            // WIDE HOMEPAGE HERO IMAGE
            if (hero) {
                ensureSpace(49);

                doc.addImage(hero, "PNG", M, y, CW, 43);

                doc.setDrawColor(...C.pinkBorder);
                doc.setLineWidth(0.35);
                doc.roundedRect(M, y, CW, 43, 2.5, 2.5, "S");

                y += 48;
            }

            // DOCUMENT TITLE
            doc.setFont("helvetica", "bold");
            doc.setFontSize(17);
            doc.setTextColor(...C.navy);
            doc.text("Clinical Appointment Summary", M, y);
            y += 7;

            textBlock(
                "Your personal information, organised to support a conversation with your healthcare professional.",
                {
                    fontSize: 9,
                    color: C.secondary,
                    lineHeight: 4.5,
                    after: 2
                }
            );

            textBlock("Generated: " + new Date().toLocaleDateString(), {
                fontSize: 8,
                color: C.muted,
                after: 4
            });

            // SECTION HEADING
            function section(title, color, pale) {
                ensureSpace(18);
                y += 3;

                doc.setFillColor(...pale);
                doc.roundedRect(M, y - 5, CW, 11, 2, 2, "F");

                doc.setFillColor(...color);
                doc.roundedRect(M, y - 5, 2.2, 11, 1, 1, "F");

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(...color);
                doc.text(title, M + 6, y + 1.5);

                y += 12;
            }

            // INFORMATION CARD WITH LABEL ABOVE VALUE.
            // This avoids the label/value overlap in the previous PDF.
            function infoCard(label, value, accent, pale, border) {
                const displayValue = Array.isArray(value)
                    ? (value.length ? value.join(", ") : "Not provided")
                    : (value && String(value).trim()
                        ? String(value)
                        : "Not provided");

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9.2);

                const lines = doc.splitTextToSize(
                    String(displayValue),
                    CW - 12
                );

                const cardHeight = Math.max(17, 9 + lines.length * 4.6);

                ensureSpace(cardHeight + 3);

                doc.setFillColor(...C.white);
                doc.setDrawColor(...border);
                doc.roundedRect(
                    M, y - 3, CW, cardHeight, 2.5, 2.5, "FD"
                );

                doc.setFillColor(...pale);
                doc.roundedRect(M, y - 3, 2, cardHeight, 1, 1, "F");

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(...accent);
                doc.text(String(label), M + 7, y + 2.5);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9.2);
                doc.setTextColor(...C.text);
                doc.text(lines, M + 7, y + 8);

                y += cardHeight + 3;
            }

            // PERSONAL NARRATIVE CARD
            function narrativeCard(value) {
                const content = String(value || "");
                const fontSize = 9.5;
                const lineHeight = 4.8;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);

                const lines = doc.splitTextToSize(content, CW - 14);
                let index = 0;

                while (index < lines.length) {
                    const available = FOOTER_LIMIT - y - 10;
                    const count = Math.max(
                        1,
                        Math.floor((available - 12) / lineHeight)
                    );

                    const chunk = lines.slice(index, index + count);
                    const cardHeight = chunk.length * lineHeight + 12;

                    ensureSpace(cardHeight + 3);

                    doc.setFillColor(...C.white);
                    doc.setDrawColor(...C.purpleBorder);
                    doc.roundedRect(
                        M, y - 3, CW, cardHeight, 2.5, 2.5, "FD"
                    );

                    doc.setFillColor(...C.purpleLight);
                    doc.roundedRect(M, y - 3, 2, cardHeight, 1, 1, "F");

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(fontSize);
                    doc.setTextColor(...C.text);
                    doc.text(chunk, M + 7, y + 4);

                    y += cardHeight + 3;
                    index += chunk.length;
                }
            }

            // COLOURFUL SYMPTOM CHIPS
            function symptomChips(items) {
                if (!Array.isArray(items) || !items.length) {
                    infoCard(
                        "Reported symptoms",
                        "Not provided",
                        C.greenDark,
                        C.greenLight,
                        C.greenBorder
                    );
                    return;
                }

                const palette = [
                    { bg: C.greenLight, border: C.greenBorder, text: C.greenDark },
                    { bg: C.pinkLight, border: C.pinkBorder, text: [177, 83, 105] },
                    { bg: C.purpleLight, border: C.purpleBorder, text: C.purple },
                    { bg: C.blueLight, border: [219, 231, 249], text: C.blue },
                    { bg: C.yellowLight, border: [244, 232, 195], text: [153, 111, 0] }
                ];

                const fontSize = 8.2;
                const chipHeight = 9;
                const gap = 3;
                const maxWidth = CW - 12;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);

                const chips = items.map((item, index) => {
                    const label = String(item);
                    const width = doc.getTextWidth(label) + 9;
                    return {
                        label,
                        width,
                        colors: palette[index % palette.length]
                    };
                });

                const rows = [];
                let current = [];
                let currentWidth = 0;

                chips.forEach(chip => {
                    if (current.length && currentWidth + chip.width + gap > maxWidth) {
                        rows.push(current);
                        current = [];
                        currentWidth = 0;
                    }

                    current.push(chip);
                    currentWidth += chip.width + gap;
                });

                if (current.length) rows.push(current);

                rows.forEach(row => {
                    ensureSpace(chipHeight + 6);

                    let x = M + 5;

                    row.forEach(chip => {
                        const p = chip.colors;

                        doc.setFillColor(...p.bg);
                        doc.setDrawColor(...p.border);
                        doc.roundedRect(
                            x, y - 5, chip.width, chipHeight, 3, 3, "FD"
                        );

                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(fontSize);
                        doc.setTextColor(...p.text);
                        doc.text(chip.label, x + 4.5, y + 1);

                        x += chip.width + gap;
                    });

                    y += chipHeight + 4;
                });

                y += 2;
            }

            // 1. CLINICAL SUMMARY
            section("1. Clinical Summary", C.purple, C.purpleLight);

            narrativeCard(
                narrative.trim()
                    ? narrative
                    : "No personal symptom description was provided."
            );

            // 2. REPORTED SYMPTOMS
            section("2. Reported Symptoms", C.green, C.greenLight);
            symptomChips(symptoms);

            // 3. PERSONAL AND MENSTRUAL HISTORY
            section("3. Personal & Menstrual History", C.purple, C.purpleLight);

            infoCard("Age range", details["age-range"],
                C.purple, C.purpleLight, C.purpleBorder);

            infoCard("Menstrual cycle status", details["menstrual-status"],
                C.purple, C.purpleLight, C.purpleBorder);

            infoCard("Last menstrual period", details["last-period"],
                C.purple, C.purpleLight, C.purpleBorder);

            infoCard("Typical cycle length",
                details["cycle-length"]
                    ? details["cycle-length"] + " days"
                    : "",
                C.purple, C.purpleLight, C.purpleBorder);

            // 4. MEDICATION AND TREATMENT
            section("4. Medication & Treatment", C.blue, C.blueLight);

            infoCard("Hormonal medication or contraception",
                details["hormonal-treatment"],
                C.blue, C.blueLight, [219, 231, 249]);

            infoCard("Medication or treatment details",
                details["medication-details"],
                C.blue, C.blueLight, [219, 231, 249]);

            // 5. RELEVANT MEDICAL HISTORY
            section("5. Relevant Medical History", C.green, C.greenLight);

            infoCard("Relevant medical history",
                details["medical-history"],
                C.greenDark, C.greenLight, C.greenBorder);

            // 6. IMPACT ON DAILY LIFE
            section("6. Impact on Daily Life", C.pink, C.pinkLight);

            infoCard("Areas affected", impact,
                [177, 83, 105], C.pinkLight, C.pinkBorder);

            // 7. DOCTOR DISCUSSION POINTS
            section("7. Points to Discuss With Your Doctor", C.purple, C.purpleLight);

            const discussionPoints = [
                "Discuss the reported symptoms and their possible causes.",
                "Discuss whether further assessment or investigations are appropriate.",
                "Review current medication, hormonal treatment and relevant medical history.",
                "Discuss suitable management options, including their potential benefits and risks.",
                "Agree on appropriate follow-up and monitoring."
            ];

            const pointColors = [
                C.greenLight,
                C.pinkLight,
                C.purpleLight,
                C.blueLight,
                C.yellowLight
            ];

            discussionPoints.forEach((point, index) => {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.8);

                const lines = doc.splitTextToSize(point, CW - 23);
                const cardHeight = Math.max(14, lines.length * 4.5 + 8);

                ensureSpace(cardHeight + 3);

                doc.setFillColor(...C.white);
                doc.setDrawColor(...C.border);
                doc.roundedRect(
                    M, y - 3, CW, cardHeight, 2.5, 2.5, "FD"
                );

                doc.setFillColor(...pointColors[index]);
                doc.circle(M + 8, y + 4, 4, "F");

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(...C.greenDark);
                doc.text(String(index + 1), M + 8, y + 6.7, {
                    align: "center"
                });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.8);
                doc.setTextColor(...C.text);
                doc.text(lines, M + 16, y + 3);

                y += cardHeight + 3;
            });

            // DISCLAIMER
            ensureSpace(32);
            y += 3;

            doc.setFillColor(...C.purpleLight);
            doc.setDrawColor(...C.purpleBorder);
            doc.roundedRect(M, y, CW, 26, 2.5, 2.5, "FD");

            doc.setFillColor(...C.pink);
            doc.roundedRect(M, y, 2, 26, 1, 1, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...C.purple);
            doc.text("IMPORTANT", M + 7, y + 6);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.8);
            doc.setTextColor(...C.secondary);

            const disclaimer = doc.splitTextToSize(
                "This briefing organises information provided by the user. It is not a diagnosis, clinical assessment or treatment recommendation. All symptoms and treatment decisions should be discussed with a qualified healthcare professional.",
                CW - 14
            );

            doc.text(disclaimer, M + 7, y + 12);

            // FOOTER AND PAGE NUMBERS
            const totalPages = doc.internal.getNumberOfPages();

            for (let page = 1; page <= totalPages; page++) {
                doc.setPage(page);

                doc.setDrawColor(...C.border);
                doc.setLineWidth(0.3);
                doc.line(M, H - 14, W - M, H - 14);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(...C.navy);
                doc.text("MenoBrief", M, H - 8.5);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                doc.setTextColor(...C.muted);
                doc.text(
                    "Menopause Clinical Briefing Tool",
                    M + 20,
                    H - 8.5
                );

                doc.text(
                    "Page " + page + " of " + totalPages,
                    W - M,
                    H - 8.5,
                    { align: "right" }
                );
            }

            const now = new Date();
            const date = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0")
            ].join("-");

            doc.save("MenoBrief-Clinical-Briefing-" + date + ".pdf");

            console.log("MenoBrief homepage-inspired PDF generated successfully.");

        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("PDF generation failed. Please try again.");

        } finally {
            button.disabled = false;
            button.innerHTML = originalContent;

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

    });
    // STEP 3: CONFIRM INFORMATION
    document.getElementById("confirm-review-button")
        .addEventListener("click", () => {

            generateBriefing();
            showStep(4);
        });

    updateNarrative();
    showStep(1);
});

















