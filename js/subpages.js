'use strict';

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', handleScrollEvents);
    window.addEventListener('resize', () => {
        bgInitialSize = parseInt(window.getComputedStyle(subpage).getPropertyValue('background-size').slice(0, -1));
    })
});

const subpage = document.querySelector('.js-subpage');
let bgInitialSize = parseInt(window.getComputedStyle(subpage).getPropertyValue('background-size').slice(0, -1));

const bgSizeChange = (section, speed) => {
    // const deviceSpeed = (width / 100) * speed;
    let deviceSpeed = speed;
    if (width > 1000) {
        deviceSpeed = speed * 3.5;
    }

    if (-1000 > section.getBoundingClientRect().bottom) {
        return;
    };

    section.style.backgroundSize = `${bgInitialSize + (window.pageYOffset / deviceSpeed)}%`;
};

const handleScrollEvents = () => {
    const splitDelay = height;

    parallaxEffect(headerHero, 5, splitDelay);
    bgSizeChange(subpage, 40);
};