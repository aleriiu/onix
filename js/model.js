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

function splitTextToChars(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
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

function initDescriptionColorFilling() {
    const section = document.querySelector('.description.color-filling-text-container');
    if (!section) return;

    const textBlocks = Array.from(section.querySelectorAll('.color-filling-text'));
    if (!textBlocks.length) return;

    const chars = [];
    textBlocks.forEach((textElement) => {
        const preparedText = splitTextToChars(textElement);
        if (!preparedText) return;
        chars.push(...preparedText.querySelectorAll('.text-char'));
    });
    if (!chars.length) return;

    const baseColor = 'var(--color-filling-base, #B2B2B2)';
    const fillColor = 'var(--color-filling-fill, #0E3A61)';
    let lastFilledCount = -1;

    const paintChars = (filledCount) => {
        if (filledCount === lastFilledCount) return;
        lastFilledCount = filledCount;

        chars.forEach((char, index) => {
            char.style.color = index < filledCount ? fillColor : baseColor;
        });
    };

    paintChars(0);

    ScrollTrigger.create({
        trigger: section,
        start: 'center center',
        end: () => {
            const dynamicDistance = chars.length * 14;
            return `+=${Math.max(window.innerHeight * 1.15, dynamicDistance)}`;
        },
        scrub: true,
        pin: true,
        anticipatePin: 1,
        refreshPriority: -20,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            const filledCount = Math.round(self.progress * chars.length);
            paintChars(filledCount);
        }
    });
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
        const WHEEL_SENSITIVITY = 2.2;

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

            const rect = sliderViewport.getBoundingClientRect();
            const viewportCenterY = window.innerHeight * 0.5;
            const isSliderInActiveZone = rect.top <= viewportCenterY && rect.bottom >= viewportCenterY;
            if (!isSliderInActiveZone) return;

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

            const nextX = gsap.utils.clamp(
                minX,
                maxX,
                currentX - horizontalDelta * WHEEL_SENSITIVITY
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

/**
 * Синхронное скрытие элементов road-timeline до первого рендера (предотвращает FOUC).
 * Вызывается немедленно при парсинге скрипта — до window.load и до DOMContentLoaded.
 */
(function preHideRoadElements() {
    console.log('[road] 1. preHideRoadElements — синхронно при парсинге скрипта', { readyState: document.readyState, scrollY: window.scrollY });
    const root = document.querySelector('[data-road-timeline]');
    if (!root) { console.warn('[road] preHideRoadElements: [data-road-timeline] не найден'); return; }
    gsap.set(root.querySelector('.model-road__line'),
        { scaleX: 0 });
    gsap.set(root.querySelectorAll('[data-road-step] .model-road__dot'),
        { autoAlpha: 0, scale: 0.5 });
    gsap.set(root.querySelectorAll('[data-road-step] .model-road__content'),
        { autoAlpha: 0, y: 18 });
    console.log('[road] 1. preHideRoadElements — элементы скрыты');
}());

/** Пошаговая анимация блока «Путь к вашей лодке» */
function initRoadTimeline() {
    console.log('[road] 3. initRoadTimeline — старт', { readyState: document.readyState, scrollY: window.scrollY });
    const root = document.querySelector('[data-road-timeline]');
    if (!root) return;

    const line = root.querySelector('.model-road__line');
    const steps = Array.from(root.querySelectorAll('[data-road-step]'));
    if (!line || steps.length === 0) return;

    const dots     = steps.map((s) => s.querySelector('.model-road__dot')).filter(Boolean);
    const contents = steps.map((s) => s.querySelector('.model-road__content')).filter(Boolean);

    // ── Timeline запускается, когда верх блока достигает середины экрана ────────
    // once: true — анимация играет ровно один раз при входе в зону триггера.
    // Это исключает ложный play при восстановлении скролла после refresh страницы:
    // ScrollTrigger с once не проверяет «уже прошли start?» при создании.
    const roadTriggerStart = root.getBoundingClientRect().top + window.scrollY;
    console.log('[road] 3. initRoadTimeline — ScrollTrigger создаётся', {
        'root.top (document)': roadTriggerStart,
        'start px (top center)': roadTriggerStart - window.innerHeight / 2,
        scrollY: window.scrollY
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger:         root,
            start:           'top center',
            once:            true,
            // road находится ниже description (-20) и overview (-30) на странице.
            // Более низкий refreshPriority = пересчитывается позже, уже после того
            // как description и overview обновили размеры своих pin-spacer-ов.
            refreshPriority: -40,
            onEnter: () => console.log('[road] 4. ScrollTrigger onEnter — анимация запущена', { scrollY: window.scrollY })
        }
    });

    // ── Линия вырастает слева направо ──────────────────────────────────────────
    tl.to(line, {
        scaleX:   1,
        duration: 1.4,
        ease:     'expo.inOut'   // плавное начало и мягкое замедление в конце
    });

    // ── Точки и подписи появляются последовательно по ходу линии ───────────────
    // Каждый шаг: сначала точка (с лёгким пружинным overshooting),
    // затем — почти одновременно — текстовый блок снизу вверх.
    steps.forEach((_, i) => {
        // Задержка после предыдущего шага: первый шаг «приходит» к концу линии,
        // последующие выдерживают паузу между собой.
        const offset = i === 0 ? '<0.35' : '+=0.1';

        tl.to(dots[i], {
            autoAlpha: 1,
            scale:     1,
            duration:  0.55,
            ease:      'back.out(1.4)'   // мягкий пружинный «щелчок»
        }, offset);

        tl.to(contents[i], {
            autoAlpha: 1,
            y:         0,
            duration:  0.65,
            ease:      'power3.out'      // плавное торможение текста
        }, '<0.08');                     // стартует почти одновременно с точкой
    });
}

/** Переключение плана палубы: кнопки слева + вертикальный индикатор справа */
function initDeckPlanSwitcher() {
    const root = document.querySelector('[data-deck-plan]');
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll('[data-deck-tab]'));
    const image = root.querySelector('[data-deck-image]');
    const indicators = Array.from(root.querySelectorAll('[data-deck-indicator]'));
    if (!tabs.length || !image) return;

    let imageSwapTimer = null;

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
        if (imageSwapTimer) {
            window.clearTimeout(imageSwapTimer);
            imageSwapTimer = null;
        }

        image.classList.add('is-switching');

        // Простая схема без гонок:
        // 1) fade-out через CSS (opacity -> 0)
        // 2) меняем src/alt
        // 3) снимаем класс и получаем fade-in (opacity -> 1)
        imageSwapTimer = window.setTimeout(() => {
            if (src) {
                image.setAttribute('src', src);
            }
            if (alt) {
                image.setAttribute('alt', alt);
            }

            requestAnimationFrame(() => {
                image.classList.remove('is-switching');
            });
        }, 170);

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

function initModelGallery() {
    const gallery = document.querySelector('[data-model-gallery]');
    if (!gallery) return;

    const panels = Array.from(gallery.querySelectorAll('[data-gallery-panel]'));
    const openButtons = Array.from(gallery.querySelectorAll('[data-gallery-open]'));
    const viewer = gallery.querySelector('[data-gallery-viewer]');
    const scroll = gallery.querySelector('[data-gallery-scroll]');
    const backBtn = gallery.querySelector('[data-gallery-back]');

    if (!panels.length || !viewer || !scroll || !backBtn) return;

    const galleryImages = {
        exterior: [
            './images/model-img2-card.png',
            './images/hero-model.png',
            './images/boat12x.png',
            './images/video-model1.png',
            './images/plan-img1.png',
            './images/plan-img2.png'
        ],
        interior: [
            './images/model-img1-card.png',
            './images/card-12x-img1.png',
            './images/model-card-img2.png',
            './images/plan-img3.png',
            './images/modal-img1.png',
            './images/modal-img2.png',
            './images/modal-img3.png'
        ]
    };

    let activeType = null;

    const renderDetails = (type) => {
        const images = galleryImages[type] || [];
        scroll.innerHTML = images
            .map(
                (src, index) =>
                    `<img class="model-gallery__detail-img" src="${src}" alt="${type === 'exterior' ? 'Экстерьер' : 'Интерьер'} ${index + 1}">`
            )
            .join('');
        scroll.scrollTop = 0;
    };

    const setButtonStates = (type) => {
        openButtons.forEach((btn) => {
            const current = btn.getAttribute('data-gallery-open');
            btn.classList.toggle('is-active', current === type);
        });
    };

    const openView = (type) => {
        activeType = type;
        setButtonStates(type);
        renderDetails(type);
        viewer.hidden = false;
        backBtn.innerHTML =
            type === 'exterior'
                ? 'Вернуться <img class="model-gallery__back-arrow" src="./images/right-arrow-gallery.png" alt="" aria-hidden="true">'
                : '<img class="model-gallery__back-arrow" src="./images/left-arrow-gallery.png" alt="" aria-hidden="true"> Вернуться';
        gallery.classList.remove('is-viewing--exterior', 'is-viewing--interior');
        gallery.classList.add(type === 'exterior' ? 'is-viewing--exterior' : 'is-viewing--interior');

        gsap.fromTo(
            viewer,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.28, ease: 'power2.out' }
        );
    };

    const closeView = () => {
        activeType = null;
        setButtonStates(null);
        gsap.to(viewer, {
            autoAlpha: 0,
            duration: 0.22,
            ease: 'power2.out',
            onComplete: () => {
                viewer.hidden = true;
                gallery.classList.remove('is-viewing--exterior', 'is-viewing--interior');
                scroll.innerHTML = '';
                gsap.set(viewer, { clearProps: 'all' });
            }
        });
    };

    panels.forEach((panel) => {
        const image = panel.querySelector('.model-gallery__img');
        if (!image) return;

        panel.addEventListener('mouseenter', () => {
            gsap.to(image, { scale: 1.09, duration: 1.6, ease: 'sine.out', overwrite: 'auto' });
        });

        panel.addEventListener('mouseleave', () => {
            gsap.to(image, { scale: 1, duration: 1.4, ease: 'sine.out', overwrite: 'auto' });
        });
    });

    openButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-gallery-open');
            if (!type) return;

            if (activeType === type && !viewer.hidden) return;
            openView(type);
        });
    });

    backBtn.addEventListener('click', closeView);
}

