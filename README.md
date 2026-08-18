# CineSpace India - Multi-Merchant Luxury Cinema Rental Marketplace

A full-stack, production-ready private cinema and event space rental platform with **Razorpay Payment Gateway Integration**, **Multi-Merchant Payout Split Settlement**, and **Indian Legal Compliance** (Indian Copyright Act 1957, Cinematograph Act 1952, IT Act 2000, and GST SAC 997312 / 998314).

---

## 🌟 Business & Financial Split Model

When a customer books a private screening slot (e.g., ₹5,000):
- **Customer Pays**: ₹5,000 (via Razorpay: UPI, Cards, NetBanking)
- **Payment Gateway Fee (~2.36%)**: ~₹118 (deducted by Razorpay)
- **Platform Facilitation Fee (10% Commission)**: **₹500** (retained by your platform)
- **Merchant Net Payout**: **₹4,382** (recorded in the automated settlement ledger and disbursed to the merchant's UPI / Bank account)

---

## 📜 Indian Legal Compliance Framework

1. **Space & Infrastructure Rental Classification**:
   - Categorized under **SAC Code 997312** (Rental of premises and event spaces for private functions) and **SAC Code 998314** (Marketplace IT platform facilitation).
2. **Indian Copyright Act, 1957 & Cinematograph Act, 1952 Compliance**:
   - The platform and hosts operate strictly as **private space rental providers for personal and family gatherings**.
   - Neither the platform nor the host broadcasts unlicensed commercial cinema prints. Guests use their own lawful OTT subscription credentials (Netflix, Amazon Prime Video, Disney+ Hotstar, Apple TV) or personal gaming consoles.
3. **Mandatory KYC & Police Guidelines Compliance**:
   - Primary guest must be 18+ and present an original Government-issued Photo ID (Aadhaar Card, Driving License, Voter ID, or Passport) at check-in.
4. **Consumer Protection (E-Commerce) Rules, 2020**:
   - Transparent cancellation and refund terms included in booking confirmations and invoice passes.

---

## 📁 Full-Stack Architecture & File Structure

```
.
├── server.js                     # Express REST API Server (Orders, Payments, Merchants, Admin)
├── database/
│   └── db.js                     # Multi-tenant Database Engine with Relational Entities
├── services/
│   ├── razorpayService.js        # Razorpay Orders, HMAC SHA-256 Signature Verification & Split Math
│   └── emailService.js           # Legal-Compliant HTML Tax Invoices & Payout Email Dispatches
├── utils/
│   └── legalTemplates.js         # Space Rental Terms, Copyright Act Disclaimer & Police KYC Rules
├── public/
│   └── index.html                # Multi-Venue Marketplace UI with Razorpay Standard Checkout SDK
├── Code.gs                       # Google Apps Script Backend (Alternative Serverless Deployment)
├── Index.html                    # Google Apps Script Frontend (Alternative Serverless Deployment)
├── package.json                  # Node.js Dependencies (express, razorpay, nodemailer, cors)
├── .env.example                  # Environment Variables Template
└── README.md                     # Documentation Manual
```

---

## 🚀 Running the Full-Stack Node.js Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```env
PORT=3000
PLATFORM_COMMISSION_PERCENT=10.0
RAZORPAY_KEY_ID=rzp_test_YourRazorpayKey
RAZORPAY_KEY_SECRET=YourRazorpaySecret
ADMIN_PIN=1234
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 3. Start the Server
```bash
npm start
```
Visit `http://localhost:3000` to access the live marketplace!

---

## 🌐 Alternative Deployment: Google Apps Script & Google Sheets

If you wish to deploy directly to Google Sheets without server maintenance:
1. Open [Google Sheets](https://sheets.new) and go to **Extensions** > **Apps Script**.
2. Paste [`Code.gs`](file:///g:/My%20Drive/Antigravity/Bookin%20App%20for%20Family%20Theature/Code.gs) into `Code.gs`.
3. Create an HTML file named `Index` and paste [`Index.html`](file:///g:/My%20Drive/Antigravity/Bookin%20App%20for%20Family%20Theature/Index.html).
4. Run `initDatabase` to create all 5 sheets (`Settings`, `Merchants`, `Screens`, `Bookings`, `Settlements`).
5. Click **Deploy** > **New deployment** > **Web app** (Access: `Anyone`).
