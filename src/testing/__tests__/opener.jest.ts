import Carter from '../../index'
import dotenv from 'dotenv'
import * as types from '../../types'
dotenv.config()




describe('opener', () => {

  jest.setTimeout(60000)
  let carter: Carter
  beforeEach(() => {
    carter = new Carter(process.env.CARTER_API_KEY as string);
  })
  // TEST WITH VALID INPUT
  test('test opener with valid input', async () => {
    const response = await carter.opener('callum')
    expect(types.isCarterOpenerInteraction(response)).toBeTruthy()
  })
  // TEST WITH INVALID INPUT
  test('test opener with invalid input', async () => {
    await expect(carter.opener(4 as any)).rejects.toThrowError()
  })
  // TEST WITH VALID INPUT WITH BAD API RESPONSE - nock - still to add
});
