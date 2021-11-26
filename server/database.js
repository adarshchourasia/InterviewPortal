const mysql = require('mysql');
const mail = require('./mail.js');

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


class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    // Load Dropdown List from all the users available.
    async getAllData(q = '') {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM users WHERE email_id LIKE '%${q}%' OR name LIKE '${q}%'LIMIT 10`;

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    
                    resolve(results);
                    
                })
            });
            //console.log("RES",response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    
    // Load table of upcoming interviews
    async getAllInterviewData(q = '') {
        try {
            const response = await new Promise((resolve, reject) => {
                //const query = "SELECT * FROM interviews;";
                const query = `select interviews.id,u1.name as interviewer_name,u1.email_id as interviewer_email,u2.name as student_name,u2.email_id as student_email,interviews.startTime,interviews.endTime from interviews inner join users as u1 on u1.id = interviews.email1 inner join users as u2 on u2.id=interviews.email2 where u1.name like '%${q}%' OR u1.email_id like '%${q}%' OR u2.name like '%${q}%' OR u2.email_id like '%${q}%'` ;

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    // Updating the Resume id
    async updateResumeId(email,resumeId){
        try{
            const data = await new Promise((resolve,reject) => {
                const query = `UPDATE users SET Resume_Id='${resumeId}' WHERE email_id = ?`;
                connection.query(query, [email] , (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    // Delete an interview
    async deleteInterviewById(id) {
        try {
            id = parseInt(id, 10);
            const data = await new Promise((resolve,reject) => {
                // const query = "SELECT * FROM interviews WHERE id = ?";
                const query = "select interviews.id, u1.email_id as email1, u1.name as name1, u2.email_id as email2, u2.name as name2, interviews.startTime, interviews.endTime from interviews \
                 inner join users as u1 on u1.id = interviews.email1 and interviews.id=? \
                 inner join users as u2 on u2.id = interviews.email2 and interviews.id=?";

                 

                connection.query(query, [id, id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            const email1 = data[0].email1;
            const email2 = data[0].email2;
            const name1 = data[0].name1;
            const name2 = data[0].name2;
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
            ms.delete(name1 + '(' + email1 + ')', name2 + '(' + email2 + ')', startTime, endTime);
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    //Check for availability
    async checkAvailability(email, start, end, id = -1) {
        try {
            const check1 = await new Promise((resolve, reject) => {
                //const query = "SELECT (SELECT COUNT(*) FROM interviews WHERE email1 = ? and id != ?) - \
                //                      (SELECT COUNT(*) FROM interviews WHERE email1 = ? and id != ? and (startTime > ? or endTime < ?)) \
                //                      as CNT";
                const query = "SELECT (SELECT COUNT(*) FROM interviews inner join users as u1 on u1.id = interviews.email1 and u1.email_id=? and interviews.id!=?) - \
                (SELECT COUNT(*) FROM interviews inner join users as u1 on u1.id = interviews.email1 and u1.email_id=? and interviews.id!=? and (interviews.startTime > ? or interviews.endTime < ?)) \
                as CNT";
                                      
                connection.query(query, [email, id, email, id, end, start] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result[0].CNT);
                })
            });
            const check2 = await new Promise((resolve, reject) => {
                //const query = "SELECT (SELECT COUNT(*) FROM interviews WHERE email2 = ? and id != ?) - \
                //                      (SELECT COUNT(*) FROM interviews WHERE email2 = ? and id != ? and (startTime > ? or endTime < ?)) \
                //                      as CNT";

                const query = "SELECT (SELECT COUNT(*) FROM interviews inner join users as u1 on u1.id = interviews.email2 and u1.email_id=? and interviews.id!=?) - \
                (SELECT COUNT(*) FROM interviews inner join users as u1 on u1.id = interviews.email2 and u1.email_id=? and interviews.id!=? and (interviews.startTime > ? or interviews.endTime < ?)) \
                as CNT";
                connection.query(query, [email, id, email, id, end, start] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result[0].CNT);
                })
            });
            return (check1>0 || check2>0);
        } catch(error) {
            console.log(error);
        }
    }

    async getUsersFromEmail(emailArray) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT id,email_id,name FROM users where email_id IN (?)";

                connection.query(query,[emailArray], (err, results) => {
                    if (err) reject(new Error(err.message));
                    
                    resolve(results);
                    
                })
            });
            //console.log("RES",response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    // Insert new interview
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
                console.log("SORRY! Student (Interviewee) Not available at that time");
                return {
                    id: -2
                };
            }
            else {
                let emails= await this.getUsersFromEmail([email1,email2]);
                let id1, id2, first = 0;
                if(emails[1]['email_id'] == email1) {
                    first = 1;
                }
                id1 = emails[first]['id'];
                id2 = emails[1-first]['id'];
                let name1 = emails[first]['name'];
                let name2 = emails[1-first]['name'];
                const insertId = await new Promise((resolve, reject) => {
                    const query = "INSERT INTO interviews (email1, email2, startTime, endTime) VALUES (?,?,?,?)";
                    connection.query(query, [id1, id2, start, end] , (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result.insertId);
                    })
                });
                const ms = mail.getMailServiceInstance();
                ms.schedule({email: email1, name: name1}, {email2, name: name2} , startTime, endTime);
                return {
                    id : insertId,
                    email1: name1 + '(' + email1 + ')',
                    email2 : name2 + '(' + email2 + ')',
                    startTime : startTime,
                    endTime : endTime
                };
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Update Interview
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
                console.log("SORRY! Student (Interviewee) Not available at that time");
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
                const ms = mail.getMailServiceInstance();
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

module.exports = DbService;