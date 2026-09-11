/**
 * NOVA CLEAN - Script JavaScript Vanilla
 * Fonctionnalités :
 * - Navigation mobile accessible (Menu burger & Drawer)
 * - Header fixe dynamique au scroll (transparence -> opacité)
 * - Animations d'apparition au scroll (IntersectionObserver)
 * - Compteur de chiffres clés animé (350+, 98%, 24h, 8 ans)
 * - Validation accessible du formulaire de devis & redirection WhatsApp
 * - Pré-remplissage du service sélectionné via l'URL (?service=...)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initScrollReveal();
  initAnimatedCounters();
  initContactForm();
  initUrlServicePreselect();
  highlightActiveNavLinks();
});

/**
 * 1. Menu Burger Mobile & Drawer latéral accessible
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerOverlay = document.getElementById('drawerOverlay');

  if (!burgerBtn || !mobileDrawer || !drawerOverlay) return;

  function openMenu() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    burgerBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Empêche le défilement d'arrière-plan
  }

  function closeMenu() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileDrawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeMenu);
  }

  drawerOverlay.addEventListener('click', closeMenu);

  // Fermeture avec la touche Échap pour l'accessibilité
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Fermeture automatique lors du clic sur un lien du drawer
  const drawerLinks = mobileDrawer.querySelectorAll('a');
  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * 2. Header fixe qui devient opaque lors du défilement
 */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  function handleScroll() {
    const scrollPosition = window.scrollY || window.pageYOffset;
    if (scrollPosition > 35) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Vérification au chargement initial
  handleScroll();
}

/**
 * 3. Animations discrètes au scroll via IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Ne s'anime qu'une seule fois
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback si IntersectionObserver n'est pas supporté
    revealElements.forEach((el) => {
      el.classList.add('active');
    });
  }
}

/**
 * 4. Compteurs de statistiques clés animés (Accueil)
 */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.stat-counter');
  if (!counterElements.length) return;

  let hasAnimated = false;

  function runCounters() {
    if (hasAnimated) return;
    hasAnimated = true;

    counterElements.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10);
      const duration = 1600; // Durée totale de l'animation en ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Courbe d'atténuation (Ease Out Cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOut * target);

        counter.textContent = currentCount.toString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toString();
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = document.getElementById('chiffres');
  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runCounters();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    statsObserver.observe(statsSection);
  } else {
    runCounters();
  }
}

