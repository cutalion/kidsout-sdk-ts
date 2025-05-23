# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in `dist/`
- **Test**: `npm test` - Runs Jest test suite
- **Run single test file**: `npm test -- <filename>` (e.g., `npm test -- SitterModel.test.ts`)

## Architecture

This is a TypeScript SDK for the Kidsout API with the following key patterns:

### Core SDK Structure
- **KidsoutSDK class** (`src/index.ts`): Main entry point with HTTP client (axios) and API endpoints
- **Zod validation**: Search parameters are validated using Zod schemas before API calls
- **Error handling**: Custom error classes (`KidsoutApiError`, `KidsoutValidationError`) with axios interceptors

### Data Models
- **Base model pattern**: `BaseModel` class provides common JSON:API resource handling
- **Resource models**: `SitterModel`, `RegionModel`, `ReviewModel` wrap API responses with helper methods
- **Relationship handling**: Models provide getters to access related resources from `included` data
- **Type-safe attributes**: Each model has strongly-typed attribute interfaces

### API Response Format
- Follows JSON:API specification
- `ListResponse<T>` wrapper for paginated endpoints
- `included` array contains related resources referenced by relationships
- Models use `_getRelatedResource()` helper to resolve relationships from included data

### Test Structure
- Uses Jest with ts-jest preset
- Test fixtures in `tests/fixtures/` contain sample API responses
- Tests validate both model behavior and parameter validation
- Uses axios-mock-adapter for HTTP mocking

### Key Files
- `src/types.ts`: All TypeScript interfaces and type definitions
- `src/models.ts`: Resource model classes with relationship handling
- `src/errors.ts`: Custom error classes
- `swagger.json`: API specification reference