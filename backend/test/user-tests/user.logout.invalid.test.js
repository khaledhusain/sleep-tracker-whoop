const request = require("supertest");
const app = require("../../server");

describe('POST /user/logout - invalid session_token', () => {
    it("should return 401 no user with the token is found", async () => {
        const response = await request(app)
            .post('/user/logout')
            .set('X-Authorization', 'zzzf91fe0523bda3e1b326d31fea0zzz');
        
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message');
    })
})

// maybe update so error checks for missing token rather than calling it invalid
// depends as a missing token is still invalid
describe('POST /user/logout - missing session_token', () => {
    it("should return 401 no user with the token is found", async () => {
        const response = await request(app)
            .post('/user/logout')
        
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message');
    })
})

