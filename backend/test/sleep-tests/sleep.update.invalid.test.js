const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepinvalidupdate@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";

describe("PATCH /sleep/:id - invalid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Inv",
      last_name: "Update",
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
    const response = await request(app).patch("/sleep/1").send({ nap: true });

    expect(response.statusCode).toBe(401);
  });

  it("returns 400 when id param is invalid", async () => {
    const response = await request(app)
      .patch("/sleep/not-a-number")
      .send({ nap: true })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 400 when body is empty", async () => {
    const response = await request(app)
      .patch("/sleep/1")
      .send({})
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 400 when body has unknown keys", async () => {
    const response = await request(app)
      .patch("/sleep/1")
      .send({ unknown_field: 1 })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 400 when wake_time is not after bedtime", async () => {
    const response = await request(app)
      .patch("/sleep/1")
      .send({
        bedtime: "2026-03-10T22:00:00Z",
        wake_time: "2026-03-10T06:00:00Z",
      })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "error_message",
      "wake_time must be after bedtime"
    );
  });

  it("returns 404 when sleep does not exist", async () => {
    const response = await request(app)
      .patch("/sleep/999999")
      .send({ nap: true })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error_message", "Sleep not found");
  });
});

afterAll(async () => {
  await db.close();
});
