import assert from "node:assert/strict";
import test from "node:test";
import { validateDestinationUrl } from "../src/controllers/url.controller.js";

const testEnvironment = {
  PORT: "8000",
  MONGODB_URI: "mongodb://127.0.0.1:27017",
  CORS_ORIGIN: "http://localhost:5173",
  ACCESS_TOKEN_SECRET: "test-access-token-secret",
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_SECRET: "test-refresh-token-secret",
  REFRESH_TOKEN_EXPIRY: "7d",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "test-api-key",
  CLOUDINARY_API_SECRET: "test-api-secret",
};

for (const [key, value] of Object.entries(testEnvironment)) {
  process.env[key] ??= value;
}

const { default: User } = await import("../src/models/user.model.js");

test("accepts and trims HTTP and HTTPS destination URLs", () => {
  assert.equal(validateDestinationUrl(" https://example.com/path "), "https://example.com/path");
  assert.equal(validateDestinationUrl("http://example.com"), "http://example.com");
});

test("rejects unsupported schemes, credentials, and malformed values", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "https://user:password@example.com",
    "not a URL",
    null,
    { $ne: null },
  ]) {
    assert.throws(
      () => validateDestinationUrl(value),
      (error) => error.statusCode === 400,
    );
  }
});

test("rejects destinations longer than 2048 characters", () => {
  const value = `https://example.com/${"a".repeat(2048)}`;
  assert.throws(
    () => validateDestinationUrl(value),
    (error) => error.statusCode === 400,
  );
});

test("never serializes password hashes or refresh tokens", () => {
  const user = new User({
    username: "redirect_user",
    fullName: "Redirect User",
    email: "user@example.com",
    password: "stored-password-hash",
    refreshToken: "stored-refresh-token",
  });

  const serializedUser = user.toJSON();
  assert.equal("password" in serializedUser, false);
  assert.equal("refreshToken" in serializedUser, false);
});