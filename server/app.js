const express = require('express');
const app = express();
const cors = require('cors');
const mail = require('./mail.js');


const database = require('./database.js');
const path = require('path');
const fileUploader = require('express-fileupload');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUploader({
    limits: { fileSize: 5 * 1024 *1024 },
    createParentPath:true
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


// To get all users data 
app.get('/getAll', (request, response) => {
    const db = database.getDbServiceInstance();

    const result = db.getAllData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

// To get all interviews data
app.get('/getAllInterviews', (request, response) => {
    const db = database.getDbServiceInstance();

    const result = db.getAllInterviewData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

//update resume id
app.post('/upload-resume',async (request, response) => {
    //console.log("Recieved Request");
    
//..
    const {email}=mail.getMailServiceInstance().getData(request.body.email);
    const resumeId=await fileUpload(request);
    //console.log("Resume Id",resumeId);
    //console.log("email- ",email);

    const db = database.getDbServiceInstance();
    const result = await db.updateResumeId(email,resumeId);
    //console.log("Updated Db");
    
    response.json({success : result});
    
    
})


// delete an interview
app.delete('/deleteInterview/:id', (request, response) => {
    const { id } = request.params;
    const db = database.getDbServiceInstance();

    const result = db.deleteInterviewById(id);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// Insert new interview in table 
app.post('/insertInterview', (request, response) => {
    const { email1, email2, endTime, startTime } = request.body;
    const db = database.getDbServiceInstance();
    
    const result = db.insertInterview(email1, email2, startTime, endTime);

    result
    .then(data => response.json({ data: data}))
    .catch(err => console.log(err));
});

// Update interview
app.patch('/updateInterview', (request, response) => {
    const { id, email1, email2, startTime, endTime } = request.body;
    const db = database.getDbServiceInstance();
    //console.log("route",id,startTime,endTime);
    const result = db.updateInterviewById(id, email1, email2, startTime, endTime);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
});

async function fileUpload(req){
    //console.log("Uploading File");
    //console.log("request",req);
    //console.log("files",req.files);

    if (!req.files || Object.keys(req.files).length === 0) {
        added = 'No files were uploaded.';
        return "adarsh";
    }
    const Resume = req.files.resumeC;
    const path = __dirname + "/data/resumes/" + Resume.md5;
    console.log("Detecting path",path);

    try{
        const result = await Resume.mv(path);      
        return Resume.md5;
    }catch(err){
        throw err;
    }            
}

app.listen(5000, () => console.log('app is running'));