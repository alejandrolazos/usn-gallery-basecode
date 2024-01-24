<a id="showMenu" href="/<?php echo $lang; ?>/menu" onclick="window.dispatchEvent( new Event('showMenu') ); return false;">
	<span class='sp1'></span>
	<span class='sp1'></span>
	<span class='sp2'></span>
</a>

<div class="sidebar_wrapper">
	<div class="sidebar_lang"> 
		<?php if($lang === 'jp'){ ?> 
			<a href="/jp/home" id="langJP" class="sidebar_lang--active" target="_self"><span>日</span><span>本</span><span>語</span></a>
			<a href="/en/home" id="langEN" target="_self"><span>EN</span></a>
		<?php } else { ?> 
			<a href="/jp/home" id="langJP" target="_self"><span>日</span><span>本</span><span>語</span></a>
			<a href="/en/home" id="langEN" class="sidebar_lang--active" target="_self"><span>EN</span></a>
		<?php } ?>
	</div>
	<div class="sidebar_hello">
		<div class="sidebar_social">
			<a href="https://www.facebook.com/ultrasupernewgallery/" target="_blank">FB</a>
			<span>/</span>
			<a href="https://www.instagram.com/ultrasupernewgalleryjp/" target="_blank">IG</a>
			<span>/</span>
			<a href="https://vimeo.com/ultrasupernewgallery" target="_blank">VIMEO</a>
		</div>
		<a href="mailto:gallery@ultrasupernew@@com" onmouseenter="this.href=this.href.replace('@@','.')" onclick="this.href=this.href.replace('@@','.')"><span><?php echo $localContentJSON['sidebar']['contact_btn']; ?></span></a>
	</div>
	<a class="icon-lottie icon-loop is-paused" id="triggerMusic"><span id="iconMusic" style="pointer-events: none;"></span></a>
    <audio id="audioMp3" src="/assets/sounds/background.mp3" preload="auto" loop></audio>
</div>
