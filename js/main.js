// ===== GLOBAL STATE =====
let personnes = [];
let presences = [];
let currentDate = new Date();
let currentFilter = 'all';
let searchQuery = '';
let _lastFocusedElement = null; // to restore focus after closing modals
let tableView = false; // whether Excel-like table is visible

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    initializeDateSelector();
    attachEventListeners();
    await loadData();
    renderUI();
});

// ===== DATE MANAGEMENT =====
function initializeDateSelector() {
    const dateInput = document.getElementById('dateSelector');
    dateInput.valueAsDate = currentDate;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    document.getElementById('dateSelector').valueAsDate = currentDate;
    renderUI();
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
    // Header buttons
    document.getElementById('addPersonBtn').addEventListener('click', () => openPersonModal());
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Date controls
    document.getElementById('prevDayBtn').addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDayBtn').addEventListener('click', () => changeDate(1));
    document.getElementById('todayBtn').addEventListener('click', () => {
        currentDate = new Date();
        document.getElementById('dateSelector').valueAsDate = currentDate;
        renderUI();
    });
    document.getElementById('dateSelector').addEventListener('change', (e) => {
        currentDate = new Date(e.target.value);
        renderUI();
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderPeopleList();
    });
    
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // ensure we use the button element itself (not an inner icon)
            const button = e.currentTarget;
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            currentFilter = button.dataset.filter;
            renderPeopleList();
        });
    });
    
    // Person form
    document.getElementById('personForm').addEventListener('submit', handlePersonSubmit);
    // Real-time validation for person form
    const nomInput = document.getElementById('nom');
    const prenomInput = document.getElementById('prenom');
    const emailInput = document.getElementById('email');
    const posteInput = document.getElementById('poste');
    const submitBtn = document.getElementById('personSubmitBtn');
    if (nomInput) nomInput.addEventListener('input', () => { validateField(nomInput); toggleSubmitEnabled(); });
    if (prenomInput) prenomInput.addEventListener('input', () => { validateField(prenomInput); toggleSubmitEnabled(); });
    if (emailInput) emailInput.addEventListener('input', () => { validateField(emailInput); toggleSubmitEnabled(); });
    if (posteInput) posteInput.addEventListener('input', () => { validateField(posteInput); toggleSubmitEnabled(); });
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('avatar_color').value = e.target.dataset.color;
        });
    });
    
    // Presence buttons
    document.querySelectorAll('.presence-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const status = e.currentTarget.dataset.status;
            markPresence(status);
        });
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Empty state add button (wired in index.html)
    const emptyAddBtn = document.getElementById('emptyAddBtn');
    if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', () => openPersonModal());
    }

    // Table view toggle
    const tableBtn = document.getElementById('tableViewBtn');
    if (tableBtn) {
        tableBtn.addEventListener('click', () => toggleTableView());
    }

    const tableExportBtn = document.getElementById('tableExportBtn');
    if (tableExportBtn) tableExportBtn.addEventListener('click', exportData);
    // ensure submit enabled state reflects initial values
    toggleSubmitEnabled();
}

