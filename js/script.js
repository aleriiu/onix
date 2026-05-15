'use strict';

//header fixed 
const header = document.querySelector('.header-fixed');
const headerH = document.querySelector('.header-fixed').clientHeight;
const height = document.querySelector('.modal_menu-container');
const headerContainer = document.querySelector('.header-container');

document.onscroll = function () {
    let scroll = window.scrollY;
    if (scroll > headerH) {
        header.classList.add('fixed');
        header.classList.add('scrolled');
        headerContainer.classList.add('padding');
        // document.body.style.paddingTop = headerH + 'px';
        header.style.backgroundColor = '#FFFFFF33';
        header.style.backdropFilter = 'blur(10px)'
    }
    else {
        header.classList.remove('fixed');
        header.classList.remove('scrolled');
        headerContainer.classList.remove('padding');
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

// 1. GSAP
gsap.registerPlugin(ScrollTrigger);

// 2. Lenis + ScrollTrigger sync (scrollerProxy убирает рывок при pin/unpin)
const lenis = new Lenis();
ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
        if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
    },
    getBoundingClientRect() {
        return {
            top:    0,
            left:   0,
            width:  window.innerWidth,
            height: window.innerHeight
        };
    }
});
lenis.on("scroll", ScrollTrigger.update);
ScrollTrigger.addEventListener("refresh", () => lenis.resize());
gsap.ticker.add((time) => {
    // gsap.ticker передает время в секундах, Lenis ожидает миллисекунды
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
ScrollTrigger.refresh();

/*
 * GALLERY — flex-мозаика + CSS sticky (без GSAP pin → нет скачка при входе).
 * Фаза 1: img-1 шире, img-5 уходит, крайние ряды — квадраты по краям + spacer.
 * Фаза 2: верх/низ схлопываются, img-1 на всю высоту.
 * Фаза 3: текст.
 */

gsap.set(".main-gallery .mosaic-cell-content__inner", { opacity: 0 });

const gallerySection = document.querySelector(".main-gallery");
const galleryPin     = gallerySection?.querySelector(".sticky-wrapper");
const mosaicWrap     = gallerySection?.querySelector(".mosaic-wrap");
const rowTop         = gallerySection?.querySelector(".mosaic-row--top");
const rowMid         = gallerySection?.querySelector(".mosaic-row--mid");
const rowBot         = gallerySection?.querySelector(".mosaic-row--bottom");
const spacerTop      = rowTop?.querySelector(".mosaic-row-spacer");
const spacerBot      = rowBot?.querySelector(".mosaic-row-spacer");

const img1Cell = gallerySection?.querySelector(".mosaic-cell.img-1");
const img2Cell = gallerySection?.querySelector(".mosaic-cell.img-2");
const img3Cell = gallerySection?.querySelector(".mosaic-cell.img-3");
const img4Cell = gallerySection?.querySelector(".mosaic-cell.img-4");
const img5Cell = gallerySection?.querySelector(".mosaic-cell.img-5");
const img6Cell = gallerySection?.querySelector(".mosaic-cell.img-6");
const img7Cell = gallerySection?.querySelector(".mosaic-cell.img-7");

const neighborCells = [img2Cell, img3Cell, img4Cell, img5Cell, img6Cell, img7Cell].filter(Boolean);
const flexCells     = [img1Cell, img2Cell, img3Cell, img4Cell, img5Cell, img6Cell, img7Cell].filter(Boolean);

const getRowGap = (row) => {
    if (!row) return 0;
    const g = parseFloat(getComputedStyle(row).gap);
    return Number.isFinite(g) ? g : 12;
};

const getMidRowFullWidth = () => {
    if (!rowMid) return 0;
    return rowMid.clientWidth - getRowGap(rowMid);
};

const getGalleryViewport = () => {
    const vv = window.visualViewport;
    const viewportW = Math.round(vv?.width ?? window.innerWidth);
    const viewportH = Math.round(vv?.height ?? window.innerHeight);
    const pinRect = galleryPin?.getBoundingClientRect();
    return {
        w: Math.round(pinRect?.width ?? viewportW),
        h: Math.round(pinRect?.height ?? viewportH)
    };
};

/** Цели фаз 1–2 фиксируем один раз при входе — иначе scrub пересчитывает offsetHeight каждый кадр */
let galleryMetrics = null;

const measureGalleryMetrics = () => {
    if (!img2Cell || !img6Cell || !img7Cell || !rowMid) return;

    galleryMetrics = {
        square: Math.round(img2Cell.offsetHeight),
        wide:   Math.round(img6Cell.offsetHeight * 2),
        img1w:  Math.round(getMidRowFullWidth()),
        vpW:    Math.round(getGalleryViewport().w),
        vpH:    Math.round(getGalleryViewport().h)
    };
};

/** full: сброс inline-стилей GSAP (скролл назад / resize). Без full — только spacer’ы. */
const resetGalleryLayout = (full = false) => {
    if (!img1Cell || !mosaicWrap || !rowMid) return;

    if (full) {
        flexCells.forEach((el) => {
            gsap.set(el, { clearProps: "width,height,flex,flexGrow,flexShrink,flexBasis,opacity,minWidth,maxWidth,margin,boxSizing,x" });
        });
        [spacerTop, spacerBot].forEach((el) => {
            if (!el) return;
            gsap.set(el, { clearProps: "flex,width,flexGrow" });
        });
        gsap.set([rowTop, rowBot], { clearProps: "flex,opacity,height,minHeight", opacity: 1 });
        gsap.set(rowMid, { clearProps: "flex,opacity", opacity: 1 });
        gsap.set(mosaicWrap, { clearProps: "gap" });
        gsap.set(img1Cell, { clearProps: "backgroundSize,backgroundPosition" });
        galleryMetrics = null;
    }

    gsap.set([spacerTop, spacerBot], { flex: "0 0 0px", width: 0 });
    mosaicWrap?.classList.remove("is-fullscreen");
};

const onGallerySectionEnter = () => {
    measureGalleryMetrics();
};

const galleryTl = gsap.timeline({
    scrollTrigger: {
        trigger:             gallerySection,
        start:               "top top",
        end:                 "+=380%",
        scrub:               0.3,
        refreshPriority:     -10,
        id:                  "main-gallery-scroll",
        invalidateOnRefresh: false,
        onEnter:             onGallerySectionEnter,
        onEnterBack:         onGallerySectionEnter,
        onLeaveBack:         () => resetGalleryLayout(true)
    }
});

if (gallerySection && img1Cell && mosaicWrap && rowMid) {
    resetGalleryLayout(false);

    let galleryResizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(galleryResizeTimer);
        galleryResizeTimer = setTimeout(() => {
            resetGalleryLayout(true);
            measureGalleryMetrics();
            galleryTl.scrollTrigger?.invalidate();
            ScrollTrigger.refresh();
        }, 200);
    });

    const growEase = "power2.inOut";
    const fadeEase = "power1.inOut";
    const flexLock = "0 0 auto";
    const m = () => galleryMetrics;

    galleryTl.to(img1Cell, {
        backgroundSize: "cover",
        duration:       1,
        ease:           growEase
    }, 0);

    // ── Фаза 1: горизонтальное выталкивание ─────────────────────────────────
    galleryTl.to([spacerTop, spacerBot], {
        flex:     "1 1 auto",
        width:    "auto",
        duration: 0.5,
        ease:     growEase
    }, 0);

    galleryTl
        .to(img2Cell, {
            flex:       flexLock,
            width:      () => m()?.square ?? img2Cell.offsetHeight,
            roundProps: "width",
            duration:   0.5,
            ease:       growEase
        }, 0)
        .to(img3Cell, {
            flex:       flexLock,
            width:      () => m()?.square ?? img3Cell.offsetHeight,
            roundProps: "width",
            duration:   0.5,
            ease:       growEase
        }, 0)
        .to(img4Cell, {
            flex:       flexLock,
            width:      () => m()?.square ?? img4Cell.offsetHeight,
            roundProps: "width",
            duration:   0.5,
            ease:       growEase
        }, 0)
        .to(img6Cell, {
            flex:       flexLock,
            width:      () => m()?.wide ?? img6Cell.offsetHeight * 2,
            roundProps: "width",
            duration:   0.5,
            ease:       growEase
        }, 0)
        .to(img7Cell, {
            flex:       flexLock,
            width:      () => m()?.square ?? img7Cell.offsetHeight,
            roundProps: "width",
            duration:   0.5,
            ease:       growEase
        }, 0);

    galleryTl
        .to(img5Cell, {
            flex:     "0 0 auto",
            width:    0,
            minWidth: 0,
            opacity:  0,
            duration: 0.5,
            ease:     growEase
        }, 0)
        .to(img1Cell, {
            flex:       "1 1 auto",
            width:      () => m()?.img1w ?? getMidRowFullWidth(),
            roundProps: "width",
            duration:   0.5,
            ease:       growEase
        }, 0);

    galleryTl.to(neighborCells, {
        opacity:  0,
        duration: 0.45,
        ease:     fadeEase,
        stagger:  0.03
    }, 0.15);

    const P2 = 0.48;
    const P2_IMG1 = 0.58;
    const P3 = 0.72;
    const P_HOLD = 0.78;

    // ── Фаза 2: вертикальное раскрытие img-1 на весь viewport ───────────────
    galleryTl.to(mosaicWrap, {
        gap:      0,
        duration: 0.42,
        ease:     fadeEase
    }, P2);

    galleryTl
        .to(rowTop, {
            flex:      "0 0 0px",
            minHeight: 0,
            opacity:   0,
            duration:  0.42,
            ease:      fadeEase
        }, P2)
        .to(rowBot, {
            flex:      "0 0 0px",
            minHeight: 0,
            opacity:   0,
            duration:  0.42,
            ease:      fadeEase
        }, P2)
          .to(img5Cell, {
            marginRight:  0,
            duration: 0.42,
            ease:     growEase
        }, P2)
        .to(rowMid, {
            flex:       "1 1 100%",
            minHeight:  "100%",
            height:     "100%",
            duration:   0.42,
            ease:       fadeEase
        }, P2)
        .to(img1Cell, {
            flex:       "1 1 100%",
            width:      "100%",
            height: () => getGalleryViewport().h,   // px вместо "100%"
            minHeight: () => getGalleryViewport().h,
            duration: 0.36,
            ease: fadeEase,
            immediateRender: false
          }, P2_IMG1);

    // ── Фаза 3: текст ───────────────────────────────────────────────────────
    galleryTl.to(".main-gallery .mosaic-cell-content__inner", {
        opacity:  1,
        duration: 0.12,
        ease:     "power1.out"
    }, P3);

    // ── Пауза: полный экран закреплён, скролл идёт «вхолостую» ───────────────
    galleryTl.to({}, { duration: 0.22 }, P_HOLD);

    galleryTl.eventCallback("onUpdate", () => {
        mosaicWrap?.classList.toggle("is-fullscreen", galleryTl.progress() >= P2_IMG1);
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
}
/***** end gallery *****/

/***** boat *****/
const boatData = {
    cabin: {
        watermark: "850",
        description: "Комфортная каютная лодка для семейных путешествий и продолжительных маршрутов",
        image: "./images/850_cabin_side.webp",
        imageAlt: "ONIX 850 Cabin",
        length: "8,5",
        capacity: "8",
        speed: "95",
        link: ""
    },
    day: {
        watermark: "850",
        description: "Открытый, стильный катер для истинных ценителей скорости и ощущений на воде. Его цель — максимум внимания и драйва.",
        image: "./images/850_day_cruiser_side.webp",
        imageAlt: "ONIX 850 Day Cruiser",
        length: "8,5",
        capacity: "2",
        speed: "95",
        link: ""
    },
    x12: {
        watermark: "12X",
        description: "Представляем абсолютно новый флагман ONIX 12X — воплощение передовых технологий, элегантного дизайна и непревзойдённого комфорта.",
        image: "./images/12x_side.webp",
        imageAlt: "ONIX 12X",
        length: "12",
        capacity: "12",
        speed: "120",
        link: "model.html"
    }
};

let activeModelKey = "cabin";
let isBoatAnimating = false;

const modelButtons = document.querySelectorAll(".boat-model-btn");
const boatDescription = document.getElementById("boatDescription");
const boatWatermark = document.getElementById("boatWatermark");
const boatLength = document.getElementById("boatLength");
const boatCapacity = document.getElementById("boatCapacity");
const boatSpeed = document.getElementById("boatSpeed");
const boatImageCurrent = document.getElementById("boatImageCurrent");
const boatLinks = document.querySelectorAll(".boat-info-desc-text-btn");


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
    boatLinks.forEach((link) => link.href = model.link);
}

async function renderBoat(modelKey) {
    if (isBoatAnimating || modelKey === activeModelKey) return;

    const model = boatData[modelKey];
    if (!model || !boatImageCurrent) return;

    isBoatAnimating = true;

    const textTargets = [boatDescription, boatWatermark, boatLength, boatCapacity, boatSpeed];

    // чтобы не наслаивались анимации при быстрых кликах
    gsap.killTweensOf([boatImageCurrent, ...textTargets]);

    await preload(model.image);

    const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
            activeModelKey = modelKey;
            isBoatAnimating = false;
        }
    });

    // 1) старая лодка уезжает вправо, текст плавно исчезает
    tl.to(boatImageCurrent, {
        x: 120,
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in"
    }, 0)
        .to(textTargets, {
            autoAlpha: 0,
            y: 6,
            duration: 0.2,
            stagger: 0.015
        }, 0);

    // 2) обновляем контент в точке, когда старая уже ушла
    tl.add(() => {
        boatImageCurrent.src = model.image;
        boatImageCurrent.alt = model.imageAlt || "лодка";
        applyBoatContent(modelKey);

        // стартовые позиции для въезда/появления
        gsap.set(boatImageCurrent, { x: -120, autoAlpha: 0 });
        gsap.set(textTargets, { y: 0, autoAlpha: 0 });
    });

    // 3) новая лодка въезжает слева направо, текст плавно появляется
    tl.to(boatImageCurrent, {
        x: 0,
        autoAlpha: 1,
        duration: 0.45,
        ease: "power3.out"
    })
        .to(textTargets, {
            autoAlpha: 1,
            duration: 0.28,
            stagger: 0.02
        }, "<+0.05");
}

modelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (isBoatAnimating) return;

        modelButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderBoat(btn.dataset.model);
    });
});
/***** end boat *****/


/***** hero stacked cards on scroll *****/
const heroSection = document.querySelector(".hero");
const heroSlides = gsap.utils.toArray(".hero .hero-background-image");
const heroDots = gsap.utils.toArray(".hero-dot");
const heroDotProgresses = gsap.utils.toArray(".hero-dot-progress");

if (heroSection && heroSlides.length > 1) {
    // Карточки уложены стопкой в одном кадре.
    gsap.set(heroSlides, { yPercent: 0, "--hero-bg-scale": 1 });

    const slidesCount = heroSlides.length;
    const totalTransitions = slidesCount - 1;
    const MOVE_UNIT = 1;
    const HOLD_UNIT = 0.35;
    const phaseUnit = MOVE_UNIT + HOLD_UNIT;
    const totalTimelineUnits = (totalTransitions * phaseUnit) + HOLD_UNIT;
    const hasHeroDots = heroDots.length > 0;
    const hasHeroDotProgress = heroDotProgresses.length > 0;

    const updateHeroPagination = (progress) => {
        if (!hasHeroDots) return;

        const timelinePos = progress * totalTimelineUnits;
        let activeIndex = 0;

        for (let i = 0; i < totalTransitions; i += 1) {
            const moveEnd = (i * phaseUnit) + MOVE_UNIT;
            if (timelinePos >= moveEnd) {
                activeIndex = i + 1;
            } else {
                break;
            }
        }

        heroDots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
        });

        if (!hasHeroDotProgress) return;

        heroDotProgresses.forEach((progressEl, dotIndex) => {
            let segmentProgress = 0;

            // 1-я карточка уже активна при старте hero.
            if (dotIndex === 0) {
                segmentProgress = 1;
            } else {
                // 2-я и 3-я точки заполняются только во время появления
                // соответствующей карточки (без учета hold-паузы).
                const transitionIndex = dotIndex - 1;
                const transitionStart = transitionIndex * phaseUnit;
                const transitionEnd = transitionStart + MOVE_UNIT;
                const raw = (timelinePos - transitionStart) / (transitionEnd - transitionStart);
                segmentProgress = gsap.utils.clamp(0, 1, raw);
            }

            gsap.set(progressEl, { scaleY: segmentProgress });
        });
    };

    if (hasHeroDotProgress) {
        gsap.set(heroDotProgresses, {
            scaleY: 0,
            transformOrigin: "top center"
        });
    }

    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: `+=${slidesCount * 100}%`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            refreshPriority: 20,
            onUpdate: (self) => updateHeroPagination(self.progress)
        }
    });

    heroSlides.slice(0, -1).forEach((slide, index) => {
        const nextSlide = heroSlides[index + 1];
        const phaseStart = index * phaseUnit;

        heroTl.to(slide, {
            yPercent: -100,
            ease: "none",
            duration: MOVE_UNIT
        }, phaseStart);

        if (nextSlide) {
            // При появлении следующей карточки даем ей легкий медленный zoom (до 110%).
            heroTl.to(nextSlide, {
                "--hero-bg-scale": 1.1,
                ease: "none",
                duration: MOVE_UNIT + HOLD_UNIT
            }, phaseStart);
        }

        // Небольшой "холостой" скролл после открытия следующей карточки.
        heroTl.to({}, { duration: HOLD_UNIT }, phaseStart + MOVE_UNIT);
    });

    // Пауза на последней карточке перед выходом из pin.
    heroTl.to({}, { duration: HOLD_UNIT });
    updateHeroPagination(0);
}
/***** end hero stacked cards on scroll *****/


