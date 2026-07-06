const reviewForm = document.querySelector("#reviewForm");
const reviewOutput = document.querySelector("#reviewOutput");
const previewTitle = document.querySelector("#previewTitle");
const ratingBadge = document.querySelector("#ratingBadge");
const statusText = document.querySelector("#statusText");
const copyBtn = document.querySelector("#copyBtn");
const postBtn = document.querySelector("#postBtn");
const resetBtn = document.querySelector("#resetBtn");
const authenticCheck = document.querySelector("#authenticCheck");
const improvementGroup = document.querySelector("#improvementGroup");
const characterCount = document.querySelector("#characterCount");
const regenerateBtn = document.querySelector("#regenerateBtn");
const editBtn = document.querySelector("#editBtn");

const CLIENT = {
  businessName: "Kuts N Kurls Unisex Salon & Bridal Studio",
  reviewPageUrl: "https://www.google.com/search?q=Kuts+N+Kurls+Unisex+Salon+%26+Bridal+Studio&oq=Kuts+N+Kurls+Unisex+Salon+%26+Bridal+Studio&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBBzI1NGowajeoAgCwAgA&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x395e5b9d3000e379:0x8affeed9bbb874de,3,,,,"
};

let reviewVersion = 0;

const experienceOpeners = {
  excellent: {
    5: "I had a lovely experience at {business}.",
    4: "I had a very good experience at {business}."
  },
  helpful: {
    5: "The team at {business} was genuinely helpful from start to finish.",
    4: "The team at {business} was helpful and easy to work with."
  },
  smooth: {
    5: "Everything went smoothly during my visit to {business}.",
    4: "My visit to {business} was smooth overall."
  },
  professional: {
    5: "{business} handled everything very professionally.",
    4: "{business} provided a professional and reliable salon experience."
  }
};

const servicePhrases = {
  haircut: "my haircut and styling",
  color: "my hair color and treatment",
  bridal: "the bridal makeup",
  makeup: "the party makeup",
  facial: "the facial and skin care",
  general: "my salon visit"
};

const highlightSentences = {
  friendly: "The artists were friendly, polite, and welcoming.",
  fast: "The service was on time and did not feel rushed.",
  clean: "The salon felt clean, organized, and comfortable.",
  quality: "The final look came out beautiful and neat.",
  communication: "They gave good suggestions and understood what I wanted.",
  value: "The service felt worth the price."
};

const improvementSentences = {
  none: "There was nothing major I would change.",
  wait: "The only small improvement would be a shorter waiting time.",
  parking: "Parking could be a little easier, but the visit itself was good.",
  updates: "A little more guidance during the service would make it even better.",
  availability: "More appointment availability would be helpful."
};

const closers = {
  5: {
    warm: "I would happily recommend them for salon and bridal services.",
    short: "Highly recommended.",
    detailed: "I left feeling happy with the result and would be glad to visit again.",
    professional: "I would recommend them to anyone looking for dependable salon service."
  },
  4: {
    warm: "Overall, I would still recommend them and would return again.",
    short: "A solid experience overall.",
    detailed: "Overall, the positives stood out, and I would feel comfortable returning.",
    professional: "Overall, I would recommend them and would consider visiting again."
  }
};

const shortVariations = [
  "{opener} {highlight} {closer}",
  "{opener} {service} {highlight} {closer}",
  "{opener} {highlight} {service} {closer}"
];

function getCheckedValue(name, fallback) {
  return new FormData(reviewForm).get(name) || fallback;
}

function getSelectedHighlights() {
  return Array.from(document.querySelectorAll("input[name='highlights']:checked"))
    .map((input) => input.value)
    .slice(0, 3);
}

function applyTemplate(template, business) {
  return template.replaceAll("{business}", business);
}

