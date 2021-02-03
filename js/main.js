document.addEventListener('DOMContentLoaded', function () {
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
});