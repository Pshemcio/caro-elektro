'use strict';

document.addEventListener('DOMContentLoaded', () => {
    scrollToSection();
    executeCssAnimations();

    document.addEventListener('invalid', (function () {
        return function (e) {
            e.preventDefault();
            formValidation(e);
        };
    })(), true);

    mainNav.addEventListener('click', handleBurgerMenu);
    mainForm.addEventListener('submit', formValidation);
});

const mainNav = document.getElementById('main-nav'),
    headerHero = document.querySelector('#main-header .c-hero'),
    mainForm = document.querySelector('.l-form__inner'),
    height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight,
    width = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth;

const itemsDisplay = (itemsContainer, action) => {
    const itemsList = itemsContainer.childNodes;

    for (let i = photosShown + 1; i < itemsList.length; i++) {
        const item = itemsList[i];

        action ? item.classList.remove('js-hide') : item.classList.add('js-hide');
    };
};

//!!!!!!!!!!!!!!!!!!!!

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

const supportsSmoothScrolling = () => {
    const body = document.body;
    const scrollSave = body.style.scrollBehavior;
    body.style.scrollBehavior = 'smooth';
    const hasSmooth = getComputedStyle(body).scrollBehavior === 'smooth';
    body.style.scrollBehavior = scrollSave;
    return hasSmooth;
};

const scrollToSection = () => {
    if (supportsSmoothScrolling()) {
        return;
    }

    new SmoothScroll('a[href*="#"]', {
        // Speed & Duration
        speed: 400, // Integer. Amount of time in milliseconds it should take to scroll 1000px
        durationMin: 500, // Integer. The minimum amount of time the scroll animation should take
    });
};

const cssAnimation = (element, animation, delay) => {
    element.classList.add(`js-${animation}-hide`);

    setTimeout(() => {
        element.classList.add(`js-${animation}-show`);

        setTimeout(() => {
            element.classList.remove(`js-${animation}-hide`);
            element.classList.remove(`js-${animation}-show`);
        }, 1000);

    }, delay);
};

const executeCssAnimations = () => {
    const headerHeading = headerHero.querySelector('.c-hero__heading'),
        headerDecoration = headerHero.querySelector('.c-hero__decoration'),
        headerParagraph = headerHero.querySelector('.c-hero__paragraph'),
        headerButton = headerHero.querySelector('.c-button--transparent');

    cssAnimation(headerHeading, 'width', 500);
    cssAnimation(headerDecoration, 'opacity', 1000);
    cssAnimation(headerDecoration, 'decoration', 900);
    cssAnimation(headerParagraph, 'transformDownTransformed', 1500);
    cssAnimation(headerButton, 'transformUp', 1800);
};

const showCardItem = element => {
    if (window.pageYOffset < element.getBoundingClientRect().top) {
        return;
    };

    if (window.pageYOffset > element.getBoundingClientRect().top + (window.pageYOffset / 1.4)) {
        element.classList.remove('js-hide-card');
    };
}

const parallaxEffect = (element, speed, delay) => {
    if (-200 > element.parentElement.getBoundingClientRect().bottom
        || 20 < element.parentElement.getBoundingClientRect().top - height + delay) {
        return;
    };

    let offsetTop = element.parentElement.offsetTop - height > 0 ? element.parentElement.offsetTop - height + delay : 0;

    element.style.transform = `translateY(${(window.pageYOffset - offsetTop) / speed}px)`;
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

let inputFailArray = [];

const checkLength = (input, min, max) => {
    if (input.value.length === 0 && min > 0) {
        displayError(input, 'required', min, max)
    } else if (input.value.length < min) {
        displayError(input, 'min', min, max)
    } else if (input.value.length >= max) {
        displayError(input, 'max', min, max)
    } else {
        removeError(input);
    };
};

const checkTextField = (input, min, max) => {
    const re = /^[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ0-9.,'"!?()/*_-\s]{0,}$/;

    if (re.test(String(input.value).trim())) {
        checkLength(input, min, max);
    } else {
        displayError(input, 'text', min, max);
    };
};

const checkEmail = (input, min, max) => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if (input.value.length === 0) {
        displayError(input, 'required', min, max);
        return;
    };

    if (re.test(String(input.value).trim())) {
        checkLength(input, min, max);
    }
    else {
        displayError(input, 'email', min, max);
    };
};

const checkPhoneNumber = (input, min, max) => {
    const re = /^[0-9-+()\s]{0,}$/;

    if (re.test(String(input.value).trim())) {
        checkLength(input, min, max);
    } else {
        displayError(input, 'phone', min, max);
    };
};

const checkAgreement = (input) => {
    input.checked ? removeError(input)
        : displayError(input, 'agreement');
};

const checkFile = (input) => {
    if (input.value.length === 0) {
        return;
    };

    let fileName = input.value,
        idxDot = fileName.lastIndexOf(".") + 1,
        extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (["jpg", "jpeg", "png"].includes(extFile)) {
        removeError(input);
    } else {
        displayError(input, 'file');
    };
};

const removeError = input => {
    input.classList.remove('js-error-outline');
    input.parentElement.querySelector('.js-error-msg').classList.remove('js-error-slide');

    setTimeout(() => {
        input.parentElement.querySelector('.js-error-msg').textContent = '';
    }, 1200);
};

const displayError = (input, info, min, max) => {
    let mainText = '';
    inputFailArray.push(false);
    switch (info) {
        case 'required':
            mainText = `To pole jest wymagane.`;
            break;
        case 'min':
            mainText = `Minimalna ilość znaków: ${min}.`;
            break;
        case 'max':
            mainText = `Maksymalna ilość znaków: ${max}.`;
            break;
        case 'email':
            mainText = 'Adres email nieprawidłowy.';
            break;
        case 'phone':
            mainText = 'Telefon nieprawidłowy.';
            break;
        case 'text':
            mainText = 'Wpisałeś niedozwolone znaki.';
            break;
        case 'agreement':
            mainText = 'Musisz zaznaczyć zgodę.';
            break;
        case 'file':
            mainText = 'Dozwolony format pliku: jpg/jpeg/png';
            break;
        default:
            mainText = '';
            break;
    }

    input.classList.add('js-error-outline');
    input.parentElement.querySelector('.js-error-msg').textContent = mainText;
    input.parentElement.querySelector('.js-error-msg').classList.add('js-error-slide');
};

const checkInputs = e => {
    if (inputFailArray.length === 0) {
        console.log('wysyłam');
    } else {
        e.preventDefault();
    };
    inputFailArray = [];
};

const formValidation = (e) => {
    const inputName = document.getElementById('name'),
        inputEmail = document.getElementById('email'),
        inputPhone = document.getElementById('phone'),
        inputMessage = document.getElementById('message'),
        inputAgreement = document.getElementById('agreement'),
        inputPhoto = document.getElementById('photo');

    checkTextField(inputName, 3, 40);
    checkEmail(inputEmail, 3, 40);
    checkPhoneNumber(inputPhone, 6, 20);
    checkTextField(inputMessage, 0, 1000);
    checkAgreement(inputAgreement);
    checkFile(inputPhoto);
    checkInputs(e);
};