/***** text change color *****/

function splitTextToLines(target) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return null;
    const originalText = el.dataset.originalText || el.textContent.replace(/\s+/g, " ").trim();
    if (!originalText) return null;
    el.dataset.originalText = originalText;

    el.textContent = "";
    const words = originalText.split(" ");
    words.forEach((word, idx) => {
        const wordSpan = document.createElement("span");
        wordSpan.className = "text-word";
        wordSpan.textContent = idx < words.length - 1 ? `${word} ` : word;
        el.appendChild(wordSpan);
    });

    const wordNodes = Array.from(el.querySelectorAll(".text-word"));
    if (!wordNodes.length) return null;

    const lines = [];
    let currentLine = "";
    let currentTop = wordNodes[0].offsetTop;

    wordNodes.forEach((wordNode) => {
        const nextTop = wordNode.offsetTop;
        if (Math.abs(nextTop - currentTop) > 1) {
            lines.push(currentLine.trimEnd());
            currentLine = "";
            currentTop = nextTop;
        }
        currentLine += wordNode.textContent || "";
    });
    if (currentLine) lines.push(currentLine.trimEnd());

    const fragment = document.createDocumentFragment();
    lines.forEach((lineText) => {
        const lineSpan = document.createElement("span");
        lineSpan.className = "text-line";
        lineSpan.style.display = "block";
        lineSpan.textContent = lineText;
        fragment.appendChild(lineSpan);
    });

    el.textContent = "";
    el.appendChild(fragment);
    return el;
}

