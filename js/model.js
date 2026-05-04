'use strict';

/** Фиксированная шапка при скролле (фрагмент из script.js) */
const header = document.querySelector('.header-fixed');
const headerContainer = document.querySelector('.header-container');
const headerH = header ? header.clientHeight : 0;

if (header && headerContainer) {
    document.addEventListener('scroll', () => {
        const scroll = window.scrollY;

        if (scroll > headerH) {
            header.classList.add('fixed');
            header.classList.add('scrolled');
            headerContainer.classList.add('padding');
            header.style.backgroundColor = '#FFFFFF33';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.classList.remove('fixed');
            header.classList.remove('scrolled');
            headerContainer.classList.remove('padding');
            header.style.backgroundColor = '';
            header.style.backdropFilter = '';
        }
    });

    window.addEventListener('scroll', () => {
        const line = document.querySelector('.horizontal-line');
        if (!line) return;
        line.style.display = window.scrollY > 50 ? 'none' : 'block';
    });
}

/** Анимация абзаца в .description (из script.js) */
gsap.registerPlugin(ScrollTrigger);

/** Плавный скролл Lenis + синхронизация с ScrollTrigger (как на главной) */
const lenis =
    typeof Lenis !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? new Lenis()
        : null;

if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

function splitTextToChars(selector) {
    const el = document.querySelector(selector);
    if (!el) return null;
    if (el.dataset.splitted === 'true') return el;

    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const fragment = document.createDocumentFragment();

    for (const char of text) {
        const span = document.createElement('span');
        span.className = 'text-char';
        span.textContent = char;
        fragment.appendChild(span);
    }

    el.textContent = '';
    el.appendChild(fragment);
    el.dataset.splitted = 'true';
    return el;
}

function initDescriptionTextAnimation() {
    const descSection = document.querySelector('.description');
    if (!descSection) return;

    splitTextToChars('.description-text');
    splitTextToChars('.description-text-italic');

    const descriptionTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.description',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });

    descriptionTl.fromTo(
        '.description-text .text-char',
        { color: '#B2B2B2' },
        {
            color: '#0E3A61',
            stagger: 0.018,
            ease: 'power2.out',
            duration: 0.6
        }
    );

    const italicChars = document.querySelectorAll('.description-text-italic .text-char');
    if (italicChars.length) {
        descriptionTl.fromTo(
            '.description-text-italic .text-char',
            { color: '#B2B2B2' },
            {
                color: '#0E3A61',
                stagger: 0.018,
                ease: 'power2.out',
                duration: 0.6
            },
            '+=0.15'
        );
    }
}

/** Слайдер tech-карточек (из script.js) */
function initTechCardSliders() {
    const techSections = document.querySelectorAll('.js-tech-cards');

    techSections.forEach((techSection) => {
        const track = techSection.querySelector('.tech-cards-track');
        const sliderViewport = techSection.querySelector('.tech-slider');
        const cards = gsap.utils.toArray('.tech-card', track);
        const prevBtn = techSection.querySelector('.tech-nav-prev');
        const nextBtn = techSection.querySelector('.tech-nav-next');

        if (!track || !sliderViewport || !cards.length) return;

        track.addEventListener('dragstart', (e) => e.preventDefault());

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
        const WHEEL_SENSITIVITY = 1.6;

        function getTrackX() {
            return Number(gsap.getProperty(track, 'x')) || 0;
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
                ease: 'power3.out'
            });
        }

        function onPointerDown(e) {
            if (e.pointerType === 'mouse') e.preventDefault();

            isPointerDown = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            startTrackX = getTrackX();
            suppressClick = false;

            gsap.killTweensOf(track);
            sliderViewport.classList.add('is-dragging');
            sliderViewport.setPointerCapture?.(e.pointerId);
        }

        function onPointerMove(e) {
            if (!isPointerDown) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) return;

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

            sliderViewport.classList.remove('is-dragging');
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

        track.addEventListener('click', (e) => {
            const card = e.target.closest('.tech-card');
            if (!card) return;

            if (suppressClick) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        function onWheel(e) {
            if (isPointerDown || maxOffset <= 0) return;

            const absX = Math.abs(e.deltaX);
            const absY = Math.abs(e.deltaY);
            const dominant = absX > absY ? e.deltaX : e.deltaY;

            if (Math.abs(dominant) < 2) return;

            e.preventDefault();

            gsap.killTweensOf(track);

            const currentX = getTrackX();
            const minX = -maxOffset;
            const maxX = 0;

            const nextX = gsap.utils.clamp(
                minX,
                maxX,
                currentX - dominant * WHEEL_SENSITIVITY
            );

            gsap.to(track, {
                x: nextX,
                duration: 0.28,
                ease: 'power2.out',
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

        nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));
        prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));

        sliderViewport.addEventListener('pointerdown', onPointerDown);
        sliderViewport.addEventListener('pointermove', onPointerMove);
        sliderViewport.addEventListener('pointerup', onPointerUp);
        sliderViewport.addEventListener('pointercancel', onPointerUp);
        sliderViewport.addEventListener('pointerleave', onPointerUp);
        sliderViewport.addEventListener('wheel', onWheel, { passive: false });

        window.addEventListener('resize', () => {
            recalcStep();
            goTo(currentIndex, false);
        });
    });
}

