# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1] - 2025-05-16

### Added
- Initial TypeScript SDK scaffold
- `searchSitters` method with validation and generic `ListResponse<Sitter>` return type
- `getRegions`, `getCurrencies`, `getPerks` methods returning `ListResponse<*>`
- VCR-style tests for search, regions, currencies, perks fixtures under `tests/fixtures`
- Domain types (`Sitter`, `Perk`, `Currency`, `Region`) and generic `ListResponse`/`ResourceResponse` in `src/types.ts`
- GitHub Actions workflow for automatic npm publish on semver tags

*This project adheres to [Semantic Versioning](https://semver.org/).* 
