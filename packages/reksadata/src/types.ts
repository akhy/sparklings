/**
 * Indonesian mutual fund types (Jenis Reksa Dana)
 */
export type FundType = string

/**
 * Mutual fund entry
 */
export interface Fund {
  /**
   * Fund code (e.g., "BPAM001")
   */
  code: string

  /**
   * Product name (e.g., "BNI-AM Dana Likuid")
   */
  productName: string

  /**
   * Investment manager / Manajer Investasi (e.g., "PT BNI Asset Management")
   */
  investmentManager: string

  /**
   * Fund type/category
   */
  fundType: FundType
}

/**
 * Collection of all funds
 */
export interface FundsData {
  /**
   * Array of all mutual funds
   */
  funds: Fund[]

  /**
   * Metadata about the dataset
   */
  metadata: {
    /**
     * Total number of funds
     */
    count: number

    /**
     * Last update date (ISO 8601)
     */
    lastUpdated: string

    /**
     * Data source
     */
    source: string
  }
}
