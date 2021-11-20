
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