function setupColorFillingTextSections() {
    const sections = document.querySelectorAll(".welcome.color-filling-text-container");
    const baseRGB = [178, 178, 178];
    const fillRGB = [14, 58, 97];

    sections.forEach((section) => {
        const textElement = section.querySelector(".color-filling-text");
        if (!textElement) return;
        let lines = [];
        let lastProgressKey = -1;

        const rebuildLines = () => {
            const preparedText = splitTextToLines(textElement);
            if (!preparedText) return false;
            lines = Array.from(preparedText.querySelectorAll(".text-line"));
            lastProgressKey = -1;
            return lines.length > 0;
        };
        if (!rebuildLines()) return;

        const paintLines = (filledFloat) => {
            const progressKey = Math.round(filledFloat * 1000);
            if (progressKey === lastProgressKey) return;
            lastProgressKey = progressKey;

            lines.forEach((line, index) => {
                const local = gsap.utils.clamp(0, 1, filledFloat - index);
                const r = Math.round(baseRGB[0] + (fillRGB[0] - baseRGB[0]) * local);
                const g = Math.round(baseRGB[1] + (fillRGB[1] - baseRGB[1]) * local);
                const b = Math.round(baseRGB[2] + (fillRGB[2] - baseRGB[2]) * local);
                line.style.color = `rgb(${r}, ${g}, ${b})`;
            });
        };

        paintLines(0);

        ScrollTrigger.create({
            trigger: section,
            start: "center center",
            end: () => {
                const dynamicDistance = lines.length * 220;
                return `+=${Math.max(window.innerHeight * 1.15, dynamicDistance)}`;
            },
            scrub: true,
            pin: true,
            anticipatePin: 1,
            refreshPriority: 10,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
                rebuildLines();
                paintLines(0);
            },
            onUpdate: (self) => {
                paintLines(self.progress * lines.length);
            }
        });
    });
}

