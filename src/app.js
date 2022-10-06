require('dotenv').config()
const express = require("express");
const path = require("path");
const hbs = require('hbs');
const exphbs = require('express-handlebars');
const url = require('url');
require("./db/conn");
const app = express();
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 8000;


const Router = require("./routers/routers")

// public static path
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

//midlawere
app.set('view engine', 'hbs');
app.set('views', template_path); 
hbs.registerPartials(partials_path);

app.use('/images', express.static(path.join(__dirname, "../uploads")));
app.use('/static', express.static(path.join(__dirname, "../public")));
app.use(express.static(static_path)); // For serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(Router);

// START THE SERVER
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});