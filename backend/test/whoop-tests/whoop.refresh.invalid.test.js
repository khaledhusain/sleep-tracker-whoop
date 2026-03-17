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

// Re-require after mocks so controllers and middleware see the mocked modules
const whoopClient = require("../../app/utils/whoopClient");
const whoopModel = require("../../app/models/whoop.server.models");

describe("GET /whoop/refresh - invalid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when there is no refresh token", async () => {
    // Simulate tokens without a refresh token
    whoopModel.getTokens.mockImplementation((done) => {
      done(null, {
        access_token: "some-access-token",
        refresh_token: null,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });
    });

    const response = await request(app).get("/whoop/refresh");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error", "No refresh token");
    expect(whoopClient.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("should surface WHOOP API errors when refreshAccessToken rejects", async () => {
    const existingTokens = {
      access_token: "old-access-token",
      refresh_token: "old-refresh-token",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    whoopModel.getTokens.mockImplementation((done) => {
      done(null, existingTokens);
    });

    const apiError = {
      response: {
        status: 400,
        data: { error: "invalid_grant" },
      },
    };

    whoopClient.refreshAccessToken.mockRejectedValueOnce(apiError);

    const response = await request(app).get("/whoop/refresh");

    // Controller returns error.response?.data or { error: message }
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ error: "invalid_grant" });

    expect(whoopClient.refreshAccessToken).toHaveBeenCalledWith(
      existingTokens.refresh_token
    );
    expect(whoopModel.setTokens).not.toHaveBeenCalled();
  });
});

afterAll(async () => {
  await db.close();
});