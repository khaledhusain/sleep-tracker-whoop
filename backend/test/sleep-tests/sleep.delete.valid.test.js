const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepdelete@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";
let sleepId = null;

describe("DELETE /sleep/:id - valid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Del",
      last_name: "Ete",
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
        date: "2026-03-20T00:00:00Z",
        bedtime: "2026-03-19T22:00:00Z",
        wake_time: "2026-03-20T06:00:00Z",
      })
      .set("X-Authorization", sessionToken);

    expect(createRes.statusCode).toBe(201);
    sleepId = createRes.body.id;
  });

  it("returns 200 when deleting an existing sleep entry", async () => {
    const response = await request(app)
      .delete(`/sleep/${sleepId}`)
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Successfully deleted sleep" });
  });

  it("returns 404 when fetching the deleted sleep", async () => {
    const response = await request(app)
      .get(`/sleep/${sleepId}`)
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error_message", "Sleep not found");
  });
});

afterAll(async () => {
  await db.close();
});
