const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepupdate@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";
let sleepId = null;

describe("PATCH /sleep/:id - valid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Up",
      last_name: "Date",
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
        date: "2026-03-15T00:00:00Z",
        bedtime: "2026-03-14T22:00:00Z",
        wake_time: "2026-03-15T06:00:00Z",
        nap: false,
      })
      .set("X-Authorization", sessionToken);

    expect(createRes.statusCode).toBe(201);
    sleepId = createRes.body.id;
  });

  it("returns 200 when updating an allowed field", async () => {
    const response = await request(app)
      .patch(`/sleep/${sleepId}`)
      .send({ nap: true })
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Successfully updated sleep" });
  });
});

afterAll(async () => {
  await db.close();
});
