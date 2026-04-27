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
        header.style.backgroundColor = '#FFFFFF33';
        header.style.backdropFilter = 'blur(10px)';
        // height.style.height = '100vh'
    }

    else {
        header.classList.remove('fixed');
        header.style.backgroundColor = "";
        header.style.backdropFilter = "";
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




/***** boat *****/
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

const modelOrder = ["cabin", "day", "x12"];
let activeModelKey = "cabin";
let isBoatAnimating = false;

const modelButtons = document.querySelectorAll(".boat-model-btn");
const boatDescription = document.getElementById("boatDescription");
const boatWatermark = document.getElementById("boatWatermark");
const boatLength = document.getElementById("boatLength");
const boatCapacity = document.getElementById("boatCapacity");
const boatSpeed = document.getElementById("boatSpeed");

const boatImageCurrent = document.getElementById("boatImageCurrent");
const boatImageNext = document.getElementById("boatImageNext");

let currentLayer = boatImageCurrent;
let nextLayer = boatImageNext;

function preload(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
}

function applyBoatContent(modelKey) {
    const model = boatData[modelKey];
    if (!model) return;

    boatDescription.textContent = model.description;
    boatWatermark.textContent = model.watermark;
    boatLength.textContent = model.length;
    boatCapacity.textContent = model.capacity;
    boatSpeed.textContent = model.speed;
}

function getDirection(fromKey, toKey) {
    const fromIndex = modelOrder.indexOf(fromKey);
    const toIndex = modelOrder.indexOf(toKey);
    return toIndex > fromIndex ? -1 : 1;
}

async function renderBoat(modelKey) {
    if (isBoatAnimating || modelKey === activeModelKey) return;
    const model = boatData[modelKey];
    if (!model) return;

    isBoatAnimating = true;
    const dir = getDirection(activeModelKey, modelKey);

    await preload(model.image);

    nextLayer.src = model.image;
    nextLayer.alt = model.imageAlt || "лодка";

    gsap.set(currentLayer, { x: 0, autoAlpha: 1, zIndex: 2 });
    gsap.set(nextLayer, { x: dir * 220, autoAlpha: 1, zIndex: 3 });

    gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
            applyBoatContent(modelKey);

            const old = currentLayer;
            currentLayer = nextLayer;
            nextLayer = old;

            gsap.set(nextLayer, { x: 0, autoAlpha: 0, zIndex: 1 });
            gsap.set(currentLayer, { x: 0, autoAlpha: 1, zIndex: 2 });

            activeModelKey = modelKey;
            isBoatAnimating = false;
        }
    })
        .to(currentLayer, {
            x: dir * -220,
            autoAlpha: 0,      // старая уходит в прозрачность
            duration: 0.62,
            ease: "power2.in"
        }, 0)
        .to(nextLayer, {
            x: 0,
            autoAlpha: 1,
            duration: 0.72,
            ease: "power3.out"
        }, 0.08)
        
        .fromTo(
            [boatDescription, boatWatermark, boatLength, boatCapacity, boatSpeed],
            { autoAlpha: 0.82, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.02, ease: "power2.out" },
            0.66
        );
}

modelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (isBoatAnimating) return;

        modelButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderBoat(btn.dataset.model);
    });
});

gsap.set(nextLayer, { autoAlpha: 0, x: 0, zIndex: 1 });
/***** end boat *****/


/***** hero auto gallery *****/
const heroSlides = gsap.utils.toArray([
    ".hero-background-image-one",
    ".hero-background-image-two",
    ".hero-background-image-three"
]);
const heroDots = gsap.utils.toArray(".hero-dot");
const heroDotProgresses = gsap.utils.toArray(".hero-dot-progress");
const HOLD_TIME = 4.6;
const TRANSITION = 1.45;

