import axios, { AxiosError } from 'axios';

/**
 * Custom error class for API-related errors.
 * It includes the HTTP status code and the original error if available.
 * @example
 * sdk.getNews({ per_page: -1 }) // Intentionally causing an error
 *   .catch(error => {
 *     if (error instanceof KidsoutApiError) {
 *       console.error(`API Error: ${error.message}, Status: ${error.status}`);
 *       if (error.originalError) console.error('Original:', error.originalError);
 *     } else {
 *       console.error('Unknown error:', error);
 *     }
 *   });
 */
export class KidsoutApiError extends Error {
  public status?: number;
  public originalError?: Error | AxiosError;

  constructor(message: string, status?: number, originalError?: Error | AxiosError) {
    super(message);
    this.name = 'KidsoutApiError';
    this.originalError = originalError;

    if (originalError && axios.isAxiosError(originalError)) {
      this.status = originalError.response?.status ?? status;
    } else {
      this.status = status;
    }

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, KidsoutApiError.prototype);
  }
}

/**
 * Custom error class for validation errors, such as invalid parameters for SDK methods.
 * It may include an array of specific validation issues.
 * @example
 * sdk.searchSitters({ date: 'invalid-date-format' })
 *   .catch(error => {
 *     if (error instanceof KidsoutValidationError) {
 *       console.error(`Validation Error: ${error.message}`);
 *       if (error.validationIssues) {
 *         error.validationIssues.forEach(issue => console.error(`- ${issue}`));
 *       }
 *     } else {
 *       console.error('Unknown error during search:', error);
 *     }
 *   });
 */
export class KidsoutValidationError extends Error {
  public validationIssues?: string[];

  constructor(message: string, validationIssues?: string[]) {
    super(message);
    this.name = 'KidsoutValidationError';
    this.validationIssues = validationIssues;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, KidsoutValidationError.prototype);
  }
}
