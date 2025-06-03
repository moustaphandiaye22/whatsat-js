document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // VARIABLES GLOBALES
  // ===========================
  
  const botReplies = [
    "Salut ! Comment ça va ?",
    "tayy gen dead dh",
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
  let selectedGroup = null;
  let diffusionActive = false;
  let contactsSelectionnes = [];

    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let contactsBloques = [];


    // ===========================
// NOUVELLES FONCTIONS - Gestion des contacts
// ===========================

function supprimerContact(contact) {
  if (!contact) return;
  
  const confirmation = confirm(`ATTENTION !\n\nÊtes-vous sûr de vouloir supprimer définitivement le contact :\n${contact.nom} ${contact.prenom} ?\n\nCette action est irréversible.`);
  
  if (confirmation) {
    // Supprimer le contact de la liste
    const index = contacts.indexOf(contact);
    if (index > -1) {
      contacts.splice(index, 1);
    }
    
    // Le retirer des contacts bloqués s'il y était
    const blockedIndex = contactsBloques.findIndex(c => c.numero === contact.numero);
    if (blockedIndex > -1) {
      contactsBloques.splice(blockedIndex, 1);
    }
    
    // Réinitialiser la sélection si c'était le contact sélectionné
    if (selectedContact === contact) {
      selectedContact = null;
      viderDiscussion();
      afficherNomEnHaut();
    }
    
    // Rafraîchir l'affichage
    if (currentView === 'contacts') {
      afficherContacts();
    }
    
    showNotification(`${contact.nom} ${contact.prenom} supprimé définitivement`, 'error');
  }
}

function bloquerContact(contact) {
  if (!contact) return;
  
  const confirmation = confirm(`Bloquer le contact ${contact.nom} ${contact.prenom} ?\n\nVous ne recevrez plus ses messages.`);
  
  if (confirmation) {
    // Ajouter à la liste des bloqués s'il n'y est pas déjà
    if (!contactsBloques.find(c => c.numero === contact.numero)) {
      contactsBloques.push({...contact, dateBlocage: new Date()});
    }
    
    showNotification(`${contact.nom} ${contact.prenom} bloqué`, 'warning');
    afficherNomEnHaut(); // Actualiser l'affichage du titre
  }
}

function debloquerContact(contact) {
  if (!contact) return;
  
  const confirmation = confirm(`Débloquer le contact ${contact.nom} ${contact.prenom} ?`);
  
  if (confirmation) {
    // Retirer de la liste des bloqués
    const index = contactsBloques.findIndex(c => c.numero === contact.numero);
    if (index > -1) {
      contactsBloques.splice(index, 1);
      showNotification(`${contact.nom} ${contact.prenom} débloqué`, 'success');
      afficherNomEnHaut(); // Actualiser l'affichage du titre
    }
  }
}

function viderDiscussion() {
  const messagesContainer = document.getElementById("messages");
  if (!messagesContainer) return;
  
  let typeDiscussion = "";
  let nomDiscussion = "";
  
  if (selectedContact) {
    typeDiscussion = "contact";
    nomDiscussion = `${selectedContact.nom} ${selectedContact.prenom}`;
  } else if (selectedGroup) {
    typeDiscussion = "groupe";
    nomDiscussion = selectedGroup.nom;
  } else {
    showNotification("Aucune discussion sélectionnée", 'warning');
    return;
  }
  
  const confirmation = confirm(`Supprimer tous les messages de la discussion avec ${typeDiscussion === 'contact' ? 'le contact' : 'le groupe'} "${nomDiscussion}" ?\n\nCette action est irréversible.`);
  
  if (confirmation) {
    messagesContainer.innerHTML = `
      <div class="text-center p-4 text-gray-500">
        <i class="fas fa-broom text-2xl mb-2 text-orange-500"></i>
        <p class="text-sm">Discussion vidée</p>
        <p class="text-xs">Les messages ont été supprimés</p>
      </div>
    `;
    
    showNotification(`Messages supprimés de la discussion avec ${nomDiscussion}`, 'success');
  }
}

function estBloque(contact) {
  return contactsBloques.some(c => c.numero === contact.numero);
}
  // ===========================
  // CHAT - FONCTIONS
  // ===========================
  
  function addMessage(text, from = 'user', isVoice = false, audioBlob = null) {
  const bubble = document.createElement("div");
  const currentTime = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Simuler l'état de lecture (lu après 2 secondes pour les messages utilisateur)
  const messageId = Date.now() + Math.random();
  
  if (isVoice && audioBlob) {
    // Message vocal
    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = "0:05"; // Durée simulée
    
    bubble.innerHTML = `
      <div class="flex flex-col">
        <div class="flex items-center space-x-2 mb-1">
          <div class="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
            <i class="fas fa-microphone text-green-600"></i>
            <button class="play-btn text-green-600 hover:text-green-800" data-audio="${audioUrl}">
              <i class="fas fa-play"></i>
            </button>
            <div class="w-20 h-1 bg-green-200 rounded">
              <div class="w-0 h-full bg-green-500 rounded transition-all duration-300 progress-bar"></div>
            </div>
            <span class="text-xs text-green-600">${duration}</span>
          </div>
        </div>
        <div class="flex items-center justify-end space-x-1 text-xs text-gray-500">
          <span>${currentTime}</span>
          <span class="read-status" data-message-id="${messageId}">✓</span>
        </div>
      </div>
    `;
  } else {
    // Message texte normal
    bubble.innerHTML = `
      <div class="flex flex-col">
        <div class="mb-1">${text}</div>
        <div class="flex items-center justify-end space-x-1 text-xs text-gray-500">
          <span>${currentTime}</span>
          ${from === 'user' ? `<span class="read-status" data-message-id="${messageId}">✓</span>` : ''}
        </div>
      </div>
    `;
  }
  
  bubble.className = `p-3 rounded-lg shadow w-fit max-w-[90%] ${
    from === 'user' ? 'bg-green-100 self-end text-right' : 'bg-white self-start text-left'
  }`;
  
  document.getElementById("messages").appendChild(bubble);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
  
  // Simuler la lecture du message après 2 secondes (pour les messages utilisateur)
  if (from === 'user') {
    setTimeout(() => {
      const statusElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (statusElement) {
        statusElement.textContent = '✓✓';
        statusElement.style.color = '#10b981'; // Vert pour "lu"
      }
    }, 2000);
  }
  
  // Gestionnaire pour les messages vocaux
  if (isVoice) {
    const playBtn = bubble.querySelector('.play-btn');
    const progressBar = bubble.querySelector('.progress-bar');
    
    playBtn?.addEventListener('click', () => {
      const audio = new Audio(playBtn.dataset.audio);
      const icon = playBtn.querySelector('i');
      
      if (audio.paused) {
        audio.play();
        icon.className = 'fas fa-pause';
        
        audio.addEventListener('timeupdate', () => {
          const progress = (audio.currentTime / audio.duration) * 100;
          progressBar.style.width = `${progress}%`;
        });
        
        audio.addEventListener('ended', () => {
          icon.className = 'fas fa-play';
          progressBar.style.width = '0%';
        });
      } else {
        audio.pause();
        icon.className = 'fas fa-play';
      }
    });
  }
}

        function simulateBotResponse() {
        // Ne pas répondre si le contact est bloqué
        if (selectedContact && estBloque(selectedContact)) {
          return; // Pas de réponse du bot pour les contacts bloqués
        }
        
        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        setTimeout(() => addMessage(reply, 'bot'), 1000);
      }

        function sendMessage() {
        const messageInput = document.getElementById("messageInput");
        const text = messageInput.value.trim();
        if (!text) return;

        // NOUVEAU : Gestion du mode diffusion avec heure et indicateurs
        if (diffusionActive && contactsSelectionnes.length > 0) {
          addMessage(`Diffusion vers ${contactsSelectionnes.length} contact(s): ${text}`, 'user');
          
          contactsSelectionnes.forEach((contact, index) => {
            setTimeout(() => {
              addMessage(`Envoyé à ${contact.nom} ${contact.prenom}`, 'bot');
            }, (index + 1) * 200);
          });

          messageInput.value = "";
          
          setTimeout(() => {
            diffusionActive = false;
            contactsSelectionnes = [];
            
            const diffusionSection = document.getElementById('diffusionSection');
            if (diffusionSection) diffusionSection.remove();
            
            const messagesContainer = document.getElementById("messages");
            if (messagesContainer) {
              messagesContainer.innerHTML = `
                <div class="text-center p-4 text-gray-500">
                  <i class="fas fa-comments text-2xl mb-2"></i>
                  <p class="text-sm">Sélectionnez un contact ou un groupe pour commencer une conversation</p>
                </div>
              `;
            }
            
            messageInput.placeholder = "Tapez votre message...";
            afficherNomEnHaut();
            
            showNotification("Diffusion terminée avec succès", 'success');
          }, contactsSelectionnes.length * 200 + 500);
          
          return;
        }

        // ANCIEN CODE modifié : Logique normale pour contacts/groupes avec nouveaux indicateurs
        if (selectedContact) {
          addMessage(`${text}`, 'user');
        } else if (selectedGroup) {
          addMessage(`${text}`, 'user');
        } else {
          showNotification("Sélectionnez un contact ou un groupe", "warning");
          return;
        }

        messageInput.value = "";
        simulateBotResponse();
      }
    function afficherNomEnHaut() {
      const titre = document.getElementById("chatTitle");
      if (!titre) return;

      if (selectedContact) {
        // Pour un contact individuel
        const initials = `${selectedContact.nom[0] || ''}${selectedContact.prenom[0] || ''}`.toUpperCase();
        const isContactBloque = estBloque(selectedContact);
        
        titre.innerHTML = `
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                ${initials}
              </div>
              <div>
                <h3 class="font-semibold text-lg flex items-center">
                  ${selectedContact.nom} ${selectedContact.prenom}
                  ${isContactBloque ? '<span class="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full"><i class="fas fa-ban mr-1"></i>Bloqué</span>' : ''}
                </h3>
                <p class="text-sm text-gray-500">${selectedContact.numero}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-96">
              <button id="viderDiscussionBtn" class="text-orange-500 hover:text-orange-700 p-2 rounded-full hover:bg-orange-50 transition-colors" title="Vider la discussion">
                <i class="fas fa-broom"></i>
              </button>
              <button id="bloquerContactBtn" class="text-gray-800 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors" title="${isContactBloque ? 'Débloquer le contact' : 'Bloquer le contact'}">
                <i class="fas fa-${isContactBloque ? 'unlock' : 'ban'}"></i>
              </button>
              <button id="supprimerContactBtn" class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors" title="Supprimer le contact">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      } else if (selectedGroup) {
        // Pour un groupe
        const groupInitials = `${selectedGroup.nom[0] || ''}`.toUpperCase();
        const membresSimples = selectedGroup.membres.filter(m => !selectedGroup.admins.includes(m));
        
        titre.innerHTML = `
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                ${groupInitials}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-lg flex items-center">
                  ${selectedGroup.nom}
                </h3>
                <div class="text-sm text-gray-600">
                  <div class="flex flex-wrap gap-2 mt-1">
                    ${selectedGroup.admins.map(admin => `
                      <span class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs flex items-center">
                        <i class="fas fa-crown mr-1"></i>${admin}
                      </span>
                    `).join('')}
                    ${membresSimples.map(membre => `
                      <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                        <i class="fas fa-user mr-1"></i>${membre}
                      </span>
                    `).join('')}
                  </div>
                  <p class="text-xs text-gray-400 mt-1">
                    ${selectedGroup.membres.length} membre(s) • ${selectedGroup.admins.length} admin(s)
                  </p>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button id="viderDiscussionBtn" class="text-orange-500 hover:text-orange-700 p-2 rounded-full hover:bg-orange-50 transition-colors" title="Vider la discussion">
                <i class="fas fa-broom"></i>
              </button>
            </div>
          </div>
        `;
      } else {
        // Aucune sélection
        titre.innerHTML = `
          <div class="flex items-center justify-center h-16">
            <div class="text-center text-gray-500">
              <i class="fas fa-comments text-2xl mb-2"></i>
              <p class="text-sm">Sélectionnez un contact ou un groupe</p>
            </div>
          </div>
        `;
      }
      
      // Ajouter les événements pour les boutons
      ajouterEvenementsIcones();
    }

       

function ajouterEvenementsIcones() {
  // Bouton vider discussion
  document.getElementById('viderDiscussionBtn')?.addEventListener('click', () => {
    viderDiscussion();
  });
  
  // Bouton bloquer/débloquer contact
  document.getElementById('bloquerContactBtn')?.addEventListener('click', () => {
    if (selectedContact) {
      if (estBloque(selectedContact)) {
        debloquerContact(selectedContact);
      } else {
        bloquerContact(selectedContact);
      }
    }
  });
  
  // Bouton supprimer contact
  document.getElementById('supprimerContactBtn')?.addEventListener('click', () => {
    if (selectedContact) {
      supprimerContact(selectedContact);
    }
  });
}

// ===========================
// NOUVELLES FONCTIONS - Gestion des messages vocaux
// ===========================
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      
      if (diffusionActive && contactsSelectionnes.length > 0) {
        // Mode diffusion
        addMessage(`🎤 Message vocal diffusé vers ${contactsSelectionnes.length} contact(s)`, 'user', true, audioBlob);
        
        contactsSelectionnes.forEach((contact, index) => {
          setTimeout(() => {
            addMessage(`🎤 Message vocal envoyé à ${contact.nom} ${contact.prenom}`, 'bot');
          }, (index + 1) * 200);
        });
      } else if (selectedContact) {
        addMessage(`🎤 Message vocal à ${selectedContact.nom} ${selectedContact.prenom}`, 'user', true, audioBlob);
        simulateBotResponse();
      } else if (selectedGroup) {
        addMessage(`🎤 Message vocal au groupe ${selectedGroup.nom}`, 'user', true, audioBlob);
        simulateBotResponse();
      }
      
      // Arrêter tous les tracks du stream
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    isRecording = true;
    updateRecordButton();
    
  } catch (error) {
    console.error('Erreur d\'accès au microphone:', error);
    showNotification('Erreur d\'accès au microphone', 'error');
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    updateRecordButton();
  }
}

function updateRecordButton() {
  const recordBtn = document.getElementById('recordBtn');
  if (!recordBtn) return;
  
  if (isRecording) {
    recordBtn.innerHTML = '<i class="fas fa-stop text-red-500"></i>';
    recordBtn.className = 'bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors animate-pulse';
  } else {
    recordBtn.innerHTML = '<i class="fas fa-microphone text-gray-600"></i>';
    recordBtn.className = 'bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors';
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


  function afficherContactsBloques() {
  const liste = document.getElementById('chats');
  if (!liste) return;
  
  liste.innerHTML = '';

  const header = document.createElement('li');
  header.className = 'p-4 bg-red-50 border-b sticky top-0';
  header.innerHTML = `
    <div class="flex justify-between items-center">
      <h3 class="font-semibold text-gray-700">
        <i class="fas fa-ban mr-2 text-red-500"></i>Contacts bloqués (${contactsBloques.length})
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

  if (contactsBloques.length === 0) {
    liste.innerHTML += `
      <li class="p-8 text-center">
        <div class="text-gray-400">
          <i class="fas fa-ban text-4xl mb-3 text-red-300"></i>
          <p class="text-lg">Aucun contact bloqué</p>
          <p class="text-sm">Les contacts que vous bloquez apparaîtront ici</p>
        </div>
      </li>
    `;
    return;
  }

  contactsBloques.forEach(c => {
    const li = document.createElement('li');
    li.className = 'p-4 hover:bg-gray-50 flex justify-between items-center border-b';
    
    const initials = `${c.nom[0] || ''}${c.prenom[0] || ''}`.toUpperCase();
    
    li.innerHTML = `
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-red-400 text-white flex items-center justify-center mr-3 font-semibold opacity-60 relative">
          ${initials}
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
            <i class="fas fa-ban text-xs text-white"></i>
          </div>
        </div>
        <div>
          <span class="text-gray-800 font-medium">${c.nom} ${c.prenom}</span>
          <p class="text-sm text-gray-500">${c.numero}</p>
          <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full mt-1 inline-block">
            <i class="fas fa-ban mr-1"></i>Bloqué le ${c.dateBlocage ? new Date(c.dateBlocage).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="text-sm text-green-600 hover:bg-green-100 px-3 py-1 rounded border border-green-300 unblock-btn">
          <i class="fas fa-unlock mr-1"></i>Débloquer
        </button>
      </div>
    `;

    li.querySelector('.unblock-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      debloquerContact(c);
      setTimeout(() => afficherContactsBloques(), 100);
    });
    
    liste.appendChild(li);
  });
}
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
    const isContactBloque = estBloque(c);
    li.className = `p-4 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${isContactBloque ? 'opacity-60' : ''}`;

    const initials = `${c.nom[0] || ''}${c.prenom[0] || ''}`.toUpperCase();
    li.innerHTML = `
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full ${isContactBloque ? 'bg-gray-400' : 'bg-orange-500'} text-white flex items-center justify-center mr-2 font-semibold relative">
          ${initials}
          ${isContactBloque ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"><i class="fas fa-ban text-xs text-white"></i></div>' : ''}
        </div>
        <div>
          <span class="font-medium ${isContactBloque ? 'text-gray-500' : ''}">${c.nom} ${c.prenom}</span>
          <p class="text-sm text-gray-500">${c.numero}</p>
          ${isContactBloque ? '<p class="text-xs text-red-500"><i class="fas fa-ban mr-1"></i>Bloqué</p>' : ''}
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
      selectedGroup = null;
      afficherNomEnHaut();
    });
    
    liste.appendChild(li);
  });
}


  function afficherArchives() {
    const liste = document.getElementById('chats');
    if (!liste) return;
    
    liste.innerHTML = '';
    const archives = contacts.filter(c => c.archive);

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
        
        // CORRECTION : Utiliser les initiales au lieu d'un avatar statique
        const initials = `${c.nom[0] || ''}${c.prenom[0] || ''}`.toUpperCase();
        
        li.innerHTML = `
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3 font-semibold opacity-60">
              ${initials}
            </div>
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
          div.className = 'flex items-center justify-between space-x-2 p-2 border rounded mb-2';
          div.innerHTML = `
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="membre-${i}" value="${contact.nom}" class="membre-checkbox" />
              <label for="membre-${i}" class="font-medium">${contact.nom} ${contact.prenom}</label>
              <span class="text-xs text-gray-500">(${contact.numero})</span>
            </div>
            <div class="flex items-center space-x-2">
              <select id="role-${i}" class="text-xs border rounded px-2 py-1 role-select" disabled>
                <option value="membre">👤 Membre</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>
          `;
          
          // Activer/désactiver le select selon la checkbox
          const checkbox = div.querySelector(`#membre-${i}`);
          const roleSelect = div.querySelector(`#role-${i}`);
          
          checkbox.addEventListener('change', () => {
            roleSelect.disabled = !checkbox.checked;
            if (!checkbox.checked) {
              roleSelect.value = 'membre';
            }
          });
          
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

  // Récupérer les membres avec leurs rôles
  const membres = [];
  const admins = [];
  
  checked.forEach(checkbox => {
    const index = checkbox.id.split('-')[1];
    const roleSelect = document.getElementById(`role-${index}`);
    const memberName = checkbox.value;
    
    membres.push(memberName);
    if (roleSelect.value === 'admin') {
      admins.push(memberName);
    }
  });

  if (admins.length === 0) {
    document.getElementById('errorMembresGroupe').innerText = "Au moins un administrateur est requis.";
    return;
  }

  groupes.push({ 
    nom: nomGroupe, 
    description, 
    membres, 
    admins, // Nouvelle propriété
    date: new Date().toLocaleDateString() 
  });
  
  form.reset();
  document.getElementById('formGroupeContainer').classList.add('hidden');
  if (currentView === 'groups') afficherGroupes();
  showNotification(`Groupe créé avec ${admins.length} admin(s) et ${membres.length - admins.length} membre(s)`, 'success');
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
    
    // Séparer admins et membres simples
    const membresSimples = groupe.membres.filter(m => !groupe.admins.includes(m));
    
    li.innerHTML = `
      <div class="flex items-center space-x-2 flex-1">
        <div class="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
          ${initials}
        </div>
        <div class="flex-1">
          <p class="font-semibold">${groupe.nom}</p>
          <p class="text-sm text-gray-500">${groupe.description}</p>
          <div class="text-xs mt-1">
            <p class="text-red-600">👑 Admins: ${groupe.admins.join(', ')}</p>
            ${membresSimples.length > 0 ? `<p class="text-blue-600">👤 Membres: ${membresSimples.join(', ')}</p>` : ''}
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <p class="text-xs text-gray-400">${groupe.date}</p>
        <div class="flex gap-1 mt-1">
          <button class="text-green-600 hover:text-green-800 p-1 manage-btn" data-index="${i}" title="Gérer les rôles">
            <i class="fas fa-users-cog"></i>
          </button>
          <button class="text-blue-600 hover:text-blue-800 p-1 edit-btn" data-index="${i}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-500 hover:text-red-700 p-1 delete-btn" data-index="${i}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;

    // Bouton pour gérer les rôles
    li.querySelector('.manage-btn').addEventListener('click', () => {
      ouvrirGestionRoles(groupe, i);
    });

    // Modifier le bouton d'édition pour prendre en compte les rôles
    li.querySelector('.edit-btn').addEventListener('click', () => {
      const groupe = groupes[i];
      document.getElementById('formGroupeContainer').classList.remove('hidden');
      document.getElementById('formContainer').classList.add('hidden');
      document.getElementById('formGroupeContainer').scrollIntoView({ behavior: 'smooth' });

      document.getElementById('formGroupe').querySelector('input[type="text"]').value = groupe.nom;
      document.getElementById('formGroupe').querySelector('textarea').value = groupe.description;

      chargerMembresGroupe();
      setTimeout(() => {
        document.querySelectorAll('#groupeMembres input[type="checkbox"]').forEach((cb, index) => {
          if (groupe.membres.includes(cb.value)) {
            cb.checked = true;
            const roleSelect = document.getElementById(`role-${index}`);
            roleSelect.disabled = false;
            roleSelect.value = groupe.admins.includes(cb.value) ? 'admin' : 'membre';
          }
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
    
    li.addEventListener('click', (e) => {
      if (e.target.closest('.manage-btn') || e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
      
      document.querySelectorAll('#listeGroupes li').forEach(el => el.classList.remove('bg-purple-100'));
      li.classList.add('bg-purple-100');
      
      selectedGroup = groupe;
      selectedContact = null;
      afficherNomEnHaut();
    });
    
    listeGroupes.appendChild(li);
  });
}

  // ===========================
  // DIFFUSION - VERSION MODIFIÉE
  // ===========================
  
  function creerInterfaceDiffusion() {
  const contactsActifs = contacts.filter(c => !c.archive);
  if (contactsActifs.length === 0) {
    showNotification("Aucun contact disponible pour la diffusion.", 'info');
    return;
  }

  // Supprimer l'interface existante si elle existe
  const existingDiffusion = document.getElementById('diffusionSection');
  if (existingDiffusion) {
    existingDiffusion.remove();
  }

  // Créer l'interface de diffusion dans la partie discussion (sidebar)
  const chatsContainer = document.getElementById('chats');
  if (!chatsContainer) return;

  const diffusionSection = document.createElement('div');
  diffusionSection.id = 'diffusionSection';
  diffusionSection.className = 'bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2 mx-2';
  
  diffusionSection.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold flex items-center text-orange-700">
        <i class="fas fa-broadcast-tower mr-2"></i>Diffusion
      </h3>
      <button id="fermerDiffusion" class="text-gray-500 hover:text-gray-700 p-1">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="mb-3">
      <h4 class="font-medium mb-2 text-xs text-gray-700">Contacts :</h4>
      <div class="space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-white">
        <label class="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer text-xs">
          <input type="checkbox" id="selectAll" class="mr-2">
          <strong>Tout sélectionner</strong>
        </label>
        <hr class="my-1">
        ${contactsActifs.map((contact, index) => `
          <label class="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer text-xs">
            <input type="checkbox" value="${index}" class="contact-checkbox mr-2">
            <div class="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-xs font-semibold">
              ${(contact.nom[0] || '') + (contact.prenom[0] || '')}
            </div>
            <span class="truncate">${contact.nom} ${contact.prenom}</span>
          </label>
        `).join('')}
      </div>
    </div>
    
    <div class="flex gap-2">
      <button id="annulerDiffusion" class="flex-1 px-3 py-2 border rounded hover:bg-gray-50 text-xs">
        Annuler
      </button>
      <button id="confirmerDiffusion" class="flex-1 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs">
        Prêt
      </button>
    </div>
  `;

  // Insérer au début de la liste des chats
  chatsContainer.insertBefore(diffusionSection, chatsContainer.firstChild);

  // Gestion de "Tout sélectionner"
  const selectAllCheckbox = document.getElementById('selectAll');
  const contactCheckboxes = document.querySelectorAll('.contact-checkbox');
  
  selectAllCheckbox.addEventListener('change', () => {
    contactCheckboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  contactCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checkedCount = Array.from(contactCheckboxes).filter(cb => cb.checked).length;
      selectAllCheckbox.checked = checkedCount === contactCheckboxes.length;
      selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < contactCheckboxes.length;
    });
  });

 

  // Événements pour les boutons
  document.getElementById('fermerDiffusion').addEventListener('click', () => {
    diffusionSection.remove();
    diffusionActive = false;
    // Restaurer le titre du chat
    afficherNomEnHaut();
  });

  document.getElementById('annulerDiffusion').addEventListener('click', () => {
    diffusionSection.remove();
    diffusionActive = false;
    // Restaurer le titre du chat
    afficherNomEnHaut();
  });
  
  document.getElementById('confirmerDiffusion').addEventListener('click', () => {
    contactsSelectionnes = [];
    
    contactCheckboxes.forEach((checkbox, index) => {
      if (checkbox.checked) contactsSelectionnes.push(contactsActifs[index]);
    });

    if (contactsSelectionnes.length === 0) {
      showNotification("Sélectionnez au moins un contact.", 'warning');
      return;
    }

    // Activer le mode diffusion
    diffusionActive = true;
    selectedContact = null;
    selectedGroup = null;

    // Modifier le titre du chat pour indiquer le mode diffusion
    const titre = document.getElementById("chatTitle");
    if (titre) {
      titre.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            <i class="fas fa-broadcast-tower"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-orange-700">Mode Diffusion</h3>
            <p class="text-sm text-gray-500">${contactsSelectionnes.length} contact(s) sélectionné(s)</p>
          </div>
        </div>
      `;
    }

    // Vider les messages actuels
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="text-center p-4 text-gray-500">
          <i class="fas fa-broadcast-tower text-2xl mb-2 text-orange-500"></i>
          <p class="text-sm">Mode diffusion activé</p>
          <p class="text-xs">Tapez votre message pour l'envoyer à ${contactsSelectionnes.length} contact(s)</p>
        </div>
      `;
    }

    // Focus sur l'input de message
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.focus();
      messageInput.placeholder = "Tapez votre message de diffusion...";
    }

    showNotification(`Mode diffusion activé pour ${contactsSelectionnes.length} contact(s)`, 'success');
  });

  // Modifier la fonction sendMessage pour gérer la diffusion
  const originalSendMessage = window.sendMessage || sendMessage;
  
  window.sendMessage = function() {
    const messageInput = document.getElementById("messageInput");
    const text = messageInput.value.trim();
    if (!text) return;

    // Si le mode diffusion est actif
    if (diffusionActive && contactsSelectionnes.length > 0) {
      // Afficher le message de diffusion dans le chat
      addMessage(` Diffusion vers ${contactsSelectionnes.length} contact(s): ${text}`, 'user');
      
      // Simuler l'envoi à chaque contact
      contactsSelectionnes.forEach((contact, index) => {
        setTimeout(() => {
          addMessage(` Envoyé à ${contact.nom} ${contact.prenom}`, 'bot');
        }, (index + 1) * 2000);
      });

      messageInput.value = "";
      
      // Désactiver le mode diffusion après envoi
      setTimeout(() => {
        diffusionActive = false;
        contactsSelectionnes = [];
        diffusionSection.remove();
        
        // Restaurer l'interface normale
        const messagesContainer = document.getElementById("messages");
        if (messagesContainer) {
          messagesContainer.innerHTML = `
            <div class="text-center p-4 text-gray-500">
              <i class="fas fa-comments text-2xl mb-2"></i>
              <p class="text-sm">Sélectionnez un contact ou un groupe pour commencer une conversation</p>
            </div>
          `;
        }
        
        messageInput.placeholder = "Tapez votre message...";
        afficherNomEnHaut();
        
        showNotification("Diffusion terminée avec succès", 'success');
      }, contactsSelectionnes.length * 200 + 500);
      
      return;
    }

    // Sinon, utiliser la fonction normale
    originalSendMessage();
  };
}

  // ===========================
  // ÉVÉNEMENTS PRINCIPAUX
  // ===========================
  
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
  document.getElementById('btnDiffusion')?.addEventListener('click', () => {
    creerInterfaceDiffusion();
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

  document.getElementById('archiveContactIcon')?.addEventListener('click', () => {
    if (selectedContact && !selectedContact.archive) {
      archiverContact(selectedContact);
      selectedContact = null;
    } else {
      showNotification("Veuillez sélectionner un contact actif à archiver.", 'info');
    }
  });

  document.getElementById("recordBtn")?.addEventListener("click", () => {
  if (!selectedContact && !selectedGroup && !diffusionActive) {
    showNotification("Sélectionnez un contact ou un groupe", "warning");
    return;
  }
  
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

// À ajouter dans vos événements de navigation
document.getElementById('blockedContacts')?.addEventListener('click', () => {
  currentView = 'blocked';
  document.getElementById('listeContactsContainer')?.classList.remove('hidden');
  document.getElementById('listeGroupesContainer')?.classList.add('hidden');
  afficherContactsBloques();
});

const searchInput = document.getElementById('search');
searchInput?.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  const contactsList = document.querySelectorAll('#chats li');
  const chatsContainer = document.getElementById('chats');
  
  if (query === '*') {
    const contactsArray = Array.from(contactsList);
    
    contactsArray.sort((a, b) => {
      const nameA = a.querySelector('span')?.textContent || a.textContent;
      const nameB = b.querySelector('span')?.textContent || b.textContent;
      return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
    });
    
    contactsArray.forEach(contact => {
      contact.style.display = '';
      chatsContainer.appendChild(contact);
    });
    
    showNotification("Contacts triés par ordre alphabétique", 'info');
  }
  else {
    contactsList.forEach(contact => {
      const contactName = contact.textContent.toLowerCase();
      
      if (query === '' || contactName.includes(query)) {
        contact.style.display = '';
      }
      else {
        contact.style.display = 'none';
      }
    });
        if (query === '') {
      if (currentView === 'contacts') afficherContacts();
      else if (currentView === 'archives') afficherArchives();
    }
  }
});
  // Afficher les contacts par défaut
  afficherContacts();
  currentView = 'contacts';  

  
});