const request = require("supertest");
const app = require("../server");

describe('POST /user/create_account', () => {
    it("should create a new account in the database return 201", async () => {
        const newUser = {
            first_name: "John",
            last_name: "Doe",
            email: "johndoe@doemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(newUser)

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('user_id');
        expect(response.body.user_id).toBe(1);
    });
})
