# Database Reset and Testing Guide

This guide explains how to reset the database and perform end-to-end testing for tenant creation, email verification, and password resets in a local development environment.

---

## 1. Wiping and Resetting the Database

To start completely fresh by removing all tenant data and resetting both the master and tenant databases, follow these steps:

### Step 1: Stop the Dev Server
Make sure the Next.js development server is stopped by pressing `Ctrl + C` in your terminal.

### Step 2: Delete Existing SQLite Database Files
Run the following commands to delete all database files (master and all tenant databases) safely:
```bash
# Delete master database
rm -f prisma/master.db

# Delete all tenant databases safely without shell globbing errors
find prisma/tenants -name "*.db" -delete
```

### Step 3: Re-initialize the Master Database Schema
Push the master schema definition to create a new `master.db` file and build the tables. You must specify the `DATABASE_URL` inline so Prisma writes to `prisma/master.db` instead of the default development tenant database:
```bash
DATABASE_URL="file:./prisma/master.db" npx prisma db push --schema=prisma/master.prisma
```

### Step 4: Seed the Master Database (Super Admin)
Run the master seed script to create the initial Super Admin account:
```bash
npx tsx prisma/seed-master.ts
```
*Note: This creates a Super Admin user with the default credentials:*
- **Email:** `admin@faixappreta.com.br`
- **Password:** `faixappreta123`
- *You can override these by setting `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in your `.env` file.*

---

## 2. Clear Session Cookies (Crucial)

If you recently updated `NEXTAUTH_SECRET` in your `.env` file, your browser may contain old session cookies that cannot be decrypted, causing auth errors.
*   Open your browser Developer Tools (`F12` or `Cmd + Option + I`).
*   Navigate to **Application** (Chrome/Edge) or **Storage** (Firefox) -> **Cookies**.
*   Select `http://localhost:3000` and clear `next-auth.session-token` (and any other `next-auth.*` cookies).
*   Alternatively, open an **Incognito / Private Window** to perform testing.

---

## 3. Step-by-Step E2E Testing Flow

### Step 1: Log in as Super Admin
1. Start your local server:
   ```bash
   npm run dev
   ```
2. Navigate to the Super Admin login page:
   [http://localhost:3000/super-admin/login](http://localhost:3000/super-admin/login)
3. Enter the default Super Admin credentials:
   - **Email:** `admin@faixappreta.com.br`
   - **Password:** `faixappreta123`
4. Click **Entrar** to access the Super Admin Dashboard.

### Step 2: Create a Tenant (CT)
1. In the Super Admin Dashboard, click **Criar novo CT** (or go directly to [http://localhost:3000/super-admin/create](http://localhost:3000/super-admin/create)).
2. Fill out the form fields:
   - **Nome do CT:** e.g., `CT Gracie`
   - **Domínio (slug):** `gracie` (this dictates the local URL search param: `?tenant=gracie`)
   - **Nome do Admin:** The name of the chief instructor/admin for this CT.
   - **Email do Admin:** The email address of the CT Administrator (e.g., `admin@gracie.com.br`).
   - **Senha do Admin:** Must be at least 6 characters.
3. Click **Criar CT**. This will:
   - Create `prisma/tenants/gracie.db` SQLite database.
   - Run the migrations/tables in that tenant database.
   - Add the tenant entry to `prisma/master.db`.
   - Seed the initial tenant schema.
   - Generate and "send" an email verification code.

### Step 3: Complete Email Verification
Since real emails are not sent during local development unless `RESEND_API_KEY` is configured in your `.env`, email delivery falls back to your terminal logs.
1. Check the console/terminal where `npm run dev` is running.
2. Look for the fallback email log block:
   ```text
   ==================================================
   ✉️  [EMAIL FALLBACK] Sent email to: admin@gracie.com.br
   📂  Subject: Faixappreta - Verifique seu e-mail
   --------------------------------------------------
   ...
   Código de confirmação: XXXXXX
   ==================================================
   ```
3. Copy the 6-digit code (`XXXXXX`) from the logs.
4. Navigate to the tenant login page: [http://localhost:3000/login?tenant=gracie](http://localhost:3000/login?tenant=gracie)
5. Enter the administrator's email and password.
6. A message will indicate the email needs verification and will automatically redirect you to the verification screen:
   [http://localhost:3000/verify-email?email=admin%40gracie.com.br&tenant=gracie](http://localhost:3000/verify-email?email=admin%40gracie.com.br&tenant=gracie)
7. Enter the code you copied from your terminal logs and click **Confirmar**.
8. The email is verified, and you can now log in successfully!

### Step 4: Test Password Reset
1. Go to the tenant login page: [http://localhost:3000/login?tenant=gracie](http://localhost:3000/login?tenant=gracie)
2. Click **Clique aqui** next to "Esqueceu sua senha?".
3. Enter the admin email (`admin@gracie.com.br`) and submit.
4. Go back to your terminal where `npm run dev` is running.
5. Find the fallback password reset email log block:
   ```text
   ==================================================
   ✉️  [EMAIL FALLBACK] Sent email to: admin@gracie.com.br
   📂  Subject: Faixappreta - Redefinição de Senha
   --------------------------------------------------
   ...
   http://localhost:3000/reset-password?token=YOUR_SECURE_TOKEN_HERE
   ==================================================
   ```
6. Copy the complete reset link (including the token) from the console and paste it into your browser.
7. Enter a new password (minimum 6 characters) and confirm it.
8. The password has been successfully reset! You can now log in using the new password.
