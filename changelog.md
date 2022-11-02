# Changelog

All notable changes (from [1.4.0] onwards) will be documented here.

## [1.4.0] - 2022-11-02

**Breaking Changes**:  please note there is a small breaking change in this release related to the `CarterConversationEntry` type. This is the object used in the `Carter.history` array. As I don't believe this feature is being used yet I have elected to make this a minor release.

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
