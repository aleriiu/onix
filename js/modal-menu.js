'use strict';

const closeBtn = document.querySelector('#close');
const modalMenu = document.querySelector('.modal-menu');
const mobMenu = document.querySelector('#menu');

mobMenu?.addEventListener('click', () => {
    modalMenu.style.display = 'flex';
});

closeBtn?.addEventListener('click', () => {
    modalMenu.style.display = 'none';
});

/***** modal boat switcher *****/
const OVERLAY_DELAY = 300; // 1000 = 1 секунда

const modalBoatButtons = document.querySelectorAll('.modal-window-choose-boat');
const modalBoatTitle = document.getElementById('modalBoatTitle');
const modalBoatText = document.getElementById('modalBoatText');
const modalBoatImage = document.getElementById('modalBoatImage');
const modalBoatOverlay = document.getElementById('modalBoatOverlay');

let overlayTimer = null;
let activeBoatKey = 'x12';

const modalBoatData = {
    x12: {
        title: '12X Cruiser',
        text: 'Представляем абсолютно новый флагман ONIX 12X — воплощение передовых технологий, элегантного дизайна и непревзойденного комфорта.',
        image: './images/modal-img2.png',
        alt: '12X Cruiser',
        overlay: './images/modal-boat-12x.png'
    },
    cabin850: {
        title: '850 Cabin',
        text: 'Комфортная каютная лодка для семейных путешествий и продолжительных маршрутов.',
        image: './images/modal-img1.png',
        alt: '850 Cabin',
        overlay: './images/modal-boat-850cabin.png'
    },
    aero800: {
        title: '800 Aero Cabin',
        text: 'Премиум в мире аэролодок. За нее не существует границ и времени года. В том, где застыли воды, эта яхта открывает сезон и непревзойденный комфорт в путешествии.',
        image: './images/modal-img4.png',
        alt: '800 Aero Cabin',
        overlay: './images/modal-boat-800.png'
    },
    day850: {
        title: '850 Day Cruiser',
        text: 'Открытый, стильный катер для истинных ценителей скорости и ощущений на воде. Его цель — максимум внимания и драйва.',
        image: './images/modal-img3.png',
        alt: '850 Day Cruiser',
        overlay: './images/modal-boat-850day.png'
    }
};

function setActiveBoat(key) {
    activeBoatKey = key;
    const boat = modalBoatData[key];
    if (!boat) return;

    if (modalBoatTitle) modalBoatTitle.textContent = boat.title;
    if (modalBoatText) modalBoatText.textContent = boat.text;

    if (modalBoatImage) {
        modalBoatImage.src = boat.image;
        modalBoatImage.alt = boat.alt;
    }

    if (modalBoatOverlay) {
        modalBoatOverlay.classList.remove('is-visible');

        if (overlayTimer) {
            clearTimeout(overlayTimer);
            overlayTimer = null;
        }

        modalBoatOverlay.src = boat.overlay;
        modalBoatOverlay.alt = `${boat.title} лодка`;

        overlayTimer = setTimeout(() => {
            modalBoatOverlay.classList.add('is-visible');
        }, OVERLAY_DELAY);
    }

    modalBoatButtons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.boat === key);
    });
}

modalBoatButtons.forEach((btn) => {
    const activate = () => setActiveBoat(btn.dataset.boat);

    btn.addEventListener('mouseenter', activate); // desktop hover
    btn.addEventListener('focus', activate);      // клавиатура/доступность
    btn.addEventListener('click', activate);
});

// стартовое состояние
setActiveBoat('x12');

const modalDetailBtn = document.querySelector('.modal-window-description-btn');
modalDetailBtn?.addEventListener('click', () => {
    if (activeBoatKey === 'x12') {
        window.location.assign('model.html');
    }
});
/***** end modal boat switcher *****/


/***** request modal *****/

const requestModal = document.getElementById('requestModal');
const openRequestEls = document.querySelectorAll('.js-open-request');

function openRequestModal() {
    requestModal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    requestModal?.setAttribute('aria-hidden', 'false');
}

function closeRequestModal() {
    requestModal?.classList.remove('is-open');
    document.body.style.overflow = '';
    requestModal?.setAttribute('aria-hidden', 'true');
}

openRequestEls.forEach((el) => {
    el.addEventListener('click', openRequestModal);
});

document.querySelectorAll('.js-close-request').forEach((el) => {
    el.addEventListener('click', closeRequestModal);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRequestModal();
});

/***** end request modal *****/ 