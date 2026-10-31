# Privacy Statement

## Data Handling

MenoBrief processes patient information entirely on the client side:

- **Storage:** Information is held in browser memory (JavaScript variables) only. There is no automatic persistence to `sessionStorage`, `localStorage`, cookies, or any server-side storage.
- **Persistence:** Refreshing or closing the browser tab clears all entered information. There is no recovery path after a page reload.
- **Transmission:** No data is sent to any server, API, AI service, or third party. No network requests are made with patient information.
- **PDF generation:** The clinical briefing PDF is generated locally in the browser using jsPDF. The PDF file is created on the user's device and downloaded through the browser's normal download mechanism.

## What Is Collected

The form optionally collects:
- Symptoms experienced
- A free-text narrative description
- Age range
- Menstrual history and cycle details
- Medication and hormonal treatment details
- Relevant medical history
- Impact on daily life areas

All fields are optional. Users should only share information they are comfortable entering.

## What Is Not Done

- No patient records are saved to a database.
- No AI service processes patient information (the `gemini.js` and `prompt-builder.js` files are empty placeholders; no AI integration is active).
- No analytics or tracking is performed.
- No accounts or sign-ups are required.

## Limitations

- Browser memory is not encrypted.
- Data held in memory can be inspected via browser developer tools.
- Any script running on the page can access in-memory state.
- No medical compliance (HIPAA, GDPR, etc.) is claimed or certified.

## Recommendations

- Do not enter information you are not comfortable potentially being visible in browser developer tools.
- Refresh or close the page when finished to clear all entered data.
- Download the PDF to your device for your own records; the application does not retain copies.
