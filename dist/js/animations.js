gsap.registerPlugin(ScrollTrigger);

const gsap_intro = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_events = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_about = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_access = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_contact = gsap.timeline({ ease: "power4.easeInOut", paused: true });

const gsap_io = gsap.utils.toArray(".anim--io");


gsap_events
  // .from(".events .page_title small, .events .page_title h1", 2, { delay: 0, opacity: 0, stagger: { amount: 0.15 } })
  .from(".events .page_title small, .events .page_title h1", 1, { delay: 0, opacity: 0, y: 40, skewY: 10, stagger: { amount: 0.12 } })
  .from(".events .page_section strong, .events .page_section span", 1, { opacity: 0, y: 120, skewY: 20, stagger: { amount: 0.25 } }, "-=1.5")
  ;

gsap_about
  // .from(".about .page_title h1", .8, { delay: .5, y: -30, opacity: 0 })
  .from(".about .page_title h1", .8, { delay: .5, opacity: 0, y: 40, skewY: 10, stagger: { amount: 0.12 } })
  .from(".about .page_title small", .8, { y: -30, opacity: 0 }, "-=.5")
  .from(".about--intro", .8, { y: -30, opacity: 0 }, "-=.5")
  .from(".about_img", .8, { opacity: 0, stagger: { amount: 0.2 } }, "-=.5")
  ;

gsap_access
  .from(".access .page_title small, .access .page_title h1", 1, { delay: 0, opacity: 0, y: 40, skewY: 10, stagger: { amount: 0.12 } })
  .from(".access .col", 1, { opacity: 0, y: 120, stagger: { amount: 0.5 } }, "-=.75")
  ;

gsap_contact
  .from(".contact .page_title small, .contact .page_title h1", 1, { delay: .5, opacity: 0, y: 40, skewY: 10, stagger: { amount: 0.20 } })
  .from(".contact_title", 1, { duration: 0, opacity: 0, y: 120, skewY: 8, stagger: {amount: 0.15} }, "-=.75")
  .from(".contact_info", 1, { opacity: 0, y: 90, stagger: { amount: 0.15 } }, "-=.75")
  .from(".contact_form", 1, { opacity: 0, y: 90, skewY: 2 }, "-=.75")
  ;


// CURSOR FOLLOWER
const cursor = new MouseFollower({
    el: null,
    container: document.body,
    className: 'mf-cursor',
    innerClassName: 'mf-cursor-inner',
    textClassName: 'mf-cursor-text',
    mediaClassName: 'mf-cursor-media',
    mediaBoxClassName: 'mf-cursor-media-box',
    iconSvgClassName: 'mf-svgsprite',
    iconSvgNamePrefix: '-',
    iconSvgSrc: '',
    dataAttr: 'cursor',
    hiddenState: '-hidden',
    textState: '-text',
    iconState: '-icon',
    activeState: '-active',
    mediaState: '-media',
    stateDetection: {
        '-pointer': 'a,button',
        '-hidden': 'iframe',
        '-icon-view': 'img'
    },
    visible: true,
    visibleOnState: false,
    speed: 0.4,
    ease: 'expo.out',
    overwrite: true,
    skewing: 1.2,
    skewingText: 2,
    skewingIcon: 2,
    skewingMedia: 2,
    skewingDelta: 0.001,
    skewingDeltaMax: 0.2,
    stickDelta: 0.2,
    showTimeout: 20,
    hideOnLeave: true,
    hideTimeout: 300,
    hideMediaTimeout: 300
});

let images = document.querySelectorAll('img');

addEventListener("change", () => {
  images = document.querySelectorAll('img');
})

/* images.forEach(img => {
  img.addEventListener("mouseenter", () => {
    cursor.setText('VIEW');
  })
  img.addEventListener("mouseleave", () => {
    cursor.setText("");
  })
}) */

