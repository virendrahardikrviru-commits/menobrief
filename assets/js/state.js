(function () {

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
