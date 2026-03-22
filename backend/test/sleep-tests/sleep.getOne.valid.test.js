const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepgetone@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";
let sleepId = null;

describe("GET /sleep/:id - valid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Get",
      last_name: "One",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const loginRes = await request(app).post("/user/login").send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    expect(loginRes.statusCode).toBe(200);
    sessionToken = loginRes.body.session_token;

    const createRes = await request(app)
      .post("/sleep")
      .send({
        date: "2026-03-10T00:00:00Z",
        bedtime: "2026-03-09T22:00:00Z",
        wake_time: "2026-03-10T06:00:00Z",
      })
      .set("X-Authorization", sessionToken);

    expect(createRes.statusCode).toBe(201);
    sleepId = createRes.body.id;
  });

  it("returns 200 and the sleep row for the authenticated user", async () => {
    const response = await request(app)
      .get(`/sleep/${sleepId}`)
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", sleepId);
    expect(response.body).toHaveProperty("bedtime");
    expect(response.body).toHaveProperty("wake_time");
  });
});

afterAll(async () => {
  await db.close();
});
