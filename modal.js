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
const modalBoatButtons = document.querySelectorAll('.modal-window-choose-boat');
const modalBoatTitle = document.getElementById('modalBoatTitle');
const modalBoatText = document.getElementById('modalBoatText');
const modalBoatImage = document.getElementById('modalBoatImage');

const modalBoatData = {
    x12: {
        title: '12X Cruiser',
        text: 'Представляем абсолютно новый флагман ONIX 12X — воплощение передовых технологий, элегантного дизайна и непревзойденного комфорта.',
        image: './images/modal-img2.png',
        alt: '12X Cruiser'
    },
    cabin850: {
        title: '850 Cabin',
        text: 'Комфортная каютная лодка для семейных путешествий и продолжительных маршрутов.',
        image: './images/modal-img1.png',
        alt: '850 Cabin'
    },
    aero800: {
        title: '800 Aero Cabin',
        text: 'Премиум в мире аэролодок. За нее не существует границ и времени года. В том, где застыли воды, эта яхта открывает сезон и непревзойденный комфорт в путешествии.',
        image: './images/modal-img4.png',
        alt: '800 Aero Cabin'
    },
    day850: {
        title: '850 Day Cruiser',
        text: 'Открытый, стильный катер для истинных ценителей скорости и ощущений на воде. Его цель — максимум внимания и драйва.',
        image: './images/modal-img3.png',
        alt: '850 Day Cruiser'
    }
};

function setActiveBoat(key) {
    const boat = modalBoatData[key];
    if (!boat) return;

    if (modalBoatTitle) modalBoatTitle.textContent = boat.title;
    if (modalBoatText) modalBoatText.textContent = boat.text;

    if (modalBoatImage) {
        modalBoatImage.src = boat.image;
        modalBoatImage.alt = boat.alt;
    }

    modalBoatButtons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.boat === key);
    });
}

modalBoatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        setActiveBoat(btn.dataset.boat);
    });
});

// стартовое состояние
setActiveBoat('cabin850');
/***** end modal boat switcher *****/