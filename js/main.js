document.addEventListener('DOMContentLoaded', () => {
    populateGallery(myGallery, 26, `img/gallery-thumbnails/img-`, `img/gallery-main/img-`, '1366x1024')
    initSplideSlider();
    initPhotoSwipeFromDOM('.my-gallery');

    mainNav.addEventListener('click', handleBurgerMenu);
    showMoreBtn.addEventListener('click', handleShowMoreBtnClick);
});

const mainNav = document.getElementById('main-nav');
const myGallery = document.querySelector('.my-gallery');
const showMoreBtn = document.querySelector('.js-show-more');
const photosShown = Math.floor(getComputedStyle(document.documentElement)
    .getPropertyValue('--js-photos-quantity'));

const handleShowMoreBtnClick = (e) => {
    if (e.target.innerText === 'POKAŻ WIĘCEJ') {
        itemsDisplay(myGallery, true);
        e.target.innerText = 'SCHOWAJ';
    } else {
        itemsDisplay(myGallery, false);
        e.target.innerText = 'POKAŻ WIĘCEJ';
    };
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