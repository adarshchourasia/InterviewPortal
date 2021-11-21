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

app.delete('/deleteInterview/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteInterviewById(id);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

app.listen(5000, () => console.log('app is running'));