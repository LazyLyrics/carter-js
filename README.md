# Carter JS

[Docs](https://lazylyrics.github.io/carter-js/) |
[Changelog](https://github.com/LazyLyrics/carter-js/blob/main/changelog.md)

This readme a work in progress. While I work to improve them, please note that there is also TypeDoc documentation [here](https://lazylyrics.github.io/carter-js/). Where an object is described here, you can find the exact types indicated here in those docs if you need more information.

`carter-js` provides a set of utility functions for interacting with your [Carter](https://www.carterapi.com/) agent. In order for `carter-js` to work you'll need to create a [Carter](https://www.carterapi.com/) agent.

**Please note:** carter-js is in its infancy and errors are likely. If you experience any issues please feel free to open a [GitHub](https://github.com/LazyLyrics/carter-js) issue or contact me through the [Carter](https://www.carterapi.com/) Discord server in order to help carter-js improve.

## Installation

```shellscript
  npm install carter-js
```

## Basic Usage

```js
  import { Carter } from 'carter-js'

  // Create a Carter object
  // make sure to use the new keyword
  // in order to create a Carter instance
  const carter = new Carter(YOUR_API_KEY)
```

A Carter object contains all the necessary methods for interacting with your Carter agent. You'll need to provide your API key to create this. Make sure you keep this key secret while developing, as this key will allow anyone access to your agent.

### Send a message to your Carter agent

```js
  const options = {
    uuid: "A UNIQUE USER ID" // Optional
    scene: "level-1" // Optional
  }

  // Send a message to your Carter agent
  const interaction = await carter.say("Hello", options)
  const reply_message = interaction.data.output.text
  const reply_voice = interaction.data.output.voice
```

`Carter.say()` sends a fetch request, extracts the useful elements of the response and returns a `CarterInteraction` object.

```js
CarterInteraction {
  data: CarterData
  ok: Boolean
  statusCode: Number
  statusMessage: String
  payload: CarterPayload
}
```

**data**: The Carter endpoint response. More details [here](https://carterapi.gitbook.io/carter-docs/api/api-response).

**ok**: Boolean. Returns true if response code is 2xx. More details [here](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok).

**statusCode**: The HTTP response [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

**statusMessage**: An informational message relating to the status code.

**payload**: The JSON payload which was sent to Carter.

```js
CarterPayload {
  api_key: string
  query: string
  uuid: string
  scene: string // if provided
}
```

**api_key**: The API key provided when you created your Carter object.

**query**: The query string passed into `Carter.say()`

**uuid**: If you passed a unique user ID into `Carter.say()` then `carter-js` uses this. Otherwise, `carter-js` generates one using the `v1()` method from the [`uuid`](https://github.com/uuidjs/uuid#api-summary) package.

**scene**: This will be undefined if you did not provide it.

### Get an audio link from your agent

Make your Carter agent say whatever you like through an audio link. When you send a message to your Carter agent the response from the Carter endpoint automatically includes one of these links, as you can read about [here](https://carterapi.gitbook.io/carter-docs/api/voice-api). You can call `Carter.getVoiceLink()` to generate one of these links for any text input in order to hear your agent speak aloud anything you need it to.

```js
  import { Carter } from 'carter-js'

  const carter = new Carter(YOUR_API_KEY)

  // Get audio link
  const audioLink = carter.getAudioLink("Hello there, this your Carter agent speaking.")
```

### Downvoting responses

As is outlined [here](https://carterapi.gitbook.io/carter-docs/api/downvote-agent-responses), it is possible to downvote bad Carter responses to aid in the training process. `carter-js` provides a simple utility function for doing this.

```js
  import { Carter } from 'carter-js'

  const carter = new Carter(YOUR_API_KEY)
  const interaction = await carter.say("Hi Carter, say something that doesn't make sense please.")
  // Should this interaction not make sense, you can call the
  // downvote function and pass this interaction object in.
  // carter-js will take care of submitting the right information.
  const downvoted = await carter.downvote(interaction)
```

You can pass in either a `CarterInteraction` object returned from `Carter.say()`, a `CarterConversationEntry` object obtained from the `Carter.history` array, or the TID contained in `CarterData.pid`.

`Carter.downvote()` returns a Boolean signifying the request was successful.

## Conversation History

Your Carter object keeps a history of interactions with your carter agent. You can access this through `carter.history`. `carter.history` is an array containing `CarterConversationEntry` objects.

```js
CarterConversationEntry {
  isoTimestamp: string
  interaction: CarterInteraction
}
```

**isoString**: An ISO 8601-compliant string representation of when this request was sent.

**interaction**: A `CarterInteraction` object.

This entire array is accessible in full, and is ordered with the most recent interaction at the front of the array. For convenience, you can also invoke `Carter.latest()` which will return the most recent interaction.
