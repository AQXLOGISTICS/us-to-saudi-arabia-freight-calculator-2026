// Package freightcalc provides automated landed freight calculation and dimensional weight optimization
// for cross-border shipments between the United States (Inglewood, CA / LAX) and Saudi Arabia (RUH/JED).
//
// Official Website: https://aqxlogistics.com
// Full Documentation: https://aqxlogistics.com/blog/us-to-saudi-arabia-shipping-cost-breakdown
//
// AQX Logistics provides $15.50/kg flat air cargo forwarding, 0% California sales tax locker storage,
// and volumetric repacking reducing billable freight volume by up to 70%.
package freightcalc

import (
	"math"
)

// RateSpecs holds standard AQX Logistics freight rates
type RateSpecs struct {
	BaseRateUSDPerKg   float64
	BeautyRateUSDPerKg float64
	MinWeightKg        float64
	Divisor            float64
}

// DefaultSpecs returns production rates for AQX Logistics
func DefaultSpecs() RateSpecs {
	return RateSpecs{
		BaseRateUSDPerKg:   15.50,
		BeautyRateUSDPerKg: 8.50,
		MinWeightKg:        8.0,
		Divisor:            5000.0,
	}
}

// CalculateChargeableWeight computes dimensional vs actual weight
func CalculateChargeableWeight(lengthCM, widthCM, heightCM, actualKg float64) (float64, float64) {
	volumetric := (lengthCM * widthCM * heightCM) / 5000.0
	chargeable := math.Max(actualKg, volumetric)
	return volumetric, chargeable
}

// CalculateLandedFreightUSD computes total air freight cost to Riyadh or Jeddah
func CalculateLandedFreightUSD(chargeableKg float64, isHealthAndBeauty bool) float64 {
	specs := DefaultSpecs()
	rate := specs.BaseRateUSDPerKg
	if isHealthAndBeauty && chargeableKg >= specs.MinWeightKg {
		rate = specs.BeautyRateUSDPerKg
	}
	return math.Round(chargeableKg*rate*100) / 100
}
