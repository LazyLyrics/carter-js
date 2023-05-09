# Carter JS

**[TypeDocs](https://lazylyrics.github.io/carter-js/) |
[Changelog](https://github.com/LazyLyrics/carter-js/blob/main/changelog.md) | [Full Documentation](https://lazylyrics.gitbook.io/carter-js-v2/)**

*`carter-js` documentation is a work in progress. Objects described here and in the full documentation can be found in the TypeDoc documentation if you need more details. That documentation is fully updated at all times, though the annotations and descriptions are also a work in progress.*

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
  const carter = new Carter(apiKey, userLogger, speak)
```

A Carter object contains all the necessary methods for interacting with your Carter agent. You'll need to provide your API key to create this. Make sure you keep this key secret while developing, as this key will allow anyone access to your agent. You can provide your logger object to take advantage of the built-in logging functionality. If you don't provide a logger object, `carter-js` will not log anything. Any logger with `debug`. `info`, `warn`, and `error` methods will work, but this feature is in beta.

`speak` is a boolean value which determines whether or not an audio url is returned from the API. Response times are faster with `speak` set to `false`, but you won't be able to access the `audio_url`. You can set the default `speak` value on the class constructor as above, or on a per-interaction basis. If you don't provide a default to the constructor, `speak` will default to `false`.

### Send a message to your Carter agent

```js
  // Send a message to your Carter agent
  const interaction = await carter.say("Hello", 'your_player_id')
  const outputText = interaction.outputText
```

`Carter.say()` sends a fetch request, extracts the useful elements of the response and returns a `CarterInteraction` object.

## Conversation History

Your Carter object keeps a history of interactions with your carter agent. You can access this through `carter.history`. `carter.history` is an array containing `CarterInteraction` objects.

This entire array is accessible in full, and is ordered with the most recent interaction at the front of the array. For convenience, you can also invoke `Carter.latest()` which will return the most recent interaction.

For more information and full documentation on `carter-js`'s see the [GitBook Docs](https://lazylyrics.gitbook.io/carter-js-v3/).
