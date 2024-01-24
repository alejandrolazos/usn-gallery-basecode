<style>
	#preloader{transition: all ease-in-out 2.0s; opacity: 1}
	#preloader.hidden{opacity: 0;}
</style>
<a id="ultrasupernew">
	<img src="./assets/gallery/logo-gallery.svg" alt="UltraSuperNew Gallery" id="logo" class="logo-gallery">
</a>
<div class="pre pre--blob">
	<div id="preloader_content">
		<div class="loaded_data">
			<div class="loaded_value">0</div>
			<div class="loaded_symbol">%</div>
		</div>
		<div class="loaded_text"><span><?php echo $localContentJSON['preloader']['loading']; ?></span> <em id="words"><?php echo $localContentJSON['preloader']['msg1']; ?></em></div>
	</div>
	<div class="preloader_blob" style="filter: blur(1px) contrast(1);">
		<canvas id="canvas" width="360" height="360"></canvas>
	</div>
</div>

<script>
	window.addEventListener('scene_loading', (evt)=>{

		if(window.loaded === 100){
			window.preloaderElem = true;
			return false;
		}

		if(!window.preloaderElem){
			window.preloaderElem = document.getElementsByClassName('loaded_value');	
			if(window.preloaderElem.length > 0){
				window.preloaderElem = window.preloaderElem[0];
			}
			if(window.preloaderElem){
				window.preloaderElem.innerHTML = (window.loaded+1);
			}
		} else {
			window.preloaderElem.innerHTML = (window.loaded+1);
		}
	})

	window.addEventListener('scene_loaded', (evt)=>{

		if(window.loaded === 100 && window.preloaderElem){
			window.preloaderElem = false;
			
		}
	})

	// To animate random words
	let animatedWords = false;

	function displayWords(index) {
		if (index >= localContent.preloader.random_msgs.length) {
			index = 0;
		}
		animatedWords = document.getElementById("words");
		if(animatedWords){
			animatedWords.innerHTML = localContent.preloader.random_msgs[index];
			setTimeout(function () {
				displayWords(index + 1)
			}, 2000);	
		}
	}
	displayWords(0); 
	
</script>