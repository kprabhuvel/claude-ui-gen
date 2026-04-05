// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

import { createSession, getSession } from "../auth";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  test("sets the auth-token cookie", async () => {
    await createSession("user-1", "test@example.com");
    expect(mockCookieStore.set).toHaveBeenCalledOnce();
    expect(mockCookieStore.set.mock.calls[0][0]).toBe("auth-token");
  });

  test("cookie value is a valid signed JWT", async () => {
    await createSession("user-1", "test@example.com");
    const token = mockCookieStore.set.mock.calls[0][1];
    expect(token.split(".")).toHaveLength(3);
    await expect(jwtVerify(token, JWT_SECRET)).resolves.toBeDefined();
  });

  test("JWT payload contains userId and email", async () => {
    await createSession("user-42", "user@example.com");
    const token = mockCookieStore.set.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    expect(payload.userId).toBe("user-42");
    expect(payload.email).toBe("user@example.com");
  });

  test("cookie is httpOnly with path /", async () => {
    await createSession("user-1", "test@example.com");
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe("/");
  });

  test("cookie expires ~7 days from now", async () => {
    const before = Date.now();
    await createSession("user-1", "test@example.com");
    const after = Date.now();
    const expires: Date = mockCookieStore.set.mock.calls[0][2].expires;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(expires).toBeInstanceOf(Date);
    expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });
});

describe("getSession", () => {
  test("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    expect(await getSession()).toBeNull();
  });

  test("returns null for an invalid token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "not.a.valid.jwt" });
    expect(await getSession()).toBeNull();
  });

  test("returns null for an expired token", async () => {
    const token = await new SignJWT({ userId: "u1", email: "a@b.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
      .sign(JWT_SECRET);
    mockCookieStore.get.mockReturnValue({ value: token });
    expect(await getSession()).toBeNull();
  });

  test("returns session payload for a valid token", async () => {
    const token = await new SignJWT({ userId: "user-42", email: "user@example.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    mockCookieStore.get.mockReturnValue({ value: token });
    const session = await getSession();
    expect(session?.userId).toBe("user-42");
    expect(session?.email).toBe("user@example.com");
  });
});
