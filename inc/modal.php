<section class="artist_modal">
  <div class="artist_close" onclick="window.dispatchEvent( new Event('closeModal') )">
    <span></span>
    <span></span>
  </div>
  <div class="artist_wrapper">
    <div class="artist_content">
      <picture class="artist_avatar">
        <img src="" alt="">
      </picture>
      <h4 class="artist_name"></h4>
      <div class="artist_bio"></div>
    </div>
  </div>
</section>

<section class="photo_modal">
  <div class="photo_close" onclick="window.dispatchEvent( new Event('closeModal') )">
    <span></span>
    <span></span>
  </div>
  <div class="wrapper">
    <div class="content">
      <picture class="photo_container">
        <img src="">
      </picture>
      <h4 class="photo_title"></h4>
    </div>
  </div>
</section>

<section class="video_modal">
  <div class="video_close" onclick="window.dispatchEvent( new Event('closeModal') )">
    <span></span>
    <span></span>
  </div>
  <div class="wrapper">
    <div class="content">
      <div id="youtube_wrapper" class="video_container"></div>
      <h4 class="video_title"></h4>
    </div>
  </div>
</section>