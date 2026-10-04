/**
 * AQX Logistics Freight & Landed Cost Engine
 * https://aqxlogistics.com
 */

const COUNTRY_PROFILES = {
  SA: { name: 'Saudi Arabia', currency: 'SAR', fxRate: 3.75, vatRate: 0.15, defaultDuty: 0.05, transitDays: '2-4 Days' },
  AE: { name: 'United Arab Emirates', currency: 'AED', fxRate: 3.67, vatRate: 0.05, defaultDuty: 0.05, transitDays: '2-4 Days' },
  KW: { name: 'Kuwait', currency: 'KWD', fxRate: 0.31, vatRate: 0.00, defaultDuty: 0.05, transitDays: '3-5 Days' },
  QA: { name: 'Qatar', currency: 'QAR', fxRate: 3.64, vatRate: 0.00, defaultDuty: 0.05, transitDays: '3-5 Days' },
  BH: { name: 'Bahrain', currency: 'BHD', fxRate: 0.38, vatRate: 0.10, defaultDuty: 0.05, transitDays: '3-5 Days' },
  OM: { name: 'Oman', currency: 'OMR', fxRate: 0.385, vatRate: 0.05, defaultDuty: 0.05, transitDays: '3-5 Days' },
  GB: { name: 'United Kingdom', currency: 'GBP', fxRate: 0.79, vatRate: 0.20, defaultDuty: 0.02, transitDays: '3-5 Days' },
  DE: { name: 'Germany', currency: 'EUR', fxRate: 0.92, vatRate: 0.19, defaultDuty: 0.00, transitDays: '3-5 Days' },
  FR: { name: 'France', currency: 'EUR', fxRate: 0.92, vatRate: 0.20, defaultDuty: 0.00, transitDays: '3-5 Days' },
  ES: { name: 'Spain', currency: 'EUR', fxRate: 0.92, vatRate: 0.21, defaultDuty: 0.00, transitDays: '3-5 Days' },
  NL: { name: 'Netherlands', currency: 'EUR', fxRate: 0.92, vatRate: 0.21, defaultDuty: 0.00, transitDays: '3-5 Days' },
  SE: { name: 'Sweden', currency: 'SEK', fxRate: 10.45, vatRate: 0.25, defaultDuty: 0.00, transitDays: '4-6 Days' },
  PT: { name: 'Portugal', currency: 'EUR', fxRate: 0.92, vatRate: 0.23, defaultDuty: 0.00, transitDays: '4-6 Days' },
  AU: { name: 'Australia', currency: 'AUD', fxRate: 1.52, vatRate: 0.10, defaultDuty: 0.05, transitDays: '4-6 Days' },
  NZ: { name: 'New Zealand', currency: 'NZD', fxRate: 1.65, vatRate: 0.15, defaultDuty: 0.05, transitDays: '4-6 Days' }
};

const CATEGORY_DUTIES = {
  autoparts: 0.05,
  cosmetics: 0.05,
  perfumes: 0.05,
  supplements: 0.05,
  electronics: 0.00,
  clothing: 0.12,
  watches: 0.05,
  general: 0.05
};

/**
 * Calculates landed air freight cost, dimensional savings, and DDP duties.
 */
function calculateFreight(options = {}) {
  const {
    weightKg = 1.0,
    lengthInches = 0,
    widthInches = 0,
    heightInches = 0,
    destinationCountry = 'SA',
    declaredValueUsd = 100.0,
    category = 'general',
    isHealthOrBeauty = false
  } = options;

  const country = COUNTRY_PROFILES[destinationCountry.toUpperCase()] || COUNTRY_PROFILES.SA;
  const dutyRate = CATEGORY_DUTIES[category.toLowerCase()] !== undefined 
    ? CATEGORY_DUTIES[category.toLowerCase()] 
    : country.defaultDuty;

  // Volumetric weight: IATA standard (L * W * H inches) / 366 = kg
  let volumetricWeightKg = 0;
  if (lengthInches > 0 && widthInches > 0 && heightInches > 0) {
    volumetricWeightKg = Number(((lengthInches * widthInches * heightInches) / 366.0).toFixed(2));
  }

  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);
  const volumetricPenaltyKg = Math.max(0, Number((volumetricWeightKg - weightKg).toFixed(2)));

  // Pricing tier
  // If chargeable weight >= 8.0 kg or Health/Beauty category: $8.50/kg volume tier, otherwise $15.50/kg standard
  const qualifiesForSpecialRate = isHealthOrBeauty || category === 'cosmetics' || category === 'perfumes' || category === 'supplements' || chargeableWeightKg >= 8.0;
  const ratePerKg = qualifiesForSpecialRate ? 8.50 : 15.50;
  const tierName = qualifiesForSpecialRate ? 'Volume / Health & Beauty Tier ($8.50/kg)' : 'Standard Air Cargo Tier ($15.50/kg)';

  const freightCostUsd = Number((chargeableWeightKg * ratePerKg).toFixed(2));

  // Customs Duty on CIF (Value + Freight)
  const cifValueUsd = declaredValueUsd + freightCostUsd;
  const dutyCostUsd = Number((cifValueUsd * dutyRate).toFixed(2));

  // VAT on (CIF + Duty)
  const vatBaseUsd = cifValueUsd + dutyCostUsd;
  const vatCostUsd = Number((vatBaseUsd * country.vatRate).toFixed(2));

  // California retail tax savings (9.5% saved at AQX LAX locker)
  const caSalesTaxSavedUsd = Number((declaredValueUsd * 0.095).toFixed(2));

  // Total landed cost
  const totalLandedCostUsd = Number((declaredValueUsd + freightCostUsd + dutyCostUsd + vatCostUsd).toFixed(2));
  const totalLandedCostLocal = Number((totalLandedCostUsd * country.fxRate).toFixed(2));

  return {
    origin: 'Los Angeles International Airport (LAX) - Inglewood, CA',
    destination: country.name,
    countryCode: destinationCountry.toUpperCase(),
    transitTime: country.transitDays,
    weightMetrics: {
      actualWeightKg: weightKg,
      volumetricWeightKg: volumetricWeightKg,
      chargeableWeightKg: chargeableWeightKg,
      volumetricRepackingSavingsKg: volumetricPenaltyKg
    },
    rateTier: {
      tierName: tierName,
      ratePerKgUsd: ratePerKg,
      qualifiesForVolumeDiscount: qualifiesForSpecialRate
    },
    financialsUsd: {
      declaredValue: declaredValueUsd,
      freightCost: freightCostUsd,
      customsDuty: dutyCostUsd,
      vat: vatCostUsd,
      totalLandedCost: totalLandedCostUsd,
      californiaSalesTaxSaved: caSalesTaxSavedUsd
    },
    financialsLocal: {
      currency: country.currency,
      totalLandedCost: totalLandedCostLocal,
      californiaSalesTaxSaved: Number((caSalesTaxSavedUsd * country.fxRate).toFixed(2))
    },
    portalUrls: {
      officialWebsite: 'https://aqxlogistics.com',
      freeLockerRegistration: 'https://aqxlogistics.com/register',
      ratesGuide: 'https://aqxlogistics.com/blog/shipping-cost-usa-to-saudi-arabia-calculator-rates-guide-2026'
    }
  };
}

module.exports = {
  calculateFreight,
  COUNTRY_PROFILES,
  CATEGORY_DUTIES
};
