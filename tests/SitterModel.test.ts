import { SitterModel } from '../src/models';
import { Sitter, Avatar, ListResponse, JsonApiResource } from '../src/types';

describe('SitterModel', () => {
  const sitterData: Sitter = {
    id: '123',
    type: 'users',
    attributes: { name: 'Alice' },
  };
  const sitterDataWithRels: Sitter = {
    ...sitterData,
    relationships: {
      avatars: { data: [{ id: '123', type: 'avatars' }] },
      inaccurate_location: { data: { id: 'inacc1', type: 'inaccurate_locations' } },
      meta_tags: { data: { id: 'meta1', type: 'meta_tags' } },
    },
  };
  const avatarData: Avatar = {
    id: '123',
    type: 'avatars',
    attributes: { url: 'https://example.com/avatar.png' },
  };
  const otherAvatar: Avatar = {
    id: '456',
    type: 'avatars',
    attributes: { url: 'https://example.com/avatar2.png' },
  };
  const inaccurateLocationData: JsonApiResource<Record<string, any>> = {
    id: 'inacc1',
    type: 'inaccurate_locations',
    attributes: { foo: 'bar' },
  };
  const metaTagData: JsonApiResource<Record<string, any>> = {
    id: 'meta1',
    type: 'meta_tags',
    attributes: { baz: 'qux' },
  };

  it('returns undefined avatar when none included', () => {
    const model = new SitterModel(sitterData, []);
    expect(model.avatar).toBeUndefined();
    expect(model.inaccurateLocation).toBeUndefined();
    expect(model.metaTags).toBeUndefined();
  });

  it('returns correct relations when included', () => {
    const model = new SitterModel(
      sitterDataWithRels,
      [avatarData, otherAvatar, inaccurateLocationData, metaTagData]
    );
    expect(model.avatar).toEqual(avatarData);
    expect(model.inaccurateLocation).toEqual(inaccurateLocationData);
    expect(model.metaTags).toEqual(metaTagData);
  });

  it('static fromListResponse wraps data and included', () => {
    const resp: ListResponse<Sitter> = {
      data: [sitterDataWithRels],
      included: [avatarData, inaccurateLocationData, metaTagData],
      meta: { current_page: 1, total: 1, total_pages: 1 },
    };
    const models = SitterModel.fromListResponse(resp);
    expect(models).toHaveLength(1);
    expect(models[0]).toBeInstanceOf(SitterModel);
    expect(models[0].avatar).toEqual(avatarData);
    expect(models[0].inaccurateLocation).toEqual(inaccurateLocationData);
    expect(models[0].metaTags).toEqual(metaTagData);
  });
});