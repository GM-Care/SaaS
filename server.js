/**
 * ============================================================================
 * CINESPACE INDIA - MULTI-TENANT LUXURY PRIVATE CINEMA MARKETPLACE
 * ============================================================================
 * Full-Stack Node.js + Express + Razorpay Gateway + Webhook Engine
 * Features: 3 Dedicated Portals, 10-Photo Gallery & Video Walkthrough Manager,
 *           Brand Profile & Google Maps, 1-Click Guest Check-In & Email Reset
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./database/db');
const razorpayService = require('./services/razorpayService');
const emailService = require('./services/emailService');
const { LEGAL_DECLARATIONS, getFullLegalAgreement } = require('./utils/legalTemplates');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // Preserve raw body for Webhook Signature Verification
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// DEDICATED PORTAL ROUTES (CLOUDFLARE / BROWSER ROUTING)
// ============================================================================

// 1. Customer Marketplace Portal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Dedicated Merchant SaaS Portal
app.get('/merchant', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'merchant.html'));
});

// 3. Dedicated Master Admin Control Center
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 4. Secure Password Reset Page
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// ============================================================================
// AUTHENTICATION & PASSWORD RESET VIA EMAIL APIS
// ============================================================================

/**
 * Request Password Reset Email Link
 */
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });

    const resetEntry = db.createPasswordResetToken(email);

    if (!resetEntry) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    const hostHeader = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const resetUrl = `${protocol}://${hostHeader}/reset-password?token=${resetEntry.token}`;

    emailService.sendPasswordResetEmail(
      resetEntry.email,
      resetUrl,
      resetEntry.username,
      resetEntry.name
    );

    res.json({
      success: true,
      message: `Password reset link sent to ${resetEntry.email}. Please check your inbox or spam folder.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Verify Password Reset Token
 */
app.get('/api/auth/verify-reset-token', (req, res) => {
  try {
    const { token } = req.query;
    const verified = db.verifyPasswordResetToken(token);

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid or already used password reset link.' });
    }

    if (verified.expired) {
      return res.status(400).json({ success: false, message: 'This password reset link has expired (15-min validity).' });
    }

    res.json({
      success: true,
      tokenData: {
        role: verified.role,
        username: verified.username,
        name: verified.name,
        email: verified.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Complete Password & PIN Reset
 */
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword, newPin } = req.body;
    if (!token || !newPassword || !newPin) {
      return res.status(400).json({ success: false, message: 'Token, new password, and new PIN are required.' });
    }

    const result = db.resetPasswordWithToken(token, newPassword, newPin);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      message: `Password and PIN reset successfully for ${result.username}!`,
      role: result.role
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// PUBLIC & MARKETPLACE API ROUTES
// ============================================================================

/**
 * 1. Public App Configuration & Razorpay Public Key
 */
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    platformName: process.env.PLATFORM_NAME || 'CineSpace India - Luxury Private Theaters',
    razorpayKeyId: razorpayService.getKeyId(),
    defaultCommissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || '10.0'),
    defaultSupportPhone: process.env.DEFAULT_SUPPORT_WHATSAPP || '+91 86677 08711',
    legalDeclarations: LEGAL_DECLARATIONS,
    houseRules: db.getHouseRules()
  });
});

/**
 * 2. Get All Verified Venues with Multi-city, Capacity, and Rating Filters
 */
app.get('/api/marketplace/venues', (req, res) => {
  try {
    const { city, minCapacity, merchantId, includeUnverified } = req.query;
    const venues = db.getVenues({
      city,
      minCapacity,
      merchantId,
      includeUnverified: includeUnverified === 'true'
    });
    res.json({ success: true, count: venues.length, venues });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Get Single Venue Details, Slots, Addons, Media & Customer Reviews
 */
app.get('/api/marketplace/venue/:id', (req, res) => {
  try {
    const venue = db.getVenueById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    const merchant = db.getMerchantById(venue.merchantId);
    const slots = db.getTimeSlots();
    const addons = db.getAddons();
    const reviews = db.getReviews(venue.id);

    res.json({
      success: true,
      venue,
      merchant: merchant ? {
        brandName: merchant.brandName,
        businessName: merchant.businessName,
        logo: merchant.logo,
        gstin: merchant.gstin,
        city: merchant.city,
        locality: merchant.locality,
        address: merchant.address,
        googleMapsUrl: merchant.googleMapsUrl,
        phone: merchant.phone,
        verificationStatus: merchant.verificationStatus,
        inspectionNotes: merchant.inspectionNotes
      } : null,
      slots,
      addons,
      reviews,
      houseRules: db.getHouseRules()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. Check Real-Time Slot Availability for a Venue and Date
 */
app.get('/api/slots/availability', (req, res) => {
  try {
    const { venueId, date } = req.query;
    if (!venueId || !date) {
      return res.status(400).json({ success: false, message: 'venueId and date required' });
    }
    const slots = db.getAvailableSlots(venueId, date);
    res.json({ success: true, venueId, date, slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. Get Customer Reviews for a Venue
 */
app.get('/api/reviews/venue/:id', (req, res) => {
  try {
    const reviews = db.getReviews(req.params.id);
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. Submit Customer Rating & Feedback
 */
app.post('/api/reviews/submit', (req, res) => {
  try {
    const {
      venueId,
      merchantId,
      bookingId,
      customerName,
      rating,
      avRating,
      comfortRating,
      hospitalityRating,
      comment
    } = req.body;

    if (!venueId || !rating) {
      return res.status(400).json({ success: false, message: 'Venue ID and Rating are required' });
    }

    const review = db.submitReview({
      venueId,
      merchantId,
      bookingId,
      customerName,
      rating: Number(rating),
      avRating: Number(avRating) || Number(rating),
      comfortRating: Number(comfortRating) || Number(rating),
      hospitalityRating: Number(hospitalityRating) || Number(rating),
      comment
    });

    res.json({
      success: true,
      message: 'Thank you for your review! Your rating has been published.',
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. Get Full Legal Space Rental Agreement for a Venue
 */
app.get('/api/legal-agreement', (req, res) => {
  const { venueId } = req.query;
  const venue = venueId ? db.getVenueById(venueId) : null;
  const merchant = venue ? db.getMerchantById(venue.merchantId) : null;

  const agreement = getFullLegalAgreement(
    merchant ? merchant.brandName : 'Partner Cinema Host',
    venue ? venue.name : 'Private Theater Suite',
    venue ? venue.city : 'India'
  );
  res.json({ success: true, agreement });
});

// ============================================================================
// PAYMENTS & BOOKINGS API (RAZORPAY + CUSTOM MERCHANT COMMISSION)
// ============================================================================

/**
 * 8. Create Razorpay Order with Individual Merchant Commission Calculation
 */
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const {
      venueId,
      bookingDate,
      timeSlot,
      guests,
      adultsCount,
      minorsCount,
      occasion,
      selectedAddons = [],
      customerName,
      customerPhone,
      customerEmail,
      govtIdType,
      govtIdNumber,
      specialRequests
    } = req.body;

    const venue = db.getVenueById(venueId);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    const merchant = db.getMerchantById(venue.merchantId);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

    const availableSlots = db.getAvailableSlots(venueId, bookingDate);
    const targetSlot = availableSlots.find(s => s.name.trim() === String(timeSlot).trim());
    if (!targetSlot || !targetSlot.isAvailable) {
      return res.status(400).json({ success: false, message: 'This slot is already reserved or unavailable.' });
    }

    const allAddons = db.getAddons();
    let addonsTotal = 0;
    const addonsSummaryList = [];
    selectedAddons.forEach(addonId => {
      const item = allAddons.find(a => a.id === addonId);
      if (item) {
        addonsTotal += item.price;
        addonsSummaryList.push(item.name + ` (₹${item.price})`);
      }
    });

    const merchantCommissionRate = merchant.commissionRatePercent || 10.0;

    const financialSplit = razorpayService.calculateFinancialSplit(
      venue.basePrice,
      addonsTotal,
      merchantCommissionRate
    );

    const tempReceiptId = 'REC-' + Date.now().toString(36).toUpperCase();

    const razorpayOrder = await razorpayService.createOrder(
      financialSplit.totalPayable,
      tempReceiptId,
      {
        venueId: venue.id,
        merchantId: merchant.id,
        merchantCommissionRate: merchantCommissionRate,
        bookingDate,
        timeSlot,
        customerPhone
      }
    );

    const tempBooking = db.createBooking({
      venueId: venue.id,
      merchantId: merchant.id,
      venueName: venue.name,
      customerName,
      customerPhone,
      customerEmail,
      govtIdType,
      govtIdNumber,
      adultsCount,
      minorsCount,
      bookingDate,
      timeSlot,
      guests: Number(guests) || 1,
      occasion: occasion || 'Movie Screening',
      addons: selectedAddons,
      addonsSummary: addonsSummaryList.join(', ') || 'None',
      
      baseAmount: financialSplit.baseAmount,
      addonsAmount: financialSplit.addonsAmount,
      subTotal: financialSplit.subTotal,
      commissionRatePercent: merchantCommissionRate,
      platformFee: financialSplit.platformFee,
      pgFee: financialSplit.pgFee,
      merchantNetPayout: financialSplit.merchantNetPayout,
      totalAmount: financialSplit.totalPayable,

      razorpayOrderId: razorpayOrder.orderId,
      paymentStatus: 'Awaiting Razorpay Payment',
      bookingStatus: 'Blocked',
      specialRequests: specialRequests || '',
      legalAgreementAccepted: true,
      damageLiabilityAccepted: true
    });

    res.json({
      success: true,
      bookingId: tempBooking.bookingId,
      checkinOtp: tempBooking.checkinOtp,
      razorpayOrderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.keyId,
      financialSplit,
      venue: {
        name: venue.name,
        city: venue.city,
        address: merchant.address
      }
    });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 9. Verify Razorpay Payment & Confirm Booking (Dispatches Dynamic Merchant Email)
 */
app.post('/api/payments/verify', async (req, res) => {
  try {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    const booking = db.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking record not found' });

    const isValidSignature = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return res.status(400).json({ success: false, message: 'Razorpay signature verification failed.' });
    }

    const confirmedBooking = db.updateBookingPayment(bookingId, razorpayPaymentId, razorpaySignature);
    const venue = db.getVenueById(confirmedBooking.venueId);
    const merchant = db.getMerchantById(confirmedBooking.merchantId);

    emailService.sendCustomerConfirmationPass(confirmedBooking, venue, merchant);
    emailService.sendMerchantBookingAlert(confirmedBooking, venue, merchant);

    res.json({
      success: true,
      message: 'Payment verified successfully! VIP Admission Pass generated.',
      booking: confirmedBooking,
      venue,
      merchant: {
        brandName: merchant.brandName,
        phone: merchant.phone,
        address: merchant.address,
        upiId: merchant.upiId
      }
    });

  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 10. Razorpay Automated Webhook Handler
 */
app.post('/api/payments/webhook', (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const booking = db.getBookingByOrderId(orderId);
      if (booking && booking.bookingStatus !== 'Confirmed') {
        const confirmed = db.updateBookingPayment(booking.bookingId, paymentId, signature || 'webhook_captured');
        const venue = db.getVenueById(confirmed.venueId);
        const merchant = db.getMerchantById(confirmed.merchantId);

        emailService.sendCustomerConfirmationPass(confirmed, venue, merchant);
        emailService.sendMerchantBookingAlert(confirmed, venue, merchant);
        console.log(`[Razorpay Webhook] Booking ${confirmed.bookingId} confirmed via ${event}.`);
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * 11. Lookup Booking / VIP Pass by ID or Phone
 */
app.get('/api/bookings/lookup', (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Please provide Booking ID or Phone Number' });

    const matches = db.lookupBooking(query);
    if (matches.length === 0) return res.json({ success: false, message: 'No reservation found' });

    const latest = matches[matches.length - 1];
    const venue = db.getVenueById(latest.venueId);
    const merchant = db.getMerchantById(latest.merchantId);

    res.json({
      success: true,
      booking: latest,
      venue,
      merchant: merchant ? {
        brandName: merchant.brandName,
        phone: merchant.phone,
        address: merchant.address,
        gstin: merchant.gstin
      } : null,
      houseRules: db.getHouseRules()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// MERCHANT ONBOARDING, PROFILE, MEDIA & DASHBOARD
// ============================================================================

/**
 * 12. Host Door Check-in Verification
 */
app.post('/api/merchant/verify-checkin', (req, res) => {
  try {
    const { bookingId, checkinOtp } = req.body;
    const result = db.verifyGuestCheckin(bookingId, checkinOtp);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Guest checked in successfully! Door PIN verified.`,
      booking: result.booking
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 13. Merchant Update Brand Profile & Google Maps URL
 */
app.post('/api/merchant/update-profile', (req, res) => {
  try {
    const { merchantId, pin, brandName, logo, city, locality, address, googleMapsUrl, phone, email, upiId } = req.body;
    const merchant = db.getMerchantById(merchantId);

    if (!merchant || (merchant.pin !== String(pin).trim() && merchant.password !== String(pin).trim())) {
      return res.status(401).json({ success: false, message: 'Invalid Security PIN or Password' });
    }

    const updated = db.updateMerchantProfile(merchantId, {
      brandName,
      logo,
      city,
      locality,
      address,
      googleMapsUrl,
      phone,
      email,
      upiId
    });

    res.json({
      success: true,
      message: 'Host profile, logo, and location updated successfully!',
      merchant: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 14. Merchant Update Space Media (Up to 10 Photos & 1 Video)
 */
app.post('/api/merchant/update-space-media', (req, res) => {
  try {
    const { merchantId, venueId, pin, name, layoutSpecs, avSpecs, basePrice, capacity, description, image, photos, videoUrl } = req.body;
    const merchant = db.getMerchantById(merchantId);

    if (!merchant || (merchant.pin !== String(pin).trim() && merchant.password !== String(pin).trim())) {
      return res.status(401).json({ success: false, message: 'Invalid Security PIN or Password' });
    }

    const updatedVenue = db.updateVenueMediaAndDetails(venueId, merchantId, {
      name,
      layoutSpecs,
      avSpecs,
      basePrice,
      capacity,
      description,
      image,
      photos,
      videoUrl
    });

    if (!updatedVenue) {
      return res.status(404).json({ success: false, message: 'Venue not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Auditorium photos gallery & video walkthrough saved!',
      venue: updatedVenue
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 15. Merchant Registration / List Your Space
 */
app.post('/api/merchants/register', (req, res) => {
  try {
    const {
      entityType,
      businessName,
      brandName,
      logo,
      username,
      password,
      gstin,
      panNumber,
      ownerName,
      phone,
      email,
      city,
      locality,
      address,
      googleMapsUrl,
      bankAccountName,
      bankName,
      bankAccountNumber,
      bankIfsc,
      upiId,
      pin,
      venueName,
      capacity,
      layoutSpecs,
      avSpecs,
      basePrice,
      description,
      image,
      photos,
      videoUrl
    } = req.body;

    if (!businessName || !phone || !city) {
      return res.status(400).json({ success: false, message: 'Business Name, Phone, and City are required' });
    }

    const merchant = db.createMerchant({
      entityType,
      businessName,
      brandName: brandName || businessName,
      logo: logo || 'https://img.icons8.com/fluency/96/movie-projector.png',
      username: username || email,
      password: password || 'password123',
      gstin,
      panNumber,
      ownerName,
      phone,
      email,
      city,
      locality: locality || '',
      address,
      googleMapsUrl: googleMapsUrl || '',
      bankAccountName,
      bankName,
      bankAccountNumber,
      bankIfsc,
      upiId,
      pin: pin || '1234'
    });

    const venue = db.createVenue({
      merchantId: merchant.id,
      name: venueName || `${brandName || businessName} Suite`,
      brandName: merchant.brandName,
      city: merchant.city,
      locality: merchant.locality,
      capacity: Number(capacity) || 9,
      layoutSpecs: layoutSpecs || '5 Motorized Recliners + 4 Bed Lounge',
      avSpecs: avSpecs || '4K Laser + Dolby Atmos 9.4.6',
      basePrice: Number(basePrice) || 4999,
      description: description || 'Luxury private screening lounge.',
      image: image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      photos: photos || [image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'],
      videoUrl: videoUrl || '',
      verificationStatus: 'Pending Verification'
    });

    res.json({
      success: true,
      message: 'Cinema listed! Awaiting admin infrastructure verification before public publishing.',
      merchant,
      venue
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 16. Merchant Portal Dashboard (Username / Password or PIN Authenticated)
 */
app.post('/api/merchant/dashboard', (req, res) => {
  try {
    const { username, password, pin, merchantId } = req.body;
    
    let merchant = null;
    if (merchantId) {
      merchant = db.getMerchantById(merchantId);
      if (merchant && pin && merchant.pin !== String(pin).trim() && merchant.password !== String(pin).trim()) {
        merchant = null;
      }
    } else {
      merchant = db.findMerchantByCredentials(username, password || pin);
    }

    if (!merchant) {
      return res.status(401).json({ success: false, message: 'Invalid Username, Password, or Security PIN' });
    }

    const venues = db.getVenues({ merchantId: merchant.id, includeUnverified: true });
    const settlements = db.getMerchantSettlements(merchant.id);
    const reviews = db.getMerchantReviews(merchant.id);
    const merchantBookings = (db.bookings || []).filter(b => b.merchantId === merchant.id);

    const totalRevenue = merchantBookings
      .filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked-In')
      .reduce((sum, b) => sum + (b.merchantNetPayout || 0), 0);

    res.json({
      success: true,
      merchant,
      venues,
      reviews,
      bookings: merchantBookings.reverse(),
      settlements: settlements.reverse(),
      stats: {
        totalBookings: merchantBookings.length,
        confirmedBookings: merchantBookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked-In').length,
        totalNetEarnings: totalRevenue,
        totalReviewsCount: reviews.length,
        averageRating: reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '5.0',
        pendingPayouts: settlements.filter(s => s.settlementStatus === 'Pending Transfer').reduce((sum, s) => sum + s.netPayableToMerchant, 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 17. Merchant: Update Username, Password & Security PIN
 */
app.post('/api/merchant/update-credentials', (req, res) => {
  try {
    const { merchantId, currentSecret, newUsername, newPassword, newPin } = req.body;
    const merchant = db.getMerchantById(merchantId);

    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

    const isMatch = merchant.pin === String(currentSecret).trim() || merchant.password === String(currentSecret).trim();
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password or PIN is incorrect.' });
    }

    const updated = db.updateMerchantCredentials(merchantId, newUsername, newPassword, newPin);

    res.json({
      success: true,
      message: 'Account credentials updated successfully!',
      merchant: {
        id: updated.id,
        username: updated.username,
        pin: updated.pin
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 18. Merchant Update SMTP Settings
 */
app.post('/api/merchant/smtp-settings', (req, res) => {
  try {
    const { pin, merchantId, smtpUser, smtpPass, fromName } = req.body;
    const merchant = db.getMerchantById(merchantId);

    if (!merchant || (merchant.pin !== String(pin).trim() && merchant.password !== String(pin).trim())) {
      return res.status(401).json({ success: false, message: 'Invalid Security PIN or Password' });
    }

    const updated = db.updateMerchantSmtp(merchantId, {
      host: 'smtp.gmail.com',
      port: 587,
      user: smtpUser,
      pass: smtpPass,
      fromName: fromName || merchant.brandName
    });

    res.json({ success: true, message: 'SMTP settings updated successfully!', merchant: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 19. Test Merchant SMTP Connection
 */
app.post('/api/merchant/test-smtp', async (req, res) => {
  try {
    const { smtpUser, smtpPass } = req.body;
    const result = await emailService.testSmtpConnection({
      host: 'smtp.gmail.com',
      port: 587,
      user: smtpUser,
      pass: smtpPass
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// MASTER ADMIN APIS (CREDENTIALS, GATEWAY, VERIFICATION & COMMISSIONS)
// ============================================================================

/**
 * 20. Master Admin Dashboard Login & Data Fetch
 */
app.post('/api/admin/dashboard', (req, res) => {
  try {
    const { pin, password } = req.body;
    const inputAuth = password || pin;

    if (!db.verifyAdminAuth(inputAuth)) {
      return res.status(401).json({ success: false, message: 'Invalid Master Admin Password or PIN' });
    }

    const stats = db.getMasterStats();
    const merchants = db.getMerchants();
    const venues = db.getVenues({ includeUnverified: true });
    const allReviews = db.getReviews();
    const allSettlements = db.getAllSettlements().reverse();
    const allBookings = (db.bookings || []).slice(-50).reverse();
    const gatewaySettings = db.getGatewaySettings();
    const adminCreds = db.getAdminCredentials();

    res.json({
      success: true,
      stats,
      adminInfo: {
        username: adminCreds.username,
        email: adminCreds.email,
        pin: adminCreds.pin
      },
      merchants,
      venues,
      reviews: allReviews,
      settlements: allSettlements,
      recentBookings: allBookings,
      gatewaySettings: {
        keyId: gatewaySettings.keyId,
        keySecret: gatewaySettings.keySecret ? '••••••••' + gatewaySettings.keySecret.slice(-4) : '',
        webhookSecret: gatewaySettings.webhookSecret ? '••••••••' : '',
        mode: gatewaySettings.mode
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 21. Master Admin: Change Admin Username, Password, and PIN
 */
app.post('/api/admin/update-credentials', (req, res) => {
  try {
    const { currentAuth, newUsername, newPassword, newPin } = req.body;

    if (!db.verifyAdminAuth(currentAuth)) {
      return res.status(401).json({ success: false, message: 'Current Master Password / PIN is incorrect.' });
    }

    const updated = db.updateAdminCredentials(newUsername, newPassword, newPin);

    res.json({
      success: true,
      message: 'Master Admin credentials updated successfully!',
      adminInfo: {
        username: updated.username,
        email: updated.email,
        pin: updated.pin
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 22. Master Admin: Reset Any Merchant's Password or PIN
 */
app.post('/api/admin/reset-merchant-credentials', (req, res) => {
  try {
    const { currentAuth, merchantId, newPassword, newPin } = req.body;

    if (!db.verifyAdminAuth(currentAuth)) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin PIN' });
    }

    const updated = db.updateMerchantCredentials(merchantId, null, newPassword, newPin);
    if (!updated) return res.status(404).json({ success: false, message: 'Merchant ID not found' });

    res.json({
      success: true,
      message: `Credentials for ${updated.brandName} reset successfully!`,
      merchant: {
        id: updated.id,
        username: updated.username,
        pin: updated.pin
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 23. Master Admin: Update Razorpay Gateway Credentials & Webhook Secret
 */
app.post('/api/admin/gateway-settings', (req, res) => {
  try {
    const { pin, keyId, keySecret, webhookSecret } = req.body;

    if (!db.verifyAdminAuth(pin)) {
      return res.status(401).json({ success: false, message: 'Invalid Master Admin PIN' });
    }

    if (!keyId || !keySecret) {
      return res.status(400).json({ success: false, message: 'Key ID and Key Secret are required.' });
    }

    const updated = db.updateGatewaySettings({ keyId, keySecret, webhookSecret });

    res.json({
      success: true,
      message: `Razorpay Credentials updated! Switched to ${updated.mode}.`,
      gatewaySettings: {
        keyId: updated.keyId,
        mode: updated.mode
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 24. Master Admin: Audit & Verify/Approve Merchant Infrastructure
 */
app.post('/api/admin/merchant/verify-infrastructure', (req, res) => {
  try {
    const { pin, merchantId, status, notes, commissionRatePercent } = req.body;

    if (!db.verifyAdminAuth(pin)) {
      return res.status(401).json({ success: false, message: 'Invalid Master Admin PIN' });
    }

    const updated = db.verifyMerchantInfrastructure(
      merchantId,
      status || 'Approved',
      notes,
      commissionRatePercent
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Merchant ID not found' });
    }

    res.json({
      success: true,
      message: `Infrastructure for ${updated.brandName} is now ${status}! Commission set to ${updated.commissionRatePercent}%.`,
      merchant: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 25. Master Admin: Update Individual Merchant Commission Rate (%)
 */
app.post('/api/admin/merchant/update-commission', (req, res) => {
  try {
    const { pin, merchantId, commissionRatePercent } = req.body;

    if (!db.verifyAdminAuth(pin)) {
      return res.status(401).json({ success: false, message: 'Invalid Master Admin PIN' });
    }

    const newRate = parseFloat(commissionRatePercent);
    if (isNaN(newRate) || newRate < 0 || newRate > 50) {
      return res.status(400).json({ success: false, message: 'Invalid commission rate' });
    }

    const updated = db.updateMerchantCommission(merchantId, newRate);
    if (!updated) return res.status(404).json({ success: false, message: 'Merchant ID not found' });

    res.json({
      success: true,
      message: `Commission rate for ${updated.brandName} updated to ${newRate}%`,
      merchant: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 26. Master Admin: Settle Payout
 */
app.post('/api/admin/settle-payout', (req, res) => {
  try {
    const { pin, settlementId, utr } = req.body;

    if (!db.verifyAdminAuth(pin)) {
      return res.status(401).json({ success: false, message: 'Invalid Master Admin PIN' });
    }

    const updated = db.markSettlementPaid(settlementId, utr || 'BANK-TRANSFER');
    if (!updated) return res.status(404).json({ success: false, message: 'Settlement ID not found' });

    res.json({ success: true, message: 'Payout settlement marked as Settled', settlement: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`🎬 CineSpace Marketplace SaaS Live on: http://localhost:${PORT}`);
  console.log(`📸 10-Photo Gallery & Video Walkthrough Manager Enabled`);
  console.log(`📍 Brand Logo, Address & Google Maps Location Link Active`);
  console.log(`🔑 Master Admin & Merchant Credential Management Enabled`);
  console.log(`==================================================================`);
});
