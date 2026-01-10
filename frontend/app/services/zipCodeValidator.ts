/**
 * US ZIP Code Validation Service
 * Validates ZIP codes against known US postal code ranges
 */

interface ZipCodeRange {
  min: number;
  max: number;
  state: string;
  region: string;
}

// US ZIP code ranges by state/region
// Source: USPS ZIP code allocation
const US_ZIP_RANGES: ZipCodeRange[] = [
  // Northeast
  { min: 1001, max: 2791, state: 'MA', region: 'Massachusetts' },
  { min: 2801, max: 2940, state: 'RI', region: 'Rhode Island' },
  { min: 3031, max: 3897, state: 'NH', region: 'New Hampshire' },
  { min: 3901, max: 4992, state: 'ME', region: 'Maine' },
  { min: 5001, max: 5495, state: 'VT', region: 'Vermont' },
  { min: 5501, max: 5544, state: 'MA', region: 'Massachusetts' },
  { min: 5601, max: 5907, state: 'VT', region: 'Vermont' },
  { min: 6001, max: 6389, state: 'CT', region: 'Connecticut' },
  { min: 6390, max: 6390, state: 'CT', region: 'Connecticut' },
  { min: 6401, max: 6928, state: 'CT', region: 'Connecticut' },
  { min: 7001, max: 8989, state: 'NJ', region: 'New Jersey' },
  { min: 10001, max: 14975, state: 'NY', region: 'New York' },
  
  // Mid-Atlantic
  { min: 15001, max: 19640, state: 'PA', region: 'Pennsylvania' },
  { min: 19701, max: 19980, state: 'DE', region: 'Delaware' },
  { min: 20001, max: 20039, state: 'DC', region: 'Washington DC' },
  { min: 20040, max: 20167, state: 'DC', region: 'Washington DC' },
  { min: 20201, max: 20599, state: 'DC', region: 'Washington DC' },
  { min: 20601, max: 21930, state: 'MD', region: 'Maryland' },
  { min: 22001, max: 24658, state: 'VA', region: 'Virginia' },
  { min: 25001, max: 26886, state: 'WV', region: 'West Virginia' },
  
  // Southeast
  { min: 27006, max: 28909, state: 'NC', region: 'North Carolina' },
  { min: 29001, max: 29948, state: 'SC', region: 'South Carolina' },
  { min: 30001, max: 31999, state: 'GA', region: 'Georgia' },
  { min: 32004, max: 34997, state: 'FL', region: 'Florida' },
  { min: 35004, max: 36925, state: 'AL', region: 'Alabama' },
  { min: 37010, max: 38589, state: 'TN', region: 'Tennessee' },
  { min: 38601, max: 39776, state: 'MS', region: 'Mississippi' },
  { min: 40003, max: 42788, state: 'KY', region: 'Kentucky' },
  
  // Midwest
  { min: 43001, max: 45999, state: 'OH', region: 'Ohio' },
  { min: 46001, max: 47997, state: 'IN', region: 'Indiana' },
  { min: 48001, max: 49971, state: 'MI', region: 'Michigan' },
  { min: 50001, max: 52809, state: 'IA', region: 'Iowa' },
  { min: 53001, max: 54990, state: 'WI', region: 'Wisconsin' },
  { min: 55001, max: 56763, state: 'MN', region: 'Minnesota' },
  { min: 57001, max: 57799, state: 'SD', region: 'South Dakota' },
  { min: 58001, max: 58856, state: 'ND', region: 'North Dakota' },
  { min: 59001, max: 59937, state: 'MT', region: 'Montana' },
  
  // Great Plains
  { min: 60001, max: 62999, state: 'IL', region: 'Illinois' },
  { min: 63001, max: 65899, state: 'MO', region: 'Missouri' },
  { min: 66002, max: 67954, state: 'KS', region: 'Kansas' },
  { min: 68001, max: 69367, state: 'NE', region: 'Nebraska' },
  
  // South Central
  { min: 70001, max: 71232, state: 'LA', region: 'Louisiana' },
  { min: 71233, max: 72959, state: 'AR', region: 'Arkansas' },
  { min: 73001, max: 74966, state: 'OK', region: 'Oklahoma' },
  { min: 75001, max: 79999, state: 'TX', region: 'Texas' },
  
  // Mountain West
  { min: 80001, max: 81658, state: 'CO', region: 'Colorado' },
  { min: 82001, max: 83128, state: 'WY', region: 'Wyoming' },
  { min: 83201, max: 83876, state: 'ID', region: 'Idaho' },
  { min: 84001, max: 84784, state: 'UT', region: 'Utah' },
  { min: 85001, max: 86556, state: 'AZ', region: 'Arizona' },
  { min: 87001, max: 88441, state: 'NM', region: 'New Mexico' },
  { min: 88901, max: 89883, state: 'NV', region: 'Nevada' },
  
  // West Coast
  { min: 90001, max: 96162, state: 'CA', region: 'California' },
  { min: 97001, max: 97920, state: 'OR', region: 'Oregon' },
  { min: 98001, max: 99403, state: 'WA', region: 'Washington' },
  
  // Alaska & Hawaii
  { min: 99501, max: 99950, state: 'AK', region: 'Alaska' },
  { min: 96701, max: 96898, state: 'HI', region: 'Hawaii' }
];

export interface ZipCodeValidationResult {
  isValid: boolean;
  state?: string;
  region?: string;
  error?: string;
}

export class ZipCodeValidator {
  /**
   * Validates if a ZIP code is a real US ZIP code
   */
  static validateZipCode(zipCode: string): ZipCodeValidationResult {
    // Basic format validation
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return {
        isValid: false,
        error: 'ZIP code must be exactly 5 digits'
      };
    }

    const zipNum = parseInt(zipCode, 10);

    // Check against known US ZIP code ranges
    for (const range of US_ZIP_RANGES) {
      if (zipNum >= range.min && zipNum <= range.max) {
        return {
          isValid: true,
          state: range.state,
          region: range.region
        };
      }
    }

    // Special cases for military/diplomatic ZIP codes
    if (this.isMilitaryZipCode(zipNum)) {
      return {
        isValid: true,
        state: 'Military',
        region: 'Military/Diplomatic'
      };
    }

    return {
      isValid: false,
      error: 'This ZIP code is not recognized as a valid US postal code'
    };
  }

  /**
   * Check if ZIP code is for military/diplomatic use
   */
  private static isMilitaryZipCode(zipNum: number): boolean {
    // APO (Army Post Office) ZIP codes: 09001-09999
    // FPO (Fleet Post Office) ZIP codes: 09001-09999  
    // DPO (Diplomatic Post Office) ZIP codes: 09001-09999
    return (zipNum >= 9001 && zipNum <= 9999);
  }

  /**
   * Get state abbreviation from ZIP code
   */
  static getStateFromZipCode(zipCode: string): string | null {
    const result = this.validateZipCode(zipCode);
    return result.isValid ? result.state || null : null;
  }

  /**
   * Get region name from ZIP code
   */
  static getRegionFromZipCode(zipCode: string): string | null {
    const result = this.validateZipCode(zipCode);
    return result.isValid ? result.region || null : null;
  }

  /**
   * Check if ZIP code exists (basic range check)
   * This is a fast, offline validation
   */
  static isValidUSZipCode(zipCode: string): boolean {
    return this.validateZipCode(zipCode).isValid;
  }
}

// Export for easy use
export const validateZipCode = ZipCodeValidator.validateZipCode;
export const isValidUSZipCode = ZipCodeValidator.isValidUSZipCode;