// ===== FORM VALIDATION HELPERS =====
function isValidEmail(value) {
    if (!value) return true; // optional field
    // simple email regex (not exhaustive)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showFieldError(inputEl, message) {
    const id = inputEl.id + 'Error';
    const err = document.getElementById(id);
    if (err) err.textContent = message || '';
    inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearFieldError(inputEl) {
    showFieldError(inputEl, '');
}

function validateField(inputEl) {
    const val = (inputEl.value || '').trim();
    if (inputEl.id === 'nom' || inputEl.id === 'prenom') {
        if (!val) {
            showFieldError(inputEl, 'Ce champ est requis');
            return false;
        }
        if (val.length < 1) {
            showFieldError(inputEl, 'Valeur trop courte');
            return false;
        }
        clearFieldError(inputEl);
        return true;
    }
    if (inputEl.id === 'email') {
        if (val && !isValidEmail(val)) {
            showFieldError(inputEl, 'Email invalide');
            return false;
        }
        clearFieldError(inputEl);
        return true;
    }
    // default
    clearFieldError(inputEl);
    return true;
}

function validatePersonForm() {
    const nom = document.getElementById('nom');
    const prenom = document.getElementById('prenom');
    const email = document.getElementById('email');
    let ok = true;
    if (!validateField(nom)) ok = false;
    if (!validateField(prenom)) ok = false;
    if (!validateField(email)) ok = false;
    return ok;
}

function toggleSubmitEnabled() {
    const submitBtn = document.getElementById('personSubmitBtn');
    if (!submitBtn) return;
    submitBtn.disabled = !validatePersonForm();
}

function toggleTableView() {
    tableView = !tableView;
    const tableSection = document.getElementById('tableSection');
    const tableBtn = document.getElementById('tableViewBtn');
    if (tableView) {
        tableSection.hidden = false;
        tableSection.setAttribute('aria-hidden', 'false');
        // hide the list and empty-state but keep the parent visible so the table can be shown
        const peopleList = document.getElementById('peopleList');
        const emptyState = document.getElementById('emptyState');
        if (peopleList) peopleList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        if (tableBtn) tableBtn.setAttribute('aria-pressed', 'true');
        renderTableView();
    } else {
        tableSection.hidden = true;
        tableSection.setAttribute('aria-hidden', 'true');
        const peopleList = document.getElementById('peopleList');
        const emptyState = document.getElementById('emptyState');
        if (peopleList) peopleList.style.display = 'grid';
        if (emptyState) emptyState.style.display = '';
        if (tableBtn) tableBtn.setAttribute('aria-pressed', 'false');
    }
}

function renderTableView() {
    const tbody = document.querySelector('#peopleTable tbody');
    tbody.innerHTML = '';
    const dateStr = formatDate(currentDate);

    // re-use the same filtering logic
    let filtered = personnes.filter(person => {
        if (searchQuery) {
            const searchText = `${person.nom} ${person.prenom} ${person.email || ''} ${person.poste || ''}`.toLowerCase();
            if (!searchText.includes(searchQuery)) return false;
        }
        if (currentFilter !== 'all') {
            const presence = presences.find(p => p.personne_id === person.id && p.date === dateStr);
            if (currentFilter === 'present' && (!presence || (presence.statut !== 'present' && presence.statut !== 'retard'))) return false;
            if (currentFilter === 'absent' && presence && (presence.statut === 'present' || presence.statut === 'retard')) return false;
        }
        return true;
    });

    filtered.forEach(person => {
        const tr = document.createElement('tr');

        // Nom (first)
        const tdNom = document.createElement('td');
        tdNom.contentEditable = true;
        tdNom.textContent = person.nom || '';
        tdNom.dataset.personId = person.id;
        tdNom.dataset.field = 'nom';
        tdNom.addEventListener('blur', handleCellEdit);
        tr.appendChild(tdNom);

        // Prenom (second)
        const tdPrenom = document.createElement('td');
        tdPrenom.contentEditable = true;
        tdPrenom.textContent = person.prenom || '';
        tdPrenom.dataset.personId = person.id;
        tdPrenom.dataset.field = 'prenom';
        tdPrenom.addEventListener('blur', handleCellEdit);
        tr.appendChild(tdPrenom);

        // Email
        const tdEmail = document.createElement('td');
        tdEmail.contentEditable = true;
        tdEmail.textContent = person.email || '';
        tdEmail.dataset.personId = person.id;
        tdEmail.dataset.field = 'email';
        tdEmail.addEventListener('blur', handleCellEdit);
        tr.appendChild(tdEmail);

        // Poste
        const tdPoste = document.createElement('td');
        tdPoste.contentEditable = true;
        tdPoste.textContent = person.poste || '';
        tdPoste.dataset.personId = person.id;
        tdPoste.dataset.field = 'poste';
        tdPoste.addEventListener('blur', handleCellEdit);
        tr.appendChild(tdPoste);

        // Statut select
        const tdStatut = document.createElement('td');
        const dateNow = dateStr;
        const presence = presences.find(p => p.personne_id === person.id && p.date === dateNow);
        const select = document.createElement('select');
        ['none','present','absent','retard','conge'].forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s === 'none' ? 'non marqué' : s;
            select.appendChild(opt);
        });
        select.value = presence ? presence.statut : 'none';
        select.dataset.personId = person.id;
        select.addEventListener('change', (e) => {
            const newStatus = e.target.value === 'none' ? 'absent' : e.target.value;
            // set presence inputs and call markPresence
            document.getElementById('presencePersonId').value = person.id;
            document.getElementById('presenceDate').value = dateNow;
            document.getElementById('presenceNotes').value = presence?.notes || '';
            markPresence(newStatus);
            // re-render table after a slight delay to reflect change
            setTimeout(() => renderTableView(), 200);
        });
        tdStatut.appendChild(select);
        tr.appendChild(tdStatut);

        // Notes
        const tdNotes = document.createElement('td');
        tdNotes.contentEditable = true;
        tdNotes.textContent = presence?.notes || '';
        tdNotes.dataset.personId = person.id;
        tdNotes.dataset.field = 'presence_notes';
        tdNotes.addEventListener('blur', handlePresenceNotesEdit);
        tr.appendChild(tdNotes);

        tbody.appendChild(tr);
    });
}

