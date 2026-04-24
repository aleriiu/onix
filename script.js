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

window.addEventListener('scroll', function() {
    const element = document.querySelector('.horizontal-line');
    if (window.scrollY > 50) {
      element.style.display = 'none'; // Скрыть
    } else {
      element.style.display = 'block'; // Показать обратно, если скролл вернулся
    }
  });


/***** gallery *****/

        // 1. Инициализация плавного скролла Lenis
        const lenis = new Lenis();
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // 2. Настройка GSAP
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // Привязка к скроллу
            }
        });

        // Анимация разлета картинок
        tl.to(".img-2", { x: "-200%", y: "-150%", rotate: -20, opacity: 0 }, 0)
          .to(".img-3", { x: "200%", y: "150%", rotate: 20, opacity: 0 }, 0)
          .to(".img-4", { x: "-250%", y: "150%", rotate: -30, opacity: 0 }, 0)
          .to(".img-5", { x: "250%", y: "-150%", rotate: 30, opacity: 0 }, 0)
          .to(".img-6", { x: "250%", y: "-150%", rotate: 30, opacity: 0 }, 0)
          .to(".img-7", { x: "250%", y: "-150%", rotate: 30, opacity: 0 }, 0)
          // Масштабируем центральную картинку (эффект пролета сквозь неё)
          .to(".img-1", { 
              scale: 15, 
              opacity: 0, 
              duration: 2,
              ease: "power2.in" 
          }, 0)

          // Проявляем текст в конце
          .to(".info-content", { 
              opacity: 1, 
              y: 0, 
              duration: 1 
          }, "-=0.5");

/***** end gallery *****/