/* ============================================
   BUSCONNECT — main.js
   Shared logic for all pages
   ============================================ */

// ─── Sample driver data (used until backend is connected) ───
window.DRIVERS = [
  {
    id: 1,
    name: "Jan Amoida",
    initials: "JA",
    route: "Paramaribo → Lelydorp",
    location: "Paramaribo",
    experience: "6 jaar ervaring",
    rating: 5.0,
    reviews: 28,
    available: true,
    phone: "+597 712 3456",
    license: "SR-2018-00112",
  },
  {
    id: 2,
    name: "Priya Ramkhelawan",
    initials: "PR",
    route: "Wanica → Flora School",
    location: "Wanica",
    experience: "4 jaar ervaring",
    rating: 4.8,
    reviews: 19,
    available: true,
    phone: "+597 724 8810",
    license: "SR-2020-00334",
  },
  {
    id: 3,
    name: "Carlos Apinsa",
    initials: "CA",
    route: "Nickerie → Centrum",
    location: "Nickerie",
    experience: "8 jaar ervaring",
    rating: 4.9,
    reviews: 41,
    available: true,
    phone: "+597 731 0022",
    license: "SR-2016-00567",
  },
  {
    id: 4,
    name: "Fatimah Noorani",
    initials: "FN",
    route: "Paramaribo → Anton de Kom School",
    location: "Paramaribo",
    experience: "3 jaar ervaring",
    rating: 4.7,
    reviews: 14,
    available: false,
    phone: "+597 745 6601",
    license: "SR-2021-00789",
  },
  {
    id: 5,
    name: "Ravi Soerdjbali",
    initials: "RS",
    route: "Lelydorp → EBG School",
    location: "Wanica",
    experience: "5 jaar ervaring",
    rating: 4.6,
    reviews: 22,
    available: true,
    phone: "+597 768 4421",
    license: "SR-2019-00903",
  },
  {
    id: 6,
    name: "Maureen Doelwijt",
    initials: "MD",
    route: "Commewijne → Paramaribo",
    location: "Commewijne",
    experience: "7 jaar ervaring",
    rating: 5.0,
    reviews: 33,
    available: true,
    phone: "+597 791 2233",
    license: "SR-2017-01011",
  },
];

// ─── Build a driver card HTML ───
function buildDriverCard(driver) {
  const stars = "★".repeat(Math.round(driver.rating)) + "☆".repeat(5 - Math.round(driver.rating));
  return `
    <div class="driver-card">
      <div class="driver-card__header">
        <div class="driver-avatar">${driver.initials}</div>
        <div class="driver-card__info">
          <h3>${driver.name}</h3>
          <small>${driver.location}</small>
        </div>
      </div>
      <div class="driver-card__body">
        <div class="driver-meta">
          <div class="driver-meta-item">
            <span>🛣️</span>
            <span>${driver.route}</span>
          </div>
          <div class="driver-meta-item">
            <span>🏆</span>
            <span>${driver.experience}</span>
          </div>
          <div class="driver-meta-item">
            <span>📞</span>
            <span>${driver.phone}</span>
          </div>
        </div>
      </div>
      <div class="driver-card__footer">
        <div>
          <div class="stars">${stars}</div>
          <span style="font-size:0.75rem;color:var(--muted)">${driver.rating.toFixed(1)} · ${driver.reviews} reviews</span>
        </div>
        <span class="badge ${driver.available ? "badge--success" : "badge--warning"}">
          ${driver.available ? "✓ Beschikbaar" : "⏳ Bezet"}
        </span>
      </div>
    </div>
  `;
}

// ─── Render drivers into a container ───
function renderDrivers(drivers, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (drivers.length === 0) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted);">
        <div style="font-size:2.5rem;margin-bottom:0.75rem;">🔍</div>
        <p>Geen chauffeurs gevonden voor uw zoekopdracht.</p>
      </div>`;
    return;
  }
  el.innerHTML = drivers.map(buildDriverCard).join("");
}

// ─── Fetch drivers from API or fall back to sample data ───
function loadDrivers(containerId, limit) {
  fetch("/api/drivers")
    .then((r) => r.json())
    .then((data) => {
      const drivers = limit ? data.slice(0, limit) : data;
      window.DRIVERS = data; // update global
      renderDrivers(drivers, containerId);
      const countEl = document.getElementById("resultCount");
      if (countEl) countEl.textContent = `${data.length} chauffeur(s) beschikbaar`;
    })
    .catch(() => {
      // Backend not running — use sample data
      const drivers = limit ? window.DRIVERS.slice(0, limit) : window.DRIVERS;
      renderDrivers(drivers, containerId);
      const countEl = document.getElementById("resultCount");
      if (countEl) countEl.textContent = `${window.DRIVERS.length} chauffeur(s) beschikbaar`;
    });
}

// ─── Mobile hamburger menu ───
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      // Animate hamburger to X
      const spans = hamburger.querySelectorAll("span");
      if (mobileMenu.classList.contains("open")) {
        spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
      } else {
        spans[0].style.transform = "";
        spans[1].style.opacity = "";
        spans[2].style.transform = "";
      }
    });

    // Close menu on link click
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.querySelectorAll("span").forEach((s) => {
          s.style.transform = "";
          s.style.opacity = "";
        });
      })
    );
  }

  // ─── Load drivers on relevant pages ───
  if (document.getElementById("featuredDrivers")) {
    loadDrivers("featuredDrivers", 3);
  }
  if (document.getElementById("driverGrid")) {
    loadDrivers("driverGrid");
  }

  // ─── Scroll-triggered nav shadow ───
  window.addEventListener("scroll", () => {
    document.querySelector(".nav")?.classList.toggle("nav--scrolled", window.scrollY > 20);
  });

  // ─── Animate elements on scroll ───
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".feature-card, .driver-card, .step, .metric-card").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });
});