function initOverviewSpecsScroll() {
    const section = document.querySelector('.model-overview');
    const specsRoot = section?.querySelector('[data-overview-specs]');
    const viewport = specsRoot?.querySelector('[data-overview-specs-viewport]');
    const track = specsRoot?.querySelector('[data-overview-specs-track]');
    const descCol = section?.querySelector('.model-overview__desc');
    const mediaCol = track?.querySelector('.model-overview__media');
    const specsList = track?.querySelector('.model-overview__specs-list');
    if (!section || !specsRoot || !viewport || !track || !descCol || !mediaCol || !specsList) return;

    // Важно: дистанцию считаем по колонке характеристик, а не по общему flex-треку.
    // Иначе pin может закончиться раньше, чем список дойдет до конца.
    const getScrollableDistance = () => Math.max(0, specsList.scrollHeight - viewport.clientHeight);
    const overviewImages = Array.from(track.querySelectorAll('img'));
    let inited = false;

    const setupOverviewPin = () => {
        console.log('[road] 2. setupOverviewPin — старт', { readyState: document.readyState, scrollY: window.scrollY });
        if (inited) { console.log('[road] setupOverviewPin — уже инициализирован, пропуск'); return; }
        inited = true;

        gsap.set(track, { y: 0 });

        // На мобильных (где layout становится колонкой) pin выключаем, чтобы не было "скачков".
        const mm = gsap.matchMedia();
        mm.add('(min-width: 769px)', () => {
            const mediaImages = Array.from(mediaCol.querySelectorAll('.model-overview__media-img'));
            const firstImage = mediaImages[0] || null;
            const secondImage = mediaImages[1] || null;
            const distance = getScrollableDistance();

            // Если скроллить внутри левой части почти нечего — не пиним секцию.
            if (distance < 8 || !firstImage || !secondImage) {
                gsap.set(track, { y: 0 });
                return () => {};
            }

            // Точные целевые параметры из ТЗ:
            // 1) первая картинка стартует так, что ее низ = 120px до низа viewport
            // 2) вторая стартует на ~300px ниже первой (между картинками)
            // 3) стоп второй — когда зазор до первой = 30px
            const START_BOTTOM_OFFSET = 120;
            const START_GAP = 300;
            const STOP_GAP = 30;
            const FIRST_STOP_TOP_OFFSET = 0; // фикс на уровне начала текста (top .model-overview__desc)
            const SECOND_BOTTOM_SAFE_OFFSET = 24; // чтобы вторая картинка полностью вмещалась

            gsap.set(track, { y: 0 });
            gsap.set(mediaCol, { y: 0 });
            gsap.set(specsList, { y: 0 });
            gsap.set(firstImage, { y: 0 });
            gsap.set(secondImage, { y: 0 });

            let baseY1 = 0;
            let baseY2 = 0;
            let maxShift1 = 0;
            let maxShift2 = 0;
            let pinDistance = 0;

            const recalcImageTrajectory = () => {
                gsap.set(firstImage, { y: 0 });
                gsap.set(secondImage, { y: 0 });

                const sectionRect = section.getBoundingClientRect();
                const descRect = descCol.getBoundingClientRect();
                const firstRect = firstImage.getBoundingClientRect();
                const secondRect = secondImage.getBoundingClientRect();

                const firstH = firstRect.height;
                const secondH = secondRect.height;
                const firstStartTopTarget = sectionRect.bottom - START_BOTTOM_OFFSET - firstH;
                const firstStopTopByRatio = descRect.top + FIRST_STOP_TOP_OFFSET;

                // Ограничиваем стоп первой так, чтобы вторая (при своем стопе) вмещалась в секцию.
                // secondStopTop = firstStopTop + firstH + STOP_GAP
                // secondStopBottom = secondStopTop + secondH <= sectionBottom - safeOffset
                const firstStopTopMaxForSecondFit =
                    sectionRect.bottom - SECOND_BOTTOM_SAFE_OFFSET - secondH - firstH - STOP_GAP;
                const firstStopTopTarget = Math.min(firstStopTopByRatio, firstStopTopMaxForSecondFit);

                const secondStartTopTarget = firstStartTopTarget + firstH + START_GAP;
                const secondStopTopTarget = firstStopTopTarget + firstH + STOP_GAP;

                baseY1 = firstStartTopTarget - firstRect.top;
                baseY2 = secondStartTopTarget - secondRect.top;

                maxShift1 = Math.max(0, firstStartTopTarget - firstStopTopTarget);
                maxShift2 = Math.max(0, secondStartTopTarget - secondStopTopTarget);
                pinDistance = Math.max(getScrollableDistance(), maxShift1, maxShift2);

                gsap.set(firstImage, { y: baseY1 });
                gsap.set(secondImage, { y: baseY2 });
            };

            recalcImageTrajectory();

            const st = ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: () => `+=${Math.max(1, pinDistance)}`,
                scrub: true,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                refreshPriority: -30,
                invalidateOnRefresh: true,
                onRefresh: () => {
                    recalcImageTrajectory();
                },
                onUpdate: (self) => {
                    const current = pinDistance * self.progress;

                    // Список характеристик уходит до своего конца.
                    gsap.set(specsList, { y: -Math.min(current, getScrollableDistance()) });

                    // Картинки едут вместе со списком, но каждая фиксируется в своей точке.
                    gsap.set(firstImage, { y: baseY1 - Math.min(current, maxShift1) });
                    gsap.set(secondImage, { y: baseY2 - Math.min(current, maxShift2) });
                }
            });

            return () => {
                st.kill();
            };
        });

        // Явный fallback для узких экранов.
        mm.add('(max-width: 768px)', () => {
            gsap.set(track, { y: 0 });
            gsap.set(mediaCol, { y: 0 });
            gsap.set(specsList, { y: 0 });
            return () => {};
        });

        const onImgLoad = () => ScrollTrigger.refresh();
        overviewImages.forEach((img) => {
            if (img.complete) return;
            img.addEventListener('load', onImgLoad, { once: true });
        });

        console.log('[road] 2. setupOverviewPin — ScrollTrigger.refresh() вызван');
        ScrollTrigger.refresh();
    };

    // Инициализируем после полной загрузки страницы, чтобы избежать раннего неверного pin-расчета.
    if (document.readyState === 'complete') {
        console.log('[road] initOverviewSpecsScroll: readyState=complete — setupOverviewPin вызван синхронно');
        setupOverviewPin();
    } else {
        console.log('[road] initOverviewSpecsScroll: readyState=' + document.readyState + ' — setupOverviewPin отложен до window.load');
        window.addEventListener('load', setupOverviewPin, { once: true });
    }
}

