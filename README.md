# Carter JS

`carter-js` provides a set of utility functions for interacting with your [Carter](https://www.carterapi.com/) agent. In order for `carter-js` to work you'll need to create a [Carter](https://www.carterapi.com/) agent.

## Installation

```shellscript
  npm install carter-js
```

## Basic Usage

```js
  import { Carter } from 'carter-js'

  // Create a Carter object
  const carter = Carter(YOUR_API_KEY)
```

The Carter object contains all the necessary methods for interacting with your Carter agent. You'll need to provide your API key to create this. Make sure you keep this key secret while developing, as this key will allow anyone access to your agent.

### Send a message to your Carter agent

```js
  const options = {
    uuid: "A UNIQUE USER ID" // Optional
    scene: "level-1" // Optional
  }

  // Send a query to your Carter agent
  const response = carter.say("Hello", options)
  const reply_message = reponse.data.output.text
  const reply_voice = response.data.output.voice
```

`Carter.say()` sends the fetch request, extracts the useful elements of the response and returns a `CarterResponse` object which looks like this:

```js
CarterResponse {
  data
  ok
  statusCode
  statusMessage
  payload
}
```

**data**: The CarterAPI response. More details [here](https://carterapi.gitbook.io/carter-docs/api/api-response).

**ok**: Boolean. Returns true if response code is 2xx. More details [here](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok).

**statusCode**: The HTTP response [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

**statusMessage**: An informational message relating to the statusCode.

**payload**: The JSON payload which was sent to Carter.

The payload looks like this:

```js
CarterPayload {
  api_key
  query
  uuid
  scene
}
```

**api_key**: The API key provided when you created your Carter object.

**query**: The query string passed into `Carter.say()`

**uuid**: If you passed a unique user id into `Carter.say()` then `carter-js` uses this. Otherwise, `carter-js` generates one using the `v1()` method from the [`uuid`](https://github.com/uuidjs/uuid#api-summary) package.

### Get an audio link from your agent

Make your Carter agent say whatever you like through an audio link. When you send a message to your Carter agent the response from the Carter endpoint automatically includes one of these links, as you can read about [here](https://carterapi.gitbook.io/carter-docs/api/voice-api). You can call `Carter.getVoiceLink()` to generate one of these links for any text input in order to hear your agent speak anything you need it to.

```js
  import { Carter } from 'carter-js'

  const carter = Carter(YOUR_API_KEY)
  const audioLink = carter.getAudioLink("Hello there, this your Carter agent speaking.")
```

One way to play the output audio link is through a JavaScript Audio Object.
