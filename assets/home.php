<div id="floating_elements">
	<?php 
	 /*
	 <a id="tokyo" href="javascript:;" onclick="window.dispatchEvent( new CustomEvent('travelTo', { detail: 'tokyo'}) ); return false;"><span>Tokyo</span></a>
	<a id="singapore" href="javascript:;" onclick="window.dispatchEvent( new CustomEvent('travelTo', { detail: 'singapore'}) ); return false;"><span>Singapore</span></a>
	<a id="nft" href="javascript:;" onclick="window.dispatchEvent( new CustomEvent('travelTo', { detail: 'nft'}) ); return false;"><span>NFT</span></a>
	*/?>
</div>

<div id="layout_menu" class="row"> 
  <a class="icon-lottie clingy icon--active layout_btn current" title="Spherical" data-type="sphere" data-hover="Exploration" data-type="sphere" onclick="
    window.dispatchEvent(new CustomEvent('layoutChange', {detail: 'sphere'})); return false;"><span id="icon1"></span></a>
  <a class="icon-lottie clingy layout_btn" title="Helix" data-type="helix" data-hover="Chronological" data-type="helix" onclick="
    window.dispatchEvent(new CustomEvent('layoutChange', {detail: 'helix'}));return false;"><span id="icon2"></span></a>
  <a class="icon-lottie clingy layout_btn" title="3D Grid" data-type="grid" data-hover="Layered" data-type="grid" onclick="
    window.dispatchEvent(new CustomEvent('layoutChange', {detail: 'grid'}));return false;"><span id="icon3"></span></a>
  <a class="icon-lottie clingy layout_btn" title="2D Grid" data-type="table" data-hover="Grid" data-type="table" onclick="
    window.dispatchEvent(new CustomEvent('layoutChange', {detail: 'table'}));return false;"><span id="icon4"></span></a>
</div>
<div class="music">
  <a class="icon-lottie is-paused" id="triggerMusic"><span id="iconMusic" style="pointer-events: none;"></span></a>
  <audio id="audioMp3" src="/assets/sounds/background.mp3" preload="auto" loop></audio>
</div>
<div id="section_menu" class="row">
	
	<button class="section_btn" onclick="
		window.dispatchEvent(new CustomEvent('layoutChange', {detail: 'sphere'}));
		return false;
	"><?php echo $localContentJSON['home']['btn1']; ?></button>

</div>

<div id="section_intro" class="intro --center">
  <h1 class="intro_title">
    <div class="line"><span>Ultra</span></div>
    <div class="line"><span>Super</span></div>
    <div class="line"><span>New</span></div>
    <div class="line"><span class="em">Gallery</span></div>
  </h1>
  <p class="intro_text">
    <?php echo $localContentJSON['home']['intro_title']; ?>
  </p>
</div> 
