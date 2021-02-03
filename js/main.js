document.addEventListener('DOMContentLoaded', () => {
    initializeSplideSlider();

    mainNav.addEventListener('click', showBurgerMenu);
});

const mainNav = document.getElementById('main-nav');

const initializeSplideSlider = () => {
    new Splide('.header-splide', {
        type: 'fade',
        rewind: true,
        autoplay: true,
        interval: 8000,
        speed: 500,
        pauseOnHover: false,
        cover: true,
        drag: false,
        pagination: false,
        width: '100vw',
        height: '100vh',
        classes: {
            arrow: 'splide__arrow header-btns',
        },
    }).mount();
};

const showBurgerMenu = () => {
    const burgerBtn = mainNav.querySelector('.c-burger');
    const menu = mainNav.querySelector('.l-main-nav');

    document.body.classList.toggle('js-mobile-menu-open');
    burgerBtn.classList.toggle('c-burger--active');
    menu.classList.toggle('l-main-nav--active');
};