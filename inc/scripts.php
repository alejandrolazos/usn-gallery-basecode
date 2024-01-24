<script type="text/javascript" src="https://www.youtube.com/iframe_api"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.0/lottie.min.js"
    integrity="sha512-XCthc/WzPfa+oa49Z3TI6MUK/zlqd67KwyRL9/R19z6uMqBNuv8iEnJ8FWHUFAjC6srr8w3FMZA91Tfn60T/9Q=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script type="text/javascript" src="dist/libs/gsap.min.js"></script>
<script type="text/javascript" src="dist/libs/scrollTrigger.js"></script>
<script type="text/javascript" src="dist/libs/smooth.js"></script>

<script type="text/javascript" src="dist/js/animations.js"></script>
<script type="text/javascript" src="dist/js/preloader.js"></script>

<script type="text/javascript" src="dist/js/wgl.min.js"></script>

<script> 
    const textrev = gsap.timeline();
    textrev.from(".intro_title span", 2, {
      delay: .5,
      opacity: 0,
      ease: "power4.out",
      y: 200,
      skewY: 35,
      stagger: {
        amount: 0.4,
      },
    }); 
  </script>