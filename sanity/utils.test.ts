import assert from "node:assert/strict";
import { test } from "node:test";
import type { Rule } from "sanity";
import { composeValidation, isEmptyObjectValue, requireTypeWhenObjectHasValue } from "./utils";

/** Captures the callback passed to `Rule.custom` so tests can invoke it directly. */
function captureCustom(builder: (rule: unknown) => unknown): (value: unknown) => true | string {
  let captured: ((value: unknown) => true | string) | undefined;
  builder({
    custom(fn: (value: unknown) => true | string) {
      captured = fn;
      return this;
    },
  });

  assert.ok(captured, "validation builder never called Rule.custom");
  return captured;
}

test("isEmptyObjectValue: true only for objects whose values are all nullish", () => {
  assert.equal(isEmptyObjectValue({}), true);
  assert.equal(isEmptyObjectValue({ type: null, image: undefined }), true);
  assert.equal(isEmptyObjectValue({ type: "image" }), false);
  assert.equal(isEmptyObjectValue(null), false);
  assert.equal(isEmptyObjectValue([1]), false);
  assert.equal(isEmptyObjectValue("x"), false);
});

test("requireTypeWhenObjectHasValue: the contract used by createMediaField/createLinkField", () => {
  const validate = captureCustom(requireTypeWhenObjectHasValue("Select a media type."));

  // No value or stale all-null object: valid (editors cleared the field).
  assert.equal(validate(undefined), true);
  assert.equal(validate({ type: null, image: null }), true);

  // Meaningful content without a type: invalid.
  assert.equal(validate({ type: undefined, image: "asset-ref" }), "Select a media type.");

  // Type present: valid.
  assert.equal(validate({ type: "image", image: "asset-ref" }), true);
});

test("composeValidation: base alone passes through; external results are combined with base", () => {
  const rule = {} as Rule;
  const base = () => "base";
  const external = () => "external";

  assert.equal(composeValidation(base)(rule), "base");
  assert.deepEqual(composeValidation(base, external)(rule), ["external", "base"]);
  assert.deepEqual(composeValidation(base, () => ["e1", "e2"])(rule), ["e1", "e2", "base"]);
});
