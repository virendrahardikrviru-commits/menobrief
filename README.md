# MenoBrief

MenoBrief is a free, client-only tool that helps women prepare structured menopause clinical briefings to support conversations with healthcare professionals.

## What it does

- Collects symptoms, personal context, menstrual history, medication details, medical history, and daily-life impact through a four-step form.
- Organises the entered information into a structured clinical appointment summary.
- Generates a PDF briefing locally in the browser for download.

## Technology

- Static HTML5, CSS3, and vanilla JavaScript.
- No build step, bundler, or framework.
- No backend, database, or server-side processing.
- PDF generation uses a locally hosted copy of jsPDF.
- Icons use a locally hosted copy of Lucide.
- Fonts are self-hosted DM Sans and Playfair Display.

## GEO / AEO (answer-engine optimization)

- JSON-LD structured data (Schema.org) on every page: Organization, WebPage, BreadcrumbList, HowTo (the four-step workflow), FAQPage, and a MedicalCondition topic for menopause/perimenopause.
- Semantic HTML landmarks, breadcrumb navigation, publisher/author information, and article dates.
- A citable FAQ section on the homepage and full FAQ schema on the FAQ page.
- All structured data is public information about the tool only. No patient data is included, and no external requests are made.

## Privacy

- Patient information is held temporarily in browser memory only while you work on the page.
- Refreshing or closing the page clears entered information.
- No data is sent to an AI service or external processing service by the application.
- PDFs are generated locally on your device.
- No encryption, medical compliance, or guaranteed security is claimed.

## Usage

Open `index.html` in a modern web browser. No installation or build process is required.

## Project documentation

See `SECURITY.md` and the documents in `docs/` for additional information.

## Licensing

No open-source licence has been applied to this repository. Public visibility on GitHub does not grant permission to reuse, modify, or distribute the source code.