const safeInit = (name, initFn) => {
    try {
        initFn();
    } catch (error) {
        // Не даем одному блоку сломать инициализацию всей страницы.
        console.error(`[model.js] ${name} init failed`, error);
    }
};

safeInit('description-color-filling', initDescriptionColorFilling);
safeInit('model-gallery', initModelGallery);
safeInit('overview-specs-scroll', initOverviewSpecsScroll);
safeInit('tech-card-sliders', initTechCardSliders);
safeInit('equipment-tabs', initEquipmentTabs);
safeInit('deck-plan-switcher', initDeckPlanSwitcher);
safeInit('model-accordions', initModelAccordions);
// initRoadTimeline вызывается в window.load (см. ниже) — после создания pin-spacer от .model-overview
safeInit('model-video-play', initModelVideoPlay);

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
            const absX = Math.abs(e.deltaX);
            const absY = Math.abs(e.deltaY);
            const isIntentionalHorizontal = absX >= 12 && absY <= 4 && absX > absY * 2.2;
            if (!isIntentionalHorizontal) return;
            if (e.deltaX > 0 && xPos <= minX + tol) return;
            if (e.deltaX < 0 && xPos >= -tol) return;

            e.preventDefault();
            goToX(xPos - e.deltaX);
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

safeInit('other-models-horizontal-scroll', initOtherModelsHorizontalScroll);

window.addEventListener('load', () => {
    console.log('[road] window.load — старт', { scrollY: window.scrollY });
    // Инициализируем road-timeline здесь: к этому моменту setupOverviewPin уже добавил
    // pin-spacer для .model-overview, поэтому ScrollTrigger считает позицию правильно.
    safeInit('road-timeline', initRoadTimeline);
    ScrollTrigger.sort();
    console.log('[road] window.load — ScrollTrigger.refresh() вызван');
    ScrollTrigger.refresh();
    console.log('[road] window.load — завершён');
});

document.querySelector('.hero-model__cta')?.addEventListener('click', () => {
    const target = document.querySelector('.model-video');
    if (!target) return;
    if (lenis) {
        lenis.scrollTo(target, { offset: 0 });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