window.addEventListener('scene_loaded', (evt) => {

  if (window.loaded === 100) {
    gsap_intro
      .from(".intro_title span", 1.5, { delay: .5, opacity: 0, y: 200, skewY: 35, stagger: { amount: 0.4 } }, "-=.25")
      .from(".intro_text span", 1.5, { opacity: 0, yPercent: 50, skewY: 2, stagger: { amount: 0.2 } }, '-=.25')
      ;

    gsap_intro.play();

    
    // Load and append external link icon
    let ns = "http://www.w3.org/2000/svg";
    let externalLinkSvg = document.createElementNS(ns, "svg");
    let externalLinkPath = document.createElementNS(ns, "path");

    externalLinkSvg.setAttribute("width", "14px");
    externalLinkSvg.setAttribute("height", "14px");
    externalLinkSvg.setAttribute("viewBox", "0 0 512 512");
    externalLinkPath.setAttribute(
      "d",
      "M432 320H400a16 16 0 0 0 -16 16V448H64V128H208a16 16 0 0 0 16-16V80a16 16 0 0 0 -16-16H48A48 48 0 0 0 0 112V464a48 48 0 0 0 48 48H400a48 48 0 0 0 48-48V336A16 16 0 0 0 432 320zM488 0h-128c-21.4 0-32.1 25.9-17 41l35.7 35.7L135 320.4a24 24 0 0 0 0 34L157.7 377a24 24 0 0 0 34 0L435.3 133.3 471 169c15 15 41 4.5 41-17V24A24 24 0 0 0 488 0z"
    );
    externalLinkPath.setAttribute(
      "fill",
      "#ff45ab"
      );

    externalLinkSvg.appendChild(externalLinkPath);

    // Apply svg and galaxy titles rollover
    setTimeout(() => {
      let shopElement = document.querySelector(".follower_content .link span");
      shopElement.appendChild(externalLinkSvg);

      let galaxiesTitles = gsap.utils.toArray(".follower_content h2");

      galaxiesTitles.forEach(title => {
        new SplitType(title, {types: "chars"});
        
        let colorChars
        let galaxyName

        let currentTitle = gsap.utils.toArray(title);
        let array = [].slice.call(currentTitle[0].children);

        for (let i = 0; i < array.length; i++) {
          let h2Char = document.createElement("h2");
          h2Char.innerHTML = `${array[i].innerHTML}`;

          array[i].appendChild(h2Char);
        }

        title.parentElement.addEventListener("mouseenter", () => {
          galaxyName = title.parentElement.parentElement.parentElement.id;

          colorChars = gsap.utils.toArray(`#${galaxyName}.follower .follower_content .char h2`);

          gsap.to(colorChars, {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            // ease: "power1.in",
            delay: 0,
            stagger: {
              amount: 0.5
            },
          });
        });

        title.parentElement.addEventListener("mouseleave", () => {
          gsap.set(colorChars, {
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            // ease: "power1.out",
            delay: 0,
            stagger: {
              amount: 0.5
            },
          });
        });
      });

    }, 1000);
  }
});

window.addEventListener('openHero', (evt) => {
  console.log("Hero");
})

// Sprites Ink transition
//set transitionBackground dimentions
let transitionLayer = document.querySelector('#exhibition .cd-transition-layer');
let transitionBackground = document.querySelector('#exhibition .cd-transition-layer .bg-layer');

let frameProportion = 1.78, //png frame aspect ratio
		frames = 25, //number of png frames
		resize = false;


function setLayerDimensions() {
  let windowWidth = window.innerWidth,
    windowHeight = window.innerHeight,
    layerHeight, layerWidth;

  if( windowWidth/windowHeight > frameProportion ) {
    layerWidth = windowWidth;
    layerHeight = layerWidth/frameProportion;
  } else {
    layerHeight = windowHeight*1.2;
    layerWidth = layerHeight*frameProportion;
  }

  transitionLayer.style.width = layerWidth*frames+'px';
  transitionLayer.style.height = layerHeight+'px';


  resize = false;
}

setLayerDimensions();
window.addEventListener("resize", () => {
  if( !resize ) {
    resize = true;
    (!window.requestAnimationFrame) ? setTimeout(setLayerDimensions, 300) : window.requestAnimationFrame(setLayerDimensions);
  }
})


let prevArrow = document.querySelector(".prev");
let nextArrow = document.querySelector(".next");

prevArrow.addEventListener('click', () => {ScrollTrigger.refresh(true);})
nextArrow.addEventListener('click', () => {ScrollTrigger.refresh(true);})

