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

/** Слайдер цены (range) */
function initModelPriceRange() {
    const input = document.querySelector('.model-price__range');
    const out = document.querySelector('.model-price__value');
    if (!input || !out) return;

    const format = (v) =>
        new Intl.NumberFormat('ru-RU').format(Number(v)) + ' ₽';

    const sync = () => {
        out.textContent = format(input.value);
    };

    input.addEventListener('input', sync);
    sync();
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
initModelAccordions();
initModelPriceRange();
initModelVideoPlay();

document.querySelector('.hero-model__cta')?.addEventListener('click', () => {
    document.querySelector('.model-video')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
