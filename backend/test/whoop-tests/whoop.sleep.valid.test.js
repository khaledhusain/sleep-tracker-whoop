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

// Re‑require after mocks so controllers and middleware see the mocked modules
const whoopClient = require("../../app/utils/whoopClient");
const whoopModel = require("../../app/models/whoop.server.models");

describe("GET /whoop/sleep - valid cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Make whoopAuthMiddleware provide a valid non-expired access token
    whoopModel.getTokens.mockImplementation((done) => {
      done(null, {
        access_token: "fake-access-token",
        refresh_token: "fake-refresh-token",
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour in future
      });
    });
  });
  // Example: happy path with one page, default range
  it("should sync WHOOP sleep data and return inserted count", async () => {
    // Arrange
    const fakeAccessToken = "fake-access-token";
    const fakeRecords = [
      {
        id: 1,
        user_id: 123,
        start: "2026-03-01T00:00:00Z",
        end: "2026-03-01T08:00:00Z",
        nap: false,
        score: {
          stage_summary: {
            total_in_bed_time_milli: 8 * 60 * 60 * 1000,
            total_light_sleep_time_milli: 3 * 60 * 60 * 1000,
            total_slow_wave_sleep_time_milli: 2 * 60 * 60 * 1000,
            total_rem_sleep_time_milli: 3 * 60 * 60 * 1000,
            total_awake_time_milli: 0.5 * 60 * 60 * 1000,
          },
          sleep_performance_percentage: 80,
          sleep_efficiency_percentage: 90,
          sleep_consistency_percentage: 85,
          respiratory_rate: 14.5,
        },
      },
    ];
    // whoopAuthMiddleware will have already set req.accessToken;
    whoopClient.getSleep
      .mockResolvedValueOnce({
        data: {
          records: fakeRecords,
          next_token: null,
        },
      });

    whoopModel.insertSleepEntries.mockImplementation((entries, done) => {
      done(null, entries.length); // simulate "changes" count
    });

    const response = await request(app)
      .get("/whoop/sleep")
      .set("X-Debug-Whoop-Access-Token", fakeAccessToken);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("inserted", 1);

    expect(whoopClient.getSleep).toHaveBeenCalledTimes(1);
    expect(whoopModel.insertSleepEntries).toHaveBeenCalledTimes(1);
  });

  // Example: custom range with multiple pages
  it("should handle paginated WHOOP sleep responses", async () => {
    const baseSleep = (id) => ({
      id,
      user_id: 123,
      start: "2026-03-01T00:00:00Z",
      end: "2026-03-01T08:00:00Z",
      nap: false,
      score: {
        stage_summary: {
          total_in_bed_time_milli: 8 * 60 * 60 * 1000,
          total_light_sleep_time_milli: 3 * 60 * 60 * 1000,
          total_slow_wave_sleep_time_milli: 2 * 60 * 60 * 1000,
          total_rem_sleep_time_milli: 3 * 60 * 60 * 1000,
          total_awake_time_milli: 0.5 * 60 * 60 * 1000,
        },
        sleep_performance_percentage: 80,
        sleep_efficiency_percentage: 90,
        sleep_consistency_percentage: 85,
        respiratory_rate: 14.5,
      },
    });

    const firstPage = {
      data: {
        records: [baseSleep(1), baseSleep(2)],
        next_token: "next-123",
      },
    };
    const secondPage = {
      data: {
        records: [baseSleep(3)],
        next_token: null,
      },
    };

    whoopClient.getSleep
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    whoopModel.insertSleepEntries.mockImplementation((entries, done) => {
      done(null, entries.length);
    });

    const response = await request(app)
      .get("/whoop/sleep")
      .query({ range: "last-week" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("inserted", 3);
    expect(whoopClient.getSleep).toHaveBeenCalledTimes(2);
  });
});

afterAll(async () => {
  await db.close();
});