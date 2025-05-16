# kidsout-sdk

TypeScript SDK for the Kidsout public API

## Installation

```bash
npm install kidsout-sdk
# or
yarn add kidsout-sdk
```

## Usage

```ts
import { KidsoutSDK, SearchSittersParams } from 'kidsout-sdk';

const sdk = new KidsoutSDK();

(async () => {
  // Search for sitters
  const searchParams: SearchSittersParams = { per_page: 10, babies: false };
  const result = await sdk.searchSitters(searchParams);
  console.log(result.data); // array of sitters

  // List available perks
  const perks = await sdk.getPerks();
  console.log(perks.data);

  // List available regions
  const regions = await sdk.getRegions();
  console.log(regions.data);

  // List available currencies
  const currencies = await sdk.getCurrencies();
  console.log(currencies.data);
})();
```

## API

### new KidsoutSDK(baseURL?)

Creates a new SDK instance. Defaults to `https://api.kidsout.ru/api/v2`.

### searchSitters(params)

Search for sitters. Returns a `Promise<ListResponse<Sitter>>`.

### getPerks()

Returns a `Promise<ListResponse<Perk>>`.

### getRegions()

Returns a `Promise<ListResponse<Region>>`.

### getCurrencies()

Returns a `Promise<ListResponse<Currency>>`.

## Contributing

Feel free to open issues or submit pull requests.

## License

MIT