/**
 * 5. Formulaire de contact avec validation JS & redirection WhatsApp
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const alertBox = document.getElementById('formAlertBox');

  // Champs du formulaire
  const fullName = document.getElementById('fullName');
  const phoneNumber = document.getElementById('phoneNumber');
  const emailAddress = document.getElementById('emailAddress');
  const locationArea = document.getElementById('locationArea');
  const clientType = document.getElementById('clientType');
  const serviceSelect = document.getElementById('serviceSelect');
  const projectDetails = document.getElementById('projectDetails');
  const consentCheck = document.getElementById('consentCheck');

  // Réinitialisation des messages d'erreur lors de la saisie
  const inputFields = [fullName, phoneNumber, emailAddress, locationArea, clientType, serviceSelect, consentCheck];
  inputFields.forEach((field) => {
    if (!field) return;
    const eventType = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventType, () => {
      clearFieldError(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validation Nom complet
    if (!fullName.value.trim() || fullName.value.trim().length < 2) {
      showFieldError(fullName, 'Veuillez saisir votre nom et prénom (2 caractères minimum).');
      isValid = false;
    } else {
      clearFieldError(fullName);
    }

    // Validation Téléphone
    const phoneVal = phoneNumber.value.trim().replace(/\s+/g, '');
    if (!phoneVal || phoneVal.length < 8) {
      showFieldError(phoneNumber, 'Veuillez renseigner un numéro de téléphone valide pour Cotonou.');
      isValid = false;
    } else {
      clearFieldError(phoneNumber);
    }

    // Validation Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress.value.trim() || !emailRegex.test(emailAddress.value.trim())) {
      showFieldError(emailAddress, 'Veuillez saisir une adresse email valide.');
      isValid = false;
    } else {
      clearFieldError(emailAddress);
    }

    // Validation Quartier
    if (!locationArea.value) {
      showFieldError(locationArea, 'Veuillez sélectionner votre quartier à Cotonou.');
      isValid = false;
    } else {
      clearFieldError(locationArea);
    }

    // Validation Profil client
    if (!clientType.value) {
      showFieldError(clientType, 'Veuillez indiquer votre profil (particulier, entreprise, etc.).');
      isValid = false;
    } else {
      clearFieldError(clientType);
    }

    // Validation Service
    if (!serviceSelect.value) {
      showFieldError(serviceSelect, 'Veuillez sélectionner la prestation principale souhaitée.');
      isValid = false;
    } else {
      clearFieldError(serviceSelect);
    }

    // Validation Consentement
    if (!consentCheck.checked) {
      showFieldError(consentCheck, 'Vous devez accepter le traitement de vos informations pour recevoir votre devis.');
      isValid = false;
    } else {
      clearFieldError(consentCheck);
    }

    if (!isValid) {
      showAlert('Veuillez corriger les champs surlignés en rouge avant d\'envoyer le formulaire.', 'error');
      // Scroll doux vers la première erreur
      const firstError = form.querySelector('.has-error');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Préparation de la confirmation et simulation de soumission
    const submitBtn = document.getElementById('submitFormBtn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi de votre demande en cours...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      const clientNameVal = fullName.value.trim();
      const serviceVal = serviceSelect.options[serviceSelect.selectedIndex].text;
      const zoneVal = locationArea.options[locationArea.selectedIndex].text;
      const notesVal = projectDetails.value.trim();

      // Construction du message WhatsApp prêt à envoyer
      const waMessage = encodeURIComponent(
        `Bonjour NOVA CLEAN Cotonou,\nJe m'appelle ${clientNameVal}.\nJ'ai soumis une demande de devis pour : *${serviceVal}* à *${zoneVal}*.\nDétails : ${notesVal || 'Non précisé'}.\nMerci de me recontacter !`
      );
      const waLink = `https://wa.me/2290168941085?text=${waMessage}`;

      // Affichage du message de confirmation chaleureux
      if (alertBox) {
        alertBox.className = 'form-alert-box success';
        alertBox.innerHTML = `
          <strong>Merci ${clientNameVal} ! Votre demande a été enregistrée avec succès.</strong><br/>
          Notre responsable d'Akpakpa étudie votre besoin pour vous transmettre un devis sous 24 heures ouvrées.<br/>
          <div style="margin-top: 10px;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-accent btn-sm" style="display:inline-flex; align-items:center; gap:6px;">
              <span>Envoyer aussi sur WhatsApp pour une réponse prioritaire &rarr;</span>
            </a>
          </div>
        `;
        alertBox.style.display = 'block';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
    }, 800);
  });

  function showFieldError(field, message) {
    field.classList.add('has-error');
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearFieldError(field) {
    field.classList.remove('has-error');
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = `form-alert-box ${type}`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';
  }
}

/**
 * 6. Pré-sélection du service si présent dans les paramètres d'URL (ex: contact.html?service=bureaux)
 */
function initUrlServicePreselect() {
  const serviceSelect = document.getElementById('serviceSelect');
  if (!serviceSelect) return;

  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');

  if (serviceParam) {
    const matchedOption = serviceSelect.querySelector(`option[value="${serviceParam}"]`);
    if (matchedOption) {
      serviceSelect.value = serviceParam;
    }
  }
}

/**
 * 7. Détection automatique et surbrillance du lien actif dans la navigation
 */
function highlightActiveNavLinks() {
  const currentPath = window.location.pathname;
  let pageName = currentPath.split('/').pop() || 'index.html';
  if (pageName === '') pageName = 'index.html';

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPage = href.split('#')[0];
    if (linkPage === pageName || (pageName === 'index.html' && (linkPage === '' || linkPage === './'))) {
      link.classList.add('active');
    } else if (linkPage !== pageName && linkPage !== '') {
      link.classList.remove('active');
    }
  });
}