function buildReview() {
  const business = CLIENT.businessName;
  const rating = getCheckedValue("rating", "5");
  const experience = getCheckedValue("experience", "excellent");
  const serviceType = getCheckedValue("serviceType", "haircut");
  const tone = getCheckedValue("tone", "warm");
  const improvement = getCheckedValue("improvement", "none");
  const selectedHighlights = getSelectedHighlights();

  const opener = applyTemplate(experienceOpeners[experience]?.[rating] || experienceOpeners.excellent[5], business);
  const service = `I appreciated how ${servicePhrases[serviceType] || servicePhrases.haircut} was handled.`;
  const highlightText = selectedHighlights.length
    ? selectedHighlights.map((key) => highlightSentences[key]).join(" ")
    : "The overall experience was positive and straightforward.";

  const improvementText = rating === "4" ? ` ${improvementSentences[improvement] || improvementSentences.none}` : "";

  if (tone === "short") {
    const highlight = `${highlightText.split(".")[0]}.`;
    const template = shortVariations[reviewVersion % shortVariations.length];
    return template
      .replace("{opener}", opener)
      .replace("{service}", service)
      .replace("{highlight}", highlight)
      .replace("{closer}", closers[rating]?.[tone] || closers[5].warm);
  }

  if (tone === "professional") {
    return `${opener} ${service} ${highlightText}${improvementText} ${closers[rating]?.[tone] || closers[5].professional}`;
  }

  if (tone === "detailed") {
    return `${opener} ${service} ${highlightText}${improvementText} ${closers[rating]?.[tone] || closers[5].detailed}`;
  }

  return `${opener} ${highlightText}${improvementText} ${closers[rating]?.[tone] || closers[5].warm}`;
}

async function copyReview() {
  const text = reviewOutput.value.trim();

  if (!text) {
    setStatus("Create review first");
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied");
    return true;
  } catch {
    reviewOutput.select();
    document.execCommand("copy");
    setStatus("Copied");
    return true;
  }
}

function getReviewUrl() {
  if (CLIENT.reviewPageUrl) {
    return CLIENT.reviewPageUrl;
  }

  const query = encodeURIComponent(`${CLIENT.businessName} Google review`);
  return `https://www.google.com/search?q=${query}`;
}

function setStatus(message) {
  statusText.value = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusText.value = "Ready";
  }, 2200);
}

function updateCharacterCount() {
  const count = reviewOutput.value.trim().length;
  characterCount.textContent = `${count} Character${count === 1 ? "" : "s"}`;
}

function refreshRatingState() {
  const rating = getCheckedValue("rating", "5");
  const hasReview = Boolean(reviewOutput.value.trim());
  ratingBadge.textContent = `${rating} stars`;
  improvementGroup.classList.toggle("hidden", rating !== "4");
  postBtn.disabled = !hasReview || !authenticCheck.checked;
  copyBtn.disabled = !hasReview;
  regenerateBtn.disabled = !hasReview;
  editBtn.disabled = !hasReview;
  updateCharacterCount();
}

function createReview() {
  const review = buildReview();
  reviewOutput.value = review;
  reviewOutput.readOnly = true;
  editBtn.textContent = "Edit Review";
  previewTitle.textContent = "Your Personalized Review";
  refreshRatingState();
  setStatus("Created");
}

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createReview();
});

reviewForm.addEventListener("change", refreshRatingState);

reviewOutput.addEventListener("input", () => {
  refreshRatingState();
  setStatus("Editing");
});

copyBtn.addEventListener("click", copyReview);

regenerateBtn.addEventListener("click", () => {
  reviewVersion += 1;
  createReview();
});

editBtn.addEventListener("click", () => {
  if (!reviewOutput.value.trim()) {
    setStatus("Create review first");
    return;
  }

  reviewOutput.readOnly = !reviewOutput.readOnly;
  editBtn.textContent = reviewOutput.readOnly ? "Edit Review" : "Save Review";
  setStatus(reviewOutput.readOnly ? "Saved" : "Edit mode");
  if (!reviewOutput.readOnly) {
    reviewOutput.focus();
  }
});

postBtn.addEventListener("click", async () => {
  if (!authenticCheck.checked) {
    setStatus("Check review first");
    return;
  }

  const reviewUrl = getReviewUrl();
  const copied = await copyReview();

  if (!copied) {
    setStatus("Copy manually");
    return;
  }

  window.location.href = reviewUrl;
});

resetBtn.addEventListener("click", () => {
  reviewForm.reset();
  reviewOutput.value = "";
  reviewOutput.readOnly = true;
  previewTitle.textContent = "Kuts N Kurls";
  editBtn.textContent = "Edit Review";
  reviewVersion = 0;
  refreshRatingState();
  setStatus("Reset");
});

refreshRatingState();