setupColorFillingTextSections();

function initDescriptionColorFilling() {
    const section = document.querySelector(".description.color-filling-text-container");
    if (!section) return;

    const textBlocks = Array.from(section.querySelectorAll(".color-filling-text"));
    if (!textBlocks.length) return;
    const baseRGB = [178, 178, 178];
    const fillRGB = [14, 58, 97];
    let lines = [];
    let lastProgressKey = -1;

    const rebuildLines = () => {
        lines = [];
        textBlocks.forEach((textElement) => {
            const preparedText = splitTextToLines(textElement);
            if (!preparedText) return;
            lines.push(...preparedText.querySelectorAll(".text-line"));
        });
        lastProgressKey = -1;
        return lines.length > 0;
    };
    if (!rebuildLines()) return;

    const paintLines = (filledFloat) => {
        const progressKey = Math.round(filledFloat * 1000);
        if (progressKey === lastProgressKey) return;
        lastProgressKey = progressKey;

        lines.forEach((line, index) => {
            const local = gsap.utils.clamp(0, 1, filledFloat - index);
            const r = Math.round(baseRGB[0] + (fillRGB[0] - baseRGB[0]) * local);
            const g = Math.round(baseRGB[1] + (fillRGB[1] - baseRGB[1]) * local);
            const b = Math.round(baseRGB[2] + (fillRGB[2] - baseRGB[2]) * local);
            line.style.color = `rgb(${r}, ${g}, ${b})`;
        });
    };

    paintLines(0);

    ScrollTrigger.create({
        trigger: section,
        start: "center center",
        end: () => {
            const dynamicDistance = lines.length * 220;
            return `+=${Math.max(window.innerHeight * 1.15, dynamicDistance)}`;
        },
        scrub: true,
        pin: true,
        anticipatePin: 1,
        refreshPriority: -20,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
            rebuildLines();
            paintLines(0);
        },
        onUpdate: (self) => {
            paintLines(self.progress * lines.length);
        }
    });
}

