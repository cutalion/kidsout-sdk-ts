import { describe, it, expect } from 'vitest';
import { KidsoutSDK } from '../src/index';
import { KidsoutValidationError } from '../src/errors';

describe('SearchSitters parameter validation', () => {
  const sdk = new KidsoutSDK('https://api.kidsout.ru/api/v2');

  it('throws KidsoutValidationError on invalid date format', async () => {
    await expect(sdk.searchSitters({ date: '20210501' })).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          expect.stringContaining('date: Invalid date format; expected YYYY-MM-DD')
        ])
      })
    );
  });

  it('throws KidsoutValidationError on invalid start time', async () => {
    await expect(sdk.searchSitters({ start: '24:00' })).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          expect.stringContaining('start: Invalid start time; expected HH:MM')
        ])
      })
    );
  });

  it('throws KidsoutValidationError on invalid end time', async () => {
    await expect(sdk.searchSitters({ end: '9:60' })).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          expect.stringContaining('end: Invalid end time; expected HH:MM')
        ])
      })
    );
  });

  it('throws KidsoutValidationError on per_page out of range', async () => {
    await expect(sdk.searchSitters({ per_page: 0 })).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          // Zod's message for min is "Number must be greater than or equal to 1"
          // The original message was "per_page must be an integer between 1 and 1000"
          // The Zod schema has: .min(1).max(1000, "per_page must be an integer between 1 and 1000")
          // For min, if no custom message is specified, it's Zod's default.
          // Let's check the actual Zod message. My schema has:
          // page: z.number().int().min(1, "page must be an integer >= 1").optional(),
          // per_page: z.number().int().min(1).max(1000, "per_page must be an integer between 1 and 1000").optional(),
          // So for per_page:0, it should be the Zod default for min(1)
          expect.stringContaining('per_page: Number must be greater than or equal to 1')
        ])
      })
    );
     await expect(sdk.searchSitters({ per_page: 1001 })).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          expect.stringContaining('per_page: per_page must be an integer between 1 and 1000')
        ])
      })
    );
  });

  it('throws KidsoutValidationError when distance and bbox both provided', async () => {
    await expect(
      sdk.searchSitters({
        distance: 5,
        bbox: { bl: { lat: 1, lon: 2 }, tr: { lat: 3, lon: 4 } }
      })
    ).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          // This comes from a .refine() or .superRefine(), path might be an empty string or specific.
          // The refine was: path: ["distance"]
          expect.stringContaining('distance: distance and bbox are mutually exclusive')
        ])
      })
    );
  });

  it('throws KidsoutValidationError when min_rate > max_rate', async () => {
    await expect(
      sdk.searchSitters({ min_rate: 100, max_rate: 50 })
    ).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          // This comes from a .refine(), path: ["min_rate"]
          expect.stringContaining('min_rate: min_rate cannot be greater than max_rate')
        ])
      })
    );
  });

  // Example: Test for bbox structure (if bbox is present, bl and tr must have lat/lon)
  // The schema enforces this: bbox: z.object({ bl: z.object({ lat: z.number(), lon: z.number() }), tr: z.object({ lat: z.number(), lon: z.number() }) })
  // So, providing bbox: {} would fail, or bbox: { bl: {} } would fail.
  it('throws KidsoutValidationError if bbox.bl is missing lat/lon', async () => {
    await expect(
      sdk.searchSitters({ bbox: { bl: { lat: 1 } as any, tr: { lat: 1, lon: 1 } } })
    ).rejects.toThrowError(
      expect.objectContaining({
        name: 'KidsoutValidationError',
        message: 'Invalid search parameters',
        validationIssues: expect.arrayContaining([
          expect.stringContaining("bbox.bl.lon: Required")
        ])
      })
    );
  });
});