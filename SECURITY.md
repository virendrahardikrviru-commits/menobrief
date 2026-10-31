# Security Policy

## Supported Versions

This is a static client-side web application. All versions are equally supported as they are simply HTML, CSS, and JavaScript files served statically.

## Reporting a Vulnerability

If you discover a security issue, please open an issue on the project repository. Do not disclose sensitive information publicly.

## Security Design

- MenoBrief is a client-only application with no backend or server.
- Patient information is held in browser memory only and is cleared when the page is refreshed or closed.
- No data is transmitted to any external server or AI service.
- PDF generation happens locally in the browser.

## Limitations

- No encryption is applied to data held in browser memory.
- Data is accessible to any script running on the same page (standard browser same-origin model).
- Browser developer tools can inspect in-memory state.
- No claims of medical compliance, HIPAA, GDPR, or other regulatory compliance are made.
- Users should not enter information they are not comfortable potentially being visible in browser developer tools.

## Dependencies

External scripts are loaded from CDNs without Subresource Integrity (SRI) hashes. Consider pinning dependency versions and adding SRI hashes for production use.
