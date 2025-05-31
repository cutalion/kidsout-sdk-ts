import { KidsoutSDK } from '../dist/index.js';

const sdk = new KidsoutSDK('https://api.kidsout.ru/api/v2', 'your-api-key');

// Include avatars in the search request
const sitters = await sdk.searchSitters({
  page: 1,
  per_page: 10,
  include: ['avatars'] // This ensures avatar data is included in the response
});

console.log(sitters);

// ===== LAZY LOADING STRATEGIES =====

// Strategy 1: Simple lazy loading with async generators
async function* lazyLoadAvatars(sitters) {
  for (const sitter of sitters.data) {
    if (sitter.relationships?.avatars?.data?.[0]) {
      // Find the avatar in included resources
      const avatarId = sitter.relationships.avatars.data[0].id;
      const avatar = sitters.included?.find(
        item => item.type === 'avatars' && item.id === avatarId
      );
      
      if (avatar?.attributes?.image?.url) {
        // Simulate loading delay (remove in production)
        await new Promise(resolve => setTimeout(resolve, 100));
        yield {
          sitterId: sitter.id,
          sitterName: sitter.attributes.name,
          avatarUrl: avatar.attributes.image.url,
          thumbUrl: avatar.attributes.image.thumb,
          mediumUrl: avatar.attributes.image.medium
        };
      }
    }
  }
}

// Strategy 2: Load avatars on demand with caching
class AvatarLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }
  
  async getAvatar(sitter, included) {
    const sitterId = sitter.id;
    
    // Return cached result if available
    if (this.cache.has(sitterId)) {
      return this.cache.get(sitterId);
    }
    
    // Return existing promise if already loading
    if (this.loading.has(sitterId)) {
      return this.loading.get(sitterId);
    }
    
    // Start loading
    const loadPromise = this._loadAvatar(sitter, included);
    this.loading.set(sitterId, loadPromise);
    
    try {
      const result = await loadPromise;
      this.cache.set(sitterId, result);
      return result;
    } finally {
      this.loading.delete(sitterId);
    }
  }
  
  async _loadAvatar(sitter, included) {
    if (!sitter.relationships?.avatars?.data?.[0]) {
      return null;
    }
    
    const avatarId = sitter.relationships.avatars.data[0].id;
    const avatar = included?.find(
      item => item.type === 'avatars' && item.id === avatarId
    );
    
    if (!avatar?.attributes?.image?.url) {
      return null;
    }
    
    // Simulate loading delay (remove in production)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      sitterId: sitter.id,
      sitterName: sitter.attributes.name,
      avatarUrl: avatar.attributes.image.url,
      thumbUrl: avatar.attributes.image.thumb,
      mediumUrl: avatar.attributes.image.medium
    };
  }
}

// Strategy 3: Batch loading with size limits
async function loadAvatarsBatch(sitters, batchSize = 3) {
  const results = [];
  const sittersData = sitters.data;
  
  for (let i = 0; i < sittersData.length; i += batchSize) {
    const batch = sittersData.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (sitter) => {
      if (!sitter.relationships?.avatars?.data?.[0]) {
        return null;
      }
      
      const avatarId = sitter.relationships.avatars.data[0].id;
      const avatar = sitters.included?.find(
        item => item.type === 'avatars' && item.id === avatarId
      );
      
      if (!avatar?.attributes?.image?.url) {
        return null;
      }
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        sitterId: sitter.id,
        sitterName: sitter.attributes.name,
        avatarUrl: avatar.attributes.image.url,
        thumbUrl: avatar.attributes.image.thumb,
        mediumUrl: avatar.attributes.image.medium
      };
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean));
    
    console.log(`Loaded batch ${Math.floor(i / batchSize) + 1}, ${batchResults.filter(Boolean).length} avatars`);
  }
  
  return results;
}

// ===== USAGE EXAMPLES =====

console.log('\n=== Strategy 1: Async Generator (One by One) ===');
for await (const avatar of lazyLoadAvatars(sitters)) {
  console.log(`Loaded avatar for ${avatar.sitterName}:`, avatar.thumbUrl);
}

console.log('\n=== Strategy 2: Cached On-Demand Loading ===');
const avatarLoader = new AvatarLoader();

// Load avatars as needed
const firstSitter = sitters.data[0];
const secondSitter = sitters.data[1];

if (firstSitter) {
  const avatar1 = await avatarLoader.getAvatar(firstSitter, sitters.included);
  console.log('First avatar:', avatar1);
  
  // Loading same avatar again should be instant (cached)
  const avatar1Cached = await avatarLoader.getAvatar(firstSitter, sitters.included);
  console.log('First avatar (cached):', avatar1Cached);
}

if (secondSitter) {
  const avatar2 = await avatarLoader.getAvatar(secondSitter, sitters.included);
  console.log('Second avatar:', avatar2);
}

console.log('\n=== Strategy 3: Batch Loading ===');
const batchedAvatars = await loadAvatarsBatch(sitters, 3);
console.log('All avatars loaded in batches:', batchedAvatars);


