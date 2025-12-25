const BASE_URL = 'https://ibnux.github.io/data-indonesia'

export interface Province {
  id: string
  nama: string
}

export interface Regency {
  id: string
  id_provinsi: string
  nama: string
}

export interface District {
  id: string
  id_kabupaten: string
  nama: string
}

export interface LocationData {
  provinceName: string | null
  regencyName: string | null
  districtName: string | null
  error?: string
}

// Cache for API responses to avoid repeated calls
const cache = {
  provinces: null as Province[] | null,
  regencies: new Map<string, Regency[]>(),
  districts: new Map<string, District[]>(),
}

/**
 * Fetch all provinces
 */
export async function fetchProvinces(): Promise<Province[]> {
  if (cache.provinces) {
    return cache.provinces
  }

  try {
    const response = await fetch(`${BASE_URL}/provinsi.json`)
    if (!response.ok) throw new Error('Failed to fetch provinces')

    const data = await response.json()
    cache.provinces = data
    return data
  } catch (error) {
    console.error('Error fetching provinces:', error)
    throw error
  }
}

/**
 * Fetch regencies for a specific province
 */
export async function fetchRegencies(provinceId: string): Promise<Regency[]> {
  if (cache.regencies.has(provinceId)) {
    return cache.regencies.get(provinceId)!
  }

  try {
    const response = await fetch(`${BASE_URL}/kabupaten/${provinceId}.json`)
    if (!response.ok) throw new Error(`Failed to fetch regencies for province ${provinceId}`)

    const data = await response.json()
    cache.regencies.set(provinceId, data)
    return data
  } catch (error) {
    console.error(`Error fetching regencies for province ${provinceId}:`, error)
    throw error
  }
}

/**
 * Fetch districts for a specific regency
 */
export async function fetchDistricts(regencyId: string): Promise<District[]> {
  if (cache.districts.has(regencyId)) {
    return cache.districts.get(regencyId)!
  }

  try {
    const response = await fetch(`${BASE_URL}/kecamatan/${regencyId}.json`)
    if (!response.ok) throw new Error(`Failed to fetch districts for regency ${regencyId}`)

    const data = await response.json()
    cache.districts.set(regencyId, data)
    return data
  } catch (error) {
    console.error(`Error fetching districts for regency ${regencyId}:`, error)
    throw error
  }
}

/**
 * Get location names from NIK location codes
 * @param provinceCode - 2 digit province code (e.g., "32")
 * @param regencyCode - 2 digit regency code (e.g., "73")
 * @param districtCode - 2 digit district code (e.g., "01")
 */
export async function getLocationData(
  provinceCode: string,
  regencyCode: string,
  districtCode: string
): Promise<LocationData> {
  try {
    // Construct full IDs
    const provinceId = provinceCode
    const regencyId = provinceCode + regencyCode
    const districtId = provinceCode + regencyCode + districtCode

    // Fetch province name
    const provinces = await fetchProvinces()
    const province = provinces.find(p => p.id === provinceId)

    if (!province) {
      return {
        provinceName: null,
        regencyName: null,
        districtName: null,
        error: 'Province not found'
      }
    }

    // Fetch regency name
    const regencies = await fetchRegencies(provinceId)
    const regency = regencies.find(r => r.id === regencyId)

    if (!regency) {
      return {
        provinceName: province.nama,
        regencyName: null,
        districtName: null,
        error: 'Regency not found'
      }
    }

    // Fetch district name
    const districts = await fetchDistricts(regencyId)
    const district = districts.find(d => d.id === districtId)

    return {
      provinceName: province.nama,
      regencyName: regency.nama,
      districtName: district?.nama || null,
      error: district ? undefined : 'District not found'
    }
  } catch (error) {
    console.error('Error getting location data:', error)
    return {
      provinceName: null,
      regencyName: null,
      districtName: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
