# 🚀 Complete Step-by-Step Guide: Launching on Cloudflare

This guide walks you through deploying your **CineSpace & Prabhakar Home Cinema** web application on **Cloudflare** for global high-speed edge delivery, free SSL/HTTPS encryption, and zero server management costs.

---

## 🌟 Overview of Your 3 Live Portals on Cloudflare

Once deployed, your single Cloudflare domain will host all 3 portals automatically:
- 🛒 **Customer Marketplace**: `https://your-domain.com/`
- 💼 **Merchant Host Portal**: `https://your-domain.com/merchant`
- 👑 **Master Admin Portal**: `https://your-domain.com/admin`
- 🔑 **Password Reset Page**: `https://your-domain.com/reset-password`

---

## 📋 METHOD 1: Cloudflare Pages Direct Upload (Easiest - 2 Minutes)

If you do not want to use Git/command line, you can upload the frontend files directly via Cloudflare's web dashboard.

### Step 1: Create a Free Cloudflare Account
1. Go to [cloudflare.com](https://dash.cloudflare.com/sign-up) and create a free account.
2. Verify your email address.

### Step 2: Create a Cloudflare Pages Project
1. In the Cloudflare dashboard left menu, click **Workers & Pages**.
2. Click the **Create Application** button.
3. Select the **Pages** tab and click **Upload assets**.
4. Set your **Project Name** (e.g. `prabhakar-home-cinema` or `cinespace-theaters`).
5. Click **Create project**.

### Step 3: Drag & Drop Your Files
1. Open your computer file explorer to:  
   `g:\My Drive\Antigravity\Bookin App for Family Theature\public`
2. Select all files inside `public` (`index.html`, `merchant.html`, `admin.html`, `reset-password.html`, `_headers`).
3. Drag and drop these files directly into the Cloudflare upload zone.
4. Click **Deploy site**.
5. Your site is instantly live at: `https://prabhakar-home-cinema.pages.dev`!

---

## 💻 METHOD 2: Cloudflare via GitHub (Automatic Updates)

Whenever you make changes to your code, Cloudflare will automatically rebuild and redeploy your website.

### Step 1: Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com) named `cinespace-theaters`.
2. Push your project folder to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Launch Prabhakar Home Cinema on Cloudflare"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cinespace-theaters.git
   git push -u origin main
   ```

### Step 2: Connect GitHub to Cloudflare Pages
1. In Cloudflare Dashboard ➔ **Workers & Pages** ➔ **Create Application** ➔ **Pages**.
2. Select **Connect to Git** and choose your GitHub repository `cinespace-theaters`.
3. Configure Build Settings:
   - **Framework preset**: None
   - **Build command**: Leave blank (or `npm install`)
   - **Build output directory**: `public`
4. Click **Save and Deploy**.

---

## 🌐 Setting Up Your Custom Domain (e.g. `prabhakarcinema.in`)

To use your own custom domain on Cloudflare:

1. Inside your Cloudflare Pages project, click the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter your domain name (e.g. `prabhakarcinema.in` or `book.prabhakarcinema.in`).
4. Cloudflare will automatically configure DNS records and issue a **Free SSL/HTTPS Certificate** within 5 minutes.

---

## ⚙️ Post-Deployment: Connect Razorpay & Email in 60 Seconds

Once your live domain (e.g. `https://prabhakarcinema.in` or `.pages.dev`) is active:

1. **Configure Live Gateway in Master Admin**:
   - Open `https://your-domain.com/admin` (PIN: `1234`).
   - Paste your **Razorpay Key ID** & **Key Secret**.
   - Click **Save Gateway Credentials**.

2. **Configure Razorpay Webhook in Razorpay Dashboard**:
   - Go to Razorpay Dashboard ➔ **Settings** ➔ **Webhooks** ➔ **Add Webhook**.
   - **Webhook URL**: `https://your-domain.com/api/payments/webhook`
   - **Events**: Check `payment.captured` and `order.paid`.

3. **Configure Host Email in Merchant Portal**:
   - Open `https://your-domain.com/merchant` (PIN: `1234`).
   - Enter your host Gmail and 16-character Google App Password.
   - Click **Test Connection** ➔ **Save Email Settings**.

Your luxury private cinema SaaS is now 100% operational on Cloudflare! 🍿✨
