import fundsData from './data/funds.json'
import type { Fund, FundsData, FundType } from './types'

// Export types
export type { Fund, FundsData, FundType }

// Export the full dataset
export const data: FundsData = fundsData as FundsData

// Export just the funds array for convenience
export const funds: Fund[] = data.funds

// Export metadata
export const metadata = data.metadata

/**
 * Find a fund by its code
 */
export function findByCode(code: string): Fund | undefined {
  return funds.find(f => f.code === code)
}

/**
 * Filter funds by type
 */
export function filterByType(fundType: FundType): Fund[] {
  return funds.filter(f => f.fundType === fundType)
}

/**
 * Filter funds by investment manager
 */
export function filterByManager(investmentManager: string): Fund[] {
  return funds.filter(f => f.investmentManager === investmentManager)
}

/**
 * Search funds by product name (case-insensitive)
 */
export function searchByName(query: string): Fund[] {
  const lowerQuery = query.toLowerCase()
  return funds.filter(f => f.productName.toLowerCase().includes(lowerQuery))
}

/**
 * Get all unique fund types
 */
export function getFundTypes(): FundType[] {
  return Array.from(new Set(funds.map(f => f.fundType)))
}

/**
 * Get all unique investment managers
 */
export function getInvestmentManagers(): string[] {
  return Array.from(new Set(funds.map(f => f.investmentManager))).sort()
}
