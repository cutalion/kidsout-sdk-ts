import { describe, it, expect } from 'vitest';
import { CurrencyRateModel } from '../src/models';
import * as currencyRatesFixture from './fixtures/currency-rates.json';

describe('CurrencyRateModel', () => {
  it('should correctly parse currency rate data from fixture', () => {
    expect(currencyRatesFixture.data).toBeInstanceOf(Array);
    expect(currencyRatesFixture.data.length).toBeGreaterThan(0);

    for (const item of currencyRatesFixture.data) {
      expect(item).toHaveProperty('attributes');
      const model = new CurrencyRateModel(item.attributes);
      expect(model.from).toEqual(item.attributes.from);
      expect(model.to).toEqual(item.attributes.to);
      expect(model.rate).toEqual(item.attributes.rate);
    }
  });

  it('should handle different currency rate entries', () => {
    // Example of a specific entry if needed for more detailed testing
    const firstRateData = currencyRatesFixture.data[0]?.attributes;
    if (firstRateData) {
      const model = new CurrencyRateModel(firstRateData);
      expect(model.from).toBeDefined();
      // Add more specific assertions if structure is known
    } else {
      // Handle case where fixture might be empty or malformed for this specific check
      console.warn("Currency rates fixture doesn't have a first entry to test specifically.");
    }
  });
});