/**
 * FEEDBACK SVG — увеличение до 90vw + pin по скроллу.
 * Логика:
 * 1) Как только секция .feedback входит в экран (top bottom) — стартует анимация.
 * 2) SVG плавно увеличивается с текущей ширины до 90vw.
 * 3) SVG остается зафиксированным, пока пользователь не проскроллит половину
 *    высоты родительской секции .feedback.
 */
function initFeedbackSvgScroll() {
    const container = document.querySelector(".feedback-video-container");
    const pinWrap = container?.querySelector(".feedback-video-container-svg-pin");
    const svg = pinWrap?.querySelector(".feedback-video-container-svg");
    if (!container || !pinWrap || !svg) return;

    // Важно: pin и анимация выполняются на разных элементах.
    // pinWrap фиксируется, svg внутри масштабируется — это убирает рывки на обратном скролле.
    gsap.set(pinWrap, {
        zIndex: 1
    });
    gsap.set(svg, {
        transformOrigin: "50% 50%",
        scale: 1,
        zIndex: 1
    });

    const getTargetScale = () => {
        // Масштаб до 90% ширины родителя относительно текущей базовой ширины SVG.
        const baseWidth = pinWrap.getBoundingClientRect().width || 1;
        const targetWidth = container.clientWidth * 0.96;
        return Math.max(1, targetWidth / baseWidth);
    };

    gsap.timeline({
        scrollTrigger: {
            trigger: container,
            // Старт, когда .feedback-video-container полностью виден в окне.
            start: "bottom bottom",
            // SVG фиксируется, пока контейнер не прокрутится на 30% своей высоты.
            end: () => `+=${Math.max(1, container.offsetHeight * 0.35)}`,
            scrub: 1,
            pin: pinWrap,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // Блок ниже уже существующих pinned-секций.
            // Более низкий приоритет -> пересчет позже -> корректные start/end после spacer-ов.
            refreshPriority: -35,
            // Держим слой SVG стабильным: ScrollTrigger может менять inline-стили при pin.
            onRefreshInit: () => gsap.set(pinWrap, { zIndex: 1 }),
            onEnter: () => gsap.set(pinWrap, { zIndex: 1 }),
            onEnterBack: () => gsap.set(pinWrap, { zIndex: 1 }),
            onLeave: () => gsap.set(pinWrap, { zIndex: 1 }),
            onLeaveBack: () => gsap.set(pinWrap, { zIndex: 1 })
        }
    }).to(svg, {
        // Увеличиваем через scale (а не width), чтобы избежать горизонтального дрейфа
        // на обратном скролле при pin/unpin.
        scale: () => getTargetScale(),
        ease: "none"
    });
}

