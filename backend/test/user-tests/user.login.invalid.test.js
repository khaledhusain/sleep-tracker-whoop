const request = require("supertest");
const app = require("../../server");

describe('POST /user/login - missing email field', () => {
    it("should return 400 with error_message and validation error details", async () => {
        const user = {
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/login')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message')
    })
})

describe('POST /user/login - missing password field', () => {
    it("should return 400 with error_message and validation error details", async () => {
        const user = {
            email: "johndoe@doemail.com",
        };

        const response = await request(app)
            .post('/user/login')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message')
    })
})

describe('POST /user/login - incorrect password', () => {
    it("should return 404", async () => {
        const user = {
            email: "johndoe@doemail.com",
            password: "Password1234!"
        };

        const response = await request(app)
            .post('/user/login')
            .send(user)

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error_message')
    })
})

describe('POST /user/login - incorrect email', () => {
    it("should return 404", async () => {
        const user = {
            email: "johndoe@doemaixxxx.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/login')
            .send(user)

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error_message')
    })
})

