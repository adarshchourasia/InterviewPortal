
document.querySelector('table tbody').addEventListener('click', function(event) {
    if (event.target.className === "delete-row-btn") {
        deleteInterviewById(event.target.dataset.id);
    }
    if (event.target.className === "edit-row-btn") {
        handleEditInterview(event.target.dataset.id);
    }
});

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

document.addEventListener('DOMContentLoaded', function () {
    
    fetch('http://localhost:5000/getAll')
    .then(response => response.json())
    .then(data => loadDropdownList(data['data']));

    fetch('http://localhost:5000/getAllInterviews')
    .then(response => response.json())
    .then(data => loadInterviewTable(data['data']));
    
});

function loadDropdownList(data) {
    const drop1 = document.querySelector('#name-of-interviewer');
    const drop2 = document.querySelector('#name-of-student');

    let dropdownHtml = "";

    data.forEach(function ({name, email_id}) {
        
        const dataToStore = name + '(' + email_id + ')';
        dropdownHtml += `<option value="${dataToStore}">${dataToStore}</option>`
    });

    drop1.innerHTML = dropdownHtml;
    drop2.innerHTML = dropdownHtml;
}

function loadInterviewTable(data) {
    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='7'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function ({id, email1, email2, startTime, endTime}) {
        
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

