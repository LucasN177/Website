window.addEventListener("scroll", setScrollVar)
window.addEventListener("resize", setScrollVar)

function setScrollVar() {
  const htmlElement = document.documentElement
  const percentOfScreenHeightScrolled =
    htmlElement.scrollTop / htmlElement.clientHeight
  console.log(Math.min(percentOfScreenHeightScrolled * 100, 100))
  htmlElement.style.setProperty(
    "--scroll",
    Math.min(percentOfScreenHeightScrolled * 100, 100)
  )
}

setScrollVar()

const observer = new IntersectionObserver(entries => {
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]
    if (entry.isIntersecting) {
      document.querySelectorAll("[data-img]").forEach(img => {
        img.classList.remove("show")
      })
      const img = document.querySelector(entry.target.dataset.imgToShow)
      img?.classList.add("show")
      break
    }
  }
})

document.querySelectorAll("[data-img-to-show]").forEach(section => {
  observer.observe(section)
})

const carousel = document.querySelector('.card-carousel');
const cards = document.querySelectorAll('.card');
const prevButton = document.querySelector('.carousel-prev');
const nextButton = document.querySelector('.carousel-next');

let currentCard = 0;
let isClickableLeft = false;
let isClickableRight = true;

prevButton.addEventListener('click', () => {
  if (isClickableLeft) {
    currentCard -= 1;
    isClickableLeft = false;
    isClickableRight = true;
    if (currentCard < 0) {
      currentCard = cards.length - 1;
    }
    carousel.style.transform = `translateX(${currentCard * -100}%)`;
}
});

nextButton.addEventListener('click', () => {
  if (isClickableRight) {
    currentCard += 1;
    isClickableLeft = true;
    isClickableRight = false;
    if (currentCard >= cards.length) {
      currentCard = 0;
    }
    carousel.style.transform = `translateX(${currentCard * -100}%)`;
}
});