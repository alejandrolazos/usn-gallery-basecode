gsap.registerPlugin(ScrollTrigger);

const gsap_intro = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_events = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_about = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_access = gsap.timeline({ ease: "power4.easeInOut", paused: true });
const gsap_contact = gsap.timeline({ ease: "power4.easeInOut", paused: true });

const gsap_io = gsap.utils.toArray(".anim--io");


gsap_events
  .from(".events .page_title small, .events .page_title h1", 2, { delay: 0, opacity: 0, stagger: { amount: 0.15 } })
  .from(".events .page_section strong, .events .page_section span", 1, { opacity: 0, y: 120, skewY: 20, stagger: { amount: 0.25 } }, "-=1.5")
  ;

gsap_about
  .from(".about .page_title h1", .8, { delay: .5, y: -30, opacity: 0 })
  .from(".about .page_title small", .8, { y: -30, opacity: 0 }, "-=.5")
  .from(".about--intro", .8, { y: -30, opacity: 0 }, "-=.5")
  .from(".about_img", .8, { opacity: 0, stagger: { amount: 0.2 } }, "-=.5")
  ;

gsap_access
  .from(".access .page_title small, .access .page_title h1", 1, { delay: 0, opacity: 0, stagger: { amount: 0.15 } })
  .from(".access .col", 1, { opacity: 0, y: 120, stagger: { amount: 0.5 } }, "-=.75")
  ;

gsap_contact
  .from(".contact .page_title small, .contact .page_title h1", 1, { delay: .5, opacity: 0, stagger: { amount: 0.15 } })
  .from(".contact_title h2", 1, { opacity: 0, y: 50 }, "-=.75")
  .from(".contact_info", 1, { opacity: 0, y: 90, stagger: { amount: 0.15 } }, "-=.75")
  .from(".contact_form", 1, { opacity: 0, y: 90, skewY: 2 }, "-=.75")
  ;

window.addEventListener('scene_loaded', (evt) => {

  if (window.loaded === 100) {

    gsap_intro
      .from(".intro_title span", 1.5, { delay: .5, opacity: 0, y: 200, skewY: 35, stagger: { amount: 0.4 } }, "-=.25")
      .from(".intro_text span", 1.5, { opacity: 0, yPercent: 50, skewY: 2, stagger: { amount: 0.2 } }, '-=.25')
      ;

    gsap_intro.play();
  }
})

window.addEventListener('openHero', (evt) => {
  console.log("Hero");
})

window.addEventListener('enterExhibition', (evt) => {
  console.log("Exhibition");
})

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
      // gsap_events.restart(true, false);
      break;

    case 'about':
      console.log('start:', evt.detail);
      // gsap_about.restart(true, false);
      break;

    case 'access':
      console.log('start:', evt.detail);
      // gsap_access.restart(true, false);
      break;

    case 'contact':
      console.log('start:', evt.detail);
      // gsap_contact.restart(true, false);
      break;

    case 'menu':
      console.log('start:', evt.detail);
      break;
    default: console.log('start:', evt.detail);
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

playAnimationOnHover('icon1', 'assets/icon1.json');
playAnimationOnHover('icon2', 'assets/icon2.json');
playAnimationOnHover('icon3', 'assets/icon3.json');
playAnimationOnHover('icon4', 'assets/icon4.json');
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
const audioIcon = 'assets/icon-loop.json';
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