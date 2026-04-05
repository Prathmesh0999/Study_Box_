# Study Box Portal

## Real Gmail OTP setup

1. Create a Gmail account or use your existing Gmail.
2. Turn on 2-Step Verification for that Google account.
3. Generate a Google App Password.
4. Copy `.env.example` to `.env`.
5. Fill in:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
6. Install packages:
   - `npm install`
7. Start the app:
   - `npm start`
8. Open:
   - `http://localhost:3000`

## Notes

- Student signup now uses backend OTP APIs.
- OTPs expire in 10 minutes.
- Existing marks and student records still live in browser local storage.
