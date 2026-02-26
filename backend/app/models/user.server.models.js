const db = require("../utils/database");
const crypto = require("crypto");

const getHash = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

const addNewUser = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const query = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
    let values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];

    db.run(query, values, function (err) {
        if (err) {
            console.log(err);
            return done(err);
        }
        return done(null, this.lastID);
    });
};

module.exports = {
    addNewUser: addNewUser,
}