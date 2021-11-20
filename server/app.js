const express = require('express');
const app = express();
const cors = require('cors');

const database = require('./database');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

app.get('/getAll', (request, response) => {
    const db = database.getDbServiceInstance();

    const result = db.getAllData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.get('/getAllInterviews', (request, response) => {
    const db = database.getDbServiceInstance();

    const result = db.getAllInterviewData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})