const request = require("supertest");
const {app, db} = require("../../server");

describe('POST /user/create_account - missing first_name field', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            last_name: "Doe",
            email: "janedoe@doemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - missing last_name field', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            email: "janedoe@doemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})


describe('POST /user/create_account - missing email field', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - missing password field', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            email: "janedoe@doemail.com"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid first_name field', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jan3",
            last_name: "Doe",
            email: "janedoe@doemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid last_name field', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "D0e",
            email: "janedoe@doemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid email field, missing @ symbol', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            email: "janedoedoemail.com",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid email field, missing email top level domain', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            email: "janedoe@doemail",
            password: "Password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid password, missing upper case character', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            email: "janedoe@doemail",
            password: "password123!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid password, missing special character', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            email: "janedoe@doemail.com",
            password: "Password123"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

describe('POST /user/create_account - invalid password, missing numbers', () => {
    it("should return 400 with error_message and validation details", async () => {
        const user = {
            first_name: "Jane",
            last_name: "Doe",
            email: "janedoe@doemail.com",
            password: "PasswordIsMine!"
        };

        const response = await request(app)
            .post('/user/create_account')
            .send(user)

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error_message');
    });
})

afterAll(async () => {
    await db.close(); 
});