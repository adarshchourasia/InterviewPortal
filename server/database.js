const mysql = require('mysql');
const mail = require('./mail');

let instance = null;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Adarsh.1234',
    database: 'InterviewDB',
    port: '3306'
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db ' + connection.state);
});

async insertInterview(email1, email2, startTime, endTime) {
    try {
        const start = convertDateTime(startTime);
        const end = convertDateTime(endTime);
        const check1 = await this.checkAvailability(email1,start,end);
        const check2 = await this.checkAvailability(email2,start, end);
        if(check1 > 0) {
            console.log("SORRY! Interviewer Not available at that time");
            return {
                id: -1
            };
        }
        else if(check2 > 0) {
            console.log("SORRY! Student Not available at that time");
            return {
                id: -2
            };
        }
        else {

            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO interviews (email1, email2, startTime, endTime) VALUES (?,?,?,?);";

                connection.query(query, [email1, email2, start, end] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId);
                })
            });
            const ms = mail.getMailServiceInstance();
            ms.schedule(email1, email2, startTime, endTime);
            return {
                id : insertId,
                email1: email1,
                email2 : email2,
                startTime : startTime,
                endTime : endTime
            };
        }
    } catch (error) {
        console.log(error);
    }
}


convertDateTime = (datetime) => {
    datetime = datetime.split(' ');
    date = datetime[0].split('/');
    time = datetime[1].split(':');
    mer = datetime[2];
    if (mer == 'PM') {
        if(time[0] !== '12') {
            hh = parseInt(time[0]);
            hh+=12;
            time[0] = hh.toString();
        } 
    }
    else {
        if(time[0]==='12') {
            time[0]='00';
        }
    }
    sqlDate = "";
    sqlDate += date[2] + '-' + date[0] + '-' + date[1] + ' ' + time[0] + ':' + time[1];
    return sqlDate;
}

class database {
    static getDbServiceInstance() {
        return instance ? instance : new database();
    }

    // Load Dropdown List from all the users available.
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            //console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    
    // Load table of upcoming interviews
    async getAllInterviewData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM interviews;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            // console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async deleteInterviewById(id) {
        try {
            id = parseInt(id, 10);
            const data = await new Promise((resolve,reject) => {
                const query = "SELECT * FROM interviews WHERE id = ?";
                connection.query(query, [id] , (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            const email1 = data[0].email1;
            const email2 = data[0].email2;
            const startTime = new Date(data[0].startTime).toLocaleString();
            const endTime = new Date(data[0].endTime).toLocaleString();
            
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM interviews WHERE id = ?";
    
                connection.query(query, [id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
            const ms = mail.getMailServiceInstance();
            ms.delete(email1, email2, startTime, endTime);
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateInterviewById(id, email1, email2, startTime, endTime) {
        try {
            id = parseInt(id, 10);
            const start = convertDateTime(startTime);
            const end = convertDateTime(endTime); 
            const check1 = await this.checkAvailability(email1, start, end, id);
            const check2 = await this.checkAvailability(email2, start, end, id);

            //console.log("UpdateIn",id, email1,email2,start,end);
            if(check1 > 0) {
                console.log("SORRY! Interviewer Not available at that time");
                return {
                    id: -1
                };
            }
            else if(check2 > 0) {
                console.log("SORRY! Student Not available at that time");
                return {
                    id: -2
                };
            }
            else {
                const response = await new Promise((resolve, reject) => {
                    const query = "UPDATE interviews SET startTime = ?, endTime = ? WHERE id = ?";
        
                    connection.query(query, [start, end, id] , (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result.affectedRows);
                    })
                });
                const ms = mailService.getMailServiceInstance();
                ms.update(email1, email2, startTime, endTime);
                return {
                    id: 1
                };
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    
}


    module.exports = database;