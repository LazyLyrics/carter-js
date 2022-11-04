# Changelog

All notable changes (from [1.4.0] onwards) will be documented here.

## [Unreleased]

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
