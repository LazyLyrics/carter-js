# Changelog

All notable changes (from [1.4.0] onwards) will be documented here.

Please note that this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). As carter-js is built around an API which is still in beta, breaking changes may be introduced indirectly in minor releases. Major releases will be reserved for breaking changes to the way in carter-js is used. IE. function names, parameter depreciations etc. Where a breaking change is made on the API side, carter-js will be updated to reflect this change. However, as carter-js exposes the API response to the user, it is possible that this response may change and will not be reflected in a major release if the only difference is in the response from the API.

I will continue to build carter-js with the intention of maintaining backwards compatibility, but this is not guaranteed. Previous versions of carter-js are always likely to be outdated as the API progresses.

## [4.1] 2023-06-25 - Updates back to production URL

### Changed

- `carter-js` now uses Carter's production API endpoints, which have been upgraded to the previously unstable API endpoints.

## [4.0] 2023-06-09 - Updates to Carter Unstable API

### Changed

- `carter-js` now uses Carter's unstable API endpoints.
- `playerId` parameter has been renamed to userId in all functions. This is to reflect the change in the API.
- `carter.personalise` not takes a userId as its second argument. `personalise(text: string, userId: string, speak?: boolean | undefined)`.
- Other changes related to the api can be found in the carter docs, this changelog covers only the changes related to carter-js usage.

## [3.0] 2023-05-09

### Changed

- `carter.history` now consists of only interactions, ordered by default with the newst first in the array. This simplified the type and still enables easy sorting and filtering where necessary, as the timestamp is now included in the interaction object.
- Wherever possible, properties have moved to being `null` when not present. This is both more semantically correct and allows for less errors when trying to access undefined properties.
- All carter interactions now contain an error message property `interaction.errorMessage`, which will be populated where appropriate and possible for better debugging.
- carter.registerSkill now takes a skill object as its only parameter. This object contains the skill name, action and options. See docs for details.

#### Interactions

- Now contain:
  - `type` property, which is a string of the interaction type ie. "say", "opener" or "personalise"
  - `isoTimestamp` property, which is an ISO string of the timestamp of the interaction
  - `characterName` property, which is a string of the character name
  - `url` property, which is a string of the url the request was sent to
  - `forcedBehaviours` property, which is an array of triggered forced behaviours from carter. Not to be confused with `triggeredSkills` and `executedSkills`, which are carter-js skills created as a result of forced behaviours.
  - All interactions are now of the same type and structure, legacy properties have been left in the object while they are still present in the api response, but will be removed in a future release.

## [2.2] 2023-04-28 Changes default speak to false

### Changed

- Default speak parameter is now false. This is to move carter-js inline with the API. If you want to use the audio url, you must now pass speak: true to the carter constructor, or when calling carter functions.

## [2.1] 2023-04-13 Adds support for optional speak parameter in say function

### Added

- Optional `speak` parameter when creating a carter object. This will determine whether or not carter returns an audio URL, which is currently slowing down response times
- Optional `speak` parameter to all interaction functions. This allows you to override the default class speak property. `opener` and `personalise` can also receive this parameter, but the audio url is not currently supported by the API for these functions, so related properties in the interaction will remain undefined.
- All interactions now have a `response_text` property, which extracts the response text from the API response. This is to streamline getting your output, but also allows me to adapt carter-js to the API changes in the future. **Using this property to extract your output is strongly recommended as it will always work, regardless of API changes.**
- `say` now has a `response_audio` parameter which extracts the audio URL from the API response. See `response_text`. `opener` and `personalise` also have this property, but it will always be undefined as the API does not currently support audio for these functions. Another minor update will be released with this functionality when available. **Using this property to extract your audio is strongly recommended as it will always work, regardless of API changes.**

### Changed

- Small type changes to accommodate the above additions.

### Fixed

- None

### Deprecated

- None

## [2.0.2] 2023-04-13 Fixes error when using require

## [2.0.1] 2023-04-10 Removes unnecessary files from build

## [2.0] 2023-04-10 Support for Carter Engine V1

Items marked as [Beta] are currently untested and may not work as expected.

### Added

- Vastly improved error handling. Errors are handled where appropriate and useful error messages are thrown where possible.
- Logging. By providing a logging object to the `Carter` constructor, you can now log all interactions with the API. This is useful for debugging and for monitoring. Logging will be improved in future releases.
- Support for the new /opener endpoint with `carter.opener(playerId)`.
- Support for the new /personalise endpoint with `carter.personalise(text)`.
- Added new types for opener and personalise interactions. These are identical to the `CarterInteraction` type, but don't include forced behaviours.

### Changed