function handleCellEdit(e) {
    const field = e.target.dataset.field;
    const personId = e.target.dataset.personId;
    const value = e.target.textContent.trim();
    const index = personnes.findIndex(p => p.id === personId);
    if (index === -1) return;
    personnes[index][field] = value;
    // try to persist via API, else save local
    (async () => {
        try {
            // only try API if id does not start with local-
            if (!personId.startsWith('local-')) {
                const response = await fetch(`tables/personnes/${personId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(personnes[index])
                });
                if (!response.ok) throw new Error('API save failed');
            }
        } catch (err) {
            saveLocalState();
            showToast('Info', 'Modification enregistrée localement (mode offline)', 'info');
        }
    })();
}

function handlePresenceNotesEdit(e) {
    const personId = e.target.dataset.personId;
    const notes = e.target.textContent.trim();
    const dateNow = formatDate(currentDate);
    // set presence inputs and call markPresence with current select value
    document.getElementById('presencePersonId').value = personId;
    document.getElementById('presenceDate').value = dateNow;
    document.getElementById('presenceNotes').value = notes;
    // find existing presence to preserve status
    const existing = presences.find(p => p.personne_id === personId && p.date === dateNow);
    const status = existing ? existing.statut : 'present';
    markPresence(status);
    setTimeout(() => renderTableView(), 200);
}

// ===== DATA LOADING =====
async function loadData() {
    showLoading();
    try {
        // If the page is opened via file://, fetch() will fail due to CORS and non-http protocol.
        // Fallback to localStorage in that case so the UI remains usable offline.
        const isFileProtocol = window.location.protocol === 'file:';

        if (isFileProtocol) {
            // load from localStorage
            const localPersonnes = localStorage.getItem('personnes');
            const localPresences = localStorage.getItem('presences');
            personnes = localPersonnes ? JSON.parse(localPersonnes) : [];
            presences = localPresences ? JSON.parse(localPresences) : [];
            showToast('Info', 'Mode local (file://) : données chargées depuis localStorage. Pour utiliser une API, lancez un serveur HTTP local.', 'info');
        } else {
            // Load personnes
            const personnesResponse = await fetch('tables/personnes?limit=1000');
            const personnesData = await personnesResponse.json();
            personnes = personnesData.data || [];

            // Load presences
            const presencesResponse = await fetch('tables/presences?limit=10000');
            const presencesData = await presencesResponse.json();
            presences = presencesData.data || [];
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // On network errors, fallback to localStorage as best-effort
        const localPersonnes = localStorage.getItem('personnes');
        const localPresences = localStorage.getItem('presences');
        personnes = localPersonnes ? JSON.parse(localPersonnes) : [];
        presences = localPresences ? JSON.parse(localPresences) : [];
        showToast('Erreur', 'Impossible de charger les données depuis l\'API. Mode local activé (localStorage).', 'error');
    }
    hideLoading();
}

// Save current in-memory state to localStorage (used as offline fallback)
function saveLocalState() {
    try {
        localStorage.setItem('personnes', JSON.stringify(personnes));
        localStorage.setItem('presences', JSON.stringify(presences));
    } catch (e) {
        console.warn('Unable to save to localStorage', e);
    }
}

// ===== UI RENDERING =====
function renderUI() {
    renderStats();
    renderPeopleList();
}

function renderStats() {
    const totalPersonnes = personnes.length;
    const dateStr = formatDate(currentDate);
    const todayPresences = presences.filter(p => p.date === dateStr);
    
    const presentsCount = todayPresences.filter(p => p.statut === 'present' || p.statut === 'retard').length;
    const absentsCount = totalPersonnes - presentsCount;
    const tauxPresence = totalPersonnes > 0 ? Math.round((presentsCount / totalPersonnes) * 100) : 0;
    
    document.getElementById('totalPersonnes').textContent = totalPersonnes;
    document.getElementById('totalPresents').textContent = presentsCount;
    document.getElementById('totalAbsents').textContent = absentsCount;
    document.getElementById('tauxPresence').textContent = `${tauxPresence}%`;
}

function renderPeopleList() {
    const container = document.getElementById('peopleList');
    const emptyState = document.getElementById('emptyState');
    const dateStr = formatDate(currentDate);

    if (personnes.length === 0) {
        container.style.display = 'none';
        emptyState.classList.add('show');
        document.getElementById('countBadge').textContent = '0 personnes';
        container.innerHTML = '';
        return;
    }

    // Filter and search
    let filtered = personnes.filter(person => {
        // Search filter
        if (searchQuery) {
            const searchText = `${person.nom} ${person.prenom} ${person.email || ''} ${person.poste || ''}`.toLowerCase();
            if (!searchText.includes(searchQuery)) return false;
        }

        // Status filter
        if (currentFilter !== 'all') {
            const presence = presences.find(p => p.personne_id === person.id && p.date === dateStr);
            if (currentFilter === 'present' && (!presence || (presence.statut !== 'present' && presence.statut !== 'retard'))) {
                return false;
            }
            if (currentFilter === 'absent' && presence && (presence.statut === 'present' || presence.statut === 'retard')) {
                return false;
            }
        }

        return true;
    });

    container.style.display = 'grid';
    emptyState.classList.remove('show');
    document.getElementById('countBadge').textContent = `${filtered.length} personne${filtered.length > 1 ? 's' : ''}`;

    // Clear container and build DOM nodes to avoid unsafe innerHTML
    container.innerHTML = '';

    filtered.forEach(person => {
        const presence = presences.find(p => p.personne_id === person.id && p.date === dateStr);
        const initials = `${person.prenom?.[0] || ''}${person.nom?.[0] || ''}`.toUpperCase();

        const card = document.createElement('div');
        card.className = 'person-card';

        const header = document.createElement('div');
        header.className = 'person-header';

        const avatar = document.createElement('div');
        avatar.className = 'person-avatar';
        avatar.style.background = person.avatar_color || '#4F46E5';
        avatar.textContent = initials;

        const info = document.createElement('div');
        info.className = 'person-info';

        const nameEl = document.createElement('div');
        nameEl.className = 'person-name';
        nameEl.textContent = `${person.prenom} ${person.nom}`;

        info.appendChild(nameEl);

        if (person.poste) {
            const posteEl = document.createElement('div');
            posteEl.className = 'person-poste';
            posteEl.textContent = person.poste;
            info.appendChild(posteEl);
        }

        if (person.email) {
            const emailEl = document.createElement('div');
            emailEl.className = 'person-email';
            const icon = document.createElement('i');
            icon.className = 'fas fa-envelope';
            emailEl.appendChild(icon);
            const text = document.createTextNode(' ' + person.email);
            emailEl.appendChild(text);
            info.appendChild(emailEl);
        }

        header.appendChild(avatar);
        header.appendChild(info);

        card.appendChild(header);

        // Presence status (DOM)
        const statusEl = renderPresenceStatus(presence);
        card.appendChild(statusEl);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'person-actions';

        const btnPresence = document.createElement('button');
        btnPresence.type = 'button';
        btnPresence.className = 'action-btn';
        btnPresence.innerHTML = '<i class="fas fa-clipboard-check"></i> <span>Présence</span>';
        btnPresence.addEventListener('click', () => openPresenceModal(person.id));

        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.className = 'action-btn';
        btnEdit.innerHTML = '<i class="fas fa-edit"></i> <span>Modifier</span>';
        btnEdit.addEventListener('click', () => editPerson(person.id));

        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'action-btn danger';
        btnDelete.innerHTML = '<i class="fas fa-trash"></i> <span>Supprimer</span>';
        btnDelete.addEventListener('click', () => deletePerson(person.id));

        actions.appendChild(btnPresence);
        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        card.appendChild(actions);

        container.appendChild(card);
    });
}

function renderPresenceStatus(presence) {
    const span = document.createElement('span');
    span.className = 'presence-status';

    if (!presence) {
        span.classList.add('none');
        const icon = document.createElement('i');
        icon.className = 'fas fa-question-circle';
        span.appendChild(icon);
        span.appendChild(document.createTextNode(' Non marqué'));
        return span;
    }

    const statusConfig = {
        present: { icon: 'fa-check-circle', label: 'Présent' },
        absent: { icon: 'fa-times-circle', label: 'Absent' },
        retard: { icon: 'fa-clock', label: 'Retard' },
        conge: { icon: 'fa-umbrella-beach', label: 'Congé' }
    };

    const config = statusConfig[presence.statut] || statusConfig.present;
    span.classList.add(presence.statut);
    const icon = document.createElement('i');
    icon.className = 'fas ' + config.icon;
    span.appendChild(icon);
    span.appendChild(document.createTextNode(' ' + config.label));
    return span;
}

// ===== PERSON MANAGEMENT =====
function openPersonModal(personId = null) {
    const modal = document.getElementById('personModal');
    const form = document.getElementById('personForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.querySelectorAll('.color-option').forEach((btn, index) => {
        btn.classList.toggle('active', index === 0);
    });
    document.getElementById('avatar_color').value = '#4F46E5';
    
    if (personId) {
        const person = personnes.find(p => p.id === personId);
        if (person) {
            title.textContent = 'Modifier la Personne';
            document.getElementById('personId').value = person.id;
            document.getElementById('nom').value = person.nom;
            document.getElementById('prenom').value = person.prenom;
            document.getElementById('email').value = person.email || '';
            document.getElementById('poste').value = person.poste || '';
            document.getElementById('avatar_color').value = person.avatar_color;
            
            // Set active color
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === person.avatar_color);
            });
        }
    } else {
        title.textContent = 'Nouvelle Personne';
        document.getElementById('personId').value = '';
    }
    
    // clear previous validation messages
    document.querySelectorAll('#personForm .field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('#personForm input').forEach(i => i.removeAttribute('aria-invalid'));
    toggleSubmitEnabled();

    // accessibility: remember focus and expose modal
    _lastFocusedElement = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    // focus first input for convenience
    const firstInput = document.getElementById('nom') || document.querySelector('#personModal input, #personModal button');
    if (firstInput) firstInput.focus();
}

async function handlePersonSubmit(e) {
    e.preventDefault();
    showLoading();
    // client-side validation
    if (!validatePersonForm()) {
        showToast('Erreur', 'Veuillez corriger les champs requis', 'error');
        hideLoading();
        return;
    }

    const personId = document.getElementById('personId').value;
    const personData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        email: document.getElementById('email').value,
        poste: document.getElementById('poste').value,
        avatar_color: document.getElementById('avatar_color').value
    };

    try {
        if (personId) {
            // Try API update first; if it fails, persist locally
            try {
                const response = await fetch(`tables/personnes/${personId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(personData)
                });

                if (response.ok) {
                    const updatedPerson = await response.json();
                    const index = personnes.findIndex(p => p.id === personId);
                    if (index !== -1) {
                        personnes[index] = updatedPerson;
                    }
                    // mirror to local storage for offline resilience
                    saveLocalState();
                    showToast('Succès', 'Personne modifiée avec succès', 'success');
                } else {
                    throw new Error('API update failed');
                }
            } catch (err) {
                // Offline fallback: update local record
                const index = personnes.findIndex(p => p.id === personId);
                if (index !== -1) {
                    personnes[index] = Object.assign({}, personnes[index], personData);
                } else {
                    personnes.push(Object.assign({ id: personId }, personData));
                }
                saveLocalState();
                showToast('Info', 'Modification enregistrée localement (mode offline)', 'info');
            }
        } else {
            // Create new person via API or fallback to local
            try {
                const response = await fetch('tables/personnes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(personData)
                });

                if (response.ok) {
                    const newPerson = await response.json();
                    personnes.push(newPerson);
                    // mirror to local storage
                    saveLocalState();
                    showToast('Succès', 'Personne ajoutée avec succès', 'success');
                } else {
                    throw new Error('API create failed');
                }
            } catch (err) {
                const localId = 'local-' + Date.now();
                const newPerson = Object.assign({ id: localId }, personData);
                personnes.push(newPerson);
                saveLocalState();
                showToast('Info', 'Personne ajoutée localement (mode offline)', 'info');
            }
        }

        closeModal('personModal');
        renderUI();
    } catch (error) {
        console.error('Error saving person:', error);
        showToast('Erreur', 'Impossible de sauvegarder la personne', 'error');
    }

    hideLoading();
}

