-- ============================================================================
-- CLOUDFLARE D1 INITIAL SEED DATA
-- ============================================================================

-- 1. Pilot Flagship Host: Dolby Atmos Gold Lounge
INSERT OR REPLACE INTO merchants (
  id, username, pin, business_name, brand_name, logo_url,
  entity_type, gstin, pan_number, owner_name, phone, email,
  city, locality, address, google_maps_url,
  bank_name, bank_account_no, bank_ifsc, upi_id, commission_rate_percent,
  verification_status, inspection_notes
) VALUES (
  'MERCH-001', 'host', '1234', 'Gadget Media Care', 'Dolby Atmos Gold Lounge',
  'https://img.icons8.com/fluency/96/movie-projector.png',
  'Sole Proprietorship', '33BCXPR4393D2Z2', 'BCXPR4393D', 'Ranjith',
  '+91 86677 08711', 'support@gm-care.in',
  'Chennai', 'Anna Nagar', 'Gadget Media Care, 4th Cross Street, Anna Nagar, Chennai, Tamil Nadu - 600040.',
  'https://maps.google.com/?q=Anna+Nagar+Chennai',
  'HDFC Bank Ltd', '50200012345678', 'HDFC0000123', '8667708711@upi', 3.0,
  'Approved', 'Certified 9-Guest Luxury Lounge: 5 Motorized Ergonomic Recliners + 4 Bed VIP Lounge. 4K Laser & 9.4.6 Dolby Atmos Verified.'
);

-- 2. Partner Host: Starlight Private Suites
INSERT OR REPLACE INTO merchants (
  id, username, pin, business_name, brand_name, logo_url,
  entity_type, gstin, pan_number, owner_name, phone, email,
  city, locality, address, google_maps_url,
  bank_name, bank_account_no, bank_ifsc, upi_id, commission_rate_percent,
  verification_status, inspection_notes
) VALUES (
  'MERCH-002', 'starlight', '1234', 'Starlight Acoustic Theaters Pvt Ltd', 'Starlight Private Suites',
  'https://img.icons8.com/fluency/96/film-reel.png',
  'Private Limited Company', '29AAECS5678K1ZQ', 'AAECS5678K', 'Vikram S.',
  '+91 98450 11223', 'vikram@starlightsuites.in',
  'Bengaluru', 'Indiranagar', 'Plot 45, 100ft Road, Indiranagar, Bengaluru, Karnataka - 560038.',
  'https://maps.google.com/?q=Indiranagar+Bengaluru',
  'ICICI Bank Ltd', '000205015678', 'ICIC0000002', 'starlighttheaters@upi', 5.0,
  'Approved', 'Verified 8-seat motorized recliner suite with optical starlight ceiling.'
);

-- 3. Venues / Suites
INSERT OR REPLACE INTO venues (
  id, merchant_id, name, layout_specs, av_specs, capacity, base_price,
  photos_json, video_url, image_url, description, average_rating, total_reviews
) VALUES (
  'VEN-001', 'MERCH-001', 'Dolby Atmos Gold Lounge (5 Recliners + 4 Bed Lounge)',
  '5 Motorized Ergonomic Recliner Sofas + Plush 4-Guest VIP Bed Lounge',
  '4K RGB Laser + 9.4.6 Dolby Atmos Spatial Audio + 180" Micro-Perforated Screen',
  9, 4999.0,
  '["https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80"]',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
  'The pinnacle of bespoke cinematic luxury with 5 motorized ergonomic recliners and a rear 4-guest velvet bed lounge. Acoustically treated for reference-level Dolby Atmos immersion.',
  4.95, 48
);

INSERT OR REPLACE INTO venues (
  id, merchant_id, name, layout_specs, av_specs, capacity, base_price,
  photos_json, video_url, image_url, description, average_rating, total_reviews
) VALUES (
  'VEN-002', 'MERCH-002', 'Starlight Constellation Suite',
  '8 Motorized Plush Recliners + Starlight Optical Ceiling',
  '4K HDR Laser + 7.2.4 Dolby Atmos Audio',
  8, 4499.0,
  '["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"]',
  '',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  'Atmospheric private screening lounge with optic fiber starlight ceiling and high-end surround sound.',
  4.9, 32
);

-- 4. Initial Verified Booking & Payout Settlement
INSERT OR REPLACE INTO bookings (
  id, booking_id, venue_id, merchant_id, customer_name, customer_phone, customer_email,
  booking_date, time_slot, guests_count, occasion, checkin_otp, govt_id_type, govt_id_number,
  damage_liability_accepted, addons_json, total_amount, platform_commission, merchant_net_payout,
  razorpay_order_id, razorpay_payment_id, payment_status, checkin_status
) VALUES (
  'BKG-001', 'CS-7842', 'VEN-001', 'MERCH-001', 'Ananya Deshmukh', '+91 98765 43210', 'ananya@example.com',
  '2026-08-18', 'Prime Evening (06:00 PM - 09:00 PM)', 7, 'Birthday Celebration',
  '8492', 'Aadhaar Card', '5678', 1,
  '["Caramel Popcorn & Artisanal Drinks Tub (₹899)", "VIP Celebration Decor (₹1299)"]',
  4999.0, 150.0, 4731.0,
  'order_demo_123', 'pay_demo_456', 'Paid', 'Pending Check-In'
);

INSERT OR REPLACE INTO settlements (
  id, settlement_id, booking_id, merchant_id, show_date, gross_total,
  platform_fee_deducted, net_payable_to_merchant, settlement_status, payout_utr
) VALUES (
  'SETT-001', 'SETT-8921', 'CS-7842', 'MERCH-001', '2026-08-18', 4999.0,
  150.0, 4731.0, 'Settled', 'HDFC-UPI-99281729'
);

-- 5. Customer Review
INSERT OR REPLACE INTO reviews (
  id, venue_id, merchant_id, booking_id, customer_name, rating,
  av_rating, comfort_rating, hospitality_rating, comment
) VALUES (
  'REV-001', 'VEN-001', 'MERCH-001', 'CS-7842', 'Ananya Deshmukh', 5,
  5, 5, 5, 'Unbelievable Dolby Atmos 9.4.6 audio separation! The 5 motorized recliners and 4-bed lounge made our family birthday celebration pure luxury.'
);

-- 6. Gateway & Platform Config
INSERT OR REPLACE INTO settings (key, value) VALUES
  ('ADMIN_CREDENTIALS', '{"username":"admin","email":"support@gm-care.in","pin":"1234"}'),
  ('GATEWAY_SETTINGS', '{"keyId":"rzp_test_DemoCineSpace2026","keySecret":"demo_secret_key_123","webhookSecret":"demo_webhook_secret","mode":"Test Mode (Sandbox)"}');
