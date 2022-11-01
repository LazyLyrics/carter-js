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

**data**: The Carter endpoint response. More details [here](https://carterapi.gitbook.io/carter-docs/api/api-response).

**ok**: Boolean. Returns true if response code is 2xx. More details [here](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok).

**statusCode**: The HTTP response [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

**statusMessage**: An informational message relating to the status code.

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

**uuid**: If you passed a unique user ID into `Carter.say()` then `carter-js` uses this. Otherwise, `carter-js` generates one using the `v1()` method from the [`uuid`](https://github.com/uuidjs/uuid#api-summary) package.

### Get an audio link from your agent

Make your Carter agent say whatever you like through an audio link. When you send a message to your Carter agent the response from the Carter endpoint automatically includes one of these links, as you can read about [here](https://carterapi.gitbook.io/carter-docs/api/voice-api). You can call `Carter.getVoiceLink()` to generate one of these links for any text input in order to hear your agent speak aloud anything you need it to.

```js
  import { Carter } from 'carter-js'

  const carter = Carter(YOUR_API_KEY)
  const audioLink = carter.getAudioLink("Hello there, this your Carter agent speaking.")
```

One way to play the output audio link is through a JavaScript Audio Object.

### Downvoting responses

As is outlined [here](https://carterapi.gitbook.io/carter-docs/api/downvote-agent-responses), it is possible to downvote bad Carter responses to aid in the training process. `carter-js` provides a simple utility function for doing this.

```js
  import { Carter } from 'carter-js'

  const carter = Carter(YOUR_API_KEY)
  const response = await carter.say("Hi Carter, say something that doesn't make sense please.")
  // Should this response not make sense, you can call the downvote function and pass this response object in. carter-js will take care of submitting the right information.
  const downvoted = await carter.downvote(response)
```

`Carter.downvote()` returns a Boolean signifying the request was successful.

## Conversation History

Your Carter object keeps a history of interactions with your carter agent. You can access this through `carter.history`. `carter.history` is an array containing objects that look like this:

```js
{
  isoString,
  request,
  responseData
}
```

**isoString**: An ISO 8601-compliant string representation of when this request was sent.

**request**: The payload sent to your carter agent.

**responseData**: The Carter endpoint response data returned with this request.

This entire array is accessible in full, and is ordered with the most recent interaction at the front of the array. For convenience, you can also access `Carter.latest` which will always contain the most recent interaction.