function editPerson(personId) {
    openPersonModal(personId);
}

async function deletePerson(personId) {
    const person = personnes.find(p => p.id === personId);
    if (!person) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${person.prenom} ${person.nom} ?`)) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`tables/personnes/${personId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            personnes = personnes.filter(p => p.id !== personId);
            // Also remove associated presences via API
            const personPresences = presences.filter(p => p.personne_id === personId);
            for (const presence of personPresences) {
                try {
                    await fetch(`tables/presences/${presence.id}`, { method: 'DELETE' });
                } catch (err) {
                    // ignore per-presence delete errors and continue
                }
            }
            presences = presences.filter(p => p.personne_id !== personId);
            showToast('Succès', 'Personne supprimée avec succès', 'success');
            renderUI();
        }
    } catch (error) {
        console.error('Error deleting person:', error);
        // Offline fallback: remove locally and persist to localStorage
        personnes = personnes.filter(p => p.id !== personId);
        presences = presences.filter(p => p.personne_id !== personId);
        saveLocalState();
        showToast('Info', 'Personne supprimée localement (mode offline)', 'info');
        renderUI();
    }
    
    hideLoading();
}

// ===== PRESENCE MANAGEMENT =====
function openPresenceModal(personId) {
    const person = personnes.find(p => p.id === personId);
    if (!person) return;
    
    const modal = document.getElementById('presenceModal');
    const title = document.getElementById('presenceModalTitle');
    const dateStr = formatDate(currentDate);
    
    title.textContent = `Présence - ${person.prenom} ${person.nom}`;
    document.getElementById('presencePersonId').value = personId;
    document.getElementById('presenceDate').value = dateStr;
    
    // Load existing presence notes
    const presence = presences.find(p => p.personne_id === personId && p.date === dateStr);
    document.getElementById('presenceNotes').value = presence?.notes || '';
    
    // accessibility: remember focus and expose modal
    _lastFocusedElement = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    // focus first presence button
    const firstBtn = modal.querySelector('.presence-btn');
    if (firstBtn) firstBtn.focus();
}

