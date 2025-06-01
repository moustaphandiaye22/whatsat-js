const users = [
  { username: "admin", password: "1234" },
  { username: "odc", password: "passodc" }
];

// Afficher/masquer le mot de passe
document.getElementById("togglePassword").addEventListener("click", function() {
  const pwd = document.getElementById("password");
  const icon = this.querySelector("i");
  if (pwd.type === "password") {
    pwd.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    pwd.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");

  
  errorMsg.classList.add("hidden");
  successMsg.classList.add("hidden");

  if (!username || !password) {
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    errorMsg.classList.remove("hidden");
    return;
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("isLoggedIn", "true"); // <-- AJOUT
    successMsg.textContent = "Connexion réussie ! Redirection en cours...";
    successMsg.classList.remove("hidden");

    setTimeout(() => {
        window.location.href = "../index.html";
    }, 1500); 
  } else {
    errorMsg.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
    errorMsg.classList.remove("hidden");
  }
});
