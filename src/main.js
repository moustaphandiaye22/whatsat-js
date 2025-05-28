document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // VARIABLES GLOBALES
  // ===========================
  
  const botReplies = [
    "Salut ! Comment ça va ?",
    "Haha, intéressant", 
    "Tu veux en parler plus ?",
    "Je suis juste un bot",
    "Tu peux me poser une question !",
    "breukkhhhh"
  ];

  let contacts = [
    { nom: "Tapha", prenom: "Sall", numero: "771234567", archive: false },
    { nom: "AWA", prenom: "Diop", numero: "778765432", archive: false }
  ];
  let groupes = [];
  let selectedContact = null;
  let currentView = 'contacts';

  // ===========================
  // CHAT - FONCTIONS
  // ===========================
  
  function addMessage(text, from = 'user') {
    const bubble = document.createElement("div");
    bubble.textContent = text;
    bubble.className = `p-3 rounded-lg shadow w-fit max-w-[90%] ${
      from === 'user' ? 'bg-green-100 self-end text-right' : 'bg-white self-start text-left'
    }`;
    document.getElementById("messages").appendChild(bubble);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
  }

  function simulateBotResponse() {
    const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
    setTimeout(() => addMessage(reply, 'bot'), 1000);
  }

  function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const text = messageInput.value.trim();
    if (text) {
      addMessage(text, 'user');
      messageInput.value = "";
      simulateBotResponse();
    }
  }

  // ===========================
  // UTILITAIRES
  // ===========================
  
  function clearErrors() {
    ['errorNomContact', 'errorPrenomContact', 'errorNumeroContact'].forEach(id => {
      document.getElementById(id).innerText = "";
    });
  }

  function clearGroupErrors() {
    ['errorNomGroupe', 'errorDescriptionGroupe', 'errorMembresGroupe'].forEach(id => {
      document.getElementById(id).innerText = "";
    });
  }

  function showNotification(message, type = 'info') {
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-orange-500', info: 'bg-blue-500' };
    const icons = { success: 'fas fa-check', error: 'fas fa-trash', warning: 'fas fa-archive', info: 'fas fa-info' };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notification.innerHTML = `<i class="${icons[type]} mr-2"></i>${message}`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ===========================
  // CONTACTS - GESTION
  // ===========================
  
  function validateContact(nom, prenom, numero) {
    if (!nom) return "Le nom est obligatoire.";
    if (!prenom) return "Le prénom est obligatoire.";
    if (!numero) return "Le numéro est obligatoire.";
    if (contacts.some(c => c.nom === nom && c.prenom === prenom)) return "Ce contact existe déjà.";
    if (contacts.some(c => c.numero === numero)) return "Numéro déjà utilisé.";
    if (!/^\d{5,15}$/.test(numero)) return "Numéro invalide (5-15 chiffres).";
    if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(nom)) return "Nom invalide (2-50 caractères, lettres uniquement).";
    return null;
  }

  function addContact() {
    clearErrors();
    const form = document.getElementById('formContact');
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"]');
    const [nom, prenom, numero] = [inputs[0].value.trim(), inputs[1].value.trim(), inputs[2].value.trim()];

    const error = validateContact(nom, prenom, numero);
    if (error) {
      const errorFields = ['errorNomContact', 'errorPrenomContact', 'errorNumeroContact'];
      const errorField = error.includes('nom') ? 0 : error.includes('prénom') ? 1 : 2;
      document.getElementById(errorFields[errorField]).innerText = error;
      return;
    }

    contacts.push({ nom, prenom, numero, archive: false });
    form.reset();
    document.getElementById('formContainer').classList.add('hidden');
    if (currentView === 'contacts') afficherContacts();
  }

  function archiverContact(contact) {
    if (contact && !contact.archive) {
      contact.archive = true;
      showNotification(`${contact.nom} ${contact.prenom} archivé !`, 'warning');
      if (currentView === 'contacts') afficherContacts();
      return true;
    }
    return false;
  }

  // ===========================
  // AFFICHAGE - CONTACTS
  // ===========================
  
  function afficherContacts() {
    const liste = document.getElementById('chats');
    if (!liste) return;
    
    liste.innerHTML = '';
    const actifs = contacts.filter(c => !c.archive);

    if (actifs.length === 0) {
      liste.innerHTML = '<li class="p-4"><p class="text-gray-400">Aucun contact actif.</p></li>';
      return;
    }

    actifs.forEach(c => {
      const li = document.createElement('li');
      li.className = 'p-4 hover:bg-gray-100 cursor-pointer flex items-center justify-between';

      const initials = `${c.nom[0] || ''}${c.prenom[0] || ''}`.toUpperCase();
      li.innerHTML = `
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 font-semibold">
            ${initials}
          </div>
          <div>
            <span class="font-medium">${c.nom} ${c.prenom}</span>
            <p class="text-sm text-gray-500">${c.numero}</p>
          </div>
        </div>
         <button class="text-sm text-orange-600 hover:bg-orange-100 px-2 py-1 rounded archive-btn">Archiver</button>
      `;

      li.querySelector('.archive-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        archiverContact(c);
      });

      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('archive-btn')) return;
        document.querySelectorAll('#chats li').forEach(el => el.classList.remove('bg-orange-100'));
        li.classList.add('bg-orange-100');
        selectedContact = c;
      });

      liste.appendChild(li);
    });
  }

  function afficherArchives() {
    const liste = document.getElementById('chats');
    if (!liste) return;
    
    liste.innerHTML = '';
    const archives = contacts.filter(c => c.archive);

    // En-tête
    const header = document.createElement('li');
    header.className = 'p-4 bg-gray-200 border-b sticky top-0';
    header.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-gray-700">
          <i class="fas fa-archive mr-2"></i>Contacts archivés (${archives.length})
        </h3>
        <button class="text-sm text-blue-600 hover:text-blue-800 flex items-center retour-btn">
          <i class="fas fa-arrow-left mr-1"></i>Retour aux contacts
        </button>
      </div>
    `;
    liste.appendChild(header);

    header.querySelector('.retour-btn').addEventListener('click', () => {
      currentView = 'contacts';
      afficherContacts();
    });

    if (archives.length === 0) {
      liste.innerHTML += `
        <li class="p-8 text-center">
          <div class="text-gray-400">
            <i class="fas fa-archive text-4xl mb-3"></i>
            <p class="text-lg">Aucun contact archivé</p>
            <p class="text-sm">Les contacts que vous archivez apparaîtront ici</p>
          </div>
        </li>
      `;
      return;
    }

    archives.forEach(c => {
      const li = document.createElement('li');
      li.className = 'p-4 hover:bg-gray-50 flex justify-between items-center border-b';
      li.innerHTML = `
        <div class="flex items-center">
          <img src="https://avatars.githubusercontent.com/u/12345678?v=4" class="w-10 h-10 rounded-full mr-3 opacity-60">
          <div>
            <span class="text-gray-800 font-medium">${c.nom} ${c.prenom}</span>
            <p class="text-sm text-gray-500">${c.numero}</p>
            <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full mt-1 inline-block">
              <i class="fas fa-archive mr-1"></i>Archivé
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="text-sm text-green-600 hover:bg-green-100 px-3 py-1 rounded border border-green-300 restore-btn">
            <i class="fas fa-undo mr-1"></i>Restaurer
          </button>
          <button class="text-sm text-red-600 hover:bg-red-100 px-3 py-1 rounded border border-red-300 delete-btn">
            <i class="fas fa-trash mr-1"></i>Supprimer
          </button>
        </div>
      `;

      li.querySelector('.restore-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Restaurer le contact ${c.nom} ${c.prenom} ?`)) {
          c.archive = false;
          afficherArchives();
          showNotification(`${c.nom} ${c.prenom} restauré !`, 'success');
        }
      });

      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`ATTENTION\n\nÊtes-vous sûr de vouloir supprimer définitivement `)) {
          const index = contacts.indexOf(c);
          if (index > -1) {
            contacts.splice(index, 1);
            afficherArchives();
            showNotification(`${c.nom} ${c.prenom} supprimé définitivement`, 'error');
          }
        }
      });

      liste.appendChild(li);
    });
  }

  // ===========================
  // GROUPES - GESTION
  // ===========================
  
  function chargerMembresGroupe() {
    const membresDiv = document.getElementById('groupeMembres');
    membresDiv.innerHTML = '';

    const actifs = contacts.filter(c => !c.archive);
    if (actifs.length === 0) {
      membresDiv.innerHTML = '<p class="text-gray-500">Aucun contact disponible.</p>';
      return;
    }

    actifs.forEach((contact, i) => {
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-2';
      div.innerHTML = `
        <input type="checkbox" id="membre-${i}" value="${contact.nom}" />
        <label for="membre-${i}">${contact.nom} ${contact.prenom} (${contact.numero})</label>
      `;
      membresDiv.appendChild(div);
    });
  }

  function addGroupe() {
    clearGroupErrors();
    const form = document.getElementById('formGroupe');
    const nomGroupe = form.querySelector('input[type="text"]').value.trim();
    const description = form.querySelector('textarea').value.trim();

    if (!nomGroupe) {
      document.getElementById('errorNomGroupe').innerText = "Le nom du groupe est obligatoire.";
      return;
    }
    if (groupes.some(g => g.nom === nomGroupe)) {
      document.getElementById('errorNomGroupe').innerText = "Ce groupe existe déjà.";
      return;
    }
    if (description.length > 200) {
      document.getElementById('errorDescriptionGroupe').innerText = "Description trop longue (max 200 caractères).";
      return;
    }

    const checked = document.querySelectorAll('#groupeMembres input:checked');
    if (checked.length < 2) {
      document.getElementById('errorMembresGroupe').innerText = "Minimum 2 membres requis.";
      return;
    }

    const membres = Array.from(checked).map(cb => cb.value);
    groupes.push({ nom: nomGroupe, description, membres, date: new Date().toLocaleDateString() });
    
    form.reset();
    document.getElementById('formGroupeContainer').classList.add('hidden');
    if (currentView === 'groups') afficherGroupes();
  }

  function afficherGroupes() {
    const listeGroupes = document.getElementById('listeGroupes');
    if (!listeGroupes) return;
    
    listeGroupes.innerHTML = '';
    
    if (groupes.length === 0) {
      listeGroupes.innerHTML = '<li class="p-4"><p class="text-gray-400">Aucun groupe créé.</p></li>';
      return;
    }

    groupes.forEach((groupe, i) => {
      const li = document.createElement('li');
      li.className = 'p-3 bg-white shadow rounded flex justify-between items-center mb-2';
      const initials = `${groupe.nom[0] || ''}`.toUpperCase();
      li.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
            ${initials}
          </div>
          <div>
            <p class="font-semibold">${groupe.nom}</p>
            <p class="text-sm text-gray-500">${groupe.description}</p>
            <p class="text-xs text-blue-500">Membres : ${groupe.membres.join(', ')}</p>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <p class="text-xs text-gray-400">${groupe.date}</p>
          <div class="flex gap-1 mt-1">
            <button class="text-blue-600 hover:text-blue-800 p-1 edit-btn" data-index="${i}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="text-red-500 hover:text-red-700 p-1 delete-btn" data-index="${i}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;

      li.querySelector('.edit-btn').addEventListener('click', () => {
        const groupe = groupes[i];
        document.getElementById('formGroupeContainer').classList.remove('hidden');
        document.getElementById('formContainer').classList.add('hidden');
        document.getElementById('formGroupeContainer').scrollIntoView({ behavior: 'smooth' });

        document.getElementById('formGroupe').querySelector('input[type="text"]').value = groupe.nom;
        document.getElementById('formGroupe').querySelector('textarea').value = groupe.description;

        chargerMembresGroupe();
        setTimeout(() => {
          document.querySelectorAll('#groupeMembres input[type="checkbox"]').forEach(cb => {
            if (groupe.membres.includes(cb.value)) cb.checked = true;
          });
        }, 100);

        groupes.splice(i, 1);
      });

      li.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
          groupes.splice(i, 1);
          afficherGroupes();
        }
      });

      listeGroupes.appendChild(li);
    });
  }

  // ===========================
  // DIFFUSION
  // ===========================
  
  function creerInterfaceDiffusion() {
    const contactsActifs = contacts.filter(c => !c.archive);
    if (contactsActifs.length === 0) {
      showNotification("Aucun contact disponible pour la diffusion.", 'info');
      return;
    }

    let diffusionSection = document.getElementById('diffusionSection');
    if (!diffusionSection) {
      diffusionSection = document.createElement('div');
      diffusionSection.id = 'diffusionSection';
      diffusionSection.className = 'bg-white rounded-lg shadow p-4 mb-4';
      
      const contactsSection = document.querySelector('.contacts-section') || document.querySelector('main') || document.body;
      contactsSection.appendChild(diffusionSection);
    }

    diffusionSection.innerHTML = `
      <h3 class="text-lg font-semibold mb-4">
        <i class="fas fa-broadcast-tower mr-2 text-orange-500"></i>Diffusion de message
      </h3>
      <div class="mb-4">
        <h4 class="font-medium mb-2">Sélectionner les contacts :</h4>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${contactsActifs.map((contact, index) => `
            <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" value="${index}" class="contact-checkbox mr-3">
              <span>${contact.nom} ${contact.prenom}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <div class="mb-4">
        <textarea id="messageDiffusion" placeholder="Votre message..." 
                  class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500" rows="3"></textarea>
      </div>
      <div class="flex gap-2">
        <button id="annulerDiffusion" class="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
        <button id="confirmerDiffusion" class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Envoyer</button>
      </div>
    `;

    document.getElementById('annulerDiffusion').addEventListener('click', () => diffusionSection.remove());
    
    document.getElementById('confirmerDiffusion').addEventListener('click', () => {
      const message = document.getElementById('messageDiffusion').value.trim();
      const contactsSelectionnes = [];
      
      document.querySelectorAll('.contact-checkbox').forEach((checkbox, index) => {
        if (checkbox.checked) contactsSelectionnes.push(contactsActifs[index]);
      });

      if (contactsSelectionnes.length === 0) {
        alert("Sélectionnez au moins un contact.");
        return;
      }
      if (!message) {
        alert("Entrez un message.");
        document.getElementById('messageDiffusion').focus();
        return;
      }

      contactsSelectionnes.forEach(contact => {
        if (typeof addMessage === 'function') {
          addMessage(`Diffusion à ${contact.nom} ${contact.prenom}: ${message}`, 'user');
        }
      });

      showNotification(`Message envoyé à ${contactsSelectionnes.length} contact(s)`, 'success');
      diffusionSection.remove();
    });

    document.getElementById('messageDiffusion').focus();
  }

  // ===========================
  // ÉVÉNEMENTS PRINCIPAUX
  // ===========================
  
  // Chat
  document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
  document.getElementById("messageInput")?.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  // Formulaires
  document.getElementById('btnNouveau')?.addEventListener('click', () => {
    document.getElementById('formContainer').classList.remove('hidden');
    document.getElementById('formGroupeContainer').classList.add('hidden');
    document.getElementById('formContainer').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btnFermer')?.addEventListener('click', () => {
    document.getElementById('formContainer').classList.add('hidden');
    document.getElementById('formContact').reset();
    clearErrors();
  });

  document.getElementById('btnGroupe')?.addEventListener('click', () => {
    document.getElementById('formGroupeContainer').classList.remove('hidden');
    document.getElementById('formContainer').classList.add('hidden');
    document.getElementById('formGroupeContainer').scrollIntoView({ behavior: 'smooth' });
    chargerMembresGroupe();
  });

  document.getElementById('btnFermerGroupe')?.addEventListener('click', () => {
    document.getElementById('formGroupeContainer').classList.add('hidden');
    document.getElementById('formGroupe').reset();
    clearGroupErrors();
  });

  document.getElementById('formContact')?.addEventListener('submit', e => {
    e.preventDefault();
    addContact();
  });

  document.getElementById('formGroupe')?.addEventListener('submit', e => {
    e.preventDefault();
    addGroupe();
  });

  // Navigation
  document.getElementById('contactList')?.addEventListener('click', () => {
    currentView = 'contacts';
    document.getElementById('listeContactsContainer')?.classList.remove('hidden');
    document.getElementById('listeGroupesContainer')?.classList.add('hidden');
    afficherContacts();
  });

  document.getElementById('toggleGroupes')?.addEventListener('click', () => {
    currentView = 'groups';
    document.getElementById('listeContactsContainer')?.classList.add('hidden');
    document.getElementById('listeGroupesContainer')?.classList.remove('hidden');
    afficherGroupes();
  });

  document.getElementById('archivedContacts')?.addEventListener('click', () => {
    currentView = 'archives';
    document.getElementById('listeContactsContainer')?.classList.remove('hidden');
    document.getElementById('listeGroupesContainer')?.classList.add('hidden');
    afficherArchives();
  });

  // Archivage depuis l'en-tête
  document.getElementById('archiveContactIcon')?.addEventListener('click', () => {
    if (selectedContact && !selectedContact.archive) {
      archiverContact(selectedContact);
      selectedContact = null;
    } else {
      showNotification("Veuillez sélectionner un contact actif à archiver.", 'info');
    }
  });

  // Diffusion
  document.getElementById('btnDiffusion')?.addEventListener('click', creerInterfaceDiffusion);

  // Initialisation
  afficherContacts();
  currentView = 'contacts';
});