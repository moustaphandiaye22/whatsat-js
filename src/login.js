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
        window.location.href = "./index.html";
    }, 1500); 
  } else {
    errorMsg.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
    errorMsg.classList.remove("hidden");
  }
});

 // Create animated background particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle animate-float';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        particlesContainer.appendChild(particle);
      }
    }

    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });

    // Form submission with animations
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    const loadingOverlay = document.getElementById('loadingOverlay');

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      // Hide previous messages
      errorMsg.classList.add('hidden');
      successMsg.classList.add('hidden');

      // Show loading overlay
      loadingOverlay.classList.remove('hidden');

      // Simulate API call
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');

        // Simple validation (replace with actual authentication)
        if (username && password && username.length >= 3 && password.length >= 4) {
          successMsg.classList.remove('hidden');
          
          // Add success animation to form
          loginForm.classList.add('animate-pulse');
          
          // Simulate redirect after success
          setTimeout(() => {
            // window.location.href = 'dashboard.html'; // Uncomment for actual redirect
            console.log('Redirecting to dashboard...');
          }, 2500);
        } else {
          errorMsg.classList.remove('hidden');
          
          // Shake animation for error
          loginForm.classList.add('animate-shake');
          setTimeout(() => {
            loginForm.classList.remove('animate-shake');
          }, 500);
        }
      }, 1500);
    });

    // Enhanced input interactions
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', function() {
        this.parentElement.parentElement.classList.remove('focused');
      });

      // Real-time validation feedback
      input.addEventListener('input', function() {
        if (this.value.length > 0) {
          this.classList.add('border-green-300', 'bg-green-50');
          this.classList.remove('border-gray-200', 'bg-gray-50');
        } else {
          this.classList.remove('border-green-300', 'bg-green-50');
          this.classList.add('border-gray-200', 'bg-gray-50');
        }
      });
    });

    // Initialize particles when page loads
    document.addEventListener('DOMContentLoaded', function() {
      createParticles();
      
      // Add staggered animation to form elements
      const formElements = document.querySelectorAll('.group, button, .text-center');
      formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
      });
    });

    // Add floating animation on scroll/interaction
    let floatingElements = document.querySelectorAll('.fas');
    floatingElements.forEach(element => {
      element.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(5deg)';
      });
      
      element.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
      });
    });

    // Add typing effect for placeholder text
    function typeEffect(element, text, speed = 100) {
      let i = 0;
      element.placeholder = '';
      
      function type() {
        if (i < text.length) {
          element.placeholder += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      }
      
      setTimeout(type, 1000);
    }

    // Apply typing effect to inputs after page load
    setTimeout(() => {
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      
      typeEffect(usernameInput, 'Entrez votre nom d\'utilisateur');
      setTimeout(() => {
        typeEffect(passwordInput, 'Entrez votre mot de passe');
      }, 2000);
    }, 2000);