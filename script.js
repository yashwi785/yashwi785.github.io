// ---------- Helpers ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ---------- Footer year ----------
$("#year").textContent = new Date().getFullYear();

// ---------- Dark / light theme ----------
const themeBtn = $("#theme-toggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// ---------- Mobile menu ----------
const menuBtn = $("#menu-btn");
const navLinks = $("#nav-links");

menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
$$("#nav-links a").forEach(link =>
  link.addEventListener("click", () => navLinks.classList.remove("open"))
);

// ---------- Navbar shadow, back-to-top, active link ----------
const navbar = $("#navbar");
const toTop = $("#to-top");
const sections = $$("main section[id]");
const links = $$("#nav-links a");

function onScroll() {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
  toTop.classList.toggle("show", window.scrollY > 500);

  let current = "";
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Typing effect ----------
const roles = ["Python Developer", "Full-Stack Developer", "AI & Data Science Student", "Backend Builder"];
const typedEl = $("#typed");
let roleIndex = 0, charIndex = 0, deleting = false;

function type() {
  const word = roles[roleIndex];
  typedEl.textContent = word.slice(0, charIndex);

  if (!deleting && charIndex < word.length) {
    charIndex++;
    setTimeout(type, 100);
  } else if (!deleting) {
    deleting = true;
    setTimeout(type, 1400);
  } else if (charIndex > 0) {
    charIndex--;
    setTimeout(type, 55);
  } else {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(type, 300);
  }
}
type();

// ---------- Scroll reveal, skill bars, counters ----------
function animateCounter(el) {
  const target = +el.dataset.count;
  let value = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    value += step;
    if (value >= target) { value = target; clearInterval(timer); }
    el.textContent = value;
  }, 35);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("visible");

    $$(".fill", el).forEach(bar => (bar.style.width = bar.dataset.width + "%"));
    $$("[data-count]", el).forEach(animateCounter);

    observer.unobserve(el);
  });
}, { threshold: 0.2 });

$$(".reveal").forEach(el => observer.observe(el));

// ---------- Project filter ----------
const filterBtns = $$(".filter");
const cards = $$(".card");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hide", !show);
    });
  });
});

// ---------- Contact form validation ----------
const form = $("#contact-form");
const statusEl = $("#form-status");

function validateField(input) {
  const field = input.closest(".field");
  const errorEl = $(".error", field);
  let message = "";

  if (!input.value.trim()) {
    message = "This field is required.";
  } else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    message = "Please enter a valid email.";
  } else if (input.name === "message" && input.value.trim().length < 10) {
    message = "Message should be at least 10 characters.";
  }

  field.classList.toggle("invalid", !!message);
  errorEl.textContent = message;
  return !message;
}

$$("input, textarea", form).forEach(input =>
  input.addEventListener("input", () => validateField(input))
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const valid = $$("input, textarea", form).map(validateField).every(Boolean);
  if (!valid) return;

  // Opens the visitor's email app with the message pre-filled (no backend needed).
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const subject = encodeURIComponent("Portfolio enquiry from " + name);
  const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
  window.location.href = "mailto:yashwi0563@gmail.com?subject=" + subject + "&body=" + body;

  statusEl.textContent = "Opening your email app to send the message…";
  form.reset();
  setTimeout(() => (statusEl.textContent = ""), 5000);
});
