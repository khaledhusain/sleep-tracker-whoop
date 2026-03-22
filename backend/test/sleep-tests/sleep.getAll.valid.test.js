const request = require("supertest");
const { app, db } = require("../../server");

let session_token_sleep = ""; // must not be session_token causes errors in other tests

describe("Initialises user account for sleep getAll tests", () => {
  beforeAll(async () => {
    const response = await request(app).post("/user/create_account").send({
      first_name: "Jane",
      last_name: "Doe",
      email: "janedoe2@doemail.com",
      password: "Password123!",
    });
    session_token_sleep = response.body.session_token;
  });

  it("logs in and stores session token", async () => {
    const user = {
      email: "janedoe2@doemail.com",
      password: "Password123!",
    };

    const response = await request(app).post("/user/login").send(user);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("session_token");
    session_token_sleep = response.body.session_token;
  });
});

describe("GET /sleep - get all sleep entries", () => {
  it("should return all sleep entries for the user", async () => {
    const response = await request(app)
      .get("/sleep")
      .set("X-Authorization", session_token_sleep);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

afterAll(async () => {
  await db.close();
});