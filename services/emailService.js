/**
 * ============================================================================
 * EMAIL & TAX INVOICE DISPATCH SERVICE WITH DYNAMIC PER-MERCHANT TRANSPORTS
 * ============================================================================
 * Features:
 * 1. Dispatches VIP Space Lease Passes & Tax Invoices directly from the
 *    Host's own Gmail Address using their stored Google App Password.
 * 2. Includes 4-Digit Check-In Door OTP & Explicit House Rules (No Smoking, Shoes).
 * 3. Secure Password Reset Verification Emails with 1-click Link & Username.
 * ============================================================================
 */

const nodemailer = require('nodemailer');
const db = require('../database/db');

function createTransporter(config) {
  // 1. Per-Merchant custom configuration (if host configured their Gmail App Password)
  if (config && config.user && config.pass) {
    return nodemailer.createTransporter({
      host: config.host || 'smtp.gmail.com',
      port: Number(config.port) || 587,
      secure: Number(config.port) === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  }

  // 2. Fallback to Master Platform Admin SMTP configuration
  const adminSmtp = db.getAdminSmtpConfig ? db.getAdminSmtpConfig() : null;
  if (adminSmtp && adminSmtp.user && adminSmtp.pass) {
    return nodemailer.createTransporter({
      host: adminSmtp.host || 'smtp.gmail.com',
      port: Number(adminSmtp.port) || 587,
      secure: Number(adminSmtp.port) === 465,
      auth: {
        user: adminSmtp.user,
        pass: adminSmtp.pass
      }
    });
  }

  // 3. Fallback to Environment Variables or Demo Dispatch
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'support@gm-care.in',
      pass: process.env.SMTP_PASS || 'default_demo_pass'
    }
  });
}

function resolveSenderDetails(merchant) {
  if (merchant && merchant.smtpConfig && merchant.smtpConfig.user && merchant.smtpConfig.pass) {
    return {
      email: merchant.smtpConfig.user,
      name: merchant.smtpConfig.fromName || merchant.brandName || 'CineSpace Host'
    };
  }

  const adminSmtp = db.getAdminSmtpConfig ? db.getAdminSmtpConfig() : null;
  if (adminSmtp && adminSmtp.user) {
    return {
      email: adminSmtp.user,
      name: adminSmtp.fromName || 'CineSpace Concierge (Gadget Media Care)'
    };
  }

  return {
    email: 'support@gm-care.in',
    name: 'CineSpace Concierge (Gadget Media Care)'
  };
}

