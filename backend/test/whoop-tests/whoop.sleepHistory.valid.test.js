const request = require("supertest");
const { app, db } = require("../../server");

// Mock WHOOP model
jest.mock("../../app/models/whoop.server.models", () => ({
  insertSleepEntries: jest.fn(),
  getTokens: jest.fn(),
  setTokens: jest.fn(),
  getSleepEntries: jest.fn(),
}));

// Re-require after mocks so controllers see the mocked module
const whoopModel = require("../../app/models/whoop.server.models");

describe("GET /whoop/sleep-history - valid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stored sleep history rows from the model", async () => {
    const rows = [
      { id: 1, user_id: 123, start: "2026-03-01T00:00:00Z" },
      { id: 2, user_id: 123, start: "2026-03-02T00:00:00Z" },
    ];

    whoopModel.getSleepEntries.mockImplementation((done) => {
      done(null, rows);
    });

    const response = await request(app).get("/whoop/sleep-history");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(rows);
    expect(whoopModel.getSleepEntries).toHaveBeenCalledTimes(1);
  });
});

afterAll(async () => {
  await db.close();
});