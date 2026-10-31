# UX Guidelines

## Design Principles

- **Privacy first:** Users should feel safe entering sensitive health information. Data stays in browser memory and is cleared on refresh or close.
- **No account required:** Users can start immediately without signing up.
- **Clear progress:** A four-step workflow with visual progress indicators.
- **Optional fields:** All personal details are optional. Users share only what they are comfortable with.
- **Doctor-focused output:** The generated PDF is structured for healthcare professional review.

## Visual Design

- Brand colours: green (#08795B primary), pink, purple, blue, yellow accents.
- Fonts: DM Sans (body/headings), Playfair Display (editorial).
- Botanical motif: lotus logo, pink and green botanical SVG decorations.
- Responsive layout: collapses to single column on mobile devices (< 650px).

## Interaction Patterns

- Symptom cards highlight when selected.
- Selection counter updates in real time.
- Character counter for narrative field (2,000 character max).
- Form validation for cycle length (1–120 days).
- Smooth scrolling between steps.
- Review step allows editing of previous steps.
- Confirm step generates the briefing and advances to PDF view.

## Accessibility

- Form fields have associated labels.
- Buttons have clear, descriptive text.
- Focus outlines are visible for keyboard navigation.
- ARIA live regions for feedback messages.
- Print styles hide non-essential UI when printing the briefing.

## Content Guidelines

- Use plain, supportive language.
- Avoid medical terminology where plain language works.
- Include disclaimers that the tool is not diagnostic.
- Never claim encryption, compliance, or guaranteed security.
- Use synthetic example data only in documentation; never real patient records.
