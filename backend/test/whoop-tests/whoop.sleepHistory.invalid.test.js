const request = require("supertest");
const { app, db } = require("../../server");

// Mock WHOOP model so we don't hit the real DB helpers
jest.mock("../../app/models/whoop.server.models", () => ({
  insertSleepEntries: jest.fn(),
  getTokens: jest.fn(),
  setTokens: jest.fn(),
  getSleepEntries: jest.fn(),
}));

// Re-require after mocks so controllers see the mocked module
const whoopModel = require("../../app/models/whoop.server.models");

describe("GET /whoop/sleep-history - invalid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 500 when the model returns an error", async () => {
    whoopModel.getSleepEntries.mockImplementation((done) => {
      done(new Error("DB failure"));
    });

    const response = await request(app).get("/whoop/sleep-history");

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: "DB failure" });
    expect(whoopModel.getSleepEntries).toHaveBeenCalledTimes(1);
  });
});

afterAll(async () => {
  await db.close();
});