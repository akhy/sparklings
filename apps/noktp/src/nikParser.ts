export interface NIKParsed {
  provinceCode: string
  regencyCode: string
  districtCode: string
  birthDate: string
  birthMonth: string
  birthYear: string
  gender: 'male' | 'female'
  serialNumber: string
  isValid: boolean
  errors: string[]
}

export const parseNIK = (input: string): NIKParsed => {
  const errors: string[] = []
  const cleanInput = input.replace(/\s/g, '')

  // Validate length
  if (cleanInput.length !== 16) {
    errors.push('NIK must be exactly 16 digits')
  }

  // Validate all digits
  if (!/^\d+$/.test(cleanInput)) {
    errors.push('NIK must contain only numbers')
  }

  // Parse components
  const provinceCode = cleanInput.substring(0, 2)
  const regencyCode = cleanInput.substring(2, 4)
  const districtCode = cleanInput.substring(4, 6)
  let birthDate = cleanInput.substring(6, 8)
  const birthMonth = cleanInput.substring(8, 10)
  const birthYear = cleanInput.substring(10, 12)
  const serialNumber = cleanInput.substring(12, 16)

  // Determine gender and adjust birth date
  let gender: 'male' | 'female' = 'male'
  const birthDateNum = parseInt(birthDate)

  if (birthDateNum > 40) {
    gender = 'female'
    birthDate = (birthDateNum - 40).toString().padStart(2, '0')
  }

  // Validate date components
  const dateNum = parseInt(birthDate)
  const monthNum = parseInt(birthMonth)
  const yearNum = parseInt(birthYear)

  if (dateNum < 1 || dateNum > 31) {
    errors.push('Invalid birth date (day must be 1-31)')
  }

  if (monthNum < 1 || monthNum > 12) {
    errors.push('Invalid birth month (month must be 1-12)')
  }

  // Full year (assume 1900s for >= 25, 2000s for < 25)
  const fullYear = yearNum >= 25 ? 1900 + yearNum : 2000 + yearNum

  // Validate date exists
  const testDate = new Date(fullYear, monthNum - 1, dateNum)
  if (
    testDate.getDate() !== dateNum ||
    testDate.getMonth() !== monthNum - 1 ||
    testDate.getFullYear() !== fullYear
  ) {
    errors.push('Invalid date (date does not exist)')
  }

  return {
    provinceCode,
    regencyCode,
    districtCode,
    birthDate,
    birthMonth,
    birthYear,
    gender,
    serialNumber,
    isValid: errors.length === 0,
    errors,
  }
}

export const formatNIK = (value: string): string => {
  const clean = value.replace(/\s/g, '')
  const parts = []

  if (clean.length > 0) parts.push(clean.substring(0, 6))
  if (clean.length > 6) parts.push(clean.substring(6, 12))
  if (clean.length > 12) parts.push(clean.substring(12, 16))

  return parts.join(' ')
}

export const getFullBirthDate = (parsed: NIKParsed): Date => {
  const fullYear = parseInt(parsed.birthYear) >= 25
    ? 1900 + parseInt(parsed.birthYear)
    : 2000 + parseInt(parsed.birthYear)
  return new Date(fullYear, parseInt(parsed.birthMonth) - 1, parseInt(parsed.birthDate))
}

export const formatBirthDate = (parsed: NIKParsed): string => {
  const dateObj = getFullBirthDate(parsed)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return dateObj.toLocaleDateString('en-US', options)
}
