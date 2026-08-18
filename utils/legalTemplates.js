/**
 * ============================================================================
 * STATUTORY INDIAN LEGAL & TAX COMPLIANCE TEMPLATES
 * ============================================================================
 * Defines legal agreements, tax invoice terms, and damage liability declarations
 * for Private Space & Audiovisual Infrastructure Rentals under:
 * - CGST Act 2017 (SAC 997312 - Space/Equipment Lease & SAC 998314 - Platform Fee)
 * - Indian Copyright Act, 1957 (Section 52 - Non-Commercial Private Gathering)
 * - Cinematograph Act, 1952 (Non-Theatrical Private Premise Exemption)
 * - Indian Contract Act, 1872 (Asset Bailment & Property Damage Liability)
 * - Information Technology Act, 2000 (Digital Signature & Electronic Contract)
 * ============================================================================
 */

const LEGAL_DECLARATIONS = {
  // 1. Explicit Space Rental vs Commercial Cinema Distinction
  SPACE_RENTAL_TAX_NATURE: `This document is a Tax Invoice issued exclusively for the SHORT-TERM LEASE OF PRIVATE EVENT SPACE & BESPOKE AUDIOVISUAL INFRASTRUCTURE (SAC Code 997312), and Platform Facilitation (SAC Code 998314). This transaction DOES NOT constitute commercial cinema box-office ticketing or theatrical film exhibition under the Cinematograph Act, 1952. Neither the Platform nor the Host sells film tickets or licenses content.`,

  // 2. Indian Copyright Act 1957 Non-Commercial Private Gathering
  COPYRIGHT_DISCLAIMER: `The Hirer explicitly declares that the booked suite is rented for a private, non-commercial gathering of personal friends and family members. Any audiovisual content viewed during the session is streamed lawfully via the Hirer's personal lawful OTT accounts (Netflix, Prime Video, Disney+ Hotstar, Apple TV, YouTube, etc.) or personal media under Section 52(1)(a)(i) of the Indian Copyright Act, 1957. Public broadcasting, ticket reselling, or commercial exploitation is strictly prohibited.`,

  // 3. Strict Asset & Equipment Damage Liability Policy
  DAMAGE_LIABILITY_CLAUSE: `PROPERTY & ASSET DAMAGE INDEMNITY: The Primary Hirer accepts full legal, financial, and civil liability for the care of the premises and high-end infrastructure during the rental duration. Any physical damage, fabric tear, mechanical breakdown, liquid spillage, or functional malfunction caused to the motorized sofa recliners, VIP bed lounge, 4K laser projector, micro-perforated projection screen, 9.4.6 Dolby Atmos audio equipment, gaming consoles, acoustic wall panels, or celebration decor shall be assessed by the Host and charged at full actual repair/replacement value directly to the Hirer under the Indian Contract Act, 1872.`,

  // 4. Police KYC & Law Enforcement Guidelines
  POLICE_KYC_NOTICE: `In accordance with local Police Security & Law Enforcement Guidelines, the Primary Hirer must present an original Government-issued Photo ID (Aadhaar Card, Driving License, Passport, or Voter ID) at check-in. The Host reserves the right to deny admission without refund if valid KYC is not produced or if the number of guests exceeds the maximum certified capacity.`
};

/**
 * Returns comprehensive legal rental contract
 */
function getFullLegalAgreement(merchantBrand, venueName, city) {
  return `
SHORT-TERM PRIVATE SPACE & INFRASTRUCTURE RENTAL AGREEMENT

This Agreement is digitally executed between ${merchantBrand} (hereinafter referred to as the "Host") and the Registered Guest (hereinafter referred to as the "Hirer") facilitated by the CineSpace Marketplace Platform.

1. NATURE OF SERVICE (SAC 997312):
The Host leases the private suite "${venueName}" in ${city} on a short-term basis for private gatherings, meetings, gaming, or personal family screenings. This is NOT a commercial cinema exhibition.

2. CONTENT & INTELLECTUAL PROPERTY (Indian Copyright Act, 1957):
The Hirer shall stream their own lawful content. The Host provides solely the physical space, 4K display, and sound system.

3. DAMAGE LIABILITY & SECURITY INDEMNITY:
The Hirer agrees to keep the premises, motorized recliners, bed lounges, 4K laser projectors, and Dolby Atmos audio systems in pristine condition. Any damage, stain, spillage, or breakage caused by the Hirer or accompanying guests will be charged at 100% replacement/repair cost.

4. CONDUCT & CODE OF ETHICS:
Consumption of illicit substances, commercial filming without prior written consent, smoking/vaping inside acoustically sealed lounges, or exceeding certified room capacity is strictly prohibited and subject to immediate eviction.

5. GOVERNING LAW & JURISDICTION:
This agreement is governed by the laws of the Republic of India and subject to the exclusive jurisdiction of the competent courts in ${city}.
`;
}

module.exports = {
  LEGAL_DECLARATIONS,
  getFullLegalAgreement
};
