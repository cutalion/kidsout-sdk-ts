import { KidsoutSDK, SitterModel } from '../dist/index.js';

const sdk = new KidsoutSDK('https://api.kidsout.ru/api/v2', 'your-api-key');

// Search for sitters and include avatars
const response = await sdk.searchSitters({
  page: 1,
  per_page: 10,
  include: ['avatars'] // Include avatar data
});

// Convert to model instances for easier access
const sitters = SitterModel.fromListResponse(response);

console.log(`Found ${sitters.length} sitters`);

// ===== LAZY LOADING WITH MODELS =====

// Strategy 1: Simple lazy loading with models
async function* lazyLoadAvatarsWithModels(sitters) {
  for (const sitter of sitters) {
    const avatar = sitter.avatar;
    if (avatar?.attributes?.image?.url) {
      // Simulate loading delay (network request, image processing, etc.)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      yield {
        sitterId: sitter.id,
        sitterName: sitter.attributes.name || 'Unknown',
        avatar: {
          url: avatar.attributes.image.url,
          thumb: avatar.attributes.image.thumb,
          medium: avatar.attributes.image.medium
        }
      };
    }
  }
}

// Strategy 2: On-demand avatar loader with caching (using models)
class ModelAvatarLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }
  
  async loadAvatar(sitter) {
    const sitterId = sitter.id;
    
    // Return cached result
    if (this.cache.has(sitterId)) {
      return this.cache.get(sitterId);
    }
    
    // Prevent duplicate loading
    if (this.loading.has(sitterId)) {
      // Wait for ongoing load to complete
      while (this.loading.has(sitterId)) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.cache.get(sitterId);
    }
    
    this.loading.add(sitterId);
    
    try {
      const avatar = sitter.avatar;
      if (!avatar?.attributes?.image?.url) {
        return null;
      }
      
      // Simulate image loading/processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = {
        sitterId: sitter.id,
        sitterName: sitter.attributes.name || 'Unknown',
        avatarData: {
          url: avatar.attributes.image.url,
          thumb: avatar.attributes.image.thumb,
          medium: avatar.attributes.image.medium
        },
        loadedAt: new Date().toISOString()
      };
      
      this.cache.set(sitterId, result);
      return result;
    } finally {
      this.loading.delete(sitterId);
    }
  }
  
  // Load multiple avatars with concurrency control
  async loadAvatarsBatch(sitters, concurrency = 3) {
    const results = [];
    
    for (let i = 0; i < sitters.length; i += concurrency) {
      const batch = sitters.slice(i, i + concurrency);
      const batchPromises = batch.map(sitter => this.loadAvatar(sitter));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults.filter(Boolean));
      console.log(`Batch ${Math.floor(i / concurrency) + 1}: Loaded ${batchResults.filter(Boolean).length} avatars`);
    }
    
    return results;
  }
  
  // Get cache statistics
  getCacheStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size
    };
  }
}

// Strategy 3: Virtual scrolling / pagination approach
class VirtualAvatarLoader {
  constructor(sitters, viewportSize = 5) {
    this.sitters = sitters;
    this.viewportSize = viewportSize;
    this.cache = new Map();
    this.currentIndex = 0;
  }
  
  async getVisibleAvatars() {
    const start = this.currentIndex;
    const end = Math.min(start + this.viewportSize, this.sitters.length);
    const visibleSitters = this.sitters.slice(start, end);
    
    const avatarPromises = visibleSitters.map(async (sitter) => {
      if (this.cache.has(sitter.id)) {
        return this.cache.get(sitter.id);
      }
      
      const avatar = sitter.avatar;
      if (!avatar?.attributes?.image?.url) {
        return null;
      }
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = {
        sitterId: sitter.id,
        sitterName: sitter.attributes.name || 'Unknown',
        avatar: {
          url: avatar.attributes.image.url,
          thumb: avatar.attributes.image.thumb,
          medium: avatar.attributes.image.medium
        },
        index: this.sitters.indexOf(sitter)
      };
      
      this.cache.set(sitter.id, result);
      return result;
    });
    
    return (await Promise.all(avatarPromises)).filter(Boolean);
  }
  
  next() {
    if (this.currentIndex + this.viewportSize < this.sitters.length) {
      this.currentIndex += this.viewportSize;
      return true;
    }
    return false;
  }
  
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - this.viewportSize);
      return true;
    }
    return false;
  }
  
  hasNext() {
    return this.currentIndex + this.viewportSize < this.sitters.length;
  }
  
  hasPrevious() {
    return this.currentIndex > 0;
  }
}

// ===== USAGE EXAMPLES =====

console.log('\n=== Strategy 1: Async Generator with Models ===');
let count = 0;
for await (const avatarData of lazyLoadAvatarsWithModels(sitters)) {
  console.log(`${++count}. ${avatarData.sitterName}: ${avatarData.avatar.thumb}`);
}

console.log('\n=== Strategy 2: Cached On-Demand Loading ===');
const avatarLoader = new ModelAvatarLoader();

// Load first few avatars
if (sitters.length > 0) {
  const firstAvatar = await avatarLoader.loadAvatar(sitters[0]);
  console.log('First avatar:', firstAvatar);
  
  // Load same avatar again (should be cached)
  const cachedAvatar = await avatarLoader.loadAvatar(sitters[0]);
  console.log('Cached avatar (same as above):', cachedAvatar);
  
  console.log('Cache stats:', avatarLoader.getCacheStats());
}

// Load batch of avatars
console.log('\n--- Batch Loading ---');
const batchResults = await avatarLoader.loadAvatarsBatch(sitters.slice(0, 6), 2);
console.log(`Loaded ${batchResults.length} avatars in batches`);
console.log('Final cache stats:', avatarLoader.getCacheStats());

console.log('\n=== Strategy 3: Virtual Scrolling ===');
const virtualLoader = new VirtualAvatarLoader(sitters, 3);

// Load first viewport
let currentAvatars = await virtualLoader.getVisibleAvatars();
console.log('First viewport:', currentAvatars.map(a => `${a.index}: ${a.sitterName}`));

// Move to next viewport if available
if (virtualLoader.hasNext()) {
  virtualLoader.next();
  currentAvatars = await virtualLoader.getVisibleAvatars();
  console.log('Next viewport:', currentAvatars.map(a => `${a.index}: ${a.sitterName}`));
}

// Move back to previous viewport
if (virtualLoader.hasPrevious()) {
  virtualLoader.previous();
  currentAvatars = await virtualLoader.getVisibleAvatars();
  console.log('Previous viewport (should be cached):', currentAvatars.map(a => `${a.index}: ${a.sitterName}`));
} 
