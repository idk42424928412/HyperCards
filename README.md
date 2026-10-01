# HyperCards hardened version

## What changed
- Removed the client-side `cards` array and price from the browser source. A visitor can always inspect frontend code, so prices must be authoritative on the server/database.
- Added Helmet security headers and a restrictive Content Security Policy.
- Added rate limiting and input length validation to the search endpoint.
- Removed unnecessary cookie-consent storage and third-party trackers.
- Avoided `innerHTML` for search results; text is inserted with DOM APIs to reduce XSS risk.
- Masked card IDs in the public response. If the full ID is required for a legitimate workflow, expose it only after authorization.
- Added a more conventional, restrained visual design instead of a generic AI-style gradient UI.

## Run
1. `npm install express express-rate-limit helmet`
2. Set `SMOKEMON_CARD_ID` in the server environment rather than hard-coding the real identifier.
3. `node server.js`
4. Put HTTPS in front of the Node process with a trusted reverse proxy.

## Important limitation
No website can prevent a user from opening DevTools, editing the DOM, or changing JavaScript locally. The correct security model is that the browser is untrusted: the server must validate prices, permissions, inventory, discounts, and every value that matters. If this site eventually processes payments, the payment amount must also be calculated and verified server-side immediately before creating the payment/checkout session.

## Doxxing/privacy
A public website cannot guarantee that nobody can ever identify or dox its operator. Keep personal information out of public source, metadata, repository history, error pages, DNS records where possible, and public logs. Use a business/privacy contact channel and minimize retained IP/log data according to your legal requirements. Your hosting/CDN may still process IP addresses.
