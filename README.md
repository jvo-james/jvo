# JVO

Portfolio + private JVO Desk + client project agreement flow.

## What is included

- `index.html` and `resume.html`: current public portfolio
- `form.html`: client agreement page
- `admin.html`: private JVO Desk
- `firebase-config.js`: Firebase browser config
- `netlify/api.js`: secure server function for Firestore, agreements, payments and Resend
- `firestore.rules`: blocks direct Firestore access. The Netlify function uses Firebase Admin on the server.

## Before publishing

### 1. Firebase

Create a Firebase project, enable **Authentication > Email/Password** and create the admin account using `senujames23@gmail.com`.

Create a Firestore database.

Copy your Firebase web app values into `firebase-config.js`.

Deploy `firestore.rules` in Firebase. The site does not need direct browser access to Firestore.

Create a Firebase service account and add these values to Netlify environment variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_EMAIL` = `senujames23@gmail.com`

For `FIREBASE_PRIVATE_KEY`, paste the full private key. Netlify can store multiline values. The function also supports `\\n` line breaks.

### 2. Resend

Verify `jvo.me` in Resend. Add these Netlify environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM` = for example `JVO <hello@jvo.me>`
- `REPLY_TO` = `senujames23@gmail.com`

Do not put the Resend key in any browser JavaScript file.

### 3. Netlify

Connect the GitHub repo to Netlify. `netlify.toml` already sets the publish directory and function directory.

Add:

- `SITE_URL` = `https://jvo.me`

No build command is needed.

### 4. First login

Open `/admin.html` and log in with the Firebase email/password account you created.

Go to **Settings** first. Add your payment instructions and an optional payment link. These details are copied into each new project when it is created.

## Normal workflow

1. Agree on the job and price in chat.
2. Open JVO Desk and click **New project**.
3. Add the project name, price, timeline, scope and features.
4. JVO Desk creates the agreement and copies the client link.
5. Send the link to the client.
6. The client adds their name, email, phone and company name then signs.
7. The project automatically moves to **Awaiting Deposit**.
8. When the deposit arrives, open the project and record the payment.
9. Send the payment confirmation email with one click.
10. Move the project through Development, Client Review, Approved, Fully Paid, Launched and Completed as needed.

## Important notes

- The deposit is always calculated as 50%.
- There is no revision limit in the agreement.
- Free bug support defaults to 30 days and can be changed per project or in Settings.
- New work outside the agreed scope can be saved under **Extra work** in a project.
- Client links use a long random token. Client details and signatures are stored in Firestore through the Netlify function.
- The admin area checks Firebase Authentication and the server also checks that the logged-in email matches `ADMIN_EMAIL`.
- Payment records are manual. This works well for MoMo, bank transfers and cash. A payment provider can be connected later without changing the agreement flow.

## Legal note

The included terms are practical plain-language project terms, not jurisdiction-specific legal advice. Before relying on them for large projects or disputes, have a lawyer in your jurisdiction review them.
