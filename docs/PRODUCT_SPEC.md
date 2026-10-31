# Product Specification

## Overview

MenoBrief is a browser-based menopause clinical briefing tool. It helps users prepare a structured, doctor-friendly summary of their menopause symptoms and relevant health context for discussion with a qualified healthcare professional.

## Scope

- **In scope:** Four-step form (symptoms, personal details, review, clinical briefing), local PDF generation, in-browser memory-only data handling.
- **Out of scope:** Backend services, patient database, user accounts, AI integration, API keys, encryption, compliance certification, mobile applications.

## User Flow

1. **Step 1 — Symptoms:** Select symptoms from categorical grids (vasomotor, cognitive, sleep, mood, physical, menstrual) and enter an optional free-text narrative.
2. **Step 2 — Details:** Enter optional personal context (age range, menstrual status, last period, cycle length, hormonal treatment, medication details, medical history, daily-life impact).
3. **Step 3 — Review:** Review all entered information for accuracy. Edit steps 1 or 2 if needed.
4. **Step 4 — Briefing:** View the structured clinical appointment summary and download a PDF.

## Technical Requirements

- Modern web browser with JavaScript enabled.
- No server, no build step, no installation.
- Static file hosting is sufficient (e.g., GitHub Pages).

## Dependencies

- [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.3/jspdf.umd.min.js) (CDN) — client-side PDF generation.
- [Lucide](https://unpkg.com/lucide@latest) (CDN) — icon rendering.
- Google Fonts (CDN) — DM Sans and Playfair Display typefaces.

## Data Model (in memory only)

```
{
  symptoms: string[],
  narrative: string,
  details: {
    ageRange: string,
    menstrualStatus: string,
    lastPeriod: string,
    cycleLength: string,
    hormonalTreatment: string,
    medicationDetails: string,
    medicalHistory: string,
    impact: string[]
  }
}
```

Data is cleared on page refresh or close. No persistence layer exists.

## PDF Output

The generated PDF includes:
- MenoBrief branding (lotus logo, botanical artwork)
- Clinical appointment summary
- Reported symptoms
- Personal and menstrual history
- Medication and treatment
- Relevant medical history
- Impact on daily life
- Discussion points for the doctor
- Disclaimer

PDF layout, colours, typography, and artwork are fixed and should not be altered without design review.

## Non-Goals

- No AI-powered symptom analysis or organisation.
- No patient data storage or retrieval.
- No integration with electronic health record systems.
- No diagnostic or treatment recommendations.
