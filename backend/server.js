const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const db = require(`./app/utils/database.js`);
const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.json({ 'status': 'Alive' });
});

app.get('/dbhealth', (req, res) => {
    try {
        db.prepare('SELECT 1').get();
        res.json({ status: 'ok', db: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Call routes here
require('./app/routes/test.server.routes')(app);
require('./app/routes/whoop.server.routes')(app);
require('./app/routes/user.server.routes.js')(app);
require(`./app/routes/sleep.server.routes.js`)(app);
require('./docs/swagger')(app);  

// Default response for any other request
app.use((req, res) => {
    res.sendStatus(404);
});

const HTTP_PORT = 3333;
if (process.env.NODE_ENV !== 'test') {
    app.listen(HTTP_PORT, () => {
        console.log('Server running on port: ' + HTTP_PORT);
    });
}


module.exports = { app, db };