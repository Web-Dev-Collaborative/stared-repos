export const SEARCH_PARAMS_ACTION_TYPES = {
  UPDATE_SEARCH_QUERY: 'UPDATE_SEARCH_QUERY',
  UPDATE_SEARCH_OFFSET: 'UPDATE_SEARCH_OFFSET',
};

/**
 * Update the value of search query.
 * @param {string} searchQuery
 */
export function updateSearchQuery(searchQuery) {
  return {
    type: SEARCH_PARAMS_ACTION_TYPES.UPDATE_SEARCH_QUERY,
    payload: searchQuery,
  };
}

/**
 * Update current search offset.
 * @param {number} offset
 */
export function updateSearchOffset(offset) {
  return {
    type: SEARCH_PARAMS_ACTION_TYPES.UPDATE_SEARCH_OFFSET,
    payload: offset,
  };
}
