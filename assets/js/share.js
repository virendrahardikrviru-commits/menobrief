// MenoBrief - Share feature (public website promotion only)
// Never accesses patient data, questionnaire responses, or generated PDFs.

document.addEventListener("DOMContentLoaded", () => {

    const SHARE_TITLE = "MenoBrief – Menopause Clinical Briefing Tool";
    const SHARE_TEXT = "A free, privacy-conscious tool to help women prepare structured menopause clinical briefings for healthcare appointments.";
    const SHARE_URL = "https://menobrief.pages.dev";

    const headerShareButton = document.getElementById("header-share-button");
    const drawerShareButton = document.getElementById("drawer-share-button");
    const footerShareButton = document.getElementById("footer-share-button");

    // Graceful no-op on pages without share buttons (privacy.html, FAQ, etc.)
    if (!headerShareButton && !drawerShareButton && !footerShareButton) {
        return;
    }

    let fallbackOverlay = null;
    let fallbackPanel = null;

    function buildFallbackMenu() {
        if (fallbackOverlay) return;

        fallbackOverlay = document.createElement("div");
        fallbackOverlay.className = "share-fallback-overlay";
        fallbackOverlay.setAttribute("role", "dialog");
        fallbackOverlay.setAttribute("aria-modal", "true");
        fallbackOverlay.setAttribute("aria-label", "Share MenoBrief");

        fallbackPanel = document.createElement("div");
        fallbackPanel.className = "share-fallback-panel";

        const heading = document.createElement("h3");
        heading.textContent = "Share MenoBrief";
        fallbackPanel.appendChild(heading);

        const options = [
            {
                label: "WhatsApp",
                icon: "message-circle",
                url: "https://wa.me/?text=" + encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)
            },
            {
                label: "Facebook",
                icon: "facebook",
                url: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(SHARE_URL)
            },
            {
                label: "Telegram",
                icon: "send",
                url: "https://t.me/share/url?url=" + encodeURIComponent(SHARE_URL) + "&text=" + encodeURIComponent(SHARE_TEXT)
            },
            {
                label: "Email",
                icon: "mail",
                url: "mailto:?subject=" + encodeURIComponent(SHARE_TITLE) + "&body=" + encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)
            },
            {
                label: "Copy Link",
                icon: "copy",
                url: null
            }
        ];

        options.forEach(option => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "share-fallback-option";

            const iconSpan = document.createElement("span");
            iconSpan.setAttribute("data-lucide", option.icon);
            button.appendChild(iconSpan);

            const labelSpan = document.createElement("span");
            labelSpan.textContent = option.label;
            button.appendChild(labelSpan);

            if (option.url) {
                button.addEventListener("click", () => {
                    window.location.href = option.url;
                    closeFallbackMenu();
                });
            } else {
                button.addEventListener("click", () => {
                    copyLinkToClipboard();
                    closeFallbackMenu();
                });
            }

            fallbackPanel.appendChild(button);
        });

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "share-fallback-close";

        const closeIcon = document.createElement("span");
        closeIcon.setAttribute("data-lucide", "x");
        closeButton.appendChild(closeIcon);

        const closeLabel = document.createElement("span");
        closeLabel.textContent = "Close";
        closeButton.appendChild(closeLabel);

        closeButton.addEventListener("click", closeFallbackMenu);
        fallbackPanel.appendChild(closeButton);

        fallbackOverlay.appendChild(fallbackPanel);
        document.body.appendChild(fallbackOverlay);

        if (window.lucide) {
            window.lucide.createIcons();
        }

        fallbackOverlay.addEventListener("click", (event) => {
            if (event.target === fallbackOverlay) {
                closeFallbackMenu();
            }
        });

        document.addEventListener("keydown", function escHandler(event) {
            if (event.key === "Escape" && fallbackOverlay && fallbackOverlay.classList.contains("open")) {
                closeFallbackMenu();
            }
        });
    }

    function openFallbackMenu() {
        buildFallbackMenu();
        fallbackOverlay.classList.add("open");
        document.body.classList.add("locked");
    }

    function closeFallbackMenu() {
        if (fallbackOverlay) {
            fallbackOverlay.classList.remove("open");
        }
        document.body.classList.remove("locked");
    }

    function copyLinkToClipboard() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(SHARE_URL).catch(() => {
                window.prompt("Copy this link:", SHARE_URL);
            });
        } else {
            window.prompt("Copy this link:", SHARE_URL);
        }
    }

    function handleShare() {
        if (navigator.share) {
            navigator.share({
                title: SHARE_TITLE,
                text: SHARE_TEXT,
                url: SHARE_URL
            }).catch((error) => {
                // User cancellation (AbortError) — silently stop, no fallback
                if (error.name === "AbortError") {
                    return;
                }
                // Other sharing errors — show fallback menu
                openFallbackMenu();
            });
        } else {
            openFallbackMenu();
        }
    }

    [headerShareButton, drawerShareButton, footerShareButton].forEach(button => {
        if (button) {
            button.addEventListener("click", handleShare);
        }
    });
});