if (heroSlides.length) {
    let currentIndex = 0;
    let autoCall = null;
    let progressTween = null;
    let isAnimating = false;

    const HOLD_TIME = 3.8;
    const TRANSITION = 1.0;

    function getSlideContent(slide) {
        return slide.querySelectorAll(".hero-header, .hero-header-text, .hero-header-btn");
    }

    gsap.set(heroSlides, { autoAlpha: 0, scale: 1.08 });
    gsap.set(heroSlides[0], { autoAlpha: 1, scale: 1.02 });
    gsap.set(".hero-header-text-container", { autoAlpha: 1, y: 0 });
    gsap.set(heroDotProgresses, { scaleY: 0, transformOrigin: "top center" });

    // начальное состояние контента
    heroSlides.forEach((slide, i) => {
        const content = getSlideContent(slide);
        if (i === 0) {
            gsap.set(content, { autoAlpha: 1, y: 0 });
        } else {
            gsap.set(content, { autoAlpha: 0, y: 24 });
        }
    });

    function setActiveDot(index) {
        heroDots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function runProgress(index) {
        if (progressTween) progressTween.kill();
        gsap.set(heroDotProgresses, { scaleY: 0 });
        progressTween = gsap.to(heroDotProgresses[index], {
            scaleY: 1,
            duration: HOLD_TIME,
            ease: "none"
        });
    }

    function scheduleNext() {
        if (autoCall) autoCall.kill();
        autoCall = gsap.delayedCall(HOLD_TIME, () => {
            goToSlide((currentIndex + 1) % heroSlides.length);
        });
    }

    function animateInContent(slide, at = 0) {
        const title = slide.querySelector(".hero-header");
        const text = slide.querySelector(".hero-header-text");
        const btn = slide.querySelector(".hero-header-btn");

        return gsap.timeline()
            .fromTo(
                title,
                { autoAlpha: 0, y: 70 },
                { autoAlpha: 1, y: 0, duration: 1.25, ease: "power3.out" },
                at
            )
            .fromTo(
                text,
                { autoAlpha: 0, y: 52 },
                { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out" },
                at + 0.28
            )
            .fromTo(
                btn,
                { autoAlpha: 0, y: 40 },
                { autoAlpha: 1, y: 0, duration: 0.95, ease: "power2.out" },
                at + 0.46
            );
    }

    function animateOutContent(slide, at = 0) {
        const title = slide.querySelector(".hero-header");
        const text = slide.querySelector(".hero-header-text");
        const btn = slide.querySelector(".hero-header-btn");

        return gsap.timeline().to(
            [btn, text, title],
            {
                autoAlpha: 0,
                y: -12,
                duration: 0.3,
                ease: "power2.in",
                stagger: 0.04
            },
            at
        );
    }

    function goToSlide(nextIndex) {
        if (isAnimating || nextIndex === currentIndex) return;
        isAnimating = true;

        const current = heroSlides[currentIndex];
        const next = heroSlides[nextIndex];

        gsap.timeline({
            defaults: { ease: "power2.inOut" },
            onComplete: () => {
                currentIndex = nextIndex;
                setActiveDot(currentIndex);
                runProgress(currentIndex);
                scheduleNext();
                isAnimating = false;
            }
        })
            // сначала мягко уводим текущий текст
            .add(() => animateOutContent(current, 0), 0)

            // фоновый переход с zoom
            .to(current, { autoAlpha: 0, scale: 1.11, duration: TRANSITION }, 0)
            .fromTo(
                next,
                { autoAlpha: 0, scale: 1.07 },
                { autoAlpha: 1, scale: 1.02, duration: TRANSITION },
                0
            )

            // затем заводим текст нового слайда снизу
            .add(() => animateInContent(next, 0), 1.05);
    }

    heroDots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const index = Number(dot.dataset.slide);
            if (autoCall) autoCall.kill();
            if (progressTween) progressTween.kill();
            goToSlide(index);
        });
    });

    setActiveDot(0);
    runProgress(0);
    animateInContent(heroSlides[0], 0);
    scheduleNext();
}
/***** end hero auto gallery *****/


/***** text change color *****/

function splitTextToChars(selector) {
    const el = document.querySelector(selector);
    if (!el) return null;

    // чтобы не разбивать повторно
    if (el.dataset.splitted === "true") return el;

    const text = el.textContent.replace(/\s+/g, " ").trim();
    const fragment = document.createDocumentFragment();

    for (const char of text) {
        const span = document.createElement("span");
        span.className = "text-char";
        span.textContent = char; // обычные пробелы, чтобы работал перенос строк
        fragment.appendChild(span);
    }

    el.textContent = "";
    el.appendChild(fragment);
    el.dataset.splitted = "true";
    return el;
}

