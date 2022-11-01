# Carter JS

`carter-js` provides a set of utility functions for interacting with your [carter](https://carterapi.gitbook.io/carter-docs/) agent.

## Installation

```shellscript
  npm install carter-js
```

## Basic Usage

```js
  import { Carter } from 'carter-js'

  const carter = Carter(YOUR_API_KEY)
  const options = {
    uuid: "A UNIQUE USER ID" // Optional
    scene: "level-1" // Optional
  }

  // Send a query to your carter agent
  const response = carter.say("Hello", options)
  const reply_message = reponse.data.output.text
  const reply_voice = response.data.output.voice
```

`carter.say()` sends the fetch request, destructures the useful elements of the response and returns a `CarterResponse` object which looks like this:

```js
CarterResponse {
  data
  ok
  statusCode
  statusMessage
  payload
}
```

- data - The CarterAPI response. More details [here](https://carterapi.gitbook.io/carter-docs/api/api-response).
- ok - Boolean. Returns true if response code is 2xx. More details [here](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok).
- statusCode - The HTTP response [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).
- statusMessage - An informational message relating to the statusCode.
- payload - The JSON payload which was sent to carter. If you did not provide a UUID then `carter-js` created one for you.

```js
CarterPayload {
  api_key
  query
  uuid
  scene
}
```
