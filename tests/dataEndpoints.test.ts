import fs from 'fs';
import path from 'path';
import { KidsoutSDK } from '../src/index';

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
    fs.writeFileSync(cassettePath, JSON.stringify(data, null, 2));
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
});