'use strict';

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', handleScrollEvents);
});

const subpage = document.querySelector('.subpage__header-bg');

const bgSizeChange = (element, speed) => {
    let deviceSpeed = speed * 500;
    if (width > 700) {
        deviceSpeed = speed * 1000;
    }

    if (-500 > element.parentElement.getBoundingClientRect().bottom) {
        return;
    };

    element.style.transform = `scale(${1 + ((window.pageYOffset) / (deviceSpeed))})`;
};

const handleScrollEvents = () => {
    const splitDelay = height;

    parallaxEffect(headerHero, 5, splitDelay);
    bgSizeChange(subpage, 5);
};