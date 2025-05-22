# Changelog

All notable changes to this project will be documented in this file.

## 0.0.9 - 2025-05-22

### Documentation

- Make it module

## 0.0.8 - 2025-05-22

### Documentation

- Target es2022

## 0.0.7 - 2025-05-22

### Documentation

- Update changelog

## [0.0.6] - 2025-05-20

### Added

- `getCurrencyRates` endpoint and tests

## [0.0.5] - 2025-05-17

### Documentation

- CommonJS and dynamic import examples for Node REPL

## [0.0.4] - 2025-05-17

### Added

- `getReviews` method and `ReviewModel` with related tests

### Documentation

- `ReviewModel` usage to README
- Resource Models examples to README

## [0.0.3] - 2025-05-17

### Chore

- Release version 0.0.3

## [0.0.2] - 2025-05-17

### Added

- `SearchLocation` type and `RegionModel.searchLocation`
- Support JSON:API `include` and `fields` parameters in `searchSitters`

### CI

- Update Node.js versions in test matrix to 20.x and 22.x
- Split test matrix and single publish job in GitHub Actions workflow

## [0.0.1] - 2025-05-16

### Added

- Initial TypeScript SDK scaffold
- `searchSitters` method with validation and generic `ListResponse<Sitter>` return type
- `getRegions`, `getCurrencies`, `getPerks` methods returning `ListResponse<*>`
- VCR-style tests for search, regions, currencies, perks fixtures under `tests/fixtures`
- Domain types (`Sitter`, `Perk`, `Currency`, `Region`) and generic `ListResponse`/`ResourceResponse`
  in `src/types.ts`
- GitHub Actions workflow for automatic npm publish on semver tags

*This project adheres to [Semantic Versioning](https://semver.org/).*