/** Табы «Базовая / Дополнительные» в блоке комплектации */
function initEquipmentTabs() {
    const section = document.querySelector('.model-equipment');
    if (!section) return;

    const tabs = section.querySelectorAll('.model-equipment__tab');
    const panels = section.querySelectorAll('.model-equipment__panel');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const panelId = tab.getAttribute('aria-controls');
            const targetPanel = panelId ? document.getElementById(panelId) : null;
            if (!targetPanel) return;

            tabs.forEach((t) => {
                const on = t === tab;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.setAttribute('tabindex', on ? '0' : '-1');
            });

            panels.forEach((p) => {
                const show = p === targetPanel;
                p.hidden = !show;
            });
        });
    });
}

/** Аккордеоны на странице модели */
function initModelAccordions() {
    document.querySelectorAll('.model-accordion').forEach((root) => {
        root.querySelectorAll('.model-accordion__item').forEach((item) => {
            const trigger = item.querySelector('.model-accordion__trigger');
            const panel = item.querySelector('.model-accordion__panel');
            if (!trigger || !panel) return;

            trigger.addEventListener('click', () => {
                const isOpen = item.classList.toggle('is-open');
                trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                panel.hidden = !isOpen;
            });
        });
    });
}

/** Пошаговая анимация блока «Путь к вашей лодке» */
function initRoadTimeline() {
    const root = document.querySelector('[data-road-timeline]');
    if (!root) return;

    const line = root.querySelector('.model-road__line');
    const steps = Array.from(root.querySelectorAll('[data-road-step]'));
    if (!line || steps.length === 0) return;

    const dots = steps.map((step) => step.querySelector('.model-road__dot')).filter(Boolean);
    const contents = steps.map((step) => step.querySelector('.model-road__content')).filter(Boolean);

    gsap.set(line, { scaleX: 0 });
    gsap.set(dots, { autoAlpha: 0, scale: 0.85 });
    gsap.set(contents, { autoAlpha: 0, y: 12 });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: root,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    tl.to(line, { scaleX: 1, duration: 0.72, ease: 'power2.out' }).to(
        dots[0],
        { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'back.out(2)' },
        '-=0.18'
    );

    for (let i = 0; i < steps.length; i += 1) {
        if (i > 0) {
            tl.to(
                dots[i],
                { autoAlpha: 1, scale: 1, duration: 0.24, ease: 'back.out(2)' },
                '+=0.14'
            );
        } else {
            tl.to({}, { duration: 0.08 });
        }

        tl.to(contents[i], { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }, '-=0.04');
    }
}

/** Переключение плана палубы: кнопки слева + вертикальный индикатор справа */
function initDeckPlanSwitcher() {
    const root = document.querySelector('[data-deck-plan]');
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll('[data-deck-tab]'));
    const image = root.querySelector('[data-deck-image]');
    const indicators = Array.from(root.querySelectorAll('[data-deck-indicator]'));
    if (!tabs.length || !image) return;

    const activate = (index) => {
        const next = tabs[index];
        if (!next) return;

        tabs.forEach((tab, i) => {
            const active = i === index;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        const src = next.getAttribute('data-src');
        const alt = next.getAttribute('data-alt');
        const applyImage = () => {
            if (src) image.setAttribute('src', src);
            if (alt) image.setAttribute('alt', alt);
        };

        gsap.killTweensOf(image);
        gsap.to(image, {
            autoAlpha: 0,
            duration: 0.16,
            ease: 'power1.out',
            onComplete: () => {
                applyImage();
                gsap.to(image, { autoAlpha: 1, duration: 0.24, ease: 'power1.inOut' });
            }
        });

        indicators.forEach((item, i) => {
            const active = i === index;
            item.classList.toggle('is-active', active);
            gsap.to(item, {
                backgroundColor: active ? '#E9CE74' : 'rgba(233, 206, 116, 0.35)',
                opacity: active ? 1 : 0.72,
                scaleY: active ? 1.08 : 1,
                duration: 0.22,
                ease: 'power2.out'
            });
        });
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(index));
    });

    activate(0);
}

/** Кнопка «видео» — заглушка: можно заменить на открытие модалки или iframe */
function initModelVideoPlay() {
    const btn = document.querySelector('.model-video__play');
    const wrap = document.querySelector('.model-video__inner');
    if (!btn || !wrap) return;

    btn.addEventListener('click', () => {
        wrap.classList.toggle('is-playing');
        const playing = wrap.classList.contains('is-playing');
        btn.setAttribute('aria-label', playing ? 'Пауза' : 'Смотреть видео');
    });
}