const emailService = {
  /**
   * 1. Send VIP Pass & Tax Invoice to Customer with Check-In OTP & House Rules
   */
  sendCustomerConfirmationPass: async (booking, venue, merchant) => {
    try {
      const transporter = createTransporter(merchant ? merchant.smtpConfig : null);
      const sender = resolveSenderDetails(merchant);
      const hostPhone = merchant ? merchant.phone : '+91 86677 08711';
      const cleanHostPhone = hostPhone.replace(/\D+/g, '');

      const mailOptions = {
        from: `"${sender.name}" <${sender.email}>`,
        to: booking.customerEmail,
        subject: `🎬 VIP Space Lease Pass & Door OTP: ${booking.bookingId} - ${venue.name}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 14px; overflow: hidden; border: 1px solid #d97706;">
            
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 24px 20px; text-align: center;">
              <h1 style="margin: 0; color: #090d16; font-size: 24px; text-transform: uppercase;">Official Space Lease VIP Pass</h1>
              <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 13px; font-weight: bold;">Short-Term Space & Audio-Visual Lease (SAC Code: 997312)</p>
            </div>

            <div style="padding: 24px 20px;">
              <p style="font-size: 16px; margin-top: 0;">Dear <strong>${booking.customerName}</strong>,</p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Your luxury private screening reservation at <strong>${venue.name}</strong> (${merchant ? merchant.brandName : ''}) is confirmed.
              </p>

              <!-- VIP Pass Box with Check-In Door OTP -->
              <div style="background: #111726; border: 1px dashed #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 14px; margin-bottom: 14px;">
                  <div>
                    <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Booking Reference</span>
                    <div style="font-size: 24px; font-weight: bold; color: #fbbf24; font-family: monospace;">${booking.bookingId}</div>
                  </div>
                  <div style="text-align: right; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 6px 14px; border-radius: 8px;">
                    <span style="font-size: 10px; color: #34d399; text-transform: uppercase; font-weight: bold; display: block;">Door Check-In PIN</span>
                    <div style="font-size: 22px; font-weight: 900; color: #10b981; font-family: monospace; letter-spacing: 2px;">${booking.checkinOtp || '1234'}</div>
                  </div>
                </div>

                <table style="width: 100%; font-size: 13px; color: #e2e8f0; line-height: 1.8;">
                  <tr><td style="color: #94a3b8;">Auditorium Suite:</td><td><strong>${venue.name}</strong></td></tr>
                  <tr><td style="color: #94a3b8;">Seating Layout:</td><td>${venue.layoutSpecs} (Max ${venue.capacity} Guests)</td></tr>
                  <tr><td style="color: #94a3b8;">Show Date & Slot:</td><td><strong>${booking.bookingDate} | ${booking.timeSlot}</strong></td></tr>
                  <tr><td style="color: #94a3b8;">Occasion & Guests:</td><td>${booking.occasion} &bull; ${booking.guests} Guests</td></tr>
                  <tr><td style="color: #94a3b8;">Govt ID Registered:</td><td>${booking.govtIdType} (${booking.govtIdNumber})</td></tr>
                  <tr><td style="color: #94a3b8;">Add-ons Package:</td><td>${booking.addonsSummary || 'None'}</td></tr>
                  <tr><td style="color: #94a3b8;">Space Lease Total:</td><td><strong style="color: #10b981; font-size: 15px;">₹${booking.totalAmount} (Paid)</strong></td></tr>
                  <tr><td style="color: #94a3b8;">Venue Address:</td><td>${merchant ? merchant.address : 'Anna Nagar, Chennai'}</td></tr>
                </table>
              </div>

              <!-- House Rules -->
              <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 18px; font-size: 12px; color: #fde68a; line-height: 1.6;">
                <strong style="color: #fbbf24; font-size: 13px; display: block; margin-bottom: 6px;">🏠 Auditorium House Rules:</strong>
                • <strong>Strict No Smoking / Vaping:</strong> Acoustic wall fabrics and 4K optical sensors are sensitive.<br/>
                • <strong>Indoor Footwear:</strong> Please place outdoor shoes in the entrance organizer.<br/>
                • <strong>Max 9 Guests:</strong> 5 Motorized Recliners + 4 Bed Lounge. No overcrowding.<br/>
                • <strong>Check-in:</strong> Please produce original Govt Photo ID at the door.
              </div>

              <!-- Damage Liability Notice -->
              <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; font-size: 12px; color: #fca5a5; margin-bottom: 20px;">
                <strong>Damage Liability Policy (Indian Contract Act 1872):</strong> The hirer is 100% financially liable for any damage, mechanical tear, or liquid spillage caused to the motorized recliners, bed lounge, 4K laser projector, or Dolby Atmos equipment.
              </div>

              <!-- Contact Host on WhatsApp Button -->
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://wa.me/${cleanHostPhone}?text=Hi%20${encodeURIComponent(merchant ? merchant.brandName : 'Host')}%2C%20I%20have%20booked%20slot%20${encodeURIComponent(booking.timeSlot)}%20(Booking%20ID%3A%20${booking.bookingId})%2E%20Please%20share%20directions%2E" style="background: #25D366; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 25px; display: inline-block; font-size: 14px;">
                  💬 Chat with Host on WhatsApp for Directions
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #060911; padding: 16px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
              Private screening gathering under Section 52 of the Indian Copyright Act 1957. CineSpace India &copy; 2026. Managed by Gadget Media Care
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Customer Pass sent for ${booking.bookingId}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[Email Service Notice] Could not dispatch email: ${err.message}`);
      return { success: false, error: err.message };
    }
  },

  /**
   * 2. Send Host New Booking Alert
   */
  sendMerchantBookingAlert: async (booking, venue, merchant) => {
    if (!merchant || !merchant.email) return;
    try {
      const transporter = createTransporter(null);
      const mailOptions = {
        from: '"CineSpace Host System" <concierge@cinespace.in>',
        to: merchant.email,
        subject: `🔔 New Booking Confirmed: ${booking.bookingId} - ${booking.customerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #0f172a; color: #ffffff; padding: 20px; border-radius: 8px;">
            <h2 style="color: #10b981;">New Confirmed Booking Alert!</h2>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Check-In OTP:</strong> <span style="font-size: 18px; font-weight: bold; color: #fbbf24;">${booking.checkinOtp || '1234'}</span></p>
            <p><strong>Guest:</strong> ${booking.customerName} (${booking.customerPhone})</p>
            <p><strong>Date & Slot:</strong> ${booking.bookingDate} | ${booking.timeSlot}</p>
            <p><strong>Net Payout Payable:</strong> ₹${booking.merchantNetPayout}</p>
            <p><strong>KYC ID:</strong> ${booking.govtIdType} (${booking.govtIdNumber})</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.warn(`[Email Service Notice] Host alert skipped: ${err.message}`);
    }
  },

  /**
   * 3. Send Password Reset Link & Username Verification Email
   */
  sendPasswordResetEmail: async (targetEmail, resetUrl, username, brandName) => {
    try {
      const transporter = createTransporter(null);
      const mailOptions = {
        from: '"CineSpace Security Concierge" <security@cinespace.in>',
        to: targetEmail,
        subject: `🔑 Reset Your Password & Security PIN - CineSpace Platform`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #d97706;">
            <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 22px 20px; text-align: center;">
              <h2 style="margin: 0; color: #090d16; font-size: 22px; text-transform: uppercase;">Password Reset Request</h2>
              <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 13px; font-weight: bold;">CineSpace Security & Authentication Portal</p>
            </div>
            <div style="padding: 24px 20px;">
              <p style="font-size: 15px;">Hello <strong>${brandName || 'Cinema Host'}</strong>,</p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                We received a request to reset your account password and security PIN.
              </p>
              
              <div style="background: #111726; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px; color: #e2e8f0;">
                <span style="color: #94a3b8;">Your Registered Username / Identifier:</span><br/>
                <strong style="color: #fbbf24; font-size: 16px; font-family: monospace;">${username}</strong>
              </div>

              <div style="text-align: center; margin: 26px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #090d16; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 30px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                  👉 Click Here to Reset Password & PIN
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                Or copy and paste this link in your browser:<br/>
                <a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a>
              </p>

              <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 10px; border-radius: 4px; font-size: 12px; color: #fde68a; margin-top: 20px;">
                ⚠️ <strong>Note:</strong> This password reset link is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email.
              </div>
            </div>
            <div style="background: #060911; padding: 14px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
              CineSpace India &copy; 2026. Automated Security Notification.
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Password reset email sent to ${targetEmail}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[Email Service Notice] Could not dispatch reset email: ${err.message}`);
      return { success: false, error: err.message };
    }
  },

  /**
   * 4. Test SMTP Transporter & Send Optional Test Verification Email
   */
  testSmtpConnection: async (config, testRecipient) => {
    try {
      const transporter = createTransporter(config);
      await transporter.verify();

      const targetTo = testRecipient || (config && config.user) || 'support@gm-care.in';
      const senderUser = (config && config.user) || 'support@gm-care.in';
      const senderName = (config && config.fromName) || 'CineSpace Mail System';

      try {
        await transporter.sendMail({
          from: `"${senderName}" <${senderUser}>`,
          to: targetTo,
          subject: `✓ Google SMTP Connection Verified - CineSpace Platform`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #d97706;">
              <h2 style="color: #fbbf24; margin-top: 0;">✓ Google App Password SMTP Connected!</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                This test email confirms that your Gmail account (<strong>${senderUser}</strong>) is authenticated and ready to dispatch VIP admission passes, digital door PINs, and GST invoices to guests.
              </p>
              <div style="background: #1e293b; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; margin: 18px 0; font-size: 13px;">
                <strong>Connected Sender:</strong> ${senderName} &lt;${senderUser}&gt;<br>
                <strong>Status:</strong> Active & Ready for Production Dispatch
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                Platform Legal Entity: Gadget Media Care &bull; GSTIN: 33BCXPR4393D2Z2 &bull; Support: support@gm-care.in
              </p>
            </div>
          `
        });
      } catch (sendErr) {
        console.warn('Test send notice:', sendErr.message);
      }

      return { success: true, message: `SMTP connection verified! Authentication successful for ${senderUser}` };
    } catch (err) {
      console.error('SMTP test failure:', err.message);
      return { success: false, error: err.message || 'SMTP Authentication Failed' };
    }
  }
};

module.exports = emailService;
