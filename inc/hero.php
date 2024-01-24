<div class="hero_wrapper">
	<div class="detail">
		<div class="entrance">
			<p class="price"><span><?php echo $localContentJSON['galaxies']['hero']['header']; ?></span></p>
		</div>
	</div>	
	<h5><?php echo $localContentJSON['galaxies']['hero']['title']; ?></h5>
	<h1 class="title"><span></span></h1> 
	<h2 class="artist"><span></span></h2>
	<a href="" class="enter o-button" onclick="window.dispatchEvent(new CustomEvent('openExhibition', {detail: 'hero'})); return false;"><?php echo $localContentJSON['galaxies']['hero']['enter_btn']; ?><svg width="23" height="10" viewBox="0 0 23 10" fill="none">
			<path d="M18 1L21.9276 5L18 9M1 5H21.8176" stroke="white" stroke-width="1.5" stroke-miterlimit="10"
				stroke-linecap="round" stroke-linejoin="round" />
		</svg></a>
</div>