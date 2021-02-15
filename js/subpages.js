'use strict';

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', handleScrollEvents);
    window.addEventListener('resize', () => {
        bgInitialSize = parseInt(window.getComputedStyle(subpage).getPropertyValue('background-size').slice(0, -1));
    })
});

const subpage = document.querySelector('.subpage');
let bgInitialSize = parseInt(window.getComputedStyle(subpage).getPropertyValue('background-size').slice(0, -1));

const bgSizeChange = (section, speed) => {
    const deviceSpeed = (width / 100) * speed;

    if (100 > section.getBoundingClientRect().top + height) {
        return;
    };

    section.style.backgroundSize = `${bgInitialSize + (window.scrollY / deviceSpeed)}%`;
};

const handleScrollEvents = () => {
    const splitDelay = height;

    parallaxEffect(headerHero, 5, splitDelay);
    bgSizeChange(subpage, 4);
};