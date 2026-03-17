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

describe("GET /whoop/refresh - valid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should refresh access token and persist new tokens", async () => {
    const existingTokens = {
      access_token: "old-access-token",
      refresh_token: "old-refresh-token",
      // Not expired so whoopAuthMiddleware will just set req.accessToken
      // and the controller will handle the refresh flow once.
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    // Model returns existing tokens
    whoopModel.getTokens.mockImplementation((done) => {
      done(null, existingTokens);
    });

    const refreshed = {
      data: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
      },
    };

    whoopClient.refreshAccessToken.mockResolvedValueOnce(refreshed);

    whoopModel.setTokens.mockImplementation(
      (accessToken, refreshToken, expiresAt, done) => {
        done(null);
      }
    );

    const response = await request(app).get("/whoop/refresh");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(refreshed.data);

    // Called once by whoopAuthMiddleware and once by the refresh controller
    expect(whoopModel.getTokens).toHaveBeenCalledTimes(2);
    expect(whoopClient.refreshAccessToken).toHaveBeenCalledWith(
      existingTokens.refresh_token
    );
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