import fs from 'fs';
import path from 'path';
import axios from 'axios'; // For mocking
import { KidsoutSDK } from '../src/index';
import { KidsoutApiError } from '../src/errors';

const cassetteDir = path.resolve(__dirname, 'fixtures');

/**
 * Simple VCR helper: plays back or records API responses.
 */
async function recordOrPlayback(
  cassetteName: string,
  fn: () => Promise<any>
): Promise<any> {
  const cassettePath = path.join(cassetteDir, cassetteName);
  if (fs.existsSync(cassettePath)) {
    return JSON.parse(fs.readFileSync(cassettePath, 'utf-8'));
  } else {
    const data = await fn();
    fs.mkdirSync(cassetteDir, { recursive: true });
    try {
      fs.writeFileSync(cassettePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error during JSON.stringify or writeFileSync:', error);
      throw error; // Re-throw the error to fail the test
    }
    return data;
  }
}

describe('KidsoutSDK data endpoints (VCR)', () => {
  const sdk = new KidsoutSDK();

  it('getRegions returns regions list', async () => {
    const data = await recordOrPlayback('regions.json', () => sdk.getRegions());
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it('getCurrencies returns currencies list', async () => {
    const data = await recordOrPlayback('currencies.json', () => sdk.getCurrencies());
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it('getPerks returns perks list', async () => {
    const data = await recordOrPlayback('perks.json', () => sdk.getPerks());
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });
  
  it('getReviews returns reviews list', async () => {
    // Use a known user_id for which reviews may be empty
    const data = await recordOrPlayback('reviews.json', () =>
      sdk.getReviews({ user_id: 240466, per_page: 1 })
    );
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data).toHaveProperty('meta');
    expect(typeof data.meta.current_page).toBe('number');
  });

  it('getCurrencyRates returns currency rates list', async () => {
    const response = await recordOrPlayback('currency-rates.json', () =>
      sdk.getCurrencyRates() // Using default base for the test
    );
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    if (response.data.length > 0) { // Only check item structure if data exists
      const firstRate = response.data[0];
      expect(firstRate).toHaveProperty('id');
      expect(typeof firstRate.id).toBe('string');
      expect(firstRate).toHaveProperty('type');
      expect(firstRate.type).toBe('currency_rates');
      expect(firstRate).toHaveProperty('attributes');
      expect(typeof firstRate.attributes).toBe('object');
      expect(firstRate.attributes).toHaveProperty('from');
      expect(typeof firstRate.attributes.from).toBe('string');
      expect(firstRate.attributes).toHaveProperty('to');
      expect(typeof firstRate.attributes.to).toBe('string');
      expect(firstRate.attributes).toHaveProperty('rate');
      expect(typeof firstRate.attributes.rate).toBe('number');
    }
    // The /currencies/rates endpoint might not return meta if not paginated
    // If it's confirmed to be paginated, these checks can be added:
    // expect(response).toHaveProperty('meta');
    // expect(typeof response.meta.current_page).toBe('number');
  });

  describe('Error Handling', () => {
    it('should wrap Axios errors in KidsoutApiError', async () => {
      const sdk = new KidsoutSDK();
      const mockError = {
        isAxiosError: true,
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      // Mock axiosInstance.get to simulate an API error
      // Need to access the internal axiosInstance or mock globally
      const mockAxiosInstance = (sdk as any).axiosInstance;
      jest.spyOn(mockAxiosInstance, 'get').mockRejectedValueOnce(mockError);

      try {
        await sdk.getRegions(); // Any method that uses .get()
        fail('Expected an error to be thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(KidsoutApiError);
        expect(error.message).toBe('Not Found'); // Message from response.data.message
        expect(error.status).toBe(404);
        expect(error.originalError).toBe(mockError);
      }
    });
  });

  describe('Authentication Header', () => {
    it('should set Authorization header if apiKey is provided', () => {
      const apiKey = 'test-api-key';
      const sdkWithAuth = new KidsoutSDK('https://api.kidsout.ru/api/v2', apiKey);
      // Accessing private member for testing purposes
      const axiosInstance = (sdkWithAuth as any).axiosInstance;
      expect(axiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${apiKey}`);
    });

    it('should not set Authorization header if apiKey is not provided', () => {
      const sdkWithoutAuth = new KidsoutSDK();
      const axiosInstance = (sdkWithoutAuth as any).axiosInstance;
      expect(axiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});