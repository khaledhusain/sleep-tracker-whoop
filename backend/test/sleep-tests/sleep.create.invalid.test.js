const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepinvalidcreate@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";

describe("POST /sleep - invalid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Inv",
      last_name: "Create",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const loginRes = await request(app).post("/user/login").send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    expect(loginRes.statusCode).toBe(200);
    sessionToken = loginRes.body.session_token;
  });

  it("returns 401 when X-Authorization is missing", async () => {
    const response = await request(app).post("/sleep").send({
      date: "2026-03-01T00:00:00Z",
      bedtime: "2026-02-28T22:00:00Z",
      wake_time: "2026-03-01T06:00:00Z",
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 400 when required field date is missing", async () => {
    const response = await request(app)
      .post("/sleep")
      .send({
        bedtime: "2026-03-01T22:00:00Z",
        wake_time: "2026-03-02T06:00:00Z",
      })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 400 when wake_time is not after bedtime", async () => {
    const response = await request(app)
      .post("/sleep")
      .send({
        date: "2026-03-02T00:00:00Z",
        bedtime: "2026-03-02T08:00:00Z",
        wake_time: "2026-03-02T06:00:00Z",
      })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 400 when body contains unknown keys", async () => {
    const response = await request(app)
      .post("/sleep")
      .send({
        date: "2026-03-03T00:00:00Z",
        bedtime: "2026-03-02T22:00:00Z",
        wake_time: "2026-03-03T06:00:00Z",
        not_allowed: true,
      })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });
});

afterAll(async () => {
  await db.close();
});