async function markPresence(status) {
    const personId = document.getElementById('presencePersonId').value;
    const dateStr = document.getElementById('presenceDate').value;
    const notes = document.getElementById('presenceNotes').value;
    
    if (!personId || !dateStr) return;
    
    showLoading();
    closeModal('presenceModal');
    try {
        // Check if presence already exists
        const existingPresence = presences.find(p => p.personne_id === personId && p.date === dateStr);
        
        const presenceData = {
            personne_id: personId,
            date: dateStr,
            statut: status,
            notes: notes
        };

        if (existingPresence) {
            // Try to update via API; fallback to local update on failure
            try {
                const response = await fetch(`tables/presences/${existingPresence.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(presenceData)
                });

                if (response.ok) {
                    const updatedPresence = await response.json();
                    const index = presences.findIndex(p => p.id === existingPresence.id);
                    if (index !== -1) presences[index] = updatedPresence;
                    showToast('Succès', 'Présence mise à jour', 'success');
                } else {
                    throw new Error('API update failed');
                }
            } catch (err) {
                // Offline/local fallback
                const index = presences.findIndex(p => p.personne_id === personId && p.date === dateStr);
                if (index !== -1) {
                    presences[index] = Object.assign({}, presences[index], presenceData);
                } else {
                    presences.push(Object.assign({ id: 'local-pres-' + Date.now() }, presenceData));
                }
                saveLocalState();
                showToast('Info', 'Présence enregistrée localement (mode offline)', 'info');
            }
        } else {
            // Try to create via API; fallback to local create on failure
            try {
                const response = await fetch('tables/presences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(presenceData)
                });

                if (response.ok) {
                    const newPresence = await response.json();
                    presences.push(newPresence);
                    showToast('Succès', 'Présence enregistrée', 'success');
                } else {
                    throw new Error('API create failed');
                }
            } catch (err) {
                const localId = 'local-pres-' + Date.now();
                const newPresence = Object.assign({ id: localId }, presenceData);
                presences.push(newPresence);
                saveLocalState();
                showToast('Info', 'Présence enregistrée localement (mode offline)', 'info');
            }
        }

        renderUI();
    } catch (error) {
        console.error('Error marking presence:', error);
        showToast('Erreur', 'Impossible d\'enregistrer la présence', 'error');
    }

    hideLoading();
}

// ===== EXPORT DATA =====
function exportData() {
    const dateStr = formatDate(currentDate);
    const todayPresences = presences.filter(p => p.date === dateStr);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Prénom,Nom,Email,Poste,Statut,Notes\n";
    
    personnes.forEach(person => {
        const presence = todayPresences.find(p => p.personne_id === person.id);
        const statut = presence ? presence.statut : 'non marqué';
        const notes = presence?.notes ? presence.notes.replace(/,/g, ';') : '';
        
        csvContent += `${person.prenom},${person.nom},${person.email || ''},${person.poste || ''},${statut},"${notes}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presences_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Succès', 'Données exportées', 'success');
}

// ===== MODAL HELPERS =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    // restore focus
    try {
        if (_lastFocusedElement && typeof _lastFocusedElement.focus === 'function') {
            _lastFocusedElement.focus();
        }
    } catch (e) {
        // ignore
    }
    _lastFocusedElement = null;
}

// ===== UI HELPERS =====
function showLoading() {
    document.getElementById('loadingSpinner').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('show');
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const id = Date.now();
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = `toast-${id}`;

    const iconEl = document.createElement('i');
    iconEl.className = 'fas ' + (icons[type] || icons.info);

    const content = document.createElement('div');
    content.className = 'toast-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;

    const msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;

    content.appendChild(titleEl);
    content.appendChild(msgEl);

    toast.appendChild(iconEl);
    toast.appendChild(content);

    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}
