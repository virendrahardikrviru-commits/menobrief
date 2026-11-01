// Mobile navigation drawer - shared across all pages
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("mobile-menu-toggle");
    const drawer = document.getElementById("nav-drawer");
    const drawerOverlay = document.getElementById("nav-drawer-overlay");
    const drawerPanel = document.getElementById("nav-drawer-panel");
    const drawerClose = document.getElementById("nav-drawer-close");
    const drawerLinks = document.querySelectorAll(".nav-drawer-link");

    if (hamburger && drawer && drawerOverlay && drawerPanel && drawerClose) {
        function toggleDrawer() {
            const isOpen = drawer.classList.contains("open");
            if (isOpen) {
                closeDrawer();
            } else {
                openDrawer();
            }
        }

        function openDrawer() {
            drawer.classList.add("open");
            drawerOverlay.classList.add("open");
            drawerPanel.classList.add("open");
            hamburger.setAttribute("aria-expanded", "true");
            drawerClose.setAttribute("aria-hidden", "false");
            document.body.classList.add("locked");
            hamburger.blur();
            drawerClose.focus();
        }

        function closeDrawer() {
            drawer.classList.remove("open");
            drawerOverlay.classList.remove("open");
            drawerPanel.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
            drawerClose.setAttribute("aria-hidden", "true");
            document.body.classList.remove("locked");
            hamburger.focus();
        }

        hamburger.addEventListener("click", toggleDrawer);
        drawerClose.addEventListener("click", closeDrawer);
        drawerOverlay.addEventListener("click", closeDrawer);

        drawerLinks.forEach(link => {
            link.addEventListener("click", closeDrawer);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && drawer.classList.contains("open")) {
                closeDrawer();
            }
        });
    }
});
