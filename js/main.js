document.addEventListener('DOMContentLoaded', () => {
    populateGallery(myGallery, 27, `img/gallery-thumbnails/img-`, `img/gallery-main/img-`, '1366x1024');
    scrollToSection();
    initSplideSlider();
    initPhotoSwipeFromDOM('.my-gallery');
    prepareDomElements();

    mainNav.addEventListener('click', handleBurgerMenu);
    showMoreBtn.addEventListener('click', handleShowMoreBtnClick);
    mainForm.addEventListener('submit', formValidation);

    window.addEventListener('scroll', handleScrollEvents);
});

const mainNav = document.getElementById('main-nav'),
    myGallery = document.querySelector('.my-gallery'),
    showMoreBtn = document.querySelector('.js-show-more'),
    headerHero = document.querySelector('#main-header .c-hero'),
    mainForm = document.querySelector('.l-form__inner'),
    errorMsg = document.querySelector('.js-error-msg'),
    height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight,
    width = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth,
    photosShown = Math.floor(getComputedStyle(document.documentElement)
        .getPropertyValue('--js-photos-quantity'));

const initSplideSlider = () => {
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

const itemsDisplay = (itemsContainer, action) => {
    const itemsList = itemsContainer.childNodes;

    for (let i = photosShown + 1; i < itemsList.length; i++) {
        const item = itemsList[i];

        action ? item.classList.remove('js-hide') : item.classList.add('js-hide');
    };
};

const populateGallery = (gallerySelector, imgQuantity, thumbnailSrc, largeImgSrc, dataSize) => {
    let x = 1;

    for (let i = 0; i < imgQuantity; i++) {
        const newFigure = document.createElement('figure');

        if (x < 10) {
            x = `0${x}`;
        };

        const attributesObj = {
            itemprop: 'associatedMedia',
            itemscope: '',
            itemtype: 'http://schema.org/ImageObject',
            class: 'my-gallery__figure'
        };

        for (const key in attributesObj) {
            if (Object.hasOwnProperty.call(attributesObj, key)) {
                newFigure.setAttribute(key, attributesObj[key]);
            }
        };

        newFigure.innerHTML = `
        <a href="${largeImgSrc}${x}.jpg" itemprop="contentUrl" data-size="${dataSize}">
        <img src="${thumbnailSrc}${x}.jpg" itemprop="thumbnail" alt="Image description" />
        </a>`
        gallerySelector.appendChild(newFigure);

        x++;
    };

    itemsDisplay(myGallery, false);
};

const handleShowMoreBtnClick = (e) => {
    if (e.target.innerText === 'POKAŻ WIĘCEJ') {
        itemsDisplay(myGallery, true);
        e.target.innerText = 'SCHOWAJ';
    } else {
        itemsDisplay(myGallery, false);
        e.target.innerText = 'POKAŻ WIĘCEJ';
    };
};

var initPhotoSwipeFromDOM = function (gallerySelector) {
    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    const parseThumbnailElements = (el) => {
        let thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for (let i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if (figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if (figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML;
            }

            if (linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            }

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    const closest = function closest(el, fn) {
        return el && (fn(el) ? el : closest(el.parentNode, fn));
    };

    // triggers when user clicks on thumbnail
    const onThumbnailsClick = (e) => {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        let eTarget = e.target || e.srcElement;

        // find root element of slide
        let clickedListItem = closest(eTarget, function (el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if (!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        let clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (let i = 0; i < numChildNodes; i++) {
            if (childNodes[i].nodeType !== 1) {
                continue;
            }

            if (childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if (index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe(index, clickedGallery);
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    const photoswipeParseHash = () => {
        let hash = window.location.hash.substring(1),
            params = {};

        if (hash.length < 5) {
            return params;
        }

        let vars = hash.split('&');
        for (let i = 0; i < vars.length; i++) {
            if (!vars[i]) {
                continue;
            }
            let pair = vars[i].split('=');
            if (pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }

        if (params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    const openPhotoSwipe = (index, galleryElement, disableAnimation, fromURL) => {
        let pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
            bgOpacity: .9,

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function (index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                const thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();

                return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
            }

        };

        // PhotoSwipe opened from URL
        if (fromURL) {
            if (options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for (var j = 0; j < items.length; j++) {
                    if (items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if (isNaN(options.index)) {
            return;
        }

        if (disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    const galleryElements = document.querySelectorAll(gallerySelector);

    for (let i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i + 1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    const hashData = photoswipeParseHash();
    if (hashData.pid && hashData.gid) {
        openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
    }
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

const prepareDomElements = () => {
    const offerStack = document.querySelector('#offer .l-stack').children,
        headerHeading = headerHero.querySelector('.c-hero__heading'),
        headerDecoration = headerHero.querySelector('.c-hero__decoration'),
        headerParagraph = headerHero.querySelector('.c-hero__paragraph'),
        headerButton = headerHero.querySelector('.c-button--transparent');

    for (let i = 0; i < offerStack.length; i++) {
        const element = offerStack[i];
        element.classList.add('js-hide-card');
    };

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

const handleScrollEvents = () => {
    const splideList = document.querySelector('.splide__list');
    const offerStack = document.querySelector('#offer .l-stack').children;

    const splitDelay = height;
    let test = 1200 < width ? 5 : 20;;


    for (let i = 0; i < offerStack.length; i++) {
        const element = offerStack[i];
        showCardItem(element);
    };

    parallaxEffect(document.querySelector('.l-split__content'), test, splitDelay);
    parallaxEffect(document.querySelector('.l-split--reverse .l-split__content'), test, splitDelay);
    parallaxEffect(headerHero, 5, splitDelay);
    parallaxEffect(splideList, 2, 0);
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

let testArr = [];

const checkLength = (input, min, max) => {
    if (input.value.length < min) {
        displayError(input, 'min')
    } else if (input.value.length >= max) {
        displayError(input, 'max')
    } else {
        testArr.pop();
    };
};

const checkTextField = (input, min, max) => {
    const re = /^[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ0-9_-\s]{0,}$/;
    testArr.push(false)

    if (re.test(String(input.value).trim())) {
        checkLength(input, min, max);
    } else {
        displayError(input, 'text');
    };
};

const checkEmail = (input, min, max) => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    testArr.push(false)

    if (re.test(String(input.value).trim())) {
        checkLength(input, min, max);
    }
    else {
        displayError(input, 'email');
    };
};

const checkPhoneNumber = (input, min, max) => {
    const re = /^[0-9-()]{0,}$/;
    testArr.push(false)

    if (re.test(String(input.value).trim())) {
        checkLength(input, min, max);
    } else {
        displayError(input, 'phone');
    };
};

const displayError = (input, info) => {
    let test = '';

    switch (info) {
        case 'min':
            test = 'Za krótki.'
            break;
        case 'max':
            test = 'Za długi.'
            break;
        case 'email':
            test = 'Adres email nieprawidłowy.'
            break;
        case 'phone':
            test = 'Telefon nieprawidłowy.'
            break;
        case 'text':
            test = 'Wpisałeś niedozwolone znaki.'
            break;
        default:
            break;
    }
    errorMsg.textContent = test;
};

const checkInputs = () => {
    if (testArr.length === 0) {
        console.log('wysyłam');
        errorMsg.textContent = '';
    } else {
        console.log('błąd');
    };

    console.log(testArr);
    testArr = [];
};

const formValidation = (e) => {
    e.preventDefault();

    const inputName = document.getElementById('name'),
        inputEmail = document.getElementById('email'),
        inputPhone = document.getElementById('phone'),
        inputMessage = document.getElementById('message'),
        inputAgreement = document.getElementById('agreement'),
        inputPhoto = document.getElementById('photo');

    checkTextField(inputName, 3, 40);
    checkEmail(inputEmail, 3, 40);
    checkPhoneNumber(inputPhone, 4, 20);
    checkTextField(inputMessage, 0, 500);
    checkInputs();
};