initDescriptionTextAnimation();
initTechCardSliders();
initEquipmentTabs();
initDeckPlanSwitcher();
initModelAccordions();
initRoadTimeline();
initModelVideoPlay();

/** «Другие модели»: горизонтальное смещение через GSAP (x), без нативной полосы прокрутки */
function initOtherModelsHorizontalScroll() {
    const strip = document.querySelector('[data-other-models-scroll]');
    const track = strip?.querySelector('.model-other-models__track');
    if (!strip || !track) return;

    let xPos = 0;
    let dragMoved = false;

    const getMinX = () => Math.min(0, strip.clientWidth - track.scrollWidth);

    const syncX = () => {
        const minX = getMinX();
        xPos = gsap.utils.clamp(minX, 0, xPos);
        gsap.set(track, { x: xPos });
    };

    const xTo =
        typeof gsap.quickTo === 'function'
            ? gsap.quickTo(track, 'x', {
                  duration: 0.45,
                  ease: 'power3.out'
              })
            : (value) => {
                  gsap.to(track, {
                      x: value,
                      duration: 0.45,
                      ease: 'power3.out',
                      overwrite: 'auto'
                  });
              };

    const goToX = (next) => {
        const minX = getMinX();
        xPos = gsap.utils.clamp(minX, 0, next);
        xTo(xPos);
    };

    syncX();

    strip.addEventListener(
        'wheel',
        (e) => {
            if (track.scrollWidth <= strip.clientWidth) return;

            const minX = getMinX();
            const tol = 2;

            if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
                if (e.deltaX > 0 && xPos <= minX + tol) return;
                if (e.deltaX < 0 && xPos >= -tol) return;
                e.preventDefault();
                goToX(xPos - e.deltaX);
                return;
            }

            if (e.deltaY > 0 && xPos <= minX + tol) return;
            if (e.deltaY < 0 && xPos >= -tol) return;

            e.preventDefault();
            goToX(xPos - e.deltaY);
        },
        { passive: false }
    );

    let dragActive = false;
    let startPointerX = 0;
    let startXPos = 0;

    /** Перетаскивание мышью/тачем: слушатели на document — можно тянуть за пределы блока */
    const onDragMove = (e) => {
        if (!dragActive) return;
        const dx = e.clientX - startPointerX;
        if (Math.abs(dx) > 4) {
            dragMoved = true;
            e.preventDefault();
        }
        const minX = getMinX();
        xPos = gsap.utils.clamp(minX, 0, startXPos + dx);
        gsap.set(track, { x: xPos });
    };

    const endDrag = () => {
        if (!dragActive) return;
        dragActive = false;
        strip.classList.remove('is-dragging');
        document.removeEventListener('pointermove', onDragMove, true);
        document.removeEventListener('pointerup', endDrag, true);
        document.removeEventListener('pointercancel', endDrag, true);
        document.removeEventListener('mousemove', onDragMove, true);
        document.removeEventListener('mouseup', endDrag, true);
    };

    const beginDrag = (clientX) => {
        if (track.scrollWidth <= strip.clientWidth) return;
        dragActive = true;
        dragMoved = false;
        startPointerX = clientX;
        startXPos = xPos;
        gsap.killTweensOf(track);
        strip.classList.add('is-dragging');
    };

    strip.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    strip.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        beginDrag(e.clientX);
        if (!dragActive) return;
        document.addEventListener('pointermove', onDragMove, { capture: true, passive: false });
        document.addEventListener('pointerup', endDrag, { capture: true });
        document.addEventListener('pointercancel', endDrag, { capture: true });
    });

    strip.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (typeof window.PointerEvent === 'function') return;
        beginDrag(e.clientX);
        if (!dragActive) return;
        document.addEventListener('mousemove', onDragMove, { capture: true, passive: false });
        document.addEventListener('mouseup', endDrag, { capture: true });
    });

    strip.addEventListener(
        'click',
        (e) => {
            if (!dragMoved) return;
            if (e.target.closest('.model-other-models__cta')) {
                dragMoved = false;
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            dragMoved = false;
        },
        true
    );

    strip.addEventListener('click', (e) => {
        const btn = e.target.closest('.model-other-models__cta[data-href]');
        if (!btn || !strip.contains(btn)) return;
        const href = btn.getAttribute('data-href');
        if (href) {
            window.location.href = href;
        }
    });

    const onResizeOrImages = () => {
        syncX();
    };

    window.addEventListener('resize', onResizeOrImages);
    track.querySelectorAll('img').forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', onResizeOrImages, { once: true });
    });
}

initOtherModelsHorizontalScroll();

document.querySelector('.hero-model__cta')?.addEventListener('click', () => {
    const target = document.querySelector('.model-video');
    if (!target) return;
    if (lenis) {
        lenis.scrollTo(target, { offset: 0 });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