/**
 * FEEDBACK FORM — мягкий fade-up по скроллу.
 * Старт: когда верх form-container доходит до 60% высоты viewport
 * (то есть примерно 40% блока уже на экране).
 */
function initFeedbackFormFadeIn() {
    const formContainer = document.querySelector(".form-container");
    if (!formContainer) return;
    const contentItems = Array.from(formContainer.children);
    if (!contentItems.length) return;

    // Важно: анимируем только содержимое контейнера (детей),
    // сам контейнер и его фон остаются неизменными.
    gsap.set(contentItems, {
        autoAlpha: 0,
        y: 60
    });

    const VISIBLE_RATIO = 0.8;
    // Формула:
    // visible = viewportBottom - elementTop
    // visible = elementHeight * VISIBLE_RATIO
    // => startScroll = elementTop - (viewportHeight - elementHeight * VISIBLE_RATIO)
    const getStartAt40PctVisible = () => {
        const rect = formContainer.getBoundingClientRect();
        const topInDocument = rect.top + window.scrollY;
        const startScroll = topInDocument - (window.innerHeight - formContainer.offsetHeight * VISIBLE_RATIO);
        return Math.max(0, startScroll);
    };

    gsap.to(contentItems, {
        autoAlpha: 1,
        y: -10,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
            trigger: formContainer,
            start: getStartAt40PctVisible,
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
            // Блок расположен ниже основных pin-анимаций выше по странице.
            refreshPriority: -35
        }
    });
}

