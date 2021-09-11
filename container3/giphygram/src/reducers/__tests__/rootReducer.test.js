import { rootReducer } from '../rootReducer';
import { defaultSearchParams } from '../searchParamsReducer';
import { defaultSearchResults } from '../searchResultsReducer';
import { defaultLayoutSetting } from '../layoutReducer';

describe('rootReducer', () => {
  it('should generate default state correctly', () => {
    const state = {};
    const action = {
      type: 'unknown',
      payload: null,
    };
    expect(rootReducer(state, action)).toBeDefined();
    expect(rootReducer(state, action).searchParams).toEqual(defaultSearchParams);
    expect(rootReducer(state, action).searchResults).toEqual(defaultSearchResults);
    expect(rootReducer(state, action).layout).toEqual(defaultLayoutSetting);
  });
});
