function loadData() {

    fetch("students.json")
        .then(response => response.json())
        .then(data => {

            let output = "";

            data.forEach(student => {

                output += `
                    <hr>

                    <p>Username: ${student.username}</p>

                    <p>First Name: ${student.first_name}</p>

                    <p>Last Name: ${student.last_name}</p>

                    <p>Gender: ${student.gender}</p>
                `;
            });

            document.getElementById("output").innerHTML = output;

        });

}