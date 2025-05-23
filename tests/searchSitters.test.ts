import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { KidsoutSDK, SitterModel } from '../src/index'; // Import SitterModel

const CASSETTE_PATH = path.resolve(__dirname, 'fixtures', 'searchSitters.json');

describe('KidsoutSDK.searchSitters E2E with VCR', () => {
  it('returns sitters list and records real response as fixture', async () => {
    let data: any;
    if (fs.existsSync(CASSETTE_PATH)) {
      data = JSON.parse(fs.readFileSync(CASSETTE_PATH, 'utf-8'));
    } else {
      const sdk = new KidsoutSDK();
      data = await sdk.searchSitters({ per_page: 1 });
      fs.mkdirSync(path.dirname(CASSETTE_PATH), { recursive: true });
      fs.writeFileSync(CASSETTE_PATH, JSON.stringify(data, null, 2));
    }
    // JSON:API format: data array is returned
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    // Pagination metadata should be present
    expect(data).toHaveProperty('meta');
    expect(typeof data.meta.current_page).toBe('number');

    // Verify that the response can be processed by SitterModel
    if (data.data.length > 0) {
      const models = SitterModel.fromListResponse(data);
      expect(models[0]).toBeInstanceOf(SitterModel);
      // Optionally, check a very stable attribute if one exists across all fixture entries
      // For example, checking if attributes object exists:
      expect(models[0].attributes).toBeDefined();
    }
  });
});