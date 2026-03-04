const request = require("supertest");
const {app, db} = require("../../server");

let session_token = "";

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

describe('POST /user/login', () => {
    it("should return 201 with user_id and session_token", async () => {
        const user = {
            email: "johndoe@doemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/login')
            .send(user)

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('user_id')
        expect(response.body).toHaveProperty('session_token')
        expect(response.body.user_id).toBe(1);
        session_token = response.body.session_token;
    })
})

describe('POST /user/logout', () => {
    it("should logout the user and return status 200 with message", async () => {
        const response = await request(app)
            .post('/user/logout')
            .set('X-Authorization', session_token);
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message');
    })
})

afterAll(async () => {
    await db.close(); 
});