window.addEventListener('enterExhibition', (evt) => {
  console.log("Exhibition");
  
  ScrollTrigger.refresh(true);
  
  // Exhibition titles animation
  // let mainContent = document.querySelector(".content");
  let title = document.querySelector(".content .title");
  let small = document.querySelector(".content small");
  let subtitle = document.querySelector(".content .subtitle");
  let descriptionDetails = document.querySelector(".content .desc_details");

  // Solves conflict with read more layout to have a proper animation
  let readMore = document.querySelector(".btn-read-more");
  let readMoreSpan = document.createElement("SPAN");

  readMoreSpan.innerHTML = readMore.innerHTML;
  readMore.innerHTML = "";
  readMore.appendChild(readMoreSpan);

  gsap.fromTo(title, { 
    opacity: 0,
    y: 120,
    skewY: 14,
    stagger: {
      amount: 0.25
    }
  }, 
  { 
    y: 0,
    skewY: 0,
    opacity: 1, 
    delay: .5,
    duration: 1,
    ease: "power4.easeOut", 
  });
  gsap.fromTo(small, { 
    opacity: 0,
    y: 150,
    skewY: 8,
    stagger: {
      amount: 0.15
    }
  }, 
  { 
    y: 0,
    skewY: 0,
    opacity: 1, 
    delay: .8,
    duration: 1,
    ease: "power4.easeOut", 
  });
  gsap.fromTo(subtitle, { 
    opacity: 0,
    y: 150,
    skewY: 8,
    stagger: {
      amount: 0.10
    }
  }, 
  { 
    y: 0,
    skewY: 0,
    opacity: 1, 
    delay: 1.3,
    duration: 1,
    ease: "power4.easeOut", 
  });
  gsap.fromTo(descriptionDetails, { 
    opacity: 0,
    y: 180,
    skewY: 10,
    stagger: {
      amount: 0.08
    }
  }, 
  { 
    y: 0,
    skewY: 0,
    opacity: 1, 
    delay: 1.7,
    duration: 1,
    ease: "power4.easeOut", 
  });

  setTimeout(() => {

    let artistBio = document.querySelectorAll('.artists_list .btn');
    let artistAvatar = document.querySelectorAll('.artists_list .artist_avatar');
    let closeArtistBio = document.querySelectorAll('.artist_close');
    let scrollContainer = document.querySelector('#exhibition_scroll');
    let description = gsap.utils.toArray('.description p');
    let readMoreBtn = document.querySelector(".btn-read-more");
    let artistElements = gsap.utils.toArray(".exhibition_artists .artist");
    let photoTitle = gsap.utils.toArray(".photos_title");
    let photos = gsap.utils.toArray(".photos_item");
    let cta = gsap.utils.toArray(".exhibition_cta > *");

    // Artis modal listeners
    artistBio.forEach(bio => {
      bio.addEventListener('click', () => {
        transitionLayer.classList.add('visible');
        transitionLayer.classList.add('opening');
      })

      bio.classList.add("o-btn-text");
      bio.classList.add("hover");
      bio.classList.add("hover--white");
      bio.classList.add("roll-active");

      bio.classList.add("bio-btn-text");
    })
    artistAvatar.forEach(avatar => {
      avatar.addEventListener('click', () => {
        transitionLayer.classList.add('visible');
        transitionLayer.classList.add('opening');
      })
    })
    closeArtistBio.forEach(artistBio => {
      artistBio.addEventListener('click', () => {
        setTimeout(() => {
          transitionLayer.classList.add('closing');
        }, 400)
        setTimeout(() => {
          transitionLayer.classList.remove('opening');
          transitionLayer.classList.remove('closing');
          transitionLayer.classList.remove('visible');
        }, 1000)
      })
    })

    // Sections reveal with scroll
    gsap.fromTo(description, { 
      opacity: 0,
      yPercent: -20,
    }, 
    { 
      yPercent: 0,
      opacity: 1, 
      duration: 1.4,
      ease: "power4.easeOut", 
      stagger: {
        from:"start",
        each: 0.2
      },
      scrollTrigger: {
        scroller: scrollContainer,
        trigger: description,
        start: "top top+=70%"
      },
    });
    gsap.fromTo(readMoreBtn, { 
      opacity: 0,
      yPercent: -20,
    }, 
    { 
      yPercent: 0,
      opacity: 1, 
      duration: 1.6,
      ease: "power4.easeOut", 
      scrollTrigger: {
        scroller: scrollContainer,
        trigger: readMoreBtn,
        start: "top top+=100%"
      },
    });
    // Artists
    gsap.fromTo(artistElements, { 
      opacity: 0,
      yPercent: -30,
    }, 
    { 
      yPercent: 0,
      opacity: 1, 
      duration: 1.4,
      ease: "power4.easeOut",
      stagger:{
        from:"start",
        each:0.2
      }, 
      scrollTrigger: {
        scroller: scrollContainer,
        trigger: artistElements,
        start: "top top+=70%"
      },
    });
    // Photos
    photoTitle.forEach((title) => {
      gsap.fromTo(title, { 
        opacity: 0,
        yPercent: -50,
      }, 
      { 
        yPercent: 0,
        opacity: 1, 
        duration: 1.4,
        ease: "power4.easeOut",
        scrollTrigger: {
          scroller: scrollContainer,
          trigger: title,
          start: "top top+=70%"
        },
      });
    });
    photos.forEach((photo) => {
      gsap.fromTo(photo, { 
        opacity: 0,
        yPercent: -20,
      }, 
      { 
        yPercent: 0,
        opacity: 1, 
        duration: 1,
        ease: "power4.easeOut",
        scrollTrigger: {
          scroller: scrollContainer,
          trigger: photo,
          start: "top top+=70%"
        },
      });
    });
    gsap.fromTo(cta, { 
      opacity: 0,
      yPercent: -30,
    }, 
    { 
      yPercent: 0,
      opacity: 1, 
      duration: 1.4,
      ease: "power4.easeIn",
      scrollTrigger: {
        scroller: scrollContainer,
        trigger: cta,
        start: "top top+=70%"
      },
    });

  }, 2000)
})


