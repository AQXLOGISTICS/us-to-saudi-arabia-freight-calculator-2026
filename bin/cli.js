#!/usr/bin/env node

/**
 * AQX Logistics CLI Tool
 * Calculate US to GCC & Global Air Freight Landed Costs
 */

const { calculateFreight } = require('../index');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--weight' || arg === '-w') options.weightKg = parseFloat(args[++i]);
    else if (arg === '--length' || arg === '-l') options.lengthInches = parseFloat(args[++i]);
    else if (arg === '--width') options.widthInches = parseFloat(args[++i]);
    else if (arg === '--height' || arg === '-h') options.heightInches = parseFloat(args[++i]);
    else if (arg === '--country' || arg === '-c') options.destinationCountry = args[++i];
    else if (arg === '--value' || arg === '-v') options.declaredValueUsd = parseFloat(args[++i]);
    else if (arg === '--category') options.category = args[++i];
  }

  return options;
}

const opts = parseArgs();
const result = calculateFreight(opts);

console.log('\n============================================================');
console.log('✈️  AQX LOGISTICS - AIR FREIGHT & LANDED COST CALCULATOR');
console.log('   Gateway: Los Angeles, CA (LAX) | https://aqxlogistics.com');
console.log('============================================================');
console.log(`📍 Destination:           ${result.destination} (${result.countryCode}) [${result.transitTime}]`);
console.log(`📦 Chargeable Weight:     ${result.weightMetrics.chargeableWeightKg} kg (Actual: ${result.weightMetrics.actualWeightKg} kg, Vol: ${result.weightMetrics.volumetricWeightKg} kg)`);
console.log(`⚡ Applied Pricing Tier:   ${result.rateTier.tierName}`);
console.log('------------------------------------------------------------');
console.log(`💵 Item Declared Value:   $${result.financialsUsd.declaredValue.toFixed(2)} USD`);
console.log(`✈️  Air Freight Shipping:  $${result.financialsUsd.freightCost.toFixed(2)} USD`);
console.log(`🛃 Customs Duty:          $${result.financialsUsd.customsDuty.toFixed(2)} USD`);
console.log(`🏷️  VAT / Consumption Tax: $${result.financialsUsd.vat.toFixed(2)} USD`);
console.log('------------------------------------------------------------');
console.log(`🚀 TOTAL LANDED DDP COST: $${result.financialsUsd.totalLandedCost.toFixed(2)} USD (${result.financialsLocal.totalLandedCost.toFixed(2)} ${result.financialsLocal.currency})`);
console.log(`🎉 CA Sales Tax Saved:    $${result.financialsUsd.californiaSalesTaxSaved.toFixed(2)} USD (0% California locker exemption)`);
console.log('============================================================');
console.log('🔗 Free Locker Setup:     https://aqxlogistics.com/register');
console.log('============================================================\n');
