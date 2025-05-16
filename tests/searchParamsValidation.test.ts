import { KidsoutSDK } from '../src/index';

describe('SearchSitters parameter validation', () => {
  const sdk = new KidsoutSDK('https://api.kidsout.ru/api/v2');

  it('throws on invalid date format', async () => {
    await expect(sdk.searchSitters({ date: '20210501' })).rejects.toThrow(
      'Invalid date format; expected YYYY-MM-DD'
    );
  });

  it('throws on invalid start time', async () => {
    await expect(sdk.searchSitters({ start: '24:00' })).rejects.toThrow(
      'Invalid start time; expected HH:MM'
    );
  });

  it('throws on invalid end time', async () => {
    await expect(sdk.searchSitters({ end: '9:60' })).rejects.toThrow(
      'Invalid end time; expected HH:MM'
    );
  });

  it('throws on per_page out of range', async () => {
    await expect(sdk.searchSitters({ per_page: 0 })).rejects.toThrow(
      'per_page must be an integer between 1 and 1000'
    );
  });

  it('throws when distance and bbox both provided', async () => {
    await expect(
      sdk.searchSitters({
        distance: 5,
        bbox: { bl: { lat: 1, lon: 2 }, tr: { lat: 3, lon: 4 } }
      })
    ).rejects.toThrow('distance and bbox are mutually exclusive');
  });
});