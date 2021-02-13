'use strict';

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', handleScrollEvents);
});

const handleScrollEvents = () => {
    const splitDelay = height;

    parallaxEffect(headerHero, 5, splitDelay);
};