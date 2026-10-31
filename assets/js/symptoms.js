
/**
 * MenoBrief - Symptom Selection
 */

document.addEventListener("DOMContentLoaded", () => {

    const checkboxes = document.querySelectorAll(
        'input[name="symptoms"]'
    );

    const selectedCount = document.getElementById(
        "selected-count"
    );

    function updateSymptoms() {

        const selected = Array.from(checkboxes)
            .filter(input => input.checked)
            .map(input => input.value);

        // Update application memory
        window.MenoBriefState.setSymptoms(selected);

        // Update selection counter
        selectedCount.textContent = selected.length;

        // Update selected card appearance
        checkboxes.forEach(input => {

            const card = input.closest(".symptom-card");

            if (card) {
                const hasSelection = card.querySelector(
                    'input[name="symptoms"]:checked'
                );

                card.classList.toggle(
                    "has-selection",
                    Boolean(hasSelection)
                );
            }
        });
    }

    // Listen for checkbox changes
    checkboxes.forEach(input => {
        input.addEventListener("change", updateSymptoms);
    });

    // Initial state
    updateSymptoms();

});
