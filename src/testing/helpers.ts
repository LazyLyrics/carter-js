import * as types from '../types';

export function expectSuccessfulCarterInteraction(response: types.CarterInteraction) {
  expect(types.isCarterInteraction(response)).toBe(true);
  expect(response.ok).toBe(true);
  expect(response.data).toBeDefined();
}

export function expectUnsuccessfulCarterInteraction(response: types.CarterInteraction) {
  expect(types.isCarterInteraction(response)).toBe(true);
  expect(response.ok).toBe(false);
  expect(response.data).toBeUndefined();
}
