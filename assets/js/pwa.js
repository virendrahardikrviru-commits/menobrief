(function () {
    "use strict";

    let deferredPrompt = null;

    const installButtons = [
        document.getElementById("drawer-install-button"),
        document.getElementById("header-install-button")
    ].filter(Boolean);

    if (installButtons.length === 0) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    function isInstalled() {
        return window.matchMedia("(display-mode: standalone)").matches ||
            navigator.standalone === true;
    }

    function showInstructions() {
        if (isInstalled()) {
            alert("MenoBrief is already installed on your device.");
        } else if (isIOS) {
            alert(
                "To add MenoBrief to your iPhone or iPad:\n\n" +
                "1. Open this website in Safari.\n" +
                "2. Tap the Share button.\n" +
                "3. Select 'Add to Home Screen'.\n" +
                "4. Tap 'Add'.\n\n" +
                "MenoBrief will appear on your Home Screen."
            );
        } else {
            alert(
                "To install MenoBrief:\n\n" +
                "Open your browser menu and look for " +
                "'Install MenoBrief' or 'Add to Home Screen'.\n\n" +
                "If installation is unavailable, you can continue " +
                "using MenoBrief directly from this website."
            );
        }
    }

    window.addEventListener("beforeinstallprompt", function (event) {
        event.preventDefault();
        deferredPrompt = event;
    });

    installButtons.forEach(function (button) {
        button.addEventListener("click", async function () {
            if (isInstalled()) {
                showInstructions();
                return;
            }

            if (!deferredPrompt) {
                showInstructions();
                return;
            }

            const promptEvent = deferredPrompt;
            deferredPrompt = null;

            try {
                await promptEvent.prompt();

                const choice = await promptEvent.userChoice;

                if (choice.outcome === "accepted") {
                    alert("MenoBrief installation was accepted. Follow your browser's instructions to finish.");
                }
            } catch (error) {
                console.error("MenoBrief installation prompt failed:", error);
                showInstructions();
            }
        });
    });

    window.addEventListener("appinstalled", function () {
        deferredPrompt = null;
        alert("MenoBrief has been installed successfully.");
    });
})();
