const request = require("supertest");
const { app, db } = require("../../server");

const TEST_EMAIL = "sleepinvaliddelete@test.com";
const TEST_PASSWORD = "Password123!";

let sessionToken = "";

describe("DELETE /sleep/:id - invalid cases", () => {
  beforeAll(async () => {
    await request(app).post("/user/create_account").send({
      first_name: "Inv",
      last_name: "Delete",
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
    const response = await request(app).delete("/sleep/1");

    expect(response.statusCode).toBe(401);
  });

  it("returns 400 when id is not a positive integer", async () => {
    const response = await request(app)
      .delete("/sleep/xyz")
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error_message");
  });

  it("returns 404 when sleep does not exist", async () => {
    const response = await request(app)
      .delete("/sleep/999999")
      .set("X-Authorization", sessionToken);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error_message", "Sleep not found");
  });
});

afterAll(async () => {
  await db.close();
});