// Transitions between sections
window.addEventListener('transitionStart', (evt) => {
  switch (evt.detail) {
    case 'home':
      console.log('start:', evt.detail);
      break;

    case 'galaxy':
      console.log('start:', evt.detail);
      break;

    case 'events':
      console.log('start:', evt.detail);
      gsap_events.restart(true, false);
      break;

    case 'about':
      console.log('start:', evt.detail);
      gsap_about.restart(true, false);
      break;

    case 'access':
      console.log('start:', evt.detail);
      gsap_access.restart(true, false);
      break;

    case 'contact':
      console.log('start:', evt.detail);
      gsap_contact.restart(true, false);
      break;

    case 'menu':
      console.log('start:', evt.detail);
      break;
    default: 
      console.log('start:', evt.detail);

      setTimeout(() => {

        /* let exhiTitle = document.querySelector(".pointer_title");
  
        // Exhibition hover title anim

        exhiTitle.addEventListener("mouseover", (event) => {
          console.log("here");
        });

        console.log(exhiTitle); */
      }, 2000)
      break;
  }
})

window.addEventListener('transitionEnd', (evt) => {

  switch (evt.detail) {
    case 'home':
      console.log('end:', evt.detail);
      break;

    case 'galaxy':
      console.log('end:', evt.detail);
      break;

    case 'events':
      console.log('end:', evt.detail);
      gsap_events.play();
      break;

    case 'about':
      console.log('end:', evt.detail);

      let postsSection = document.getElementById('about');

      ScrollTrigger.defaults({ scroller: postsSection });

      gsap.to("[data-speedpx]", {
        y: (i, el) => (-1 * parseFloat(el.getAttribute("data-speedpx"))) * (postsSection.offsetHeight / 3),
        ease: "none",
        scrollTrigger: {
          trigger: postsSection,
          invalidateOnRefresh: true,
          scrub: 0,
          start: 'top bottom'
        }
      });

      gsap_io.forEach((el) => {
        gsap.from(el, {
          duration: 1.5,
          yPercent: -100,
          opacity: 0,
          ease: "power4.easeOut",
          scrollTrigger: {
            trigger: el,
            end: 'top 50%',
            scrub: true,
            // markers: true,
            toggleActions: "restart none none none",
          },
        });
      });

      gsap_about.play();
      break;

    case 'access':
      console.log('end:', evt.detail);
      gsap_access.play();
      break;

    case 'contact':
      console.log('end:', evt.detail);

      /* const title = document.querySelector(".contact_title h2");

      ScrollTrigger.create({
        trigger: title,
        start: "top top",
        end: "+=50%",
        onEnter: (self) => {
        },
        onEnterBack: (self) => {
        }
      }); */

      gsap_contact.play();
      break;

    default: console.log('end:', evt.detail);
  }
})

