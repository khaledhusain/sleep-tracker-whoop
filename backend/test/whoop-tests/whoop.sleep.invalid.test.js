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

describe("GET /whoop/sleep - invalid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when there is no stored token", async () => {
    // whoopAuthMiddleware: simulate no tokens in DB
    whoopModel.getTokens.mockImplementation((done) => {
      done(null, null);
    });

    const response = await request(app).get("/whoop/sleep");

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty(
      "error",
      "Not authenticated. Go to whoop/connect"
    );
    expect(whoopClient.getSleep).not.toHaveBeenCalled();
  });

  it("should surface WHOOP API errors when getSleep rejects", async () => {
    // Valid tokens so middleware sets an access token
    whoopModel.getTokens.mockImplementation((done) => {
      done(null, {
        access_token: "fake-access-token",
        refresh_token: "fake-refresh-token",
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });
    });

    const apiError = {
      response: {
        status: 429,
        data: { error: "rate_limited" },
      },
    };

    whoopClient.getSleep.mockRejectedValueOnce(apiError);

    const response = await request(app)
      .get("/whoop/sleep")
      .query({ range: "last-week" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ error: "rate_limited" });
    expect(whoopClient.getSleep).toHaveBeenCalledTimes(1);
    expect(whoopModel.insertSleepEntries).not.toHaveBeenCalled();
  });
});

afterAll(async () => {
  await db.close();
});