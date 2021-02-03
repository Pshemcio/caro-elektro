document.addEventListener('DOMContentLoaded', () => {
    initializeSplideSlider();

    mainNav.addEventListener('click', handleBurgerMenu);
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
        width: '100%',
        height: '100vh',
        classes: {
            arrow: 'splide__arrow header-btns',
        },
    }).mount();
};

const showBurgerMenu = (menu, btn) => {
    const items = [menu, btn];

    items.forEach(item => {
        item.style.pointerEvents = 'none';

        setTimeout(() => {
            item.style.pointerEvents = 'auto';
        }, 400);

        item === menu ? item.classList.toggle('l-main-nav--active') : item.classList.toggle('c-burger--active');
    });
};

const handleBurgerMenu = () => {
    const burgerBtn = mainNav.querySelector('.c-burger');
    const menu = mainNav.querySelector('.l-main-nav');

    showBurgerMenu(menu, burgerBtn);
};