/* Animated icons */
// -> Target elements to use lottie
const clingyIcons = document.querySelectorAll('.clingy');

// -> Set up lottie & handle icons animation on hover
const playAnimationOnHover = (buttonId, animationPath) => {
  var button = document.getElementById(buttonId);
  var animation = lottie.loadAnimation({
    container: button,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: animationPath,
    rendererSettings: {
      viewBoxOnly: true,
    }
  });
  button.addEventListener('mouseover', function () {
    animation.play();
  });

  button.addEventListener('mouseleave', function () {
    animation.stop();
  });
}

// -> Set up clingy effect
const clingyMouse = (elements) => {
  elements.forEach((el) => {
    var self = el;
    var hover = false;
    var offsetHoverMax = self.getAttribute("offset-hover-max") || 0.7;
    var offsetHoverMin = self.getAttribute("offset-hover-min") || 0.5;

    const attachEventsListener = () => {
      window.addEventListener("mousemove", (e) => {
        var hoverArea = hover ? offsetHoverMax : offsetHoverMin;

        // cursor
        var cursor = {
          x: e.clientX,
          y: e.clientY - window.pageYOffset
        };

        // size
        var width = self.offsetWidth;
        var height = self.offsetHeight;

        // position
        var offset = self.getBoundingClientRect();
        var elPos = {
          x: offset.left + width / 2,
          y: offset.top + height / 2
        };

        // comparaison
        var x = cursor.x - elPos.x;
        var y = cursor.y - elPos.y;

        // dist
        var dist = Math.sqrt(x * x + y * y);

        // mutex hover
        var mutHover = false;

        // anim
        if (dist < width * hoverArea) {
          mutHover = true;
          if (!hover) {
            hover = true;
          }
          onHover(x, y);
        }

        // reset
        if (!mutHover && hover) {
          onLeave();
          hover = false;
        }
      });
    };

    const onHover = (x, y) => {
      TweenMax.to(self, 0.4, {
        x: x * 0.8,
        y: y * 0.8,
        rotation: x * 0.05,
        ease: Power2.easeOut
      });
    };

    const onLeave = () => {
      TweenMax.to(self, 0.7, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        ease: Elastic.easeOut.config(1.2, 0.4)
      });
    };

    attachEventsListener();
  });
};

playAnimationOnHover('icon1', '/assets/icon1.json');
playAnimationOnHover('icon2', '/assets/icon2.json');
playAnimationOnHover('icon3', '/assets/icon3.json');
playAnimationOnHover('icon4', '/assets/icon4.json');
clingyMouse(clingyIcons);

clingyIcons.forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.icon--active')?.classList.remove('icon--active');
    link.classList.add('icon--active');
  })
});

/* Loop */
// -> Elements for music background
const audioLoop = document.getElementById("audioMp3");
const triggerMusic = document.getElementById('triggerMusic');
const audioIcon = '/assets/icon-loop.json';
const audioIconContainer = document.getElementById('iconMusic');

// -> Lottie set up
const audioAnimation = lottie.loadAnimation({
  container: audioIconContainer,
  renderer: 'svg',
  loop: true,
  autoplay: false,
  path: audioIcon,
  rendererSettings: {
    viewBoxOnly: true,
  }
});

// -> On Off audio loop & animation
function toggleMusic(e) {
  if (audioLoop.paused) {
    audioLoop.play();
    audioAnimation.play();
  }
  else {
    audioLoop.pause();
    audioAnimation.pause();
  }
};

triggerMusic.addEventListener('click', function (e) {
  e.target.classList.toggle("is-paused");
  toggleMusic(e);
});

window.addEventListener('playSound', (e) => {
  triggerMusic.classList.remove('is-paused')
  console.log(e);
  audioLoop.play();
  audioAnimation.play();
});