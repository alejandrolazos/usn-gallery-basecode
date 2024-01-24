<div class="exhibition_wrapper">

	<a class="back" onclick="
		window.dispatchEvent(new Event('leaveExhibition'));
		return false;
		"><?php echo $localContentJSON['galaxies']['exhibition']['back_btn']; ?></a>

	<div id="exhibition_scroll">
		<div id="exhibition_scroll_content">
			<div class="exhibition_header grid">
				<div class="img_space row"></div>
				<div class="row">
					<div class="content">		 
						<h1 class="title" data-field="title"></h1>
						<small>By</small>
						<h2 class="subtitle" data-field="subtitle"></h2>
						<div class="desc_details desc_details--important"></div>
						<div class="opening"></div>
					</div>
				</div>
			</div>
			
			<div class="exhibition_description grid">
				<div class="description content">
					<div class="description_intro" data-field="intro"></div>
					<div class="description_full card__read-more" data-field="description"></div>
					<button class="btn btn-read-more" onclick="openReadMore(event, this)"><?php echo $localContentJSON['galaxies']['exhibition']['read_more']; ?></button>
				</div>
			</div>

			<div class="exhibition_gallery grid">
				<div class="content"></div>
			</div>

			<div class="exhibition_artists grid">
				<div class="artists_title">
					<h3><?php echo $localContentJSON['galaxies']['exhibition']['about_artists']; ?></h3>
				</div>
				<div class="artists_list content" data-field="artists"></div>
			</div>

			<div class="exhibition_slider grid">
				<div class="content"></div>
			</div>

			<div class="exhibition_photos grid">
				<div class="content"></div>
			</div>

			<div class="exhibition_html">
				<div class="content"></div>
				<button class="btn btn-explore"><?php echo $localContentJSON['galaxies']['exhibition']['explore']; ?></button>
			</div>

			<div class="exhibition_cta">
				<h3><?php echo $localContentJSON['galaxies']['exhibition']['view_more']; ?></h3>
				<a class="letstalk" href="mailto:gallery@ultrasupernew.com" ><?php echo $localContentJSON['galaxies']['exhibition']['contact']; ?></a>
			</div>

			<div class="exhibition_nav">
				<a class="prev" onclick="window.dispatchEvent(new Event('nextExhibition')); return false;">
					<svg width="25.501" height="8.358" viewBox="0 0 25.501 8.358">
						<use href="#icon-arrow" />
					</svg>
					<div class="data"></div>
				</a>

				<a class="next" onclick="window.dispatchEvent(new Event('prevExhibition')); return false;">
					<svg width="25.501" height="8.358" viewBox="0 0 25.501 8.358">
						<path id="icon-arrow" d="M8.358,0V3.343H-12.129V5.015H8.358V8.358l5.015-4.229Z" transform="translate(12.129)"
							fill="#fff" />
					</svg>
					<div class="data"></div>
				</a>
			</div>

		</div>
	</div>	
</div>

<script>
	const openReadMore = (_e, elem)=>{
		_e._parent = document.querySelector('#exhibition .description_full');
		if( _e._parent.classList.contains('open') ){
			_e._parent.classList.remove('open');
			_e._parent.style.height = "0px";
			elem.innerHTML = localContent.galaxies.exhibition.read_more;
		} else {
			_e._parent.classList.add('open');
			_e._parent.style.height = parseInt(_e._parent.dataset.height)+"px";
			elem.innerHTML = localContent.galaxies.exhibition.close;
		}
	}
</script>