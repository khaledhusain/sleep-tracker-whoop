const request = require("supertest");
const { app, db } = require("../../server");

// Mock WHOOP client and model
jest.mock("../../app/utils/whoopClient", () => ({
  getSleep: jest.fn(),
  refreshAccessToken: jest.fn(),
  exchangeCodeForTokens: jest.fn(),
}));
jest.mock("../../app/models/whoop.server.models", () => ({
  insertSleepEntries: jest.fn(),
  getTokens: jest.fn(),
  setTokens: jest.fn(),
  getSleepEntries: jest.fn(),
}));

// Re-require after mocks so controllers see the mocked modules
const whoopClient = require("../../app/utils/whoopClient");
const whoopModel = require("../../app/models/whoop.server.models");

describe("GET /whoop/callback - valid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exchanges code for tokens, stores them, and returns success text", async () => {
    const fakeCode = "abc123";

    const tokenResponse = {
      data: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
      },
    };

    whoopClient.exchangeCodeForTokens.mockResolvedValueOnce(tokenResponse);

    whoopModel.setTokens.mockImplementation(
      (accessToken, refreshToken, expiresAt, done) => {
        done(null);
      }
    );

    const response = await request(app)
      .get("/whoop/callback")
      .query({ code: fakeCode });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Token stored.");

    expect(whoopClient.exchangeCodeForTokens).toHaveBeenCalledTimes(1);
    expect(whoopClient.exchangeCodeForTokens).toHaveBeenCalledWith(fakeCode);

    expect(whoopModel.setTokens).toHaveBeenCalledTimes(1);
    const [savedAccess, savedRefresh, savedExpiresAt] =
      whoopModel.setTokens.mock.calls[0];
    expect(savedAccess).toBe("new-access-token");
    expect(savedRefresh).toBe("new-refresh-token");
    expect(typeof savedExpiresAt).toBe("string");
  });
});

afterAll(async () => {
  await db.close();
});