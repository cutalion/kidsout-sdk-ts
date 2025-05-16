import { RegionModel } from '../src/models';
import { Region, Place, ListResponse, SearchLocation } from '../src/types';

describe('RegionModel', () => {
  const regionData: Region = {
    id: '1',
    type: 'regions',
    attributes: { name: 'Testville' },
  };
  const regionWithRel: Region = {
    ...regionData,
    relationships: {
      default_place: { data: { id: 'p1', type: 'places' } },
    },
  };
  const placeData: Place = {
    id: 'p1',
    type: 'places',
    attributes: { address: '123 Test St' },
  };
  const otherPlace: Place = {
    id: 'p2',
    type: 'places',
    attributes: { address: '456 Other Rd' },
  };
  
  const searchLocationData: SearchLocation = {
    address: 'Test address',
    latitude: 1,
    longitude: 2,
    viewport: {
      lower_left: { latitude: 0, longitude: 0 },
      upper_right: { latitude: 3, longitude: 4 },
    },
  };
  const regionWithSearch: Region = {
    ...regionData,
    attributes: {
      ...regionData.attributes,
      search_location: searchLocationData,
    },
  };

  it('returns undefined defaultPlace when none included', () => {
    const model = new RegionModel(regionData, []);
    expect(model.defaultPlace).toBeUndefined();
  });

  it('returns correct defaultPlace when included', () => {
    const model = new RegionModel(regionWithRel, [placeData, otherPlace]);
    expect(model.defaultPlace).toEqual(placeData);
  });

  it('static fromListResponse wraps data and included', () => {
    const resp: ListResponse<Region> = {
      data: [regionWithRel],
      included: [placeData],
      meta: { current_page: 1, total: 1, total_pages: 1 },
    };
    const models = RegionModel.fromListResponse(resp);
    expect(models).toHaveLength(1);
    expect(models[0]).toBeInstanceOf(RegionModel);
    expect(models[0].defaultPlace).toEqual(placeData);
  });
  
  it('returns searchLocation from attributes', () => {
    const model = new RegionModel(regionWithSearch, [placeData]);
    expect(model.searchLocation).toEqual(searchLocationData);
  });
});