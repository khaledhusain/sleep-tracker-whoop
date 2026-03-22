const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepinvalidgetall@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";

describe("GET /sleep - invalid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Inv",
      last_name: "GetAll",
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
    const response = await request(app).get("/sleep");

    expect(response.statusCode).toBe(401);
  });

  it("returns 400 for unknown query parameters", async () => {
    const response = await request(app)
      .get("/sleep")
      .query({ extra: "1" })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 400 when start_date is not a valid ISO date", async () => {
    const response = await request(app)
      .get("/sleep")
      .query({ start_date: "not-a-date" })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });
});

afterAll(async () => {
  await db.close();
});