- [Beta] The `Carter` object now takes an extra property `userLogger` which can be used to activate debug logging. More details in the documentation.
- `carter.say` no longer accepts a `CarterPayloadOptions` object as its second argument. Instead, it accepts a playerId string. `carter-js` will still generate a uuid if this is not provided.
- Changed `query` property in carter to `text
- Time taken property of interactions is now calculated by `carter-js` rather than the API. This is measured from function call to just before the interaction is returned.
- interactions now contain an id property which is a uuid generated by `carter-js`, this is used to identify interactions when logging and in the history array.
- Skill actions no longer accept metadata or entity parameters.
- The carter.history array can now contain `CarterInteraction` objects OR `CarterOpenerInteraction` objects. Personalise interactions are not included as they are not considered part of the conversation.

### Deprecated

- `carter.downvote()` has been removed. This is because the API no longer supports downvoting.
- `carter.audioLink` has been removed. This is because the API no longer supports audio links.

## [1.6.2] 2022-12-31

### Fixes

- Fixes issue where skill actions which did not alter the response did not work if no value was returned.

## [1.6.1] 2022-12-31

### Changed

- Skill actions which alter the response **must** now return a CarterSkillOutput object. See documentation for details.

## [1.6.0] 2022-12-31

### Changed

- Skill actions which alter the response can now return a CarterSkillOutput object. See documentation for details.

### Changed

- Skill actions must now return a CarterSkillOutput object. See documentation for details.

## [1.5.1] 2022-11-30

- Bug fixes related to carter update 0.0.18

## [1.5] 2022-11-05

### Added

#### Skills

Skills allow a carter-js object to detect CarterAPI triggers. A carter-js skill allows you to then define an action which will take in CarterAPI's response and allow you to modify it. This action can be triggered automatically or manually and allows easy replacement of text in
your CarterAPI responses.

- `Carter.registerSkill(name, action, options)` - registers a new skill and its action with your carter object
- `Carter.skills` - An array of skills registered with your carter object

#### Timing functions

You can now extract response time data from your conversation history. As well as being able to pull the response time data from an individual `CarterInteraction` you are now able to use:

- `Carter.lastResponseTime()` - extracts the response time from your most recent interaction.
- `Carter.averageResponseTime()` - Calculates the average response time of interactions with your agent, can accept an optional `minutes` parameter

### Changed

- `carter.say()` now returns a `CarterResponse` object with an undefined `data` property if the response from Carter is not successful - if the `response.ok` property is not true.
- Following on from the above change, it might now be possible to pass an interaction to `Carter.downvote()` which doesn't have any data as it was unsuccessful. Therefore, `Carter.downvote()` will now return false both if the request is unsuccessful and if `carter-js` is unable to retrieve a TID from the object provided.

## [1.4.1] - 2022-11-02

### Fixed

- Fixed spelling error in `CarterData` object. Was "time_takem" now "time_taken"

## [1.4.0] - 2022-11-02

**Breaking Changes**:  please note there is a small breaking change in this release related to the `CarterConversationEntry` type. This is the object used in the `Carter.history` array. As I don't believe this feature is being used yet I have elected to make this a minor release. There is also a deprecation I have chosen to include in a minor release for the same reason.

### Added

- `Carter.downvote()` can now accept 3 types of argument. It will accept a `CarterInteraction`, a `CarterConversationEntry` (the object stored in `Carter.history` array), or you can simply pass it a TID.
- `Carter.latest()` is now a utility function which will return the most recent interaction. The `Carter.latest` property has been deprecated.

### Changed

#### Types

`carter-js` types have had a semantic overhaul, they now make more sense and their context is more clear. The heart of CarterAPI is in increasing our ability to interact with technology, hence `carter-js` has taken on more interaction-focussed semantics.

- `CarterJSResponse` -> `CarterInteraction`: Still contains request and response data for every message you send to Carter.
- `CarterQueryOptions` -> `CarterPayloadOptions`: More in line with the terminology used in `CarterInteraction` and more intuitive.
- **Breaking** `CarterConversationEntry`: This object has been reworked to be more semantically intuitive and to avoid repeating data. Previously, it contained a `CarterData` object and what used to be called the `CarterJSResponse` object, now renamed `CarterInteraction`. These objects contain similar data, and since the `CarterInteraction` object contains all the information about an object you might need, the `CarterConversationEntry` now contains only the timestamp and the interaction.

```js
CarterConversationEntry {
  isoTimestamp: string
  interaction: CarterInteraction
}
```

---

- Updated docs

### Deprecated

- `Carter.latest` attribute has been removed and replaced by `Carter.latest()`. (See above)
