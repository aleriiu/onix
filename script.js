'use strict';

//header fixed 

const header = document.querySelector('.header-fixed');
const headerH = document.querySelector('.header-fixed').clientHeight;
const height = document.querySelector('.modal_menu-container');

document.onscroll = function () {

    let scroll = window.scrollY;

    if (scroll > headerH) {
        header.classList.add('fixed');
        // document.body.style.paddingTop = headerH + 'px';
        header.style.backgroundColor = '#FFFFFF33;';
        header.style.backdropFilter = 'blur(10px)';
        // height.style.height = '100vh'
    }

    else {
        header.classList.remove('fixed');
        document.body.removeAttribute('style');
        header.removeAttribute('style');
    }
}

window.addEventListener('scroll', function () {
    const element = document.querySelector('.horizontal-line');
    if (window.scrollY > 50) {
        element.style.display = 'none'; // Скрыть
    } else {
        element.style.display = 'block'; // Показать обратно, если скролл вернулся
    }
});


/***** gallery *****/

// 1. Инициализация плавного скролла Lenis
// const lenis = new Lenis();
// function raf(time) {
//     lenis.raf(time);
//     requestAnimationFrame(raf);
// }
// requestAnimationFrame(raf);

// 2. Настройка GSAP
// gsap.registerPlugin(ScrollTrigger);

// const tl = gsap.timeline({
//     scrollTrigger: {
//         trigger: ".scroll-section",
//         start: "top top",
//         end: "bottom bottom",
//         scrub: 1, // Привязка к скроллу
//     }
// });

// Анимация разлета картинок
// tl.to(".img-2", { x: "-200%", y: "-150%", rotate: -20, opacity: 0 }, 0)
//   .to(".img-3", { x: "200%", y: "150%", rotate: 20, opacity: 0 }, 0)
//   .to(".img-4", { x: "-250%", y: "150%", rotate: -30, opacity: 0 }, 0)
//   .to(".img-5", { x: "250%", y: "-150%", rotate: 30, opacity: 0 }, 0)
//   .to(".img-6", { x: "250%", y: "-150%", rotate: 30, opacity: 0 }, 0)
//   .to(".img-7", { x: "250%", y: "-150%", rotate: 30, opacity: 0 }, 0)
// Масштабируем центральную картинку (эффект пролета сквозь неё)
//   .to(".img-1", { 
//       scale: 15, 
//       opacity: 0, 
//       duration: 2,
//       ease: "power2.in" 
//   }, 0)

// Проявляем текст в конце
//   .to(".info-content", { 
//       opacity: 1, 
//       y: 0, 
//       duration: 1 
//   }, "-=0.5");


/***** gallery *****/

// 1. Lenis
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. GSAP
gsap.registerPlugin(ScrollTrigger);

// Начальные состояния
gsap.set(".mosaic-cell", { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 });
gsap.set(".hero-shot", { opacity: 0, scale: 1.06 });
gsap.set(".hero-overlay", { opacity: 0 });
gsap.set(".info-content", { opacity: 0, y: 40 });

// Все карточки мозаики
const mosaicCards = gsap.utils.toArray(".mosaic-cell");

const galleryTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-section",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true
    }
});

// Немного уменьшаем всю мозаику
galleryTl.to(".mosaic-wrap", {
    scale: 0.92,
    duration: 0.35,
    ease: "power1.out"
}, 0);

// Разлет карточек через цикл
mosaicCards.forEach((card, i) => {
    const angle = (i / mosaicCards.length) * Math.PI * 2; // равномерно по кругу
    const distance = 220 + i * 18;                         // чем дальше карточка в списке, тем дальше улетает
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const rot = (i % 2 === 0 ? -1 : 1) * (4 + i);

    galleryTl.to(card, {
        x,
        y,
        rotate: rot,
        scale: 0.9,
        opacity: 0,
        duration: 0.85,
        ease: "power2.inOut"
    }, 0.22);
});

// Появляется одна большая картинка
galleryTl
    .to(".sticky-wrapper", {
        backgroundColor: "#000",
        duration: 0.7
    }, 0.45)
    .to(".hero-shot", {
        opacity: 1,
        scale: 1,
        duration: 0.85,
        ease: "power2.out"
    }, 0.75)
    .to(".hero-overlay", {
        opacity: 1,
        duration: 0.45
    }, 1.35)
    .to(".info-content", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power1.out"
    }, 1.4);

/***** end gallery *****/




//// boat 

const boatData = {
    cabin: {
        watermark: "850",
        description: "Комфортная каютная лодка для семейных путешествий и продолжительных маршрутов",
        image: "./images/лодка 8Х.png",
        imageAlt: "ONIX 850 Cabin",
        length: "8,5",
        capacity: "8",
        speed: "95"
    },
    day: {
        watermark: "850",
        description: "Открытый, стильный катер для истинных ценителей скорости и ощущений на воде. Его цель — максимум внимания и драйва.",
        image: "./images/boat850.png",
        imageAlt: "ONIX 850 Day Cruiser",
        length: "8,43",
        capacity: "2",
        speed: "95"
    },
    x12: {
        watermark: "12X",
        description: "Представляем абсолютно новый флагман ONIX 12X — воплощение передовых технологий, элегантного дизайна и непревзойдённого комфорта.",
        image: "./images/boat12x.png",
        imageAlt: "ONIX 12X",
        length: "11,9",
        capacity: "12",
        speed: "120"
    }
};

const modelButtons = document.querySelectorAll(".boat-model-btn");
const boatDescription = document.getElementById("boatDescription");
const boatImage = document.getElementById("boatImage");
const boatWatermark = document.getElementById("boatWatermark");
const boatLength = document.getElementById("boatLength");
const boatCapacity = document.getElementById("boatCapacity");
const boatSpeed = document.getElementById("boatSpeed");

function renderBoat(modelKey) {
    const model = boatData[modelKey];
    if (!model) return;

    boatDescription.textContent = model.description;
    boatImage.src = model.image;
    boatImage.alt = model.imageAlt;
    boatWatermark.textContent = model.watermark;
    boatLength.textContent = model.length;
    boatCapacity.textContent = model.capacity;
    boatSpeed.textContent = model.speed;
}

modelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        modelButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderBoat(btn.dataset.model);
    });
});