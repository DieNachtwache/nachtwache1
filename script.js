document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const fahrerForm = document.getElementById('fahrerForm');
    const punkteForm = document.getElementById('punkteForm');
    const editForm = document.getElementById('editForm');
    const fahrerAkteModal = document.getElementById('fahrerAkteModal');
    const editModal = document.getElementById('editModal');

    let currentUser = null;
    let currentFahrerId = null;
    let currentPunkteId = null;

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const fahrer = JSON.parse(localStorage.getItem('fahrer')) || {};

    function saveUsers() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function saveFahrer() {
        localStorage.setItem('fahrer', JSON.stringify(fahrer));
    }

    function displayFahrer() {
        const userFahrer = fahrer[currentUser] || [];
        const fahrerListe = document.getElementById('fahrerListe');
        fahrerListe.innerHTML = '';
        userFahrer.forEach(f => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${f.name} - ${f.rang} - ${f.discordProfil} - ${f.beitrittsDatum}
                <span class="gear-icon" onclick="editFahrer(${f.id})">⚙️</span>
                <span class="trash-icon" onclick="deleteFahrer(${f.id})">🗑️</span>
            `;
            li.addEventListener('click', () => openFahrerAkte(f.id));
            fahrerListe.appendChild(li);
        });
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        if (users[username] && users[username].password === password) {
            currentUser = username;
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            displayFahrer();
        } else {
            alert('Ungültiger Benutzername oder Passwort');
        }
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        if (users[username]) {
            alert('Benutzername existiert bereits');
        } else {
            users[username] = { password };
            saveUsers();
            alert('Registrierung erfolgreich');
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'block';
        }
    });

    logoutButton.addEventListener('click', function() {
        currentUser = null;
        appContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    registerLink.addEventListener('click', function() {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    loginLink.addEventListener('click', function() {
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    function openFahrerAkte(fahrerId) {
        currentFahrerId = fahrerId;
        const f = fahrer[currentUser].find(f => f.id === fahrerId);
        document.getElementById('akteName').innerText = f.name;
        displayPunkte(f.punkte);
        fahrerAkteModal.style.display = 'block';
    }

    function displayPunkte(punkte) {
        const punkteTabelle = document.querySelector('#punkteTabelle tbody');
        punkteTabelle.innerHTML = '';
        punkte.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.datum}</td>
                <td>${p.details}</td>
                <td>${p.wert}</td>
                <td>
                    <span class="gear-icon" onclick="editPunkte(${p.id})">⚙️</span>
                    <span class="trash-icon" onclick="deletePunkte(${p.id})">🗑️</span>
                </td>
            `;
            punkteTabelle.appendChild(tr);
        });
    }

    fahrerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const rang = document.getElementById('rang').value;
        const discordProfil = document.getElementById('discordProfil').value;
        const beitrittsDatum = document.getElementById('beitrittsDatum').value;

        const neueFahrer = {
            id: Date.now(),
            name,
            rang,
            discordProfil,
            beitrittsDatum,
            punkte: []
        };

        if (!fahrer[currentUser]) {
            fahrer[currentUser] = [];
        }
        fahrer[currentUser].push(neueFahrer);
        saveFahrer();
        displayFahrer();
        fahrerForm.reset();
    });

    window.deleteFahrer = function(fahrerId) {
        fahrer[currentUser] = fahrer[currentUser].filter(f => f.id !== fahrerId);
        saveFahrer();
        displayFahrer();
    };

    window.editFahrer = function(fahrerId) {
        const f = fahrer[currentUser].find(f => f.id === fahrerId);
        document.getElementById('name').value = f.name;
        document.getElementById('rang').value = f.rang;
        document.getElementById('discordProfil').value = f.discordProfil;
        document.getElementById('beitrittsDatum').value = f.beitrittsDatum;
        deleteFahrer(fahrerId);
    };

    punkteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const datum = document.getElementById('punkteDatum').value;
        const details = document.getElementById('punkteDetails').value;
        const wert = document.getElementById('punkteWert').value;

        const neuePunkte = {
            id: Date.now(),
            datum,
            details,
            wert
        };

        const f = fahrer[currentUser].find(f => f.id === currentFahrerId);
        f.punkte.push(neuePunkte);
        saveFahrer();
        displayPunkte(f.punkte);
        punkteForm.reset();
    });

    window.editPunkte = function(punkteId) {
        const f = fahrer[currentUser].find(f => f.id === currentFahrerId);
        const p = f.punkte.find(p => p.id === punkteId);
        document.getElementById('editDatum').value = p.datum;
        document.getElementById('editDetails').value = p.details;
        document.getElementById('editWert').value = p.wert;
        currentPunkteId = punkteId;
        editModal.style.display = 'block';
    };

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const datum = document.getElementById('editDatum').value;
        const details = document.getElementById('editDetails').value;
        const wert = document.getElementById('editWert').value;

        const f = fahrer[currentUser].find(f => f.id === currentFahrerId);
        const pIndex = f.punkte.findIndex(p => p.id === currentPunkteId);
        f.punkte[pIndex] = { id: currentPunkteId, datum, details, wert };
        saveFahrer();
        displayPunkte(f.punkte);
        editModal.style.display = 'none';
    });

    window.deletePunkte = function(punkteId) {
        const f = fahrer[currentUser].find(f => f.id === currentFahrerId);
        f.punkte = f.punkte.filter(p => p.id !== punkteId);
        saveFahrer();
        displayPunkte(f.punkte);
    };

    document.querySelector('.close').addEventListener('click', function() {
        fahrerAkteModal.style.display = 'none';
    });

    document.querySelector('.close-edit').addEventListener('click', function() {
        editModal.style.display = 'none';
    });
});
