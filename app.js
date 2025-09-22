const base_url = "https://jsonplaceholder.typicode.com";
let users = [];           
let editUserId = null;      

const tableBody = document.querySelector("#usersTable tbody");
const form = document.getElementById("userForm");
const messagesDiv = document.getElementById("messages");

function showMessage(message) {
    messagesDiv.textContent = message;
    setTimeout(() => { messagesDiv.textContent = ""; }, 3000);
}

async function fetchUsers() {
    try {
        const response = await fetch(`${base_url}/users`);
        if (!response.ok) throw new Error("HTTP Error " + response.status);
        users = await response.json();
        renderUsers(users);
    } catch (err) {
        showMessage("Kunne ikke hente brugere: " + err.message);
    }
}

function renderUsers(users) {
    tableBody.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");
        row.dataset.userId = user.id;

        row.innerHTML = `
            <td>${user.name || ""}</td>
            <td>${user.username || ""}</td>
            <td>${user.email || ""}</td>
            <td>${user.address?.street || ""}</td>
            <td>${user.address?.suite || ""}</td>
            <td>${user.address?.city || ""}</td>
            <td>${user.address?.zipcode || ""}</td>
            <td>${user.phone || ""}</td>
            <td>${user.website || ""}</td>
            <td>${user.company?.name || ""}</td>
            <td>${user.company?.catchPhrase || ""}</td>
            <td>${user.company?.bs || ""}</td>
            <td>
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

   
    const newUserData = {
        name: form.name.value,
        username: form.username.value,
        email: form.email.value,
        address: {
            street: form.street.value,
            suite: form.suite.value,
            city: form.city.value,
            zipcode: form.zipcode.value,
        },
        phone: form.phoneNumber.value,
        website: form.website.value,
        company: {
            name: form.companyName.value,
            catchPhrase: form.catchPhrase.value,
            bs: form.bs.value,
        }
    };

    try {
        if (editUserId) {
            
            const response = await fetch(`${base_url}/users/${editUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUserData)
            });
            if (!response.ok) throw new Error("HTTP Error " + response.status);

            const updatedUser = await response.json();

            users = users.map(u => u.id == editUserId ? updatedUser : u);
            showMessage("Bruger redigeret");
            editUserId = null;
        } else {
            const response = await fetch(`${base_url}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUserData)
            });
            if (!response.ok) throw new Error("HTTP Error " + response.status);

            const createdUser = await response.json();
            createdUser.id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

            users.push(createdUser);
            showMessage("Bruger oprettet");
        }

        renderUsers(users);
        form.reset();
    } catch (err) {
        showMessage("Redigering fejlet: " + err.message);
    }
});


document.getElementById("usersTable").addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
        const userId = event.target.closest("tr").dataset.userId;
        const user = users.find(u => u.id == userId);
        if (!user) return;

        form.name.value = user.name;
        form.username.value = user.username;
        form.email.value = user.email;
        form.street.value = user.address?.street || "";
        form.suite.value = user.address?.suite || "";
        form.city.value = user.address?.city || "";
        form.zipcode.value = user.address?.zipcode || "";
        form.phoneNumber.value = user.phone || "";
        form.website.value = user.website || "";
        form.companyName.value = user.company?.name || "";
        form.catchPhrase.value = user.company?.catchPhrase || "";
        form.bs.value = user.company?.bs || "";

        editUserId = userId;
        showMessage("Redigerer bruger " + userId);
    }

    if (event.target.classList.contains("delete-btn")) {
        const userId = event.target.closest("tr").dataset.userId;

        try {
            const response = await fetch(`${base_url}/users/${userId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("HTTP Error " + response.status);

            users = users.filter(u => u.id != userId);
            renderUsers(users);
            showMessage("Sletning succesfuldt");
        } catch (err) {
            showMessage("Sletning fejlet " + err.message);
        }
    }
});

document.addEventListener("DOMContentLoaded", fetchUsers);