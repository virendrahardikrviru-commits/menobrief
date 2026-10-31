# MenoBrief

MenoBrief is a free, open-source, client-only tool that helps women prepare structured menopause clinical briefings to support conversations with healthcare professionals.

## What it does

- Collects symptoms, personal context, menstrual history, medication details, medical history, and daily-life impact through a four-step form.
- Organises the entered information into a structured clinical appointment summary.
- Generates a PDF briefing locally in the browser for download.

## Technology

- Static HTML5, CSS3, and vanilla JavaScript.
- No build step, no bundler, no framework.
- No backend, no server, no database.
- PDF generation is done entirely in the browser using [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.3/jspdf.umd.min.js) loaded from a CDN.
- External dependencies (Google Fonts, Lucide icons, jsPDF) are loaded from CDNs.

## Privacy

- Patient information is held temporarily in browser memory only while you work on the page.
- There is no automatic persistence: refreshing or closing the page clears all entered information.
- No data is sent to any server, AI service, or third party.
- PDFs are generated locally on your device.
- No encryption, medical compliance, or guaranteed security is claimed.

## Usage

Open `index.html` in a modern web browser. No installation or server is required.

## Contributing

See `CONTRIBUTING.md` and `docs/` for project documentation.

## License

See `LICENSE` (to be added by the project owner).