window.addEventListener("load", () => {
    initDescriptionColorFilling();
    initFeedbackSvgScroll();
    initFeedbackFormFadeIn();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
});

/***** end text change color *****/

/***** tech cards slider (gsap) *****/
const techSections = document.querySelectorAll(".js-tech-cards");

techSections.forEach((techSection) => {
    const track = techSection.querySelector(".tech-cards-track");
    const sliderViewport = techSection.querySelector(".tech-slider");
    const cards = gsap.utils.toArray(".tech-card", track);
    const prevBtn = techSection.querySelector(".tech-nav-prev");
    const nextBtn = techSection.querySelector(".tech-nav-next");

    if (!track || !sliderViewport || !cards.length) return;

    track.addEventListener("dragstart", (e) => e.preventDefault());

    let currentIndex = 0;
    let step = 0;
    let maxOffset = 0;
    let maxIndex = 0;

    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let startTrackX = 0;
    let moved = false;
    let suppressClick = false;
    const SWIPE_THRESHOLD = 60;

    const WHEEL_SENSITIVITY = 2.2;

    function getTrackX() {
        return Number(gsap.getProperty(track, "x")) || 0;
    }

    function recalcStep() {
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
        if (e.pointerType === "mouse") e.preventDefault();

        isPointerDown = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        startTrackX = getTrackX();
        suppressClick = false;

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
        if (Math.abs(dx) > 4) {
            moved = true;
            suppressClick = true;
        }

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

        setTimeout(() => {
            suppressClick = false;
        }, 0);
    }

    track.addEventListener("click", (e) => {
        const card = e.target.closest(".tech-card");
        if (!card) return;

        if (suppressClick) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // тут твое действие по клику карточки
        // например открыть модалку / перейти по ссылке
    });

    function onWheel(e) {
        if (isPointerDown || maxOffset <= 0) return;

        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);
        const isIntentionalHorizontal = absX >= 12 && absY <= 4 && absX > absY * 2.2;
        if (!isIntentionalHorizontal) return;
        const horizontalDelta = e.deltaX;

        e.preventDefault();

        gsap.killTweensOf(track);

        const currentX = getTrackX();
        const minX = -maxOffset;
        const maxX = 0;

        // колесо вниз / свайп влево -> двигаем трек влево
        const nextX = gsap.utils.clamp(
            minX,
            maxX,
            currentX - horizontalDelta * WHEEL_SENSITIVITY
        );

        gsap.to(track, {
            x: nextX,
            duration: 0.28,
            ease: "power2.out",
            overwrite: true,
            onUpdate: () => {
                const x = Math.abs(getTrackX());
                currentIndex = step > 0 ? Math.round(x / step) : 0;
                currentIndex = gsap.utils.clamp(0, maxIndex, currentIndex);
            }
        });
    }

    recalcStep();
    goTo(0, false);

    nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));
    prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));

    sliderViewport.addEventListener("pointerdown", onPointerDown);
    sliderViewport.addEventListener("pointermove", onPointerMove);
    sliderViewport.addEventListener("pointerup", onPointerUp);
    sliderViewport.addEventListener("pointercancel", onPointerUp);
    sliderViewport.addEventListener("pointerleave", onPointerUp);
    sliderViewport.addEventListener("wheel", onWheel, { passive: false });

    window.addEventListener("resize", () => {
        recalcStep();
        goTo(currentIndex, false);
    });
});
/***** end tech cards slider *****/