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
        if (err) return done(err);
        return done(null, this.lastID);
    });
};

const authenticateUser = (email, password, done) => {
    const query = "SELECT user_id, password, salt FROM users where email=?"

    db.get(query, [email], (err, row) => {
        if (err) return done(err);
        if (!row) return done(404); // Incorrect email

        if (row.salt === null) row.salt = '';

        let salt = Buffer.from(row.salt, 'hex');

        if (row.password === getHash(password, salt)) {
            return done(false, row.user_id)
        } else {
            return done(404) // Incorrect password
        }
    });
};

const getToken = (id, done) => {
    const query = "SELECT session_token FROM users WHERE user_id=?";
    db.get(query, id, (err, row) => {
        if (err) return done(err);
        if (!row) return done(404); // Incorrect user_id
        return done(false, row.session_token)
    })
};

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');

    const query = "UPDATE users SET session_token=? WHERE user_id=?";

    db.run(query, [token, id], (err) => {
        return done(err, token);
    });
};

const removeToken = (token, done) => {
    const query = "UPDATE users SET session_token=null WHERE session_token=?";

    db.run(query, [token], (err) => {
        return done(err);
    })
};

const getIdFromToken = (token, done) => {
    const query = "SELECT user_id FROM users WHERE session_token = ?";

    db.get(query, [token], (err, row) => {
        if (err) return done(err);
        if (!row || !token) return done(err);

        return done(null, row.user_id);
    })
};

const getUser = (user_id, done) => {
    const query = "SELECT user_id, first_name, last_name FROM users WHERE user_id=?";
    db.get(query, user_id, (err, row) => {
        if (err) return done(err);
        if (!row) return done(404);

        return done(false, { "user_id": row.user_id, "first_name": row.first_name, "last_name": row.last_name });
    })
}

const getInfo = (user_id, done) => {
    const query = "SELECT first_name, last_name, email FROM users WHERE user_id=?";
    db.get(query, user_id, (err, row) => {
        if (err) return done(err);
        if (!row) return done(404);

        return done(false, { "user_id": row.user_id, "first_name": row.first_name, "last_name": row.last_name, "email": row.email });
    })
}

module.exports = {
    addNewUser: addNewUser,
    authenticateUser: authenticateUser,
    getToken: getToken,
    setToken: setToken,
    getIdFromToken: getIdFromToken,
    removeToken: removeToken,
    getInfo: getInfo
}