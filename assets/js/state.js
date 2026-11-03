(function () {

    const SYMPTOM_CATEGORIES = {
        "Hot flashes": "Vasomotor",
        "Night sweats": "Vasomotor",
        "Feeling overheated": "Vasomotor",
        "Brain fog": "Cognitive",
        "Memory issues": "Cognitive",
        "Difficulty concentrating": "Cognitive",
        "Insomnia / trouble falling asleep": "Sleep",
        "Waking at 3 AM or early": "Sleep",
        "Poor sleep quality": "Sleep",
        "Anxiety or feeling on edge": "Mood & Emotional",
        "Sudden mood swings": "Mood & Emotional",
        "Irritability / rage": "Mood & Emotional",
        "Crying spells": "Mood & Emotional",
        "Joint or muscle pain": "Physical",
        "Heart palpitations": "Physical",
        "Headaches / migraines": "Physical",
        "Bloating or weight changes": "Physical",
        "Irregular periods": "Menstrual & Other",
        "Heavier or lighter bleeding": "Menstrual & Other",
        "Longer or shorter cycles": "Menstrual & Other"
    };

    function createDefaultPatient() {
        return {
            symptoms: [],
            narrative: "",
            details: {}
        };
    }

    window.MenoBriefState = {

        currentStep: 1,

        patient: createDefaultPatient(),

        SYMPTOM_CATEGORIES: SYMPTOM_CATEGORIES,

        setSymptoms(symptoms) {
            this.patient.symptoms = [...symptoms];
        },

        setNarrative(value) {
            this.patient.narrative = value;
        },

        setDetails(details) {
            this.patient.details = { ...details };
        },

        clear() {
            this.currentStep = 1;
            this.patient = createDefaultPatient();
        }
    };

})();
