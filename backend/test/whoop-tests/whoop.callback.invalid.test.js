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

describe("GET /whoop/callback - invalid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when code query param is missing", async () => {
    const response = await request(app).get("/whoop/callback");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: "Missing code" });

    expect(whoopClient.exchangeCodeForTokens).not.toHaveBeenCalled();
    expect(whoopModel.setTokens).not.toHaveBeenCalled();
  });

  it("surfaces WHOOP API errors when exchangeCodeForTokens rejects", async () => {
    const fakeCode = "bad-code";

    const apiError = {
      response: {
        status: 400,
        data: { error: "invalid_grant" },
      },
    };

    whoopClient.exchangeCodeForTokens.mockRejectedValueOnce(apiError);

    const response = await request(app)
      .get("/whoop/callback")
      .query({ code: fakeCode });

    // Controller returns { status, data } from error.response
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 400,
      data: { error: "invalid_grant" },
    });

    expect(whoopClient.exchangeCodeForTokens).toHaveBeenCalledTimes(1);
    expect(whoopClient.exchangeCodeForTokens).toHaveBeenCalledWith(fakeCode);
    expect(whoopModel.setTokens).not.toHaveBeenCalled();
  });
});

afterAll(async () => {
  await db.close();
});