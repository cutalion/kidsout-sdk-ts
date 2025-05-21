# kidsout-sdk

TypeScript SDK for the Kidsout public API

## Installation

```bash
npm install kidsout-sdk
# or
yarn add kidsout-sdk
```

## Usage

```js
// ES module import (in .js files or environments that support ESM)
import { KidsoutSDK, SearchSittersParams } from 'kidsout-sdk';

// CommonJS require (default in Node.js REPL or .js files without "type": "module")
const { KidsoutSDK: SDK, SearchSittersParams: Params } = require('kidsout-sdk');

// Dynamic import (Node.js REPL supports top-level await)
const { KidsoutSDK: SDK2 } = await import('kidsout-sdk');

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

## Key Features

*   **Modern TypeScript Support**: Built with TypeScript for a better developer experience, including type safety and autocompletion.
*   **Zod-based Parameter Validation**: Robust validation for method parameters (e.g., `searchSitters`) using Zod, providing clear error messages for invalid inputs.
*   **Enhanced Error Handling**: The SDK provides structured error objects (`KidsoutApiError`, `KidsoutValidationError`) for better error diagnostics. See JSDoc on these error classes for usage examples.
*   **API Key Authentication**: Supports API key authentication by passing an optional `apiKey` to the SDK constructor. See JSDoc for the `KidsoutSDK` constructor for details.
*   **Typed Models & Specific Attributes**: Includes TypeScript models for API resources (e.g., `SitterModel`, `RegionModel`), offering more specific attribute types and helper methods to access related data.
*   **JSON:API Relationship Handling**: Model classes provide convenient getters for accessing related resources from the `included` data in API responses.

## Resource Models

For easier access to related resources, use the provided model classes:

```ts
import {
  KidsoutSDK,
  SearchSittersParams,
  SitterModel,
  RegionModel,
  ReviewModel,
} from 'kidsout-sdk';

const sdk = new KidsoutSDK();

(async () => {
  // Search sitters with included relationships
  const resp = await sdk.searchSitters({
    include: ['avatars', 'inaccurate_location', 'meta_tags'],
    per_page: 5,
  });
  // Wrap raw sitter objects into models
  const sitters = SitterModel.fromListResponse(resp);
  for (const sitter of sitters) {
    console.log('Sitter ID:', sitter.id);
    console.log('Name:', sitter.attributes.name);
    console.log('Avatar URL:', sitter.avatar?.attributes.url);
    console.log('Inaccurate Location:', sitter.inaccurateLocation?.attributes);
    console.log('Meta Tags:', sitter.metaTags?.attributes);
  }

  // List regions with default place and search location
  const regResp = await sdk.getRegions();
  const regions = RegionModel.fromListResponse(regResp);
  for (const region of regions) {
    console.log('Region:', region.attributes.name);
    console.log('Default Place:', region.defaultPlace?.attributes);
    console.log('Search Location:', region.searchLocation);
  }
  
  // Fetch user reviews
  const revResp = await sdk.getReviews({ user_id: 240466, per_page: 5 });
  const reviews = ReviewModel.fromListResponse(revResp);
  for (const review of reviews) {
    console.log('Review:', review.attributes);
  }
})();
```

## API

### new KidsoutSDK(baseURL?, apiKey?)

Creates a new SDK instance.
- `baseURL` (optional): Defaults to `https://api.kidsout.ru/api/v2`.
- `apiKey` (optional): Your API key for authentication. If provided, it sets the `Authorization: Bearer <apiKey>` header for all requests.

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

### Publishing and Versioning

We follow [Semantic Versioning](https://semver.org/). To release a new version:
1. Update code and merge into `main`.
2. Bump version and tag via `npm version [patch|minor|major]`.
3. Push commits and tags: `git push --follow-tags origin main`.
4. GitHub Actions will automatically publish to npm on tagged releases.

#### Local npm Authentication
Create an `.npmrc` file (in your project root or home directory) with:
```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```
Then export your `NPM_TOKEN` in the shell or via an untracked `.env` file:
```bash
export NPM_TOKEN=your_token_here
```
Do not commit your token to version control.

## License

MIT