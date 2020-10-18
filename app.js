const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

const middleware = require('./utils/middleware');
const clientEndpoints = ["home", "profile"];

const app = express();

app.use(helmet());
app.use(cors());

//Implement Rate limiters


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
app.use(cookieParser());

app.use(middleware.requestLogger);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/:clientEndpoint', (req, res, next) => {
    if(clientEndpoints.includes(req.params.clientEndpoint)){
        res.sendFile(path.join(__dirname, '/client/build/index.html'));
    }else{
        next();
    }
})

//TODO: Implement various endpoints

//Authenticator
app.post('/v1/login', authController);

//Search
app.post('/v1/search', searchRouter); // '/v1/search/tags' '/v1/search/user' 

//User
app.use('/v1/user', userRouter); // All user related jobs - profile updates, reporting

//Admin
app.use('/v1/admin', adminRouter); // Admin endpoints - unpublish, republish, verify

app.get('*', (req, res) => {
    res.status(301).redirect('/');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;