splitTextToChars(".welcome-text");

gsap.fromTo(
    ".welcome-text .text-char",
    { color: "#B2B2B2" },
    {
        color: "#121212",
        stagger: 0.018,         // задержка между буквами
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".welcome",
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    }
);

splitTextToChars(".description-text");
splitTextToChars(".description-text-italic");

const descriptionTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".description",
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});

descriptionTl
    .fromTo(
        ".description-text .text-char",
        { color: "#B2B2B2" },
        {
            color: "#121212",
            stagger: 0.018,
            ease: "power2.out",
            duration: 0.6
        }
    )
    .fromTo(
        ".description-text-italic .text-char",
        { color: "#B2B2B2" },
        {
            color: "#121212",
            stagger: 0.018,
            ease: "power2.out",
            duration: 0.6
        },
        "+=0.15" // пауза после первой анимации
    );

/***** end text change color *****/

/***** tech cards slider (gsap) *****/
const techSection = document.querySelector("#tech-cards");
if (techSection) {
    const track = techSection.querySelector(".tech-cards-track");
    const sliderViewport = techSection.querySelector(".tech-slider");
    const cards = gsap.utils.toArray(".tech-card", track);
    const prevBtn = techSection.querySelector(".tech-nav-prev");
    const nextBtn = techSection.querySelector(".tech-nav-next");

    let currentIndex = 0;
    let step = 0;
    let maxOffset = 0;
    let maxIndex = 0;

    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let startTrackX = 0;
    let moved = false;
    const SWIPE_THRESHOLD = 60;

    function getTrackX() {
        return Number(gsap.getProperty(track, "x")) || 0;
    }

    function recalcStep() {
        if (!cards.length || !sliderViewport) return;

        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        step = cards[0].getBoundingClientRect().width + gap;

        maxOffset = Math.max(0, track.scrollWidth - sliderViewport.clientWidth);
        maxIndex = step > 0 ? Math.ceil(maxOffset / step) : 0;
    }

    function goTo(index, animated = true) {
        currentIndex = gsap.utils.clamp(0, maxIndex, index);
        const x = -Math.min(currentIndex * step, maxOffset);

        gsap.to(track, {
            x,
            duration: animated ? 0.65 : 0,
            ease: "power3.out"
        });
    }

    function onPointerDown(e) {
        if (!sliderViewport) return;
        isPointerDown = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        startTrackX = getTrackX();

        gsap.killTweensOf(track);
        sliderViewport.classList.add("is-dragging");
        sliderViewport.setPointerCapture?.(e.pointerId);
    }

    function onPointerMove(e) {
        if (!isPointerDown) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // не мешаем вертикальному скроллу страницы
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) return;

        if (Math.abs(dx) > 4) moved = true;

        const minX = -maxOffset;
        const maxX = 0;
        const nextX = gsap.utils.clamp(minX, maxX, startTrackX + dx);

        gsap.set(track, { x: nextX });
    }

    function onPointerUp(e) {
        if (!isPointerDown) return;
        isPointerDown = false;

        sliderViewport.classList.remove("is-dragging");
        sliderViewport.releasePointerCapture?.(e.pointerId);

        const dx = e.clientX - startX;

        if (!moved) return;

        if (dx <= -SWIPE_THRESHOLD) {
            goTo(currentIndex + 1);
        } else if (dx >= SWIPE_THRESHOLD) {
            goTo(currentIndex - 1);
        } else {
            goTo(currentIndex);
        }
    }

    recalcStep();
    goTo(0, false);

    nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));
    prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));

    sliderViewport?.addEventListener("pointerdown", onPointerDown);
    sliderViewport?.addEventListener("pointermove", onPointerMove);
    sliderViewport?.addEventListener("pointerup", onPointerUp);
    sliderViewport?.addEventListener("pointercancel", onPointerUp);
    sliderViewport?.addEventListener("pointerleave", onPointerUp);

    window.addEventListener("resize", () => {
        recalcStep();
        goTo(currentIndex, false);
    });
}
/***** end tech cards slider *****/