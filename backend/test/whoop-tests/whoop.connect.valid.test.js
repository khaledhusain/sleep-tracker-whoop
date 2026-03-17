const request = require("supertest");
const { app, db } = require("../../server");

describe("GET /whoop/connect - valid cases", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.WHOOP_CLIENT_ID = "test-client-id";
    process.env.WHOOP_REDIRECT_URI = "https://example.com/callback";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("redirects to WHOOP auth with expected query params", async () => {
    const response = await request(app).get("/whoop/connect");

    expect(response.statusCode).toBe(302);
    const location = response.headers.location;
    expect(location).toBeDefined();

    expect(location).toContain(
      "https://api.prod.whoop.com/oauth/oauth2/auth"
    );
    expect(location).toContain("response_type=code");
    expect(location).toContain("client_id=test-client-id");
    expect(location).toContain(
      encodeURIComponent("https://example.com/callback")
    );
    expect(location).toContain("scope=offline%20read:sleep");
    expect(location).toMatch(/state=/);
  });
});

afterAll(async () => {
  await db.close();
});
