const config = window.PORTFOLIO_CONFIG || {};

if (document.body.classList.contains("case-page") && !window.location.hash) {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

document.querySelectorAll("[data-resume]").forEach((link) => {
  link.href = config.resumePath || "resume/Wang_Xun_Resume_CN.pdf";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

document.querySelectorAll("[data-resume-download]").forEach((link) => {
  link.href = config.resumePath || "resume/Wang_Xun_Resume_CN.pdf";
  link.setAttribute("download", "Wang_Xun_Resume_CN.pdf");
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

document.querySelectorAll("[data-gallery-group]").forEach((group) => {
  const count = group.querySelectorAll(".gallery-card").length;
  const countLabel = group.querySelector("[data-gallery-count]");
  if (countLabel) countLabel.textContent = `${String(count).padStart(2, "0")} 篇`;
});

document.querySelectorAll("[data-document-gallery]").forEach((gallery) => {
  const count = Number(gallery.dataset.documentCount || 0);
  const pageSpec = gallery.dataset.documentPages || "";
  const directory = gallery.dataset.documentDir || "";
  const prefix = gallery.dataset.documentPrefix || "page";
  const label = gallery.dataset.documentLabel || "项目材料";
  const lightboxGroup = gallery.dataset.lightboxGroup || "";

  const sourcePages = pageSpec
    ? pageSpec.split(",").flatMap((part) => {
        const [start, end] = part.split("-").map(Number);
        if (!Number.isFinite(start)) return [];
        if (!Number.isFinite(end)) return [start];
        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
      })
    : Array.from({ length: count }, (_, index) => index + 1);

  sourcePages.forEach((page, displayIndex) => {
    const number = String(page).padStart(2, "0");
    const displayNumber = String(displayIndex + 1).padStart(2, "0");
    const article = document.createElement("article");
    article.className = "gallery-card document-card";

    const button = document.createElement("button");
    button.className = "gallery-card__preview";
    button.type = "button";
    button.setAttribute("aria-label", `查看${label}第 ${displayIndex + 1} 页`);
    button.dataset.lightboxSrc = `${directory}/full/${prefix}-${number}.jpg`;
    button.dataset.lightboxTitle = `${label} · 第 ${displayNumber} 页`;
    button.dataset.lightboxAlt = `${label}第 ${displayIndex + 1} 页`;
    button.dataset.lightboxGroup = lightboxGroup;

    const windowElement = document.createElement("span");
    windowElement.className = "gallery-card__window document-card__window";
    const image = document.createElement("img");
    image.src = `${directory}/thumb/${prefix}-${number}.jpg`;
    image.alt = `${label}第 ${displayIndex + 1} 页缩略图`;
    image.loading = "lazy";
    image.decoding = "async";
    windowElement.append(image);

    const pageNumber = document.createElement("span");
    pageNumber.className = "document-card__page";
    pageNumber.setAttribute("aria-hidden", "true");
    pageNumber.textContent = displayNumber;

    button.append(windowElement, pageNumber);
    article.append(button);
    gallery.append(article);
  });
});

const moreWorkArchive = document.querySelector("[data-more-work-archive]");
if (moreWorkArchive) {
  const defaultOrder = ["starbucks", "xbox", "woolworths", "posters"];
  const requestedProject = new URLSearchParams(window.location.search).get("project");
  const activeProject = defaultOrder.includes(requestedProject) ? requestedProject : defaultOrder[0];
  const activeSection = moreWorkArchive.querySelector(`[data-archive-project="${activeProject}"]`);

  if (activeSection) moreWorkArchive.prepend(activeSection);

  document.querySelectorAll("[data-archive-nav]").forEach((link) => {
    if (link.dataset.archiveNav === activeProject) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    nav.dataset.open = String(!isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      nav.dataset.open = "false";
    });
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 }
  );
  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
}

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
const lightboxTitle = lightbox?.querySelector("[data-lightbox-title]");
const lightboxButtons = Array.from(document.querySelectorAll("[data-lightbox-src]"));
let activeLightboxButtons = lightboxButtons;
let activeLightboxIndex = -1;
let activeLightboxTrigger = null;

const showLightboxItem = (index) => {
  if (!lightbox || !lightboxImage || activeLightboxButtons.length === 0) return;
  activeLightboxIndex = (index + activeLightboxButtons.length) % activeLightboxButtons.length;
  const button = activeLightboxButtons[activeLightboxIndex];
  lightboxImage.src = button.dataset.lightboxSrc;
  lightboxImage.alt = button.dataset.lightboxAlt || "完整作品图片";
  if (lightboxTitle) lightboxTitle.textContent = button.dataset.lightboxTitle || "完整图片";
  const lightboxBody = lightbox.querySelector(".lightbox__body");
  if (lightboxBody) lightboxBody.scrollTop = 0;
  if (!lightbox.open) lightbox.showModal();
};

lightboxButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLightboxTrigger = button;
    const group = button.dataset.lightboxGroup;
    activeLightboxButtons = group
      ? lightboxButtons.filter((item) => item.dataset.lightboxGroup === group)
      : lightboxButtons.filter((item) => !item.dataset.lightboxGroup);
    showLightboxItem(activeLightboxButtons.indexOf(button));
  });
});

lightbox?.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => showLightboxItem(activeLightboxIndex - 1));
lightbox?.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showLightboxItem(activeLightboxIndex + 1));
lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener("close", () => activeLightboxTrigger?.focus());

document.addEventListener("keydown", (event) => {
  if (!lightbox?.open) return;
  if (event.key === "ArrowLeft") showLightboxItem(activeLightboxIndex - 1);
  if (event.key === "ArrowRight") showLightboxItem(activeLightboxIndex + 1);
});
