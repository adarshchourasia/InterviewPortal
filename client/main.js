
document.querySelector('table tbody').addEventListener('click', function (event) {
    if (event.target.className === "delete-row-btn") {
        deleteInterviewById(event.target.dataset.id);
    }
    if (event.target.className === "edit-row-btn") {
        handleEditInterview(event.target.dataset.id);
    }
});

let timeOut;


['interviewer', 'student', 'resume-user'].forEach(typeOfUser => {
    document.querySelector(`#${typeOfUser}-search-box`).addEventListener('input', async ({ target: { value } }) => {
        clearTimeout(timeOut);
        let message = "length is " + value.length;
        let searchBox = document.getElementById(`name-of-${typeOfUser}`);
        let optionsText = document.getElementById(`${typeOfUser}-options-text`)
        optionsText.innerHTML = `Options for ${value} -`;
        searchBox.hidden = true;

        timeOut = setTimeout(() => {
            getSearchedUsers(value, typeOfUser)
            optionsText.innerHTML = `Options for ${value} -`
            console.log(message + ' - sending api request now with value - ', value);
            searchBox.hidden = false;
        }, 1000)
        // console.log('value - ', value);
    })
})


// document.querySelector('#interviewer-search-box').addEventListener('propertychange', async(e) => {
//     console.log('value - ', e.target.value);
// })

function deleteInterviewById(id) {
    fetch('http://localhost:5000/deleteInterview/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
}

function handleEditInterview(id) {
    const updateSection = document.querySelector('#update-row');
    updateSection.hidden = false;
    document.querySelector('#start-time-updated').dataset.id = id;
}

document.querySelector('#interviews-search-button').addEventListener('click', async (e) => {
    searchQuery = document.querySelector('#interviews-search-box').value;
    result = await fetch(`http://localhost:5000/getAllInterviews?q=${searchQuery}`);
    result = await result.json();
    loadInterviewTable(result.data);
})

document.addEventListener('DOMContentLoaded', function () {

    fetch('http://localhost:5000/getAll')
        .then(response => response.json())
        .then(data => loadDropdownList(data['data']));

    fetch('http://localhost:5000/getAllInterviews')
        .then(response => response.json())
        .then(data => loadInterviewTable(data['data']));

});

async function getSearchedUsers(query, typeOfUser) {
    let result = await fetch(`http://localhost:5000/getAll?q=${query}`);
    result = await result.json();
    loadDropdownList(result.data, typeOfUser);
}

function loadDropdownList(data, typeOfUser) {
    userMapping = {
        interviewer: "#name-of-interviewer",
        student: "#name-of-student",
        "resume-user": "#name-of-resume-user",
    }
    let drops = []
    if (typeOfUser)
        drops.push(userMapping[typeOfUser]);
    else drops.push(...Object.values(userMapping));
    console.log('drops - ', drops);
    // const drop1 = document.querySelector('#name-of-interviewer');
    // const drop2 = document.querySelector('#name-of-student');
    // const drop3 = document.querySelector('#name-of-resume-user');

    let dropdownHtml = "";

    data.forEach(function ({ name, email_id }) {

        const dataToStore = name + '(' + email_id + ')';
        dropdownHtml += `<option value="${dataToStore}">${dataToStore}</option>`
    });

    drops.forEach(drop => {
        document.querySelector(drop).innerHTML = dropdownHtml;
    })
    // drop.innerHTML = dropdownHtml;
    // drop1.innerHTML = dropdownHtml;
    // drop2.innerHTML = dropdownHtml;
    // drop3.innerHTML = dropdownHtml;
}

const submitButton = document.querySelector('#submit-btn');

submitButton.onclick = function () {
    const email1 = document.querySelector("#name-of-interviewer").value;
    const email2 = document.querySelector("#name-of-student").value;
    const startTime = document.querySelector("#start-time").value;
    const endTime = document.querySelector("#end-time").value;

    //console.log(email1, email2, startTime,endTime);

    if (email1 === email2) {
        alert("Interviewer and Student(Interviewee) cannot be same");
        return;
    }
    if (startTime === "" || endTime === "") {
        alert("Select Date and Time");
        return;
    }
    let testartTime = startTime.split(' ');
    let tempStartDate = testartTime[0].split('/');
    let tempStartTime = testartTime[1].split(':');
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();



    if (parseInt(tempStartDate[2]) < yyyy
        || (parseInt(tempStartDate[2]) === yyyy && parseInt(tempStartDate[0]) === parseInt(mm) && parseInt(tempStartDate[1]) < parseInt(dd))
        || (parseInt(tempStartDate[2]) === yyyy && parseInt(tempStartDate[0]) < parseInt(mm))) {
        alert("enter correct date");
        return;
    }
    fetch('http://localhost:5000/insertInterview', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            email1: email1,
            email2: email2,
            startTime: startTime,
            endTime: endTime
        })
    })
        .then(response => response.json())
        .then(data => insertRowIntoInterviewTable(data['data']));
}

function insertRowIntoInterviewTable(data) {

    if (data.id === -1) {
        alert("Interviewer Not available at that time");
        return;
    }
    if (data.id === -2) {
        alert("Student(Interviewee) Not available at that time");
        return;
    }
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = "<tr>";

    //console.log("DATA",data);
    for (var key in data) {
        //console.log("KEY",key);
        if (key === 'startTime' || key === 'endTime') {
            data[key] = new Date(data[key]).toLocaleString();
        }
        tableHtml += `<td>${data[key]}</td>`;
    }
    const dataToStore = `${data.id},${data.email1},${data.email2}`;
    tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${dataToStore}>Edit</td>`;

    tableHtml += "</tr>";

    if (isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.innerHTML = tableHtml;
    }
}


function loadInterviewTable(data) {
    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='7'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function ({ id, email1, email2, startTime, endTime }) {

        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${email1}</td>`;
        tableHtml += `<td>${email2}</td>`;
        tableHtml += `<td>${new Date(startTime).toLocaleString()}</td>`;
        tableHtml += `<td>${new Date(endTime).toLocaleString()}</td>`;
        const dataToStore = `${id},${email1},${email2}`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${dataToStore}>Edit</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}

const updateBtn = document.querySelector('#update-row-btn');

updateBtn.onclick = function () {
    const updateDate1 = document.querySelector('#start-time-updated');
    const updateDate2 = document.querySelector('#end-time-updated');
    const data = updateDate1.dataset.id.split(',');

    //console.log("Updated", data);
    if (updateDate1.value === "" || updateDate2.value === "") {
        alert("Select Date and Time");
        return;
    }

    fetch('http://localhost:5000/updateInterview', {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            id: data[0],
            email1: data[1],
            email2: data[2],
            startTime: updateDate1.value,
            endTime: updateDate2.value
        })
    })
        .then(response => response.json())
        .then(data => updateVerdict(data['data']));
}

function updateVerdict(data) {
    if (data.id === -1) {
        alert("Interviewer Not available at that time");
    }
    else if (data.id === -2) {
        alert("Student(Interviewee) Not available at that time");
    }
    else {
        location.reload();
    }
}
