import { 
	Vector2,
	Vector3,
	Raycaster,
	PlaneGeometry,
	SphereGeometry,
	Mesh,
	MirroredRepeatWrapping,
	Quaternion,
	Euler,
	Color,
	sRGBEncoding,
	RepeatWrapping,
	Object3D
} from 'three';

import { GetColors } from './mod.getcolors.js';
import { Gallery, Photos, Slider } from './mod.gallery.js';

import PhotoSwipeLightbox from './../libs/photoswipe/photoswipe-lightbox.esm.js';
import PhotoSwipe from './../libs/photoswipe/photoswipe.esm.js';

const _rootPath = 'https://ultrasupernew.gallery';
 
function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}

const Interaction = (_t, end)=>{

	const _i = _t.Interaction = {}

	_i.raycaster = new Raycaster();
	_i.pointer = new Vector3();
	_i.prevPointer = new Vector2();
	_i.deltaPointer = new Vector2();

	_i.tmpVector = new Vector3()
	_i.tmpVectorPos = new Vector3()
	_i.tmpVectorLook = new Vector3()
	_i.tmpVectorTarget = new Vector3()

	_i.intersects = [];
	_i.switched = false;
	_i.cameraPosition = new Vector3();
	_i.objectPosition = new Vector3();
	_i.objectPositionTarget = new Vector3();
	_i.objectLocalPosition = new Vector3();
	_i.deltaRotationQuaternion = new Quaternion();
	_i.objParent = false;

	_i.switches = {
		isDragging: false,
		canScroll: false,
		raycasting: false,
		dynamicView: false,
		autoRotate: true
	}

	_i.current = {
		element: false,
		cluster: false,
		section: false,
		exhibition: false,
		object: false,
	}

	_i.dynamicPosition = new Vector3()
	_i.dynamicPositionX = new Vector3()
	_i.dynamicPositionY = new Vector3()
	_i.basePosition = new Vector3()
	_i.baseTarget = new Vector3()

	_i.worldLeft = new Vector3();
	_i.worldRight = new Vector3();
	_i.worldTop = new Vector3();
	_i.worldBottom = new Vector3();
	_i.worldTarget = new Vector3();

	_i.originalHeroCamPos = new Vector3();
	_i.originalHeroObjPos = new Vector3();
	_i.originalHeroCamLook = new Vector3();

	_i.heroOffset = 0;

	_i.otherExhibitions = 1;

	_i.bodyClasses = [ '_intro', '_home', '_section', '_contact', '_about', '_events', '_access', '_exhibition', '_hero', '_menu', '_institutional' ];
	
	window.checkImageOrientation = img => {
 	    if(img.height > img.width){
	    	img.parentElement.parentElement.classList.add('portrait');
 	    } else {
 	    	img.parentElement.parentElement.classList.add('landscape');
 	    }
 	};

	_i.cancelEverything = ()=>{

		_t.Screen.disableControls()
		_i.disableDynamicPositions();
		_i.switches.raycasting = false;
		_i.switches.canScroll = false;
		_i.switches.autoRotate = false;

		if(_i.tmtOut){
			clearTimeout(_i.tmtOut);
		}
		if(_i.layoutTmt){
			clearTimeout(_i.layoutTmt);
		}

		if(_i.layoutTmt){
			clearTimeout(_i.layoutTmt);
		}

		if(_i.cameraAnimation){
			_t.Motion.AUTO.remove(_i.cameraAnimation);
		}
		if(_i.current.section.heroAnimation){
			_t.Motion.AUTO.remove(_i.current.section.heroAnimation);
		}
		if(_i.exhibAnimation){
			_t.Motion.AUTO.remove(_i.exhibAnimation);
		}
		if(_i.current.exhibition.exhibAnimation){
			_t.Motion.AUTO.remove(_i.current.exhibition.exhibAnimation);
		}
		if(_i.layoutAnim){
			_t.Motion.AUTO.remove(_i.layoutAnim);
		}
		
	}

	_t.darkBackground = (end)=>{
		if(_t.Assets.materials.darker.anim){
			_t.Motion.AUTO.remove(_t.Assets.materials.darker.anim);
		}

		_t.Elements.darker_mesh.visible = true;

		_t.Assets.materials.darker.anim = new _t.TWEEN.Tween(_t.Assets.materials.darker,_t.Motion.AUTO ).to({opacity: 0.8}, 1000 )
		.interpolation(_t.TWEEN.Interpolation.Bezier)
		.easing( _t.TWEEN.Easing.Exponential.Out )
		.onComplete((v)=>{
			if(end)end();
		}).start();
	}

	_t.lightBackground = (end)=>{
		if(_t.Assets.materials.darker.anim){
			_t.Motion.AUTO.remove(_t.Assets.materials.darker.anim);
		}

		_t.Assets.materials.darker.anim = new _t.TWEEN.Tween(_t.Assets.materials.darker,_t.Motion.AUTO ).to({opacity: 0}, 1000 )
		.interpolation(_t.TWEEN.Interpolation.Bezier)
		.easing( _t.TWEEN.Easing.Exponential.Out )
		.onComplete((v)=>{

			_t.Elements.darker_mesh.visible = false;

			if(end)end();
		}).start();
	}

	_t.Motion.animations.scrollAnimation = ()=>{
		if(_i.current.exhibition && _i.switches.canScroll){
			if(!_i.exhibitionImgSpace){
				_i.exhibitionElem = document.querySelector('#exhibition');
				_i.exhibitionImgSpace = _i.exhibitionElem.querySelector('.exhibition_wrapper .img_space');
			}
			_i.current.exhibition.mesh.position.y = _i.heroOffset  - (_i.exhibitionImgSpace.getBoundingClientRect().top);
		}
	}

	_i.loadExternalData = (type, id, param, _callbackX)=>{

		const _ajax = {};
		_ajax.httpRequest = new XMLHttpRequest();
	 	
	 	if (!_ajax.httpRequest) {
	 	  alert("Giving up :( Cannot create an XMLHTTP instance");
	 	  return false;
	 	}

		_ajax.returnContents = ()=>{
			if (_ajax.httpRequest.readyState === XMLHttpRequest.DONE) {
				if (_ajax.httpRequest.status === 200) {
				  _callbackX(_ajax.httpRequest.responseText, param);
				}
			}
		}
		
		_ajax.httpRequest.onreadystatechange = _ajax.returnContents;

		_ajax.url = false;

		if(type === 'artist'){
			_ajax.url =  _rootPath+'/cms/wp-json/custom-routes/v1/artists/'+id;
		} else if(type === 'exhibition'){
			_ajax.url =  _rootPath+'/cms/wp-json/custom-routes/v1/'+param+'/'+id;
		}

		if(_ajax.url){
			_ajax.httpRequest.open("GET", _ajax.url);
			_ajax.httpRequest.send();	
		}

		return _ajax;
	}


	_i.onOpenBio = (event, idx)=>{

		event.preventDefault();

		const artist = _i.current.exhibition.artists_list[event.detail];

		if(artist.avatar){
			if(artist.name[lang] && artist.name[lang] !== ''){
				document.querySelector('#modal .artist_avatar').innerHTML = `<img src="`+artist.avatar+`" alt="`+artist.name[lang]+`">`;
			} else if(artist.name.en && artist.name.en !== ''){
				document.querySelector('#modal .artist_avatar').innerHTML = `<img src="`+artist.avatar+`" alt="`+artist.name.en+`">`;
			} else if(artist.name.jp && artist.name.jp !== ''){
				document.querySelector('#modal .artist_avatar').innerHTML = `<img src="`+artist.avatar+`" alt="`+artist.name.jp+`">`;
			} else {
				document.querySelector('#modal .artist_avatar').innerHTML = `<img src="assets/images/no-artist.png" alt="No artist">`;
			}
		} else {
			document.querySelector('#modal .artist_avatar').innerHTML = `<img src="assets/images/no-artist.png" alt="No artist">`;
		}

		if(artist.name){
			if(artist.name[lang] && artist.name[lang] !== ''){
				document.querySelector('#modal .artist_name').innerHTML = artist.name[lang];
			} else if(artist.name.en && artist.name.en !== ''){
				document.querySelector('#modal .artist_name').innerHTML = artist.name.en;
			} else if(artist.name.jp && artist.name.jp !== ''){
				document.querySelector('#modal .artist_name').innerHTML = artist.name.jp;
			}
		} else {
			document.querySelector('#modal .artist_name').innerHTML = 'No name';
		}

		if(artist.bio){
			if(artist.bio[lang] && artist.bio[lang] !== ''){
				document.querySelector('#modal .artist_bio').innerHTML = artist.bio[lang];
			} else if(artist.bio.en && artist.bio.en !== ''){
				document.querySelector('#modal .artist_bio').innerHTML = artist.bio.en;
			} else if(artist.bio.jp && artist.bio.jp !== ''){
				document.querySelector('#modal .artist_bio').innerHTML = artist.bio.jp;
			}
		} else {
			document.querySelector('#modal .artist_bio').innerHTML = '';
		}

		if(!_i.modal){
			_i.modal = document.getElementById('modal');
		}

		if(_i.modalTmtOut){
			clearTimeout(_i.modalTmtOut);
		}
		_i.modal.classList.remove('ph');
		_i.modal.style.display = 'flex';
		_i.modal.style.zIndex = 100000;
		_i.modal.classList.add('active', 'art');
		_i.modalTmtOut = setTimeout( ()=>{
			_i.modal.style.opacity = 1;
		}, 350);
		
		
		return false;
	}

	_i.onCloseModal = (event, idx)=>{
		event.preventDefault();
		if(!_i.modal){
			_i.modal = document.getElementById('modal');
		}

		if(_i.modalTmtOut){
			clearTimeout(_i.modalTmtOut);
		}
		if(window.videoPlayer){
			window.videoPlayer.stopVideo();
		}
		_i.modal.style.display = 'flex';
		_i.modal.style.zIndex = 100000;
		_i.modal.style.opacity = 0;
		_i.modalTmtOut = setTimeout( ()=>{
			_i.modal.style.zIndex = -100;
			_i.modal.style.display = 'none';
			_i.modal.classList.remove('active', 'art', 'ph', 'vid');
		}, 500);

		return false;
	}

	_i.photoLoaded = (photo, obj )=>{

		photo.aspectRatio = photo.width/photo.height;

		if(obj){
			if(!obj.loaded){
				obj.loaded = 0;
			}

			obj.loaded += 1;
			
			if(obj.loaded / obj.photos.length === 1){
				if(_i.parallaxPhotos){
					_i.processPhotoGallery(_i.parallaxPhotos, true);
				}
			}

		}
	}


	_t.Screen.resize.galleryResize = ()=>{
		if(_i.parallaxPhotos){
			_i.processPhotoGallery(_i.parallaxPhotos, true);
		}
	}
	_i.processPhotoGallery = (obj, resize)=>{

		if(!_i.exhibitionPhotosWrapper){
			_i.exhibitionPhotosWrapper = document.querySelector('.exhibition_photos');
		}

		_i.exhibitionPhotosWrapper.style.display = 'flex';

		obj.photosWidth = window.innerWidth / 100 * 90 / 3;

		obj.cols = Math.floor(window.innerWidth / obj.photosWidth);
		obj.toNextRow = false;
		obj.y = 0;
		obj.y_ = 0;
		obj.i = 0;

		if(resize && obj._photos){

			for (let i = 0; i < obj._photos.length; i++) {

				if(obj._photos[i].large.indexOf('jpg') > -1 || obj._photos[i].large.indexOf('png') > -1 || obj._photos[i].large.indexOf('jpeg') > -1){

					if(i % 8 === 0){

						obj._photos[i].position.x = 50;
						obj._photos[i].position.y = obj.y;

						if(obj._photos[i].size.aspectRatio > 1){
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
						} else {
							obj._photos[i]._width = 50;
							obj._photos[i]._html._item.dataset.speed = 0.5 + (Math.random()/5);
						}

						obj.y += obj._photos[i]._width / obj._photos[i].size.aspectRatio;

					} else if(i % 8 === 1){

						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
							obj._photos[i].position.x = 33.33 / 2;
						} else {
							obj._photos[i]._width = 50;
							obj._photos[i]._html._item.dataset.speed = 0.5 + (Math.random()/5);
							obj._photos[i].position.x = 25;
						}
 
					} else if(i % 8 === 2){
						
						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
							obj._photos[i].position.x = 50 + 33.33 / 2;
						} else {
							obj._photos[i]._width = 50;
							obj._photos[i]._html._item.dataset.speed = 0.5 + (Math.random()/5);
							obj._photos[i].position.x = 75;
						}

						obj.y += obj._photos[i]._width / obj._photos[i].size.aspectRatio;
						
					} else if(i % 8 === 3){
						
						obj._photos[i].position.x = 50;
						obj._photos[i].position.y = obj.y;

						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 50;
							obj._photos[i]._html._item.dataset.speed = 0.5 + (Math.random()/5);
						} else {
							obj._photos[i]._width = 66.66
							obj._photos[i]._html._item.dataset.speed = 0.66 + (Math.random()/5);
						}

						obj.y += obj._photos[i]._width / obj._photos[i].size.aspectRatio;
						
					} else if(i % 8 === 4){

						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 25;
							obj._photos[i]._html._item.dataset.speed = 0.25 + (Math.random()/5);
							obj._photos[i].position.x = 12.5;
						} else {
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
							obj._photos[i].position.x = 33.33 / 2;
						}

						obj._photos[i].position.y =  obj.y;
						
					} else if(i % 8 === 5){
						
						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 25;
							obj._photos[i]._html._item.dataset.speed = 0.25 + (Math.random()/5);
						} else {
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
						}

						obj._photos[i].position.x = 50;
						obj._photos[i].position.y = obj.y;
						
					} else if(i % 8 === 6){

						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 25;
							obj._photos[i]._html._item.dataset.speed = 0.25 + (Math.random()/5);
							obj._photos[i].position.x = 100 - 25 / 2;
						} else {
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
							obj._photos[i].position.x = 100 - 33.33 / 2;
						}

						obj._photos[i].position.y =  obj.y;
						obj.y += obj._photos[i]._width / obj._photos[i].size.aspectRatio;
						
					} else if(i % 8 === 7){

						if(obj._photos[i].size.aspectRatio < 1){
							obj._photos[i]._width = 33.33;
							obj._photos[i]._html._item.dataset.speed = 0.33 + (Math.random()/5);
						} else {
							obj._photos[i]._width = 50;
							obj._photos[i]._html._item.dataset.speed = 0.5 + (Math.random()/5);
						}

						obj._photos[i].position.x = 50;
						obj._photos[i].position.y =  obj.y;

						obj.y += obj._photos[i]._width / obj._photos[i].size.aspectRatio;
					}

					obj._photos[i]._html._item.style.width = obj._photos[i]._width+'%';

				}
				
			}

		} else {

			obj.html = document.createElement('div');
			obj.html.classList.add('photo_gallery');

			obj._photos = [];
			_i.parallaxPhotos = false;

			for (let i = 0; i < obj.photos.length; i++) {

				if(obj.photos[i].medium_srcset !== false){
					obj.photos[i].large = obj.photos[i].medium_srcset.split(' ')[0];
				} else {
					obj.photos[i].large = obj.photos[i].full_image_url;
				}

				if(obj.photos[i].large.indexOf('jpg') > -1 || obj.photos[i].large.indexOf('png') > -1 || obj.photos[i].large.indexOf('jpeg') > -1){

					obj.photos[i].index = i;

					obj.photos[i].position = new Vector3( 0, 0, 100 * Math.random() - 50 );
					obj.photos[i].size = {width: 0, height: 0, aspectRatio: 0};

					obj.photos[i]._html = {};

					obj.photos[i]._html._item = document.createElement('div');
					obj.photos[i]._html._item.classList.add('photo'+obj.i, 'photos_item');
					obj.photos[i]._html._item.dataset.speed = 1;

					obj.photos[i]._html._data = document.createElement('a');
					obj.photos[i]._html._data.classList.add('item_data');

					obj.photos[i]._html._data.href = obj.photos[i].full_image_url;
					obj.photos[i]._html._data.dataset.pswpSrc = obj.photos[i].full_image_url;

					obj.photos[i]._html._item.appendChild(obj.photos[i]._html._data);
					
					obj.photos[i]._html._image = new Image();
					obj.photos[i]._html._image.classList.add('photo_data','photos_img');
					obj.photos[i]._html._image.onload = function() {

						obj.photos[i].size = {width: this.width, height: this.height, aspectRatio: this.width/this.height};
						obj.photos[i]._html._data.dataset.pswpWidth = window.innerHeight * obj.photos[i].size.aspectRatio;
						obj.photos[i]._html._data.dataset.pswpHeight = window.innerHeight;

						_i.photoLoaded(this, obj );

					}
					obj.photos[i]._html._data.appendChild(obj.photos[i]._html._image);
					obj.photos[i]._html._image.src = obj.photos[i].large;

					obj.photos[i]._html._title = document.createElement('div');
					obj.photos[i]._html._title.classList.add('photo_data','title');
					obj.photos[i]._html._title.innerHTML = obj.photos[i].title;
					obj.photos[i]._html._data.appendChild(obj.photos[i]._html._title);

					obj.photos[i]._html._caption = document.createElement('div');
					obj.photos[i]._html._caption.classList.add('photo_data','caption');
					obj.photos[i]._html._caption.innerHTML = obj.photos[i].caption;
					obj.photos[i]._html._data.appendChild(obj.photos[i]._html._caption);

					obj.html.appendChild(obj.photos[i]._html._item);

					obj._photos[obj.i] = obj.photos[i];

					obj.i++;
				}
			}

			_i.parallaxPhotos = obj;
			_i.processPhotoGallery(_i.parallaxPhotos, true);

		}

		return obj;

	}
	_i.setArrows = (obj)=>{

		
		

		if(_i.current.exhibition && _i.current.section){

			_i.current.index = _i.current.section.exhibitions.indexOf(_i.current.exhibition);

			if(_i.current.index-1 < 0){
				_i.current.prevIndex = _i.current.section.exhibitions.length-1;
			} else {
				_i.current.prevIndex = _i.current.index-1;
			}

			if(_i.current.index+1 > _i.current.section.exhibitions.length-1){
				_i.current.nextIndex = 0;
			} else {
				_i.current.nextIndex = _i.current.index+1;
			}
		}

		if(!_i.selectors){
			_i.selectors = {}
		}

		_i.selectors.prevBtn = document.querySelector('.exhibition_nav a.prev .data');
		_i.selectors.nextBtn = document.querySelector('.exhibition_nav a.next .data');

		_i.selectors.nextBtn.innerHTML = `<img class="cover" src="`+_i.current.section.exhibitions[_i.current.prevIndex].poster.thumbnail+`"/>`;

		if(_i.current.section.exhibitions[_i.current.prevIndex].title[lang]){
			_i.selectors.nextBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.prevIndex].title[lang]+`</h5>`;
		} else if(_i.current.section.exhibitions[_i.current.prevIndex].title.en){
			_i.selectors.nextBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.prevIndex].title.en+`</h5>`;
		} else if(_i.current.section.exhibitions[_i.current.prevIndex].title.jp){
			_i.selectors.nextBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.prevIndex].title.jp+`</h5>`;
		} else {
			_i.selectors.nextBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.prevIndex].title+`</h5>`;
		}

		_i.selectors.prevBtn.innerHTML = `<img class="cover" src="`+_i.current.section.exhibitions[_i.current.nextIndex].poster.thumbnail+`"/>`;

		if(_i.current.section.exhibitions[_i.current.nextIndex].title[lang]){
			_i.selectors.prevBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.nextIndex].title[lang]+`</h5>`;
		} else if(_i.current.section.exhibitions[_i.current.nextIndex].title.en){
			_i.selectors.prevBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.nextIndex].title.en+`</h5>`;
		} else if(_i.current.section.exhibitions[_i.current.nextIndex].title.jp){
			_i.selectors.prevBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.nextIndex].title.jp+`</h5>`;
		} else {
			_i.selectors.prevBtn.innerHTML += `<h5 class="title">`+_i.current.section.exhibitions[_i.current.nextIndex].title+`</h5>`;
		}

	}
	_i.setMarkup = (type, obj)=>{

		if(type === 'hero'){

			if(obj.title[lang]){
				_i.heroTitle.innerHTML = obj.title[lang];
			} else if(obj.title.en){
				_i.heroTitle.innerHTML = obj.title.en;
			} else if(obj.title.jp){
				_i.heroTitle.innerHTML = obj.title.jp;
			} else {
				_i.heroTitle.innerHTML = obj.title;	
			}

			_i.onUpdatePath('hero', _i.heroTitle.innerHTML);

			if(obj.subtitle[lang] && obj.subtitle[lang] !== ""){
				_i.heroArtist.innerHTML = obj.subtitle[lang];	
			} else if(obj.subtitle.en && obj.subtitle.en !== ""){
				_i.heroArtist.innerHTML = obj.subtitle.en;	
			} else if(obj.subtitle.jp && obj.subtitle.jp !== ""){
				_i.heroArtist.innerHTML = obj.subtitle.jp;	
			} else {
				_i.heroArtist.innerHTML = '';	
			}

		} else if(type === 'exhibition'){

			if(!_i.exhibitionDetails){_i.exhibitionDetails = document.querySelector('#exhibition .desc_details');}
			if(!_i.exhibitionOpening){_i.exhibitionOpening = document.querySelector('#exhibition .exhibition_header .opening');}
			if(!_i.descContainer){ _i.descContainer = document.querySelector('#exhibition .description_full'); }
			if(!_i.readMoreBtn) { _i.readMoreBtn = document.querySelector('.btn.btn-read-more'); }

			_i.exhibitionDetails.innerHTML = '<strong data-field="date">'+obj.date.start+' — '+obj.date.end+'</strong>';
			_i.exhibitionOpening.innerHTML = '';

			if(obj === _i.current.section.exhibitions[0]){

				if(obj.opening.weekends){ 
					_i.exhibitionDetails.innerHTML += '<span>'+obj.opening.weekends+'</span>';
					if(obj.free === true){
						_i.exhibitionDetails.innerHTML += ' / <span data-field="price">FREE ENTRANCE</span>';	
					} else {
						_i.exhibitionDetails.innerHTML += " / <a href='"+obj.ticket+"' target='_blank'>"+obj.price+"</a>";
					}
				} else {
					if(obj.free === true){
						_i.exhibitionDetails.innerHTML += '<span data-field="price">FREE ENTRANCE</span>';	
					} else {
						_i.exhibitionDetails.innerHTML += "<a href='"+obj.ticket+"' target='_blank'>"+obj.price+"</a>";
					}
				}

				if(obj.opening.hours){
					_i.exhibitionOpening.innerHTML += ` 
						<div>
							<svg width="28px" height="28px" viewBox="0 0 28 28">
								<g id="lv1/icons/time" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
									<circle id="Oval" stroke="#5dbaef" stroke-width="2" cx="14" cy="14" r="13"></circle>
									<polyline id="Path-2" stroke="#5dbaef" stroke-width="2" points="14 5 14 14.4422268 19.0266113 19.0358887"></polyline>
								</g>
							</svg>
							<div class="opening_details">Open <span>`+obj.opening.hours+`</span></div>
						</div>
					`;
				}

				if((obj.opening.hours+obj.party.title+obj.party.date+obj.party.info) !== "null"){
					_i.exhibitionOpening.innerHTML += `
						<div>
							<svg width="28px" height="28px" viewBox="0 0 28 28">
								<g id="lv1/icons/opening" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
									<polygon id="Triangle" stroke="#5dbaef" stroke-width="2"
										transform="translate(14.000000, 13.000000) scale(1, -1) translate(-14.000000, -13.000000) "
										points="14 6 26 20 2 20"></polygon>
									<path d="M14,20 L14,27" id="Line" stroke="#5dbaef" stroke-width="2" stroke-linecap="square">
									</path>
									<path d="M21.0356688,27 L7,27" id="Line" stroke="#5dbaef" stroke-width="2"
										stroke-linecap="square">
									</path>
									<path d="M21.0356688,11 L7,11" id="Line" stroke="#5dbaef" stroke-width="2"
										stroke-linecap="square">
									</path>
									<circle id="Oval-3" fill="#5dbaef" cx="19" cy="5" r="1"></circle>
									<circle id="Oval-3" fill="#5dbaef" cx="12" cy="10" r="1"></circle>
									<circle id="Oval-3" fill="#5dbaef" cx="16" cy="14" r="1"></circle>
									<circle id="Oval-3" fill="#5dbaef" cx="9" cy="2" r="1"></circle>
								</g>
							</svg>
							<div class="party_details">
								<h5>`+obj.party.title+`</h5>
								<span>`+obj.party.date+`</span> 
								<span>`+obj.party.info+`</span>
							</div>
						</div>
					`;
				}
			} 

			if(_i.exhibitionOpening.innerHTML !== ""){ 
				_i.exhibitionOpening.style.display = 'block'; 
			} else {
				_i.exhibitionOpening.style.display = 'none';
			}


			if(obj.title[lang] && obj.title[lang] !== ""){
				_i.exhibitionTitle.innerHTML = obj.title[lang];
				_i.exhibitionArtist.innerHTML = obj.subtitle[lang];
			} else if(obj.title.en && obj.title.en !== ""){
				_i.exhibitionTitle.innerHTML = obj.title.en;
				_i.exhibitionArtist.innerHTML = obj.subtitle.en;
			} else if(obj.title.jp && obj.title.jp !== ""){
				_i.exhibitionTitle.innerHTML = obj.title.jp;
				_i.exhibitionArtist.innerHTML = obj.subtitle.jp;
			} else {
				_i.exhibitionTitle.innerHTML = "";
				_i.exhibitionArtist.innerHTML = '';	
			}

			_i.onUpdatePath('exhibition', _i.exhibitionTitle.innerHTML);


			if(obj.intro[lang] && obj.intro[lang] !== ""){
				document.querySelector('#exhibition .description_intro').innerHTML = obj.intro[lang];	
			} else if(obj.intro.en && obj.intro.en !== ""){
				document.querySelector('#exhibition .description_intro').innerHTML = obj.intro.en;	
			} else if(obj.intro.jp && obj.intro.jp !== ""){
				document.querySelector('#exhibition .description_intro').innerHTML = obj.intro.jp;	
			} else {
				document.querySelector('#exhibition .description_intro').innerHTML = '';	
			}

			if(obj.description[lang] && obj.description[lang] !== ""){
				_i.descContainer.innerHTML = obj.description[lang];	
				_i.readMoreBtn.style.display = 'block';
			} else if(obj.description.en && obj.description.en !== ""){
				_i.descContainer.innerHTML = obj.description.en;	
				_i.readMoreBtn.style.display = 'block';
			} else if(obj.description.jp && obj.description.jp !== ""){
				_i.descContainer.innerHTML = obj.description.jp;	
				_i.readMoreBtn.style.display = 'block';
			} else {
				_i.descContainer.innerHTML = '';	
				_i.readMoreBtn.style.display = 'none';
			}

			_i.descContainer.classList.remove('open');
			_i.descContainer.style.height = "auto";
			_i.descContainer.dataset.height = _i.descContainer.scrollHeight;
			_i.descContainer.style.height = "0px";
			_i.readMoreBtn.innerHTML = 'Read more';


			if(!_i.exhibitionBottomNav){
				_i.exhibitionBottomNav = document.querySelector('.exhibition_nav');
			}
			if(!_i.exhibitionContentBottomWrapper){
				_i.exhibitionContentBottomWrapper = document.querySelector('.exhibition_html');
			}

			if(obj.content_bottom){

				

				if(obj.content_bottom[lang] && obj.content_bottom[lang] !== ""){
					_i.exhibitionContentBottomWrapper.innerHTML = `
						<div class="content">
							<div class="custom_html">`+obj.content_bottom[lang]+`</div>
							<button class="btn btn-explore o-button" onclick="window.dispatchEvent( new CustomEvent('travelTo', {detail: 'init' }) ); return false;">`+localContent.galaxies.exhibition.explore+`</button>
						</div>
					`;
					_i.exhibitionContentBottomWrapper.style.display = 'flex';
					_i.exhibitionBottomNav.style.display = 'none';

				} else if(obj.content_bottom.en && obj.content_bottom.en !== ""){
					_i.exhibitionContentBottomWrapper.innerHTML = `
						<div class="content">
							<div class="custom_html">`+obj.content_bottom.en+`</div>
							<button class="btn btn-explore o-button" onclick="window.dispatchEvent( new CustomEvent('travelTo', {detail: 'init' }) ); return false;">`+localContent.galaxies.exhibition.explore+`</button>
						</div>
					`;
					_i.exhibitionContentBottomWrapper.style.display = 'flex';
					_i.exhibitionBottomNav.style.display = 'none';

				} else if(obj.content_bottom.jp && obj.content_bottom.jp !== ""){
					_i.exhibitionContentBottomWrapper.innerHTML = `
						<div class="content">
							<div class="custom_html">`+obj.content_bottom.jp+`</div>
							<button class="btn btn-explore o-button" onclick="window.dispatchEvent( new CustomEvent('travelTo', {detail: 'init' }) ); return false;">`+localContent.galaxies.exhibition.explore+`</button>
						</div>
					`;
					_i.exhibitionContentBottomWrapper.style.display = 'flex';
					_i.exhibitionBottomNav.style.display = 'none';

				} else {

					_i.exhibitionContentBottomWrapper.innerHTML = ``;
					_i.exhibitionContentBottomWrapper.style.display = 'none';

					_i.exhibitionBottomNav.style.display = 'flex';

				}
				
			} else {

				_i.exhibitionContentBottomWrapper.innerHTML = ``;
				_i.exhibitionContentBottomWrapper.style.display = 'none';

				_i.exhibitionBottomNav.style.display = 'flex';

			}

			_i.loadExternalData('exhibition', obj.ID, _i.current.section.path, (_json)=>{

				if(_json){
					_json = JSON.parse(_json);
					if(_json[0]){
						_json = _json[0];
					}
					obj.images = _json.gallery;
					obj.photos = _json.photos;
					obj.slider = _json.slider;

					if(obj.images && obj.images !== null && obj.images !== false){

						document.querySelector('.exhibition_gallery').style.display = 'flex';

						_i.exhibitionGallery.innerHTML = '';

						if(obj.images){

							obj.gallery_wrapper = document.createElement('div');
							obj.gallery_wrapper.classList.add('row','gallery');
							_i.exhibitionGallery.appendChild(obj.gallery_wrapper);

							obj.ii = 0;

							for (let i = 0; i < obj.images.length; i++) {

								let _elem = obj.images[i];

								if(_elem.medium_srcset !== false){
									_elem.large = _elem.medium_srcset.split(' ')[0];
								} else {
									_elem.large = _elem.full_image_url;
								}

								if(_elem.large.indexOf('jpg') > -1 || _elem.large.indexOf('png') > -1 || _elem.large.indexOf('jpeg') > -1){

									let idx = obj.ii;
									_elem.index = i;
									_elem.size = {width: 0, height: 0, aspectRatio: 0};

									_elem._html = {};

									_elem._html._item = document.createElement('div');
									_elem._html._item.classList.add('image'+obj.ii, 'gallery_item', 'col');

									_elem._html._link = document.createElement('a');
									_elem._html._link.classList.add('gallery_trigger');
									_elem._html._link.dataset.pswpWidth = window.innerWidth;
									_elem._html._link.dataset.pswpHeight = window.innerHeight;
									_elem._html._link.dataset.pswpSrc = _elem.full_image_url;
									_elem._html._item.appendChild(_elem._html._link);

									_elem._html._data = document.createElement('div');
									_elem._html._data.classList.add('item_data');

									_elem._html._data.onclick = (event)=>{
										event.preventDefault();
										window.dispatchEvent( new CustomEvent('galleryUpdate', {detail:{ index: idx, full: _elem.full_image_url}}) ); 
										return false; 
									}

									_elem._html._item.appendChild(_elem._html._data);
									
									_elem._html._image = new Image();
									_elem._html._image.classList.add('gallery_img');
									_elem._html._image.onload = function() {
										_elem.size = {width: this.width, height: this.height, aspectRatio: this.width/this.height};
										_elem._html._link.dataset.pswpWidth = window.innerHeight * _elem.size.aspectRatio;
										_elem._html._link.dataset.pswpHeight = window.innerHeight;
									}
									_elem._html._data.appendChild(_elem._html._image);
									_elem._html._image.src = _elem.large;

									_elem._html._title = document.createElement('div');
									_elem._html._title.classList.add('photo_data','title');
									_elem._html._title.innerHTML = _elem.title;
									_elem._html._data.appendChild(_elem._html._title);

									_elem._html._caption = document.createElement('div');
									_elem._html._caption.classList.add('photo_data','caption');
									_elem._html._caption.innerHTML = _elem.caption;
									_elem._html._data.appendChild(_elem._html._caption);

									obj.gallery_wrapper.appendChild(_elem._html._item);

									obj.ii++;
								}
							}

							if(!_t.Gallery){
								_t.Gallery = new Gallery();	
							} 
							_t.Gallery.update( _i.exhibitionGallery.querySelectorAll('#exhibition .gallery > .col'), 0);

							_i.exhibitionGallery.lightbox = new PhotoSwipeLightbox({
							  gallery: '#exhibition .gallery',
							  arrowPrevSVG: '<svg width="17" height="32" viewBox="0 0 17 32"><line x1="15" y2="15" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" /><line x1="15" y1="15" transform="translate(1.414 16.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" /></svg>',
							  arrowNextSVG: '<svg width="17" height="32" viewBox="0 0 17 32"><line x2="15" y2="15" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/><line y1="15" x2="15" transform="translate(1.414 16.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>',
							  closeSVG: '<svg width="32" height="32" viewBox="0 0 32 32"><line x2="30" y2="30" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/><line y1="30" x2="30" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>',
							  zoomSVG: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M0,0V8L3,5,6,8,8,6,5,3,8,0ZM10,8,8,10l3,3L8,16h8V8l-3,3Z" fill="#fff"/></svg>',
							  children: '.gallery_trigger',
							  bgOpacity: 1,
							  pswpModule: PhotoSwipe
							});

							_i.exhibitionGallery.lightbox.init();
						}

					} else {

						_i.exhibitionGallery.innerHTML = "";
						document.querySelector('.exhibition_gallery').style.display = 'none';

					}

					if(obj.slider && obj.slider !== null && obj.slider !== false){

						document.querySelector('.exhibition_slider').style.display = 'flex';

						_i.exhibitionSliderHTML = '<div class="row gallery slider">';
						
						if(obj.slider){
							
							_i.cntImg = 0;
							obj.slider.forEach((e,i)=>{

								if(e.large_srcset){
									e.large = e.large_srcset.split(' ')[0];
								} else if(e.full_image_url){
									e.large = e.full_image_url;
								}
								
								e.url = e.url.split('?v=')[1];
								
								if(e.large){

									_i.exhibitionSliderHTML += `
										<div class="col slider_item" data-video="`+e.url+`">
											<div class="item_data" onclick="window.dispatchEvent( new CustomEvent('sliderUpdate', { detail: { index: `+_i.cntImg+`, full: '`+e.full_image_url+`' }}) );return false;">
												<div id="video`+_i.cntImg+`" class="video"></div>
												<img src="`+e.large+`" class="slider_img" onload="checkImageOrientation(this)" />
												<button	class="btn play-btn" onclick="window.dispatchEvent( new CustomEvent('playVideo', { detail: { index: `+_i.cntImg+`, url: '`+e.url+`' }}) );return false;"><i class="icon play-icn"></i></button>
									`;
									if(e.caption && e.caption !== ""){
										_i.exhibitionSliderHTML += `
												<div class="video_data caption">`+e.caption+`</div>
												`;	
									} else if(e.title && e.title !== ""){
										_i.exhibitionSliderHTML += `
												<div class="video_data title">`+e.title+`</div>
												`;	
									}
									_i.exhibitionSliderHTML += `
											</div>
										</div>
									`;	

									_i.cntImg++;

								}
							});
						}
						_i.exhibitionSliderHTML += '</div>';			
						_i.exhibitionSlider.innerHTML = _i.exhibitionSliderHTML;

						if(!_t.Slider){
							_t.Slider = new Slider(_t);	
						} else {
							_t.Slider.destroy(_t.Slider);
							_t.Slider = new Slider(_t);
						}
						_t.Slider.update( _i.exhibitionSlider.querySelectorAll('#exhibition .slider > .col'), 0);

					} else {

						document.querySelector('.exhibition_slider').style.display = 'none';

					}

					if(obj.photos && obj.photos !== null && obj.photos !== false){

						if(!_i.exhibitionPhotosWrapper){
							_i.exhibitionPhotosWrapper = document.querySelector('.exhibition_photos');
						}

						_i.exhibitionPhotosWrapper.innerHTML = `
							<div class="photos_title">
								<h3><small>Event</small><span>Photos</span></h3>
							</div>
						`;
						_i.exhibitionPhotosWrapper.appendChild( _i.processPhotoGallery(obj, false).html );


						_i.exhibitionPhotosWrapper.lightbox = new PhotoSwipeLightbox({
						  gallery: '.photo_gallery',
						  arrowPrevSVG: '<svg width="17" height="32" viewBox="0 0 17 32"><line x1="15" y2="15" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" /><line x1="15" y1="15" transform="translate(1.414 16.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" /></svg>',
						  arrowNextSVG: '<svg width="17" height="32" viewBox="0 0 17 32"><line x2="15" y2="15" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/><line y1="15" x2="15" transform="translate(1.414 16.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>',
						  closeSVG: '<svg width="32" height="32" viewBox="0 0 32 32"><line x2="30" y2="30" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/><line y1="30" x2="30" transform="translate(1.414 1.414)" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"/></svg>',
						  zoomSVG: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M0,0V8L3,5,6,8,8,6,5,3,8,0ZM10,8,8,10l3,3L8,16h8V8l-3,3Z" fill="#fff"/></svg>',
						  children: '.photos_item .item_data',
						  bgOpacity: 1,
						  pswpModule: PhotoSwipe
						});

						_i.exhibitionPhotosWrapper.lightbox.init();

					} else {

						if(!_i.exhibitionPhotosWrapper){
							_i.exhibitionPhotosWrapper = document.querySelector('.exhibition_photos');
						}
						_i.exhibitionPhotosWrapper.style.display = 'none';

					}

				}
			})

			document.querySelector('#exhibition *[data-field="artists"]').innerHTML = '';
			_i.exhibitionArtists.innerHTML = "";

			if(obj.artists && typeof obj.artists === 'object' && !Array.isArray(obj.artists)){
				obj.artists = [obj.artists];
			}

			if( Array.isArray(obj.artists) === true ){

				obj.artists_list = {};
				obj.artists_cnt = 0;

				for(_i.exhibArtist in obj.artists){

					if(!obj.artists_list[obj.artists_cnt]){

						_i.loadExternalData('artist', obj.artists[obj.artists_cnt], obj.artists_cnt, (_json, index)=>{

							if(_json){

								_json = JSON.parse(_json);

								if(_json[0] && _json[0].artist){

									obj.artists_list[index] = _json = _json[0].artist;

									let artistsHTML = `
										<div class="artist" data-bio="[artist][bio][en][jp]">
											<picture class="artist_avatar" onclick="window.dispatchEvent( new CustomEvent('openBio', { detail: `+index+`}) )">`;
												if(obj.artists_list[index].avatar){
													if(obj.artists_list[index].name[lang] && obj.artists_list[index].name[lang] !== ''){
														artistsHTML += `<img src="`+obj.artists_list[index].avatar+`" alt="`+obj.artists_list[index].name[lang]+`">`;
													} else if(obj.artists_list[index].name.en && obj.artists_list[index].name.en !== ''){
														artistsHTML += `<img src="`+obj.artists_list[index].avatar+`" alt="`+obj.artists_list[index].name.en+`">`;
													} else if(obj.artists_list[index].name.jp && obj.artists_list[index].name.jp !== ''){
														artistsHTML += `<img src="`+obj.artists_list[index].avatar+`" alt="`+obj.artists_list[index].name.jp+`">`;
													} else {
														artistsHTML += `<img src="`+obj.artists_list[index].avatar+`" alt="`+obj.artists_list[index].name.jp+`">`;
													}
												} else {
													artistsHTML += `<img src="assets/images/no-artist.png" alt="No artist">`;
												}
									artistsHTML += `
											</picture>`;

											if(obj.artists_list[index].name){
												if(obj.artists_list[index].name[lang] && obj.artists_list[index].name[lang] !== ''){
													artistsHTML += `<h4 class="artist_name">`+obj.artists_list[index].name[lang]+`</h4>`;
												} else if(obj.artists_list[index].name.en && obj.artists_list[index].name.en !== ''){
													artistsHTML += `<h4 class="artist_name">`+obj.artists_list[index].name.en+`</h4>`;
												} else if(obj.artists_list[index].name.jp && obj.artists_list[index].name.jp !== ''){
													artistsHTML += `<h4 class="artist_name">`+obj.artists_list[index].name.jp+`</h4>`;
												}
											} else {
												artistsHTML += `<h4 class="artist_name">No name</h4>`;
											}

									if(obj.artists_list[index].links){
										artistsHTML += `
												<ul class="artist_links">`;
													if(obj.artists_list[index].links.site){ artistsHTML += `<li><a href="`+obj.artists_list[index].links.site+`" target="_blank" class="ic-site"></a></li>`; }
													if(obj.artists_list[index].links.ig){ artistsHTML += `<li><a href="`+obj.artists_list[index].links.ig+`" target="_blank" class="ic-instagram"></a></li>`; }
													if(obj.artists_list[index].links.tw){ artistsHTML += `<li><a href="`+obj.artists_list[index].links.tw+`" target="_blank" class="ic-twitter"></a></li>`; }
													if(obj.artists_list[index].links.yt){ artistsHTML += `<li><a href="`+obj.artists_list[index].links.yt+`" target="_blank" class="ic-youtube"></a></li>`; }
													if(obj.artists_list[index].links.fb){ artistsHTML += `<li><a href="`+obj.artists_list[index].links.fb+`" target="_blank" class="ic-facebook"></a></li>`; }
										artistsHTML += `</ul>
												<button class="btn" onclick="window.dispatchEvent( new CustomEvent('openBio', { detail: `+index+`}) )">Read Bio</button>
											</div>`;	
									}

									_i.exhibitionArtists.innerHTML += artistsHTML;

								} else {

								}
							}
						})

					} else {

						let artistsHTML = `
							<div class="artist" data-bio="[artist][bio][en][jp]">
								<picture class="artist_avatar">`;
									if(obj.artists_list[obj.artists_cnt].avatar && obj.artists_list[obj.artists_cnt].bio){
										if(obj.artists_list[obj.artists_cnt].bio.en && obj.artists_list[obj.artists_cnt].bio[lang] !== ''){
											artistsHTML += `<img src="`+obj.artists_list[obj.artists_cnt].avatar+`" alt="`+obj.artists_list[obj.artists_cnt].bio[lang]+`">`;
										} else if(obj.artists_list[obj.artists_cnt].bio.en && obj.artists_list[obj.artists_cnt].bio.en !== ''){
											artistsHTML += `<img src="`+obj.artists_list[obj.artists_cnt].avatar+`" alt="`+obj.artists_list[obj.artists_cnt].bio.en+`">`;
										} else if(obj.artists_list[obj.artists_cnt].bio.jp && obj.artists_list[obj.artists_cnt].bio.jp !== ''){
											artistsHTML += `<img src="`+obj.artists_list[obj.artists_cnt].avatar+`" alt="`+obj.artists_list[obj.artists_cnt].bio.jp+`">`;
										}
									} else {
										artistsHTML += `<img src="assets/images/no-artist.png" alt="No artist">`;
									}
						artistsHTML += `
								</picture>`;

								if(obj.artists_list[obj.artists_cnt].name){
									if(obj.artists_list[obj.artists_cnt].name.en && obj.artists_list[obj.artists_cnt].name[lang] !== ''){
										artistsHTML += `<h4 class="artist_name">`+obj.artists_list[obj.artists_cnt].name[lang]+`</h4>`;
									} else if(obj.artists_list[obj.artists_cnt].name.en && obj.artists_list[obj.artists_cnt].name.en !== ''){
										artistsHTML += `<h4 class="artist_name">`+obj.artists_list[obj.artists_cnt].name.en+`</h4>`;
									} else if(obj.artists_list[obj.artists_cnt].name.jp && obj.artists_list[obj.artists_cnt].name.jp !== ''){
										artistsHTML += `<h4 class="artist_name">`+obj.artists_list[obj.artists_cnt].name.jp+`</h4>`;
									}
								} else {
									artistsHTML += `<h4 class="artist_name">No name</h4>`;
								}
						if(obj.artists_list[obj.artists_cnt].links){
							artistsHTML += `
									<ul class="artist_links">`;
										if(obj.artists_list[obj.artists_cnt].links.site){ artistsHTML += `<li><a href="`+obj.artists_list[obj.artists_cnt].links.site+`" target="_blank" class="ic-site"></a></li>`; }
										if(obj.artists_list[obj.artists_cnt].links.ig){ artistsHTML += `<li><a href="`+obj.artists_list[obj.artists_cnt].links.ig+`" target="_blank" class="ic-instagram"></a></li>`; }
										if(obj.artists_list[obj.artists_cnt].links.tw){ artistsHTML += `<li><a href="`+obj.artists_list[obj.artists_cnt].links.tw+`" target="_blank" class="ic-twitter"></a></li>`; }
										if(obj.artists_list[obj.artists_cnt].links.yt){ artistsHTML += `<li><a href="`+obj.artists_list[obj.artists_cnt].links.yt+`" target="_blank" class="ic-youtube"></a></li>`; }
										if(obj.artists_list[obj.artists_cnt].links.fb){ artistsHTML += `<li><a href="`+obj.artists_list[obj.artists_cnt].links.fb+`" target="_blank" class="ic-facebook"></a></li>`; }
							artistsHTML += `</ul>
									<button class="btn" onclick="window.dispatchEvent( new CustomEvent('openBio', { detail: `+obj.artists_list[obj.artists_cnt].index+`}) )">Read Bio</button>
								</div>`;	
						}

						document.querySelector('#exhibition *[data-field="artists"]').innerHTML += artistsHTML;
					}

					obj.artists_cnt++;
					
				}

				document.querySelector('#exhibition .exhibition_artists').style.display = 'flex';

			} else if(!obj.artists || obj.artists === ''){
				document.querySelector('#exhibition *[data-field="artists"]').innerHTML = '';
				document.querySelector('#exhibition .exhibition_artists').style.display = 'none';
			}

		}

	}

	_i.removeKeepClasses = (_keep)=>{

		if(_i.tmtOutDisplays){
			clearTimeout(_i.tmtOutDisplays);
		}

		if(!_i.containers){
			_i.containers = {};
			for(let idx in _i.bodyClasses){
				_i.containerID = _i.bodyClasses[idx].replace('_', '');
				if(document.getElementById(_i.containerID)){
					_i.containers[_i.bodyClasses[idx]] = { element: document.getElementById(_i.containerID), isActive: false };
				}
			}
		}
		
		if( _keep && Array.isArray(_keep) ){

			for(let idx in _i.bodyClasses){
				if( _keep.indexOf(_i.bodyClasses[idx]) < 0){
					_i.container = _i.containers[_i.bodyClasses[idx]];
					if(_i.container){
						_i.container.isActive = false;
					}
					document.body.classList.remove(_i.bodyClasses[idx]);
				}
			}

			for(let idx in _keep){
				_i.container = _i.containers[_keep[idx]];
				if(_i.container){
					_i.container.element.style.display = 'flex';
					_i.container.isActive = true;
				}

				document.body.classList.add(_keep[idx]);
			}

		} else if(_keep && _keep !== ''){

			for(let idx in _i.bodyClasses){
				if( _i.bodyClasses[idx] !== _keep ){
					_i.container = _i.containers[_i.bodyClasses[idx]];
					if(_i.container){
						_i.container.isActive = false;
					}
					document.body.classList.remove(_i.bodyClasses[idx]);
				}
			}

			_i.container = _i.containers[_keep];
			if(_i.container){
				_i.container.element.style.display = 'flex';
				_i.container.isActive = true;
			}

			document.body.classList.add(_keep);

		}

		_i.tmtOutDisplays = setTimeout( ()=>{
			for(let idx in _i.containers){
				if(_i.containers[idx].isActive === false){
					_i.containers[idx].element.style.display = 'none';	
				}
			}
		}, 800)

		
	}

	_i.setDynamicPositions = ()=>{
		if(_i.tmtOut){
			clearTimeout(_i.tmtOut);
		}
		_i.tmtOut = setTimeout( ()=>{
			_t.Elements.camera.offsets.left.getWorldPosition(_i.worldLeft);
			_t.Elements.camera.offsets.right.getWorldPosition(_i.worldRight);
			_t.Elements.camera.offsets.top.getWorldPosition(_i.worldTop);
			_t.Elements.camera.offsets.bottom.getWorldPosition(_i.worldBottom);
			_t.Elements.camera.offsets.target.getWorldPosition(_i.worldTarget);
			_i.switches.dynamicView = true;	
		}, 500)
	}

	_i.updateDynamicPositions = ()=>{
		_i.baseTarget.copy(_t.Screen.controls.getTarget())
		_i.dynamicPositionX.lerpVectors(_i.worldLeft, _i.worldRight, (_i.pointer.x+1)/2);
		_i.dynamicPositionY.lerpVectors(_i.worldBottom, _i.worldTop, (_i.pointer.y+1)/2);
		_i.dynamicPosition.set( _i.dynamicPositionX.x, _i.dynamicPositionY.y, _i.dynamicPositionX.z);
	}

	_i.disableDynamicPositions = () => {
 		_i.switches.dynamicView = false;
	}

	_i.clickToclose = ()=>{
		_i.heroElem.addEventListener( 'click', (event)=>{
			_i.disableDynamicPositions();
			_t.Screen.disableControls()
			_i.switches.raycasting = false;
			_i.onCloseHero(event, ()=>{
				_i.onLayoutChange({ detail: 'sphere' })
			});
		}, { once: true, capture: true, useCapture: true } );
	}

	_i.getContainers = ()=>{
		if(!_i.heroWrapper){
			_i.heroElem = document.querySelector('#hero');
			_i.heroWrapper = _i.heroElem.querySelector('.hero_wrapper');
			_i.heroTitle = _i.heroElem.querySelector('.hero_wrapper .title');
			_i.heroArtist = _i.heroElem.querySelector('.hero_wrapper .artist');
		}
	}
	_i.getExhibitionContainers = ()=>{
		if(!_i.exhibitionWrapper){
			_i.exhibitionElem = document.getElementById('exhibition');
			_i.exhibitionWrapper = _i.exhibitionElem.querySelector('.exhibition_wrapper');
			_i.exhibitionTitle = _i.exhibitionWrapper.querySelector('.title');
			_i.exhibitionArtist = _i.exhibitionWrapper.querySelector('.subtitle');
			_i.exhibitionContent = _i.exhibitionWrapper.querySelector('.exhibition_content .content');

			_i.exhibitionGallery = _i.exhibitionWrapper.querySelector('.exhibition_gallery .content');
			_i.exhibitionSlider = _i.exhibitionWrapper.querySelector('.exhibition_slider .content');
			_i.exhibitionPhotos = _i.exhibitionWrapper.querySelector('.exhibition_photos .content');

			_i.exhibitionDescription = _i.exhibitionWrapper.querySelector('.exhibition_description .content');
			_i.exhibitionDetails = _i.exhibitionWrapper.querySelector('.desc_details');
			_i.exhibitionArtists = _i.exhibitionWrapper.querySelector('.exhibition_artists .artists_list');
			if(!_i.exhibitionScroll){
				_i.exhibitionScroll = document.getElementById('exhibition_scroll');
				_i.exhibitionScrollContent = document.getElementById('exhibition_scroll_content');
			}
			_i.exhibitionScroll.addEventListener( 'scroll', _i.onScroll, false );

		}
	}

	_i.onPointerMove = ( event )=>{

		if(_i.switches.isClicked){
			_i.draggingDistance += 1;
			if(_i.draggingDistance > 5){
				_i.switches.isDragging = true;
				document.body.classList.add('noPointer');
			}
		}

		_i.deltaPointer.x = event.offsetX-_i.prevPointer.x;
		_i.deltaPointer.y = event.offsetY-_i.prevPointer.y;

		if(_i.switches.isDragging) {
		    _i.deltaRotationQuaternion.setFromEuler(new Euler(toRadians(_i.deltaPointer.y/10),toRadians(_i.deltaPointer.x/10),0,'XYZ'));
		    if(_i.current.exhibition){
		    	_i.tmpObj = _i.current.exhibition.mesh;
		    	_i.tmpObj.quaternion.multiplyQuaternions(_i.deltaRotationQuaternion, _i.tmpObj.quaternion);		
		    } else if(_i.current.section && _t.sections[_i.current.section.path].heroIsActive){
		    	_i.tmpObj = _t.sections[_i.current.section.path].exhibitions[_t.sections[_i.current.section.path].hero].mesh;
		    	_i.tmpObj.quaternion.multiplyQuaternions(_i.deltaRotationQuaternion, _i.tmpObj.quaternion);	
		    } else {
		    	_i.tmpObj = false;
		    }
		    
		}
		_i.prevPointer.x = event.offsetX;
		_i.prevPointer.y = event.offsetY;

		_i.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		_i.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		_i.pointer.z = 0.5;

		if(_i.switches.dynamicView){


			if(_i.cameraAnimation){
				_t.Motion.AUTO.remove(_i.cameraAnimation);
			}

			_i.updateDynamicPositions();

			_t.Screen.controls.setLookAt( 
				_i.dynamicPosition.x, _i.dynamicPosition.y, _i.dynamicPosition.z,
				_i.worldTarget.x, _i.worldTarget.y, _i.worldTarget.z,
				true
			)
		}

	}
	_i.onClick = ( event )=>{

		if(!_i.firstClick){
			_i.firstClick = true;
			window.dispatchEvent( new Event('playSound') );
		}

		if(_i.switches.raycasting && !_i.switches.isDragging){

			_i.switches.isDragging = false;
			document.body.classList.remove('noPointer');

			if(_i.current.hover){

				_t.Screen.controls.saveState();
				_i.lastPositionSaved = true;

				if(_i.current.exhibition){
					_i.onLeaveExhibition( event, _i.current.exhibition, ()=>{})
					_i.onEnterExhibition(event, _i.current.hover._parent)		
				} else {
					_i.onEnterExhibition(event, _i.current.hover._parent)
				}
				
			} else {

				if(_i.current.section.exhibitionIsActive){
					_i.onLeaveExhibition( event, _i.current.exhibition, ()=>{

					})			
				}	
			}
		}
	}
	_i.onMouseUp = ( event )=>{
		
		_i.switches.isClicked = false;
		_i.draggingDistance = 0;
		_i.switches.isDragging = false;
		document.body.classList.remove('noPointer');

		if(_i.tmpObj){
			new _t.TWEEN.Tween(_i.tmpObj.rotation,  _t.Motion.AUTO ).to({x: 0, y: 0, z: 0}, 300 ).easing( _t.TWEEN.Easing.Exponential.Out ).onComplete((v)=>{
				_i.tmpObj = false;
			}).start();
		}
	}
	_i.onMouseDown = ( event )=>{
		_i.switches.isClicked = true;
		_i.draggingDistance = 0;
	}

	_i.onTouchMove = ( event )=>{

		if(_i.switches.isClicked){
			_i.draggingDistance += 1;
			if(_i.draggingDistance > 5){
				_i.switches.isDragging = true;
				document.body.classList.add('noPointer');
			}
		}

		_i.deltaPointer.x = event.changedTouches[0].clientX-_i.prevPointer.x;
		_i.deltaPointer.y = event.changedTouches[0].clientY-_i.prevPointer.y;

		if(_i.switches.isDragging) {
		    _i.deltaRotationQuaternion.setFromEuler(new Euler(toRadians(_i.deltaPointer.y/10),toRadians(_i.deltaPointer.x/10),0,'XYZ'));
		    if(_i.current.exhibition){
		    	_i.tmpObj = _i.current.exhibition.mesh;
		    	_i.tmpObj.quaternion.multiplyQuaternions(_i.deltaRotationQuaternion, _i.tmpObj.quaternion);		
		    } else if(_i.current.section && _t.sections[_i.current.section.path].heroIsActive){
		    	_i.tmpObj = _t.sections[_i.current.section.path].exhibitions[_t.sections[_i.current.section.path].hero].mesh;
		    	_i.tmpObj.quaternion.multiplyQuaternions(_i.deltaRotationQuaternion, _i.tmpObj.quaternion);	
		    } else {
		    	_i.tmpObj = false;
		    }
		    
		}
		_i.prevPointer.x = event.changedTouches[0].clientX;
		_i.prevPointer.y = event.changedTouches[0].clientY;

		_i.pointer.x = ( event.changedTouches[0].clientX / window.innerWidth ) * 2 - 1;
		_i.pointer.y = - ( event.changedTouches[0].clientY / window.innerHeight ) * 2 + 1;
		_i.pointer.z = 0.5;

		if(_i.switches.dynamicView){

			if(_i.cameraAnimation){
				_t.Motion.AUTO.remove(_i.cameraAnimation);
			}

			_i.updateDynamicPositions();

			_t.Screen.controls.setLookAt( 
				_i.dynamicPosition.x, _i.dynamicPosition.y, _i.dynamicPosition.z,
				_i.worldTarget.x, _i.worldTarget.y, _i.worldTarget.z,
				true
			)
		}

	}
	_i.onTouch = ( event )=>{

		_i.prevPointer.x = event.changedTouches[0].clientX;
		_i.prevPointer.y = event.changedTouches[0].clientY;

		_i.pointer.x = ( event.changedTouches[0].clientX / window.innerWidth ) * 2 - 1;
		_i.pointer.y = - ( event.changedTouches[0].clientY / window.innerHeight ) * 2 + 1;
		_i.pointer.z = 0.5;


		if(_i.switches.raycasting && !_i.switches.isDragging){
			_i.switches.isDragging = false;
			document.body.classList.remove('noPointer');

			if(_i.current.hover){

				_t.Screen.controls.saveState();
				_i.lastPositionSaved = true;

				if(_i.current.exhibition){
					_i.onLeaveExhibition( event, _i.current.exhibition, ()=>{})
					_i.onEnterExhibition(event, _i.current.hover._parent)		
				} else {
					_i.onEnterExhibition(event, _i.current.hover._parent)
				}
				
			} else {

				if(_i.current.section.exhibitionIsActive){
					_i.onLeaveExhibition( event, _i.current.exhibition, ()=>{

					})			
				}	
			}
		}
	}
	_i.onTouchUp = ( event )=>{

		_i.prevPointer.x = event.changedTouches[0].clientX;
		_i.prevPointer.y = event.changedTouches[0].clientY;

		_i.pointer.x = ( event.changedTouches[0].clientX / window.innerWidth ) * 2 - 1;
		_i.pointer.y = - ( event.changedTouches[0].clientY / window.innerHeight ) * 2 + 1;
		_i.pointer.z = 0.5;

		_i.switches.isClicked = false;
		_i.draggingDistance = 0;
		_i.switches.isDragging = false;
		document.body.classList.remove('noPointer');

		if(_i.tmpObj){
			new _t.TWEEN.Tween(_i.tmpObj.rotation,  _t.Motion.AUTO ).to({x: 0, y: 0, z: 0}, 300 ).easing( _t.TWEEN.Easing.Exponential.Out ).onComplete((v)=>{
				_i.tmpObj = false;
			}).start();
		}
	}

	_i.onTouchDown = ( event )=>{

		_i.prevPointer.x = event.changedTouches[0].clientX;
		_i.prevPointer.y = event.changedTouches[0].clientY;

		_i.pointer.x = ( event.changedTouches[0].clientX / window.innerWidth ) * 2 - 1;
		_i.pointer.y = - ( event.changedTouches[0].clientY / window.innerHeight ) * 2 + 1;
		_i.pointer.z = 0.5;

		_i.switches.isClicked = true;
		_i.draggingDistance = 0;

		_i.onTouch(event);
	}


	_i.onScroll = ( event )=>{
		if(!_i.exhibitionScroll){
			_i.exhibitionScroll = document.getElementById('exhibition_scroll');
			_i.exhibitionScrollContent = document.getElementById('exhibition_scroll_content');
		}
		_i.exhibitionScroll_rect = _i.exhibitionScroll.getBoundingClientRect(); 
		_i.arrows_opacity = _i.exhibitionScroll.scrollTop / (_i.exhibitionScrollContent.scrollHeight - window.innerHeight); // _i.exhibitionScroll_rect.height
 		_i.arrows_opacity = Math.max(0, Math.min(1, Math.cos(_i.arrows_opacity * 2 * Math.PI)));
		
	}

	_i.onTriggerMenu = ( event )=>{

		if(_i.current.exhibition){
			_i.onLeaveExhibition(event, _i.current.exhibition, ()=>{
				_i.onTriggerMenu( event );
			});
			return false;
		}

		if(_i.current.section.heroIsActive){
			_i.onCloseHero(event, ()=>{
				_i.onTriggerMenu( event );
			});
			return false;
		}

		if(!_i.current.menuDetails){
			_i.current.menuDetails = {
				exhibition: _i.current.exhibition,
				section: _i.current.section,
				prevSection: _i.current.prevSection
			}
		}

		_i.cancelEverything();

		if( _i.switches.isMenuOpen && !_i.current.section && _i.current.menuDetails){

			_i.switches.isMenuOpen = false;

			if(event.detail){

				_i.onTravelTo(event, false, true );

			} else {

				if(_i.current.menuDetails.section && _i.current.menuDetails.section.path !== 'home'){
					if(_i.current.menuDetails.exhibition !== false){
						_i.onTravelTo({ detail: _i.current.menuDetails.exhibition.name}, false, true );
					} else if(_i.current.menuDetails.section !== false){
						_i.onTravelTo({ detail: _i.current.menuDetails.section.path}, false, true );
					} else if(_i.current.menuDetails.prevSection){
						_i.onTravelTo({ detail: _i.current.menuDetails.prevSection.path}, false, true );
					} else {
						console.log("CHECK THIS 2 > ", event);
					}
				} else {

					_i.removeKeepClasses('_home');
					_i.onTravelTo({ detail: 'home'}, false, true );

				}
				_i.current.menuDetails = false;
			}
			
		} else if( _i.switches.isMenuOpen ){

			_i.switches.isMenuOpen = false;

			if(event.detail){

				_i.onTravelTo(event, false, true );

			} else {

				if(_i.current.section && _i.current.section.path !== 'home'){

					if(_i.current.exhibition !== false){
						_i.onTravelTo({ detail: _i.current.exhibition.name}, false, true );
					} else if(_i.current.section !== false){
						_i.onTravelTo({ detail: _i.current.section.path}, false, true );
					} else if(_i.current.prevSection){
						_i.onTravelTo({ detail: _i.current.prevSection.path}, false, true );
					} else {
						console.warn("CHECK THIS 2 > ", event);
					}

				} else {
					_i.removeKeepClasses('_home');
					_i.onTravelTo({ detail: 'home'}, false, true );
				}
			}

			_i.current.menuDetails = false;

		} else {

			_i.switches.isMenuOpen = true;
			_i.removeKeepClasses('_menu');
			_i.onTravelTo({ detail: 'menu'}, false, true);
		}
	}

	_i.onOpenHero = ()=>{

		_t.Screen.controls.minZoom = 0.7;
		_t.Screen.controls.zoomTo(1.0, true);

		if(_i.current.exhibition){
			_i.onLeaveExhibition( event, _i.current.exhibition)	
		}

		_i.switches.raycasting = false;
		_i.switches.canScroll = false;

		_i.disableDynamicPositions();
		_t.Screen.disableControls()

		_t.Screen.focusDistance = 100;

		_t.darkBackground();

		_i.getContainers();
		_i.clickToclose();

		if(_i.current.section.heroAnimation){
			_t.Motion.AUTO.remove(_i.current.section.heroAnimation);
		}

		if(_i.current.section && _i.current.section.exhibitions && typeof _i.current.section.hero !=='undefined'){

			const current = _i.current.section.path;
			const _currentExhibition = _t.sections[current].exhibitions[_t.sections[current].hero];
			_t.sections[current].heroIsActive = true;

			_i.setMarkup('hero', _currentExhibition);

			_i.heroElem.classList.add('visible');

			if(_t.params.gpu.isMobile || window.innerWidth < 1024){

				_t.sections[current].heroAnimation = new _t.TWEEN.Tween({
					position: _currentExhibition.mesh.position.y,
					scale: _currentExhibition.bubble.scale.x,
					color: _t.sections[current].exhibitions[Math.max(0, _t.sections[current].exhibitions.length - 1)].mesh.material.color
				},  _t.Motion.AUTO ).to({
					position: 300,
					scale: 1500,
					color: {r: 0.1, g: 0.1, b: 0.1}
				}, 1000 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
					if(_t.sections[current] && _t.sections[current].exhibitions){

						_currentExhibition.mesh.position.y = v.position;
						_currentExhibition.bubble.scale.set(v.scale, v.scale, v.scale);

						for (_i.cnt = 0; _i.cnt < _t.sections[current].exhibitions.length; _i.cnt++) {
							if(_t.sections[current].exhibitions[_t.sections[current].hero].ID !== _t.sections[current].exhibitions[_i.cnt].ID){
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.r = v.color.r;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.g = v.color.g;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.b = v.color.b;
							}
						}
					}
				}).onComplete((v)=>{

					_i.setDynamicPositions();

					window.dispatchEvent( new Event('sectionReady') );

				}).start();

			} else {

				_t.sections[current].heroAnimation = new _t.TWEEN.Tween({
					position: _currentExhibition.mesh.position.x,
					scale: _currentExhibition.bubble.scale.x,
					color: _t.sections[current].exhibitions[Math.max(0, _t.sections[current].exhibitions.length - 1)].mesh.material.color
				},  _t.Motion.AUTO ).to({
					position: -300,
					scale: 1500,
					color: {r: 0.1, g: 0.1, b: 0.1}
				}, 1000 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
					if(_t.sections[current] && _t.sections[current].exhibitions){

						_currentExhibition.mesh.position.x = v.position; // 0
						
						_currentExhibition.bubble.scale.set(v.scale, v.scale, v.scale) // 500
						for (_i.cnt = 0; _i.cnt < _t.sections[current].exhibitions.length; _i.cnt++) {
							if(_t.sections[current].exhibitions[_t.sections[current].hero].ID !== _t.sections[current].exhibitions[_i.cnt].ID){
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.r = v.color.r;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.g = v.color.g;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.b = v.color.b;
							}
						}
					}
				}).onComplete((v)=>{

					_i.setDynamicPositions();

					window.dispatchEvent( new Event('sectionReady') );

				}).start();
			}
		}
	}

	_i.onCloseHero = (event, _callback)=>{

		_i.disableDynamicPositions();
		_t.Screen.disableControls()

		_i.switches.raycasting = false;
		_i.switches.canScroll = false;
		_t.Screen.focusDistance = 600;

		_t.lightBackground();

		if(_i.current.section.heroAnimation){
			_t.Motion.AUTO.remove(_i.current.section.heroAnimation);
		}

		_i.getContainers();

		_i.removeKeepClasses('_section');
		_i.heroElem.classList.remove('visible');

		if(_i.current.section.heroIsActive && _i.current.section && _i.current.section.exhibitions && typeof _i.current.section.hero !=='undefined'){

			let current = _i.current.section.path;

			if(_t.params.gpu.isMobile || window.innerWidth < 1024){

				_t.sections[current].heroAnimation = new _t.TWEEN.Tween({
					position: _t.sections[current].exhibitions[_t.sections[current].hero].mesh.position.y,
					scale: _t.sections[current].exhibitions[_t.sections[current].hero].bubble.scale.x,
					color: _t.sections[current].exhibitions[_t.sections[current].hero].mesh.material.color
				},  _t.Motion.AUTO ).to({
					position: 0,
					scale: 500,
					color: {r: 1, g: 1, b: 1}
				}, 1000 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
					if(_t.sections[current] && _t.sections[current].exhibitions && typeof _t.sections[current].hero !=='undefined'){
						_t.sections[current].exhibitions[_t.sections[current].hero].mesh.position.y = v.position; // 0
						_t.sections[current].exhibitions[_t.sections[current].hero].bubble.scale.set(v.scale, v.scale, v.scale) // 500
						for (_i.cnt = 0; _i.cnt < _t.sections[current].exhibitions.length; _i.cnt++) {
							if(_t.sections[current].exhibitions[_t.sections[current].hero].ID !== _t.sections[current].exhibitions[_i.cnt].ID){
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.r = v.color.r;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.g = v.color.g;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.b = v.color.b;
							}
						}
	 				}
				}).onComplete((v)=>{

					_t.sections[current].heroIsActive = false;

					_i.heroTitle.innerHTML = '';
					_i.heroArtist.innerHTML = '';

					_i.switches.raycasting = true;

					_i.onUpdatePath('section', _i.current.section.title);

					_t.Screen.enableControls()

					if(_callback) _callback();

				}).start();

			} else {

				_t.sections[current].heroAnimation = new _t.TWEEN.Tween({
					position: _t.sections[current].exhibitions[_t.sections[current].hero].mesh.position.x,
					scale: _t.sections[current].exhibitions[_t.sections[current].hero].bubble.scale.x,
					color: _t.sections[current].exhibitions[_t.sections[current].hero].mesh.material.color
				},  _t.Motion.AUTO ).to({
					position: 0,
					scale: 500,
					color: {r: 1, g: 1, b: 1}
				}, 1000 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
					if(_t.sections[current] && _t.sections[current].exhibitions && typeof _t.sections[current].hero !=='undefined'){
						_t.sections[current].exhibitions[_t.sections[current].hero].mesh.position.x = v.position; // 0
						_t.sections[current].exhibitions[_t.sections[current].hero].bubble.scale.set(v.scale, v.scale, v.scale) // 500
						for (_i.cnt = 0; _i.cnt < _t.sections[current].exhibitions.length; _i.cnt++) {
							if(_t.sections[current].exhibitions[_t.sections[current].hero].ID !== _t.sections[current].exhibitions[_i.cnt].ID){
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.r = v.color.r;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.g = v.color.g;
								_t.sections[current].exhibitions[_i.cnt].mesh.material.color.b = v.color.b;
							}
						}
					}
				}).onComplete((v)=>{

					_t.sections[current].heroIsActive = false;

					_i.heroTitle.innerHTML = '';
					_i.heroArtist.innerHTML = '';

					_i.switches.raycasting = true;

					_i.onUpdatePath('section', _i.current.section.title);

					_t.Screen.enableControls()

					if(_callback) _callback();

				}).start();

			}

		} else {
			
			_i.switches.raycasting = true;

			_t.Screen.enableControls()

			_i.onUpdatePath('section', _i.current.section.title);

			if(_callback) _callback();		

		}
	}

	_i.onEnterSection = (event, _callback)=>{

		_t.Screen.controls.minZoom = 0.7;
		_t.Screen.controls.zoomTo(1.0, true);

		_i.disableDynamicPositions();
		_t.Screen.disableControls()

		_i.switches.raycasting = false;
		_i.switches.canScroll = false;

		_t.Screen.controls.saveState();
		_i.lastPositionSaved = true;

		if(_i.current.exhibition){
			_i.onLeaveExhibition( event, _i.current.exhibition)	
		}

		if(_i.current.section && _i.current.section.exhibitions){

			_i.onUpdatePath('section', _i.current.section.title);

			if(_i.exhibAnimation){
				_t.Motion.AUTO.remove(_i.exhibAnimation);
			}
			if(_i.cameraAnimation){
				_t.Motion.AUTO.remove(_i.cameraAnimation);
			}

			_i.exhibAnimation = new _t.TWEEN.Tween(_i.current.section.exhibitions[_i.current.section.hero].object.position,  _t.Motion.AUTO ).to({
				z: -600
			}, 1500 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onComplete((v)=>{

				if(_i.current.section && _i.current.section.exhibitions && typeof _i.current.section.hero !=='undefined'){

					_i.removeKeepClasses('_hero');

					window.dispatchEvent( new Event('openHero') );

					if(_callback) _callback();

				} else {

					_i.removeKeepClasses('_section');

					_i.switches.raycasting = true;

					window.dispatchEvent( new Event('sectionReady') );

					_t.Screen.enableControls()

					if(_callback) _callback();

				}

			}).start();

		}
	}
 

	_i.onLeaveExhibition = ( event, exhibition, _callback)=>{

		_i.parallaxPhotos = false;

		_i.disableDynamicPositions();
		_t.Screen.disableControls()
		_i.switches.raycasting = false;
		_i.switches.canScroll = false;

		if(_i.cameraAnimation){
			_t.Motion.AUTO.remove(_i.cameraAnimation);
		}
		if(_i.layoutAnim){
			_t.Motion.AUTO.remove(_i.layoutAnim);
		}
		if(_i.layoutTmt){
			clearTimeout(_i.layoutTmt);
		}

		if(!exhibition){
			exhibition = _i.current.exhibition;
		} 

		_i.removeKeepClasses();
		_i.getExhibitionContainers();
		_i.exhibitionElem.classList.remove('visible');
		_i.current.exhibition = false;
		_i.current.section.exhibitionIsActive = false;
		_t.triggerControls = false;
		
		exhibition.cameraPosition.getWorldPosition(_i.tmpVector);

		if(_i.lastPositionSaved){
			_t.Screen.controls.reset(true);
			if(_i.currentLayout === 'table' || _i.currentLayout === 'grid'){
				_t.triggerControls = 'drag';
			} else {
				_t.triggerControls = 'rotate';	
			}
		} else {
			_i.onLayoutChange({detail: _i.currentLayout})
		}
 
		

		new _t.TWEEN.Tween({
			clusterOpacity: _i.current.section.gas.material.opacity,
		},  _t.Motion.AUTO ).to({
			clusterOpacity: _i.current.section.gas_opacity,
		}, 300 ).onUpdate((v2)=>{
			_i.current.section.gas.material.opacity = v2.clusterOpacity;
		}).start();

		if(exhibition.exhibAnimation){
			_t.Motion.AUTO.remove(exhibition.exhibAnimation);
		}

		if(_i.current.lenis){
			_i.current.lenis.destroy();
			_i.current.lenis = false;
			delete _t.Motion.animations.lenis;
			_i.current.lenisWrapper.scrollTop = 0;
		}

		exhibition.exhibAnimation = new _t.TWEEN.Tween({
			scale: exhibition.meshHD.scale.x,
			scale2x: exhibition.mesh.scale.x,
			scale2y: exhibition.mesh.scale.y,
			position: exhibition.mesh.position.y,
			displacement: exhibition.extrudedMat.displacementScale,
			opacity: exhibition.extrudedMat.opacity,
			bubble: exhibition.bubble.scale.x,
			hideOthers: _i.otherExhibitions,
		},  _t.Motion.AUTO ).to({
			displacement: 0,
			scale: 0,
			opacity: 0,
			bubble: 500,
			scale2x: exhibition.mesh.originalScale.x, 
			scale2y: exhibition.mesh.originalScale.y, 
			position: 0,
			hideOthers: 1
		}, 1000 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v2)=>{

			_i.otherExhibitions = v2.hideOthers;

			for(_i.tmpCnt in _i.current.section.exhibitions){
				if(_i.current.section.exhibitions[_i.tmpCnt] !== exhibition){
					_i.current.section.exhibitions[_i.tmpCnt].object.scale.set(_i.otherExhibitions, _i.otherExhibitions, _i.otherExhibitions);
				}
			}

			exhibition.meshHD.scale.set(v2.scale, v2.scale/exhibition.ratio, v2.scale);
			exhibition.mesh.scale.set(v2.scale2x, v2.scale2y, 1);
			exhibition.mesh.position.y = v2.position;

			exhibition.extrudedMat.opacity = v2.opacity;
			exhibition.extrudedMat.displacementScale = v2.displacement;
			exhibition.extrudedMat.needsUpdate = true;

			exhibition.bubble.scale.set(v2.bubble, v2.bubble, v2.bubble);

			_t.Elements.dust.toggle(v2.opacity, v2.scale);

		}).onComplete((v2)=>{

			_i.onUpdatePath('section',_i.current.section.title);
			_i.removeKeepClasses('_section');

			_i.switches.raycasting = true;
			_i.switches.canScroll = false;

			if(_t.triggerControls){
				_t.Screen.enableControls();
				_t.Screen.changeControls(_t.triggerControls);	
			}

			if(_callback) _callback();

		}).start();

		
	}

	_i.onJumpLeaveExhibition = ( event, exhibition, _callback)=>{

		if(!exhibition){
			exhibition = _i.current.exhibition;
		}

		_i.parallaxPhotos = false;

		_i.disableDynamicPositions();
		_t.Screen.disableControls()

		_i.switches.raycasting = false;
		_i.switches.canScroll = false;

		_i.getExhibitionContainers();

		_i.exhibitionElem.classList.remove('visible');
		
		_i.current.exhibition = false;
		_i.current.section.exhibitionIsActive = false;
		
		if(_i.cameraAnimation){
			_t.Motion.AUTO.remove(_i.cameraAnimation);
		}

		exhibition.cameraPosition.getWorldPosition(_i.tmpVector);

		switch(_i.currentLayout){
			case 'table':

				_i.tmpVector = _i.tmpVector.lerp(_i.current.section['3d'].coordinates, 1.1)

				_t.Screen.controls.setLookAt(
					_i.tmpVector.x, 
					_i.tmpVector.y, 
					_i.tmpVector.z, 

					_t.Elements.camera.position.x, 
					_t.Elements.camera.position.y, 
					_t.Elements.camera.position.z, 

					true);
			break;
			case 'sphere':

				_i.tmpVector = _i.tmpVector.lerp(_i.current.section['3d'].coordinates, 1.1)

				_t.Screen.controls.setLookAt(
					_i.tmpVector.x, 
					_i.tmpVector.y, 
					_i.tmpVector.z, 

					_t.Elements.camera.position.x, 
					_t.Elements.camera.position.y, 
					_t.Elements.camera.position.z, 

					true);
			break;
			case 'helix':

				_i.tmpVector = _i.tmpVector.lerp(_i.current.section['3d'].coordinates, 1.1)

				_t.Screen.controls.setLookAt(
					_i.tmpVector.x, 
					_i.tmpVector.y, 
					_i.tmpVector.z, 

					_t.Elements.camera.position.x, 
					_t.Elements.camera.position.y, 
					_t.Elements.camera.position.z, 

					true);
			break;
			case 'grid':

				_i.tmpVector = _i.tmpVector.lerp(_i.current.section['3d'].coordinates, 1.1)

				_t.Screen.controls.setLookAt(
					_i.tmpVector.x, 
					_i.tmpVector.y, 
					_i.tmpVector.z, 

					_t.Elements.camera.position.x, 
					_t.Elements.camera.position.y, 
					_t.Elements.camera.position.z, 

					true);
			break;
		}

		new _t.TWEEN.Tween({
			clusterOpacity: _i.current.section.gas.material.opacity
		},  _t.Motion.AUTO ).to({
			clusterOpacity: _i.current.section.gas_opacity,
		}, 300 ).onUpdate((v2)=>{
			_i.current.section.gas.material.opacity = v2.clusterOpacity;
		}).start();

		if(exhibition.exhibAnimation){
			_t.Motion.AUTO.remove(exhibition.exhibAnimation);
		}

		if(_i.current.lenis){
			_i.current.lenis.destroy();
			_i.current.lenis = false;
			delete _t.Motion.animations.lenis;
			_i.current.lenisWrapper.scrollTop = 0;
		}

		exhibition.exhibAnimation = new _t.TWEEN.Tween({
			scale: exhibition.meshHD.scale.x,
			scale2x: exhibition.mesh.scale.x,
			scale2y: exhibition.mesh.scale.y,
			position: exhibition.mesh.position.y,
			displacement: exhibition.extrudedMat.displacementScale,
			opacity: exhibition.extrudedMat.opacity,
			bubble: exhibition.bubble.scale.x,
			hideOthers: _i.otherExhibitions,
		},  _t.Motion.AUTO ).to({
			displacement: 0,
			scale: 0,
			opacity: 0,
			bubble: 500,
			scale2x: exhibition.mesh.originalScale.x, 
			scale2y: exhibition.mesh.originalScale.y, 
			position: 0,
			hideOthers: 1
		}, 500 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v2)=>{

			_i.otherExhibitions = v2.hideOthers;
			for(_i.tmpCnt in _i.current.section.exhibitions){
				if(_i.current.section.exhibitions[_i.tmpCnt] !== exhibition){
					_i.current.section.exhibitions[_i.tmpCnt].object.scale.set(_i.otherExhibitions, _i.otherExhibitions, _i.otherExhibitions);
				}
			}

			exhibition.meshHD.scale.set(v2.scale,v2.scale/exhibition.ratio,v2.scale);
			exhibition.mesh.scale.set(v2.scale2x,v2.scale2y,1);
			exhibition.mesh.position.y = v2.position;

			exhibition.extrudedMat.opacity = v2.opacity;
			exhibition.extrudedMat.displacementScale = v2.displacement;
			exhibition.extrudedMat.needsUpdate = true;

			exhibition.bubble.scale.set(v2.bubble, v2.bubble, v2.bubble);

			_t.Elements.dust.toggle(v2.opacity, v2.scale);

		}).onComplete((v2)=>{

			_t.Screen.controls.minZoom = 0.7;
			_t.Screen.controls.zoomTo(1.0, true);

			if(exhibition.title && exhibition.title[lang] && exhibition.title[lang] !== ""){
				_i.onUpdatePath('exhibition', exhibition.title[lang]);
			} else if(exhibition.title && exhibition.title.en && exhibition.title.en !== ""){
				_i.onUpdatePath('exhibition', exhibition.title.en);
			} else if(exhibition.title && exhibition.title.jp && exhibition.title.jp !== ""){
				_i.onUpdatePath('exhibition', exhibition.title.jp);
			} else if(exhibition.title){
				_i.onUpdatePath('exhibition', exhibition.title);
			}

			window.dispatchEvent( new Event('enterExhibition') );

			if(_callback) _callback();

		}).start();
	}

	_i.onExpandHero = (event,exhibition, _callback)=>{

		_i.disableDynamicPositions();
		_t.Screen.disableControls()

		_i.switches.raycasting = false;
		_i.switches.canScroll = false;
		_t.Screen.focusDistance = 600;

		_t.lightBackground();

		if(_i.current.section.heroAnimation){
			_t.Motion.AUTO.remove(_i.current.section.heroAnimation);
		}

		_i.getContainers();

		_i.removeKeepClasses('_section');
		_i.heroElem.classList.remove('visible');

		const section = _i.current.section;
		const cluster = _i.current.cluster;
		_i.current.exhibition = exhibition;


		if(!exhibition && _i.initial && _i.initial.exhibition){
			exhibition = _i.initial.exhibition;
			delete _i.initial.exhibition;
			delete _i.initial;
		}

		if(!exhibition.colors){
			exhibition.colors = new GetColors(_t, exhibition.texture.image);
			_t.Elements.dust.toggle(0, 0);
			_t.Elements.dust.setColors(exhibition.colors);
		}
		
		if(_i.cameraAnimation){
			_t.Motion.AUTO.remove(_i.cameraAnimation);
		}

		if(exhibition.exhibAnimation){
			_t.Motion.AUTO.remove(exhibition.exhibAnimation);
		}

		if(_i.current.lenis){
			_i.current.lenis.destroy();
			_i.current.lenis = false;
			delete _t.Motion.animations.lenis;
			_i.current.lenisWrapper.scrollTop = 0;
		}

		_i.tmpVectorTarget = _t.Screen.controls.getTarget(_i.tmpVectorTarget);

		if(!exhibition.hdTex && exhibition.poster.hero){
			exhibition.hdTex = _t.Loaders.texLoader.load( exhibition.poster.hero, (tx)=>{
				tx.encoding = sRGBEncoding;
				tx.wrapS = tx.wrapT = RepeatWrapping;
				exhibition.mesh.material.map = tx;
			});
		}

		if(_t.params.gpu.isMobile || window.innerWidth < 1024){

			section.heroAnimation = new _t.TWEEN.Tween({
				position: exhibition.mesh.position.y,
				scale: exhibition.bubble.scale.x,
				color: exhibition.mesh.material.color,
				objPos: exhibition.object.position
			},  _t.Motion.AUTO ).to({
				position: 0,
				scale: 500,
				color: {r: 1, g: 1, b: 1},
				objPos: cluster.targets.sphere[0].position
			}, 800 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
				if(section && section.exhibitions && typeof section.hero !=='undefined'){
					exhibition.mesh.position.y = v.position; // 0
					exhibition.bubble.scale.set(v.scale, v.scale, v.scale) // 500
				}

				exhibition.cameraPosition.getWorldPosition(_i.originalHeroCamPos);
				exhibition.object.position.set(v.objPos.x, v.objPos.y, v.objPos.z);
				exhibition.object.getWorldPosition(_i.originalHeroCamLook);

				_t.Screen.controls.setLookAt( _i.originalHeroCamPos.x,_i.originalHeroCamPos.y,_i.originalHeroCamPos.z, _i.originalHeroCamLook.x,_i.originalHeroCamLook.y,_i.originalHeroCamLook.z, true );
			});

		} else {

			section.heroAnimation = new _t.TWEEN.Tween({
				position: exhibition.mesh.position.x,
				scale: exhibition.bubble.scale.x,
				color: exhibition.mesh.material.color,
				objPos: exhibition.object.position
			},  _t.Motion.AUTO ).to({
				position: 0,
				scale: 500,
				color: {r: 1, g: 1, b: 1},
				objPos: cluster.targets.sphere[0].position
			}, 800 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
				if(section && section.exhibitions && typeof section.hero !=='undefined'){
					exhibition.mesh.position.x = v.position; // 0
					exhibition.bubble.scale.set(v.scale, v.scale, v.scale) // 500
				}

				exhibition.cameraPosition.getWorldPosition(_i.originalHeroCamPos);
				exhibition.object.position.set(v.objPos.x, v.objPos.y, v.objPos.z);
				exhibition.object.getWorldPosition(_i.originalHeroCamLook);

				_t.Screen.controls.setLookAt( _i.originalHeroCamPos.x,_i.originalHeroCamPos.y,_i.originalHeroCamPos.z, _i.originalHeroCamLook.x,_i.originalHeroCamLook.y,_i.originalHeroCamLook.z, true );
			});

		}

		section.heroAnimation.onComplete((v)=>{

			section.heroIsActive = false;
			_i.heroTitle.innerHTML = '';
			_i.heroArtist.innerHTML = '';

			section.gas_opacity = section.gas.material.opacity;
			
			new _t.TWEEN.Tween({
				clusterOpacity: section.gas.material.opacity
			},  _t.Motion.AUTO ).to({
				clusterOpacity: 0,
			}, 600 ).onUpdate((v2)=>{
				section.gas.material.opacity = v2.clusterOpacity;
			}).start();

			exhibition.exhibAnimation = new _t.TWEEN.Tween({
				scale: exhibition.meshHD.scale.x,
				scale2x: exhibition.mesh.scale.x,
				scale2y: exhibition.mesh.scale.y,
				position: exhibition.mesh.position.y,
				displacement: exhibition.extrudedMat.displacementScale,
				opacity: 0,
				bubble: exhibition.bubble.scale.x,
			},  _t.Motion.AUTO ).to({
				displacement: -200,
				scale: 1.8,
				scale2x: exhibition.mesh.originalScale.x*1.5,
				scale2y: exhibition.mesh.originalScale.y*1.5,
				position: _i.heroOffset,
				bubble: 2500,
				opacity: 1,
				
			}, 600 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v2)=>{

				exhibition.meshHD.scale.set(v2.scale,v2.scale/exhibition.ratio,v2.scale);

				exhibition.extrudedMat.opacity = v2.opacity;
				exhibition.extrudedMat.displacementScale = v2.displacement;
				exhibition.extrudedMat.needsUpdate = true;

				exhibition.bubble.scale.set(v2.bubble, v2.bubble, v2.bubble);

				exhibition.mesh.scale.set(v2.scale2x,v2.scale2y,1);
				exhibition.mesh.position.y = v2.position;
				
				exhibition.mesh.getWorldPosition(_t.Elements.dust.mesh.position);

				_t.Elements.dust.toggle(v2.opacity, v2.scale);

			}).onComplete((v2)=>{

				if(exhibition.title && exhibition.title[lang] && exhibition.title[lang] !== ""){
					_i.onUpdatePath('exhibition', exhibition.title[lang]);
				} else if(exhibition.title && exhibition.title.en && exhibition.title.en !== ""){
					_i.onUpdatePath('exhibition', exhibition.title.en);
				} else if(exhibition.title && exhibition.title.jp && exhibition.title.jp !== ""){
					_i.onUpdatePath('exhibition', exhibition.title.jp);
				} else if(exhibition.title){
					_i.onUpdatePath('exhibition', exhibition.title);
				}

				_i.setDynamicPositions();

				_i.removeKeepClasses('_exhibition');

				window.dispatchEvent( new Event('exhibitionReady') );

				_t.Screen.focusDistance = 100;

				_i.getExhibitionContainers();

				_i.setMarkup('exhibition', exhibition);
				_i.setArrows(exhibition);

				_i.exhibitionElem.classList.add('visible');

				_i.switches.canScroll = true;

				if(!_i.current.lenis){

					_i.current.lenisWrapper = document.getElementById('exhibition_scroll');
					_i.current.lenisContent = document.getElementById('exhibition_scroll_content');

					_i.current.lenis = new Lenis({
					  duration: 1.2,
					  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
					  direction: 'vertical', 
					  gestureDirection: 'vertical', 
					  smooth: true,
					  mouseMultiplier: 1,
					  smoothTouch: false,
					  touchMultiplier: 2,
					  infinite: false,
					  wrapper: _i.current.lenisWrapper,
					  content: _i.current.lenisContent
					})

					_t.Motion.animations.lenis = (time)=>{
						if(_i.current.lenis){
							_i.current.lenis.raf(time);
						}
					}
				}

				window.dispatchEvent( new Event('enterExhibition') );

				if(_callback) _callback();

			}).start();
		}).start();

		_i.cameraAnimation = new _t.TWEEN.Tween({
			
			hideOthers: _i.otherExhibitions,
			
		},  _t.Motion.AUTO ).to({
			
			hideOthers: 0,
			
		}, 1400 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

			_i.otherExhibitions = v.hideOthers;

			for(_i.tmpCnt in section.exhibitions){
				if(section.exhibitions[_i.tmpCnt] !== exhibition){
					section.exhibitions[_i.tmpCnt].object.scale.set(_i.otherExhibitions, _i.otherExhibitions, _i.otherExhibitions);
				}
			}

		}).onComplete((v)=>{

		}).start();

	}

	_i.onEnterExhibition = ( event, exhibition, _callback)=>{

		const section = _i.current.section;
		const cluster = _i.current.cluster;

		if(section.heroIsActive){
			_i.onCloseHero(event, ()=>{
				_t.Screen.controls.saveState();
				_i.lastPositionSaved = true;
				_i.onEnterExhibition( event, exhibition, _callback);
			});
			return false;
		}

		if(!exhibition && _i.initial && _i.initial.exhibition){
			exhibition = _i.initial.exhibition;
			delete _i.initial.exhibition;
			delete _i.initial;
		}

		_i.disableDynamicPositions();
		_t.Screen.disableControls();

		_i.switches.raycasting = false;
		_i.current.exhibition = exhibition;
		section.exhibitionIsActive = true;

		if(!exhibition.colors){
			exhibition.colors = new GetColors(_t, exhibition.texture.image);
			_t.Elements.dust.toggle(0, 0);
			_t.Elements.dust.setColors(exhibition.colors);
		}
	
		if(_i.cameraAnimation){
			_t.Motion.AUTO.remove(_i.cameraAnimation);
		}

		if(exhibition.exhibAnimation){
			_t.Motion.AUTO.remove(exhibition.exhibAnimation);
		}

		if(_i.current.lenis){
			_i.current.lenis.destroy();
			_i.current.lenis = false;
			delete _t.Motion.animations.lenis;
			_i.current.lenisWrapper.scrollTop = 0;
		}

		exhibition.cameraPosition.getWorldPosition(_i.tmpVectorPos);
		exhibition.object.getWorldPosition(_i.tmpVectorLook);
		_i.tmpVectorTarget = _t.Screen.controls.getTarget(_i.tmpVectorTarget);

		if(!exhibition.hdTex && exhibition.poster.hero){
			exhibition.hdTex = _t.Loaders.texLoader.load( exhibition.poster.hero, (tx)=>{
				tx.encoding = sRGBEncoding;
				tx.wrapS = tx.wrapT = RepeatWrapping;
				exhibition.mesh.material.map = tx;
			});
		}

		_t.Screen.controls.minZoom = 0.7;
		_t.Screen.controls.zoomTo(1.0, true);

		_i.cameraAnimation = new _t.TWEEN.Tween({
			position: { 
				x: _t.Elements.camera.position.x, 
				y: _t.Elements.camera.position.y, 
				z: _t.Elements.camera.position.z
			},
			lookAt: { 
				x: _i.tmpVectorTarget.x,
				y: _i.tmpVectorTarget.y,
				z: _i.tmpVectorTarget.z,
			},
			hideOthers: _i.otherExhibitions,
		},  _t.Motion.AUTO ).to({
			position: { 
				x: _i.tmpVectorPos.x, 
				y: _i.tmpVectorPos.y, 
				z: _i.tmpVectorPos.z
			},
			lookAt: { 
				x: _i.tmpVectorLook.x,
				y: _i.tmpVectorLook.y,
				z: _i.tmpVectorLook.z
			},
			hideOthers: 0
		}, 500 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

			_i.otherExhibitions = v.hideOthers;

			for(_i.tmpCnt in section.exhibitions){
				if(section.exhibitions[_i.tmpCnt] !== exhibition){
					section.exhibitions[_i.tmpCnt].object.scale.set(_i.otherExhibitions, _i.otherExhibitions, _i.otherExhibitions);
				}
			}
			_t.Screen.controls.setLookAt( v.position.x,v.position.y,v.position.z, v.lookAt.x,v.lookAt.y,v.lookAt.z, true );

		}).onComplete((v)=>{

			section.gas_opacity = section.gas.material.opacity;
			

			new _t.TWEEN.Tween({
				clusterOpacity: section.gas.material.opacity
			},  _t.Motion.AUTO ).to({
				clusterOpacity: 0,
			}, 800 ).onUpdate((v2)=>{
				section.gas.material.opacity = v2.clusterOpacity;
			}).start();

			if(_t.params.gpu.isMobile || window.innerWidth < 1024){
				exhibition.mesh.coverScale = 1.5;
			} else {
				exhibition.mesh.coverScale = 1.9;
			}

			exhibition.exhibAnimation = new _t.TWEEN.Tween({
				scale: exhibition.meshHD.scale.x,
				scale2x: exhibition.mesh.scale.x,
				scale2y: exhibition.mesh.scale.y,
				position: exhibition.mesh.position.y,
				displacement: exhibition.extrudedMat.displacementScale,
				opacity: 0,
				bubble: exhibition.bubble.scale.x,
			},  _t.Motion.AUTO ).to({
				displacement: -200,
				scale: 1.8,
				scale2x: exhibition.mesh.originalScale.x*exhibition.mesh.coverScale,
				scale2y: exhibition.mesh.originalScale.y*exhibition.mesh.coverScale,
				position: _i.heroOffset,
				bubble: 2500,
				opacity: 1
			}, 600 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v2)=>{

				exhibition.meshHD.scale.set(v2.scale,v2.scale/exhibition.ratio,v2.scale);

				exhibition.extrudedMat.opacity = v2.opacity;
				exhibition.extrudedMat.displacementScale = v2.displacement;
				exhibition.extrudedMat.needsUpdate = true;

				exhibition.bubble.scale.set(v2.bubble, v2.bubble, v2.bubble);

				exhibition.mesh.scale.set(v2.scale2x,v2.scale2y,1);
				exhibition.mesh.position.y = v2.position;
				
				exhibition.mesh.getWorldPosition(_t.Elements.dust.mesh.position);
				_t.Elements.dust.toggle(v2.opacity, v2.scale);

			}).onComplete((v2)=>{

				if(exhibition.title && exhibition.title[lang] && exhibition.title[lang] !== ""){
					_i.onUpdatePath('exhibition', exhibition.title[lang]);
				} else if(exhibition.title && exhibition.title.en && exhibition.title.en !== ""){
					_i.onUpdatePath('exhibition', exhibition.title.en);
				} else if(exhibition.title && exhibition.title.jp && exhibition.title.jp !== ""){
					_i.onUpdatePath('exhibition', exhibition.title.jp);
				} else if(exhibition.title){
					_i.onUpdatePath('exhibition', exhibition.title);
				}

				_i.setDynamicPositions();

				_i.removeKeepClasses('_exhibition');

				window.dispatchEvent( new Event('exhibitionReady') );

				_t.Screen.focusDistance = 100;


				_i.getExhibitionContainers();

				_i.setMarkup('exhibition', exhibition);
				_i.setArrows(exhibition);

				_i.exhibitionElem.classList.add('visible');

				_i.switches.canScroll = true;

				if(!_i.current.lenis){

					_i.current.lenisWrapper = document.getElementById('exhibition_scroll');
					_i.current.lenisContent = document.getElementById('exhibition_scroll_content');

					_i.current.lenis = new Lenis({
					  duration: 1.2,
					  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
					  direction: 'vertical', 
					  gestureDirection: 'vertical', 
					  smooth: true,
					  mouseMultiplier: 1,
					  smoothTouch: false,
					  touchMultiplier: 2,
					  infinite: false,
					  wrapper: _i.current.lenisWrapper,
					  content: _i.current.lenisContent
					})

					_t.Motion.animations.lenis = (time)=>{
						if(_i.current.lenis){
							_i.current.lenis.raf(time);
						}
					}
				}

				window.dispatchEvent( new Event('enterExhibition') );

				if(_callback) _callback();

			}).start();

		}).start();
	}

	_i.onLayoutChange = ( event, _callback, fast )=>{

		const section = _i.current.section;
		const cluster = _i.current.cluster;
		const exhibition = _i.current.exhibition;

		if(_i.layoutAnim){
			_t.Motion.AUTO.remove(_i.layoutAnim);
		}
		if(_i.cameraAnimation){
			_t.Motion.AUTO.remove(_i.cameraAnimation);
		}
		if(_i.layoutTmt){
			clearTimeout(_i.layoutTmt);
		}

		if( (!cluster.stars && !cluster.gas) || !cluster.targets){
			if(_callback) _callback();
			return false;
		}

		if(section.heroIsActive){
			_i.onCloseHero(event, ()=>{
				_i.removeKeepClasses('_section');
				_i.onLayoutChange(event, _callback, fast);
			});
			return false;
		}

		if(exhibition){
			_i.onLeaveExhibition( event, exhibition, ()=>{
				_i.onLayoutChange(event, _callback, fast);
			});
			return false;
		}

		_i.disableDynamicPositions();
		_t.Screen.disableControls()
		_i.switches.raycasting = false;
		

		if(fast){
			_i.layoutTime1 = 400;
			_i.layoutTime2 = 400;
		} else {
			_i.layoutTime1 = 2000;
			_i.layoutTime2 = 1000;
		}

		_i.layoutAnim = new _t.TWEEN.Tween({ 
			scale: cluster.stars.mesh.scale.y, 
			opacity: cluster.stars.mesh.material.opacity 
		},  _t.Motion.AUTO ).to({ 
			scale: 0,
			opacity: 0
		}, _i.layoutTime1 ).easing( _t.TWEEN.Easing.Exponential.InOut ).onUpdate((v)=>{
			if(cluster.stars){
				cluster.stars.mesh.scale.y = v.scale;
				cluster.stars.mesh.material.opacity = v.opacity;
			}
		}).start();	
		

		_t.currentLayoutBtn = document.querySelectorAll('.layout_btn.current');

		if(_t.currentLayoutBtn.length > 0){
			_t.currentLayoutBtn[0].classList.remove('current');
		}

		_t.currentLayoutBtn = document.querySelector('.layout_btn[data-type="'+event.detail+'"]').classList.add('current');

		_i.currentLayout = event.detail;

		event.complete = (controlsType)=>{
			
			_t.Screen.controls.minZoom = 0.5;
			_t.Screen.controls.maxZoom = 2.0;
			_t.Screen.controls.zoomTo(1.0, true);

			_t.Screen.controls.saveState();
			_i.lastPositionSaved = true;

			if(controlsType){
				_i.switches.raycasting = true;
				_t.Screen.enableControls();
				_t.Screen.changeControls(controlsType);	
			}

			if(_callback) _callback();
		}

		switch(event.detail){
			case 'table':

				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				_t.Screen.controls.setLookAt(
					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z + 400, 

					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z + 100, 

					true);
				cluster.transform( cluster.targets[event.detail], _i.layoutTime2/2, true, ()=>{
					if(cluster.gas){
						new _t.TWEEN.Tween( cluster.gas.scale,  _t.Motion.AUTO )
						    .to( { x: 15, y: 15, z: 15 }, _i.layoutTime2 )
						    .easing( _t.TWEEN.Easing.Exponential.InOut )
						    .onComplete( ()=>{ event.complete('drag') }).start();
					}
				});
			break;
			case 'sphere':

				_t.Screen.controls.azimuthRotateSpeed = -1;
				_t.Screen.controls.polarRotateSpeed = -1;

				_t.Screen.controls.setLookAt(
					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z + 0.01, 

					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z, 

					true);
				 
				cluster.transform( cluster.targets[event.detail], _i.layoutTime2/2, true, ()=>{
					if(cluster.gas){
						new _t.TWEEN.Tween( cluster.gas.scale,  _t.Motion.AUTO )
						    .to( { x: 6, y: 6, z: 6 }, _i.layoutTime2 )
						    .easing( _t.TWEEN.Easing.Exponential.InOut )
						    .onComplete( ()=>{ event.complete('rotate') }).start();
					}
				} );
			break;
			case 'helix':

				_t.Screen.controls.azimuthRotateSpeed = -1;
				_t.Screen.controls.polarRotateSpeed = -1;

				_t.Screen.controls.setLookAt(
					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z + 0.01, 

					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z, 

					true);
				cluster.transform( cluster.targets[event.detail], _i.layoutTime2/2, true, ()=>{
					if(cluster.gas){
						new _t.TWEEN.Tween( cluster.gas.scale,  _t.Motion.AUTO )
						    .to( { x: 10, y: 10, z: 10 }, _i.layoutTime2 )
						    .easing( _t.TWEEN.Easing.Exponential.InOut )
						    .onComplete( ()=>{ event.complete('rotate') }).start();
					}
				});
			break;
			case 'grid':

				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				_t.Screen.controls.setLookAt(
					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z + 800, 

					section['3d'].coordinates.x, 
					section['3d'].coordinates.y, 
					section['3d'].coordinates.z - 200, 

					true);
				cluster.transform( cluster.targets[event.detail], _i.layoutTime2/2, true, ()=>{
					if(cluster.gas){
						new _t.TWEEN.Tween( cluster.gas.scale,  _t.Motion.AUTO )
						    .to( { x: 10, y: 10, z: 10 }, _i.layoutTime2 )
						    .easing( _t.TWEEN.Easing.Exponential.InOut )
						    .onComplete( ()=>{ event.complete('drag') }).start();
					}
				});
			break;
			default:

				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				event.complete(false)
		}
	}

	_i.createFlyingObjects = (section)=>{

		const v_cluster = section['3d'].area = new Object3D();
		v_cluster.position.set(section['3d'].position.x, section['3d'].position.y, section['3d'].position.z);
		_t.Elements.scene.add(v_cluster);

		v_cluster.orbits = {};

		let _o = 0;
		let _phi, _theta;
		let _vector = new Vector3();
		const _sphere_radius = 200;
		let orbit;

		for(let xtmp of section['3d'].orbitting){
			v_cluster.orbits[xtmp] = {};
			v_cluster.orbits[xtmp].parent = new Object3D();	
			v_cluster.add(v_cluster.orbits[xtmp].parent);
			v_cluster.orbits[xtmp].figure = _t.Elements.orbitting[xtmp].clone();
			v_cluster.orbits[xtmp].figure.scale.set(0.5,0.5,0.5);

			_phi = Math.acos( -1 + ( 2 * _o ) / section['3d'].orbitting.length );
			_theta = Math.sqrt( section['3d'].orbitting.length * Math.PI ) * _phi;
			
			_vector.x = _sphere_radius * Math.cos( _theta ) * Math.sin( _phi );
			_vector.y = _sphere_radius * Math.sin( _theta ) * Math.sin( _phi );
			_vector.z = _sphere_radius * Math.cos( _phi );
			_vector.multiplyScalar( 1.5 );

			v_cluster.orbits[xtmp].figure.position.copy(_vector);
			v_cluster.orbits[xtmp].parent.add(v_cluster.orbits[xtmp].figure);
			v_cluster.orbits[xtmp].parent.rotation.x = Math.PI * (Math.random() * 10);
			v_cluster.orbits[xtmp].speed = [1 + Math.random()*2, 1 + Math.random()*2];
		}

		_t.Motion.animations['orbitting'+section+Math.random()] = ()=>{
			for(orbit in v_cluster.orbits){
				v_cluster.orbits[orbit].parent.rotation.y += Math.PI / 8000 * v_cluster.orbits[orbit].speed[0];
				v_cluster.orbits[orbit].parent.rotation.x += Math.PI / 8000 * v_cluster.orbits[orbit].speed[1];
				v_cluster.orbits[orbit].figure.rotation.y += Math.PI / 8000 * v_cluster.orbits[orbit].speed[1];
				v_cluster.orbits[orbit].figure.rotation.x += Math.PI / 8000 * v_cluster.orbits[orbit].speed[0];
			}
			v_cluster.rotation.y += Math.PI/12000;
			v_cluster.rotation.z -= Math.PI/12000;
		}	

		return v_cluster;	
 	}

	_i.onTravelTo = ( event, _callback, forced )=>{

		_i.parallaxPhotos = false;

		if(event.detail !== _i.current.section.path || forced === true){
		
			if(_i.current.exhibition){
				if(_i.exhibAnimation) _t.Motion.AUTO.remove(_i.exhibAnimation);
				_i.onLeaveExhibition( event, _i.current.exhibition, ()=>{
					_i.onTravelTo(event);
				});
				return false;
			}

			if(_i.current.section.heroIsActive){
				if(_i.heroElem) _i.heroElem.classList.remove('visible');
				_i.onCloseHero(event, ()=>{
					_i.onTravelTo(event);
				});
				return false;
			}

			if(_i.switches.isMenuOpen && event.detail !== 'menu'){
				_i.onTriggerMenu(event, ()=>{
					_i.onTravelTo(event);
				});
				return false;
			}

			_i.cancelEverything();
			_i.currentLayout = 'sphere';

 			if(document.body.classList.contains('_intro')){

 				_i.removeKeepClasses();

 				if(_t.params.gpu.isMobile || window.innerWidth < 1024){

 				} else {

 					if(_i.cameraOffset){
 						_t.Motion.AUTO.remove(_i.cameraOffset);
 					}
 					_i.cameraOffset = new _t.TWEEN.Tween({
 						position: _t.camOff
 					},  _t.Motion.AUTO ).to({
 						position: 0
 					}, 600 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
 						_t.camOff = v.position;
 						_t.Elements.camera.setViewOffset( window.innerWidth, window.innerHeight, v.position, 0, window.innerWidth, window.innerHeight);
 					}).start();
 				}
 				
 			}

 			if(_t.camOff > 0){

 				if(_i.cameraOffset){
 					_t.Motion.AUTO.remove(_i.cameraOffset);
 				}
 				_i.cameraOffset = new _t.TWEEN.Tween({
 					position: _t.camOff 
 				},  _t.Motion.AUTO ).to({
 					position: 0
 				}, 600 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
 					_t.camOff = v.position;
 					_t.Elements.camera.setViewOffset( window.innerWidth, window.innerHeight, v.position, 0, window.innerWidth, window.innerHeight);
 				}).start();

 			}
 			

			if(_i.current.cluster) _i.current.cluster.reduce();

			_t.currentLayoutBtn = document.querySelectorAll('.layout_btn.current');

			if(_t.currentLayoutBtn.length > 0){
				_t.currentLayoutBtn[0].classList.remove('current');
			}
			_t.currentLayoutBtn = document.querySelector('.layout_btn[data-type="sphere"]').classList.add('current');

			if(_i.current.lenis){
				_i.current.lenis.destroy();
				_i.current.lenis = false;
				delete _t.Motion.animations.lenis;
				_i.current.lenisWrapper.scrollTop = 0;
			}
			
			if(event.detail === 'home' || event.detail === 'init'){

				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				for(_i.tmpCls in _t.Multiverse.clusters){
					_t.Multiverse.clusters[_i.tmpCls].reduce()
				}

				if(event.detail === 'init'){

					window.dispatchEvent( new CustomEvent('transitionStart', { detail: 'home' }) );
					window.dispatchEvent( new Event('hideGLTxt') );

					_i.switches.autoRotate = true;
					_t.Screen.focusDistance = 3000;
					_i.removeKeepClasses('_intro');

					_i.current.prevSection = _t.sections[_i.current.section.path];
					_i.current.prevCluster = _t.Multiverse.clusters[_i.current.section.path];
					_i.current.cluster = _t.Multiverse.clusters['home'];
					_i.current.section = _t.sections['home'];

					_i.onUpdatePath('section', 'home');
					
					
					_i.current.cluster.show()
					_t.Follow.hide();

					_t.Screen.controls.minZoom = 0.7;
					_t.Screen.controls.zoomTo(1.0, true);

					_i.cameraAnimation = new _t.TWEEN.Tween({
						position: { 
							x: _t.Elements.camera.position.x, 
							y: _t.Elements.camera.position.y, 
							z: _t.Elements.camera.position.z
						},
						lookAt: { 
							x: _i.tmpVectorTarget.x, 
							y: _i.tmpVectorTarget.y, 
							z: _i.tmpVectorTarget.z
						},
						orbitScale1: (typeof _i.current.cluster !== 'undefined' && typeof _i.current.cluster.orbits !== 'undefined' ? _i.current.cluster.orbits[Object.keys(_i.current.cluster.orbits)[0]].figure.scale.x : 20),
						orbitScale2: (typeof _i.current.prevCluster !== 'undefined' && typeof _i.current.prevCluster.orbits !== 'undefined' ? _i.current.prevCluster.orbits[Object.keys(_i.current.prevCluster.orbits)[0]].figure.scale.x : 20)
					},  _t.Motion.AUTO ).to({
						position: _t.params.init_position,
						lookAt: _t.params.init_target,
						orbitScale1: 5,
						orbitScale2: 20
					}, 1500 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

						_t.Screen.controls.setLookAt( v.position.x,v.position.y,v.position.z, v.lookAt.x,v.lookAt.y,v.lookAt.z, true );

						if(_i.current.cluster && _i.current.cluster.orbits){
							for(let orbit in _i.current.cluster.orbits){
								_i.current.cluster.orbits[orbit].figure.scale.set(v.orbitScale1,v.orbitScale1,v.orbitScale1)
							}
						}

						if(_i.current.prevCluster && _i.current.prevCluster.orbits){	
							for(let orbit in _i.current.prevCluster.orbits){
								_i.current.prevCluster.orbits[orbit].figure.scale.set(v.orbitScale2,v.orbitScale2,v.orbitScale2)
							}
						}
					}).onComplete((v)=>{

						if(_t.params.gpu.isMobile || window.innerWidth < 1024){

						} else {

							if(_i.cameraOffset){
								_t.Motion.AUTO.remove(_i.cameraOffset);
							}
							_i.cameraOffset = new _t.TWEEN.Tween({
								position: _t.camOff
							},  _t.Motion.AUTO ).to({
								position: -300
							}, 600 ).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{
								_t.camOff = v.position;
								_t.Elements.camera.setViewOffset( window.innerWidth, window.innerHeight, v.position, 0, window.innerWidth, window.innerHeight);
							}).start();
						}	

						window.dispatchEvent( new CustomEvent('transitionEnd', { detail: 'home' }) );
						window.dispatchEvent( new Event('showGLTxt') );

						_t.Screen.enableControls()

						_t.Follow.show();

						if(_callback) _callback();
					}).start();

				} else {

					window.dispatchEvent( new CustomEvent('transitionStart', { detail: event.detail }) );
					window.dispatchEvent( new Event('hideGLTxt') );

					_i.switches.autoRotate = true;
					_t.Screen.focusDistance = 3000;
					_i.removeKeepClasses('_home');

					_i.current.prevSection = _t.sections[_i.current.section.path];
					_i.current.prevCluster = _t.Multiverse.clusters[_i.current.section.path];
					_i.current.cluster = _t.Multiverse.clusters[event.detail];
					_i.current.section = _t.sections[event.detail];

					_i.onUpdatePath('section', 'home');
					
					_i.current.cluster.show()
					_t.Follow.hide();

					_i.targetPosition1 = new Vector3(
						_i.current.section['3d'].coordinates.x,
						_i.current.section['3d'].coordinates.y,
						_i.current.section['3d'].coordinates.z+0.01
					).lerp( _t.Elements.camera.position, 0.3 );

					_i.targetPosition2 = new Vector3(
						_i.current.section['3d'].coordinates.x,
						_i.current.section['3d'].coordinates.y,
						_i.current.section['3d'].coordinates.z+0.01
					).lerp( _t.Elements.camera.position, 0.1 );  

					_i.targetLookAt1 = new Vector3(0,0,0).lerp( _t.Elements.camera.position, 0.1 );
					_i.targetLookAt2 = new Vector3(0,0,0).lerp( _t.Elements.camera.position, 0.01 );

					_i.tmpVectorTarget = _t.Screen.controls.getTarget(_i.tmpVectorTarget)

					_t.Screen.controls.minZoom = 0.8;
					_t.Screen.controls.zoomTo(1.65, true);

					_i.cameraAnimation = new _t.TWEEN.Tween({
						position: { 
							x: _t.Elements.camera.position.x, 
							y: _t.Elements.camera.position.y, 
							z: _t.Elements.camera.position.z
						},
						lookAt: { 
							x: _i.tmpVectorTarget.x, 
							y: _i.tmpVectorTarget.y, 
							z: _i.tmpVectorTarget.z
						},
						orbitScale1: (typeof _i.current.cluster !== 'undefined' && typeof _i.current.cluster.orbits !== 'undefined' ? _i.current.cluster.orbits[Object.keys(_i.current.cluster.orbits)[0]].figure.scale.x : 20),
						orbitScale2: (typeof _i.current.prevCluster !== 'undefined' && typeof _i.current.prevCluster.orbits !== 'undefined' ? _i.current.prevCluster.orbits[Object.keys(_i.current.prevCluster.orbits)[0]].figure.scale.x : 20)
					},  _t.Motion.AUTO ).to({
						position: { 
							x: [_i.targetPosition1.x, _i.targetPosition2.x, _i.current.section['3d'].coordinates.x], 
							y: [_i.targetPosition1.y, _i.targetPosition2.y, _i.current.section['3d'].coordinates.y], 
							z: [_i.targetPosition1.z, _i.targetPosition2.z, _i.current.section['3d'].coordinates.z+0.01]
						},
						lookAt: { 
							x: [_i.targetLookAt1.x, _i.targetLookAt2.x, 0], 
							y: [_i.targetLookAt1.y, _i.targetLookAt2.y, 0], 
							z: [_i.targetLookAt1.z, _i.targetLookAt2.z, 0]
						},
						orbitScale1: 5,
						orbitScale2: 20
					}, 1500 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

						_t.Screen.controls.setLookAt( v.position.x,v.position.y,v.position.z, v.lookAt.x,v.lookAt.y,v.lookAt.z, true );

						if(_i.current.cluster && _i.current.cluster.orbits){
							for(let orbit in _i.current.cluster.orbits){
								_i.current.cluster.orbits[orbit].figure.scale.set(v.orbitScale1,v.orbitScale1,v.orbitScale1)
							}
						}

						if(_i.current.prevCluster && _i.current.prevCluster.orbits){	
							for(let orbit in _i.current.prevCluster.orbits){
								_i.current.prevCluster.orbits[orbit].figure.scale.set(v.orbitScale2,v.orbitScale2,v.orbitScale2)
							}
						}
					}).onComplete((v)=>{

						window.dispatchEvent( new CustomEvent('transitionEnd', { detail: event.detail }) );
						
						_t.Screen.enableControls()

						_t.Follow.show();

						if(_callback) _callback();
					}).start();

				}

			} else if(event.detail === 'menu'){

				if(!_t.sections.menu.hasObjs){
					_t.sections.menu.hasObjs = true;
					_i.createFlyingObjects(_t.sections.menu);
				}

				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				for(_i.tmpCls in _t.Multiverse.clusters){
					_t.Multiverse.clusters[_i.tmpCls].reduce()
				}

				window.dispatchEvent( new CustomEvent('transitionStart', { detail: event.detail }) );
				window.dispatchEvent( new Event('hideGLTxt') );

				_t.Screen.focusDistance = 3000;
				_i.removeKeepClasses('_menu');
				_t.Follow.hide();

				_i.current.prevSection = _t.sections[_i.current.section.path];
				_i.current.prevCluster = _t.Multiverse.clusters[_i.current.section.path];

				_i.current.menuDetails = {
					exhibition: _i.current.exhibition,
					section: _i.current.section,
					prevSection: _i.current.prevSection,
					prevCluster:  _t.Multiverse.clusters[_i.current.section.path]
				}

				_i.cameraAnimation = new _t.TWEEN.Tween({
					position: { 
						x: _t.Elements.camera.position.x, 
						y: _t.Elements.camera.position.y, 
						z: _t.Elements.camera.position.z
					},
					lookAt: { 
						x: _t.Elements.camera.position.x, 
						y: _t.Elements.camera.position.y, 
						z: _t.Elements.camera.position.z
					},
					orbitScale1: (typeof _i.current.cluster !== 'undefined' && typeof _i.current.cluster.orbits !== 'undefined' ? _i.current.cluster.orbits[Object.keys(_i.current.cluster.orbits)[0]].figure.scale.x : 20),
					orbitScale2: (typeof _i.current.prevCluster !== 'undefined' && typeof _i.current.prevCluster.orbits !== 'undefined' ? _i.current.prevCluster.orbits[Object.keys(_i.current.prevCluster.orbits)[0]].figure.scale.x : 20)
				},  _t.Motion.AUTO ).to({
					position: { 
						x: [_t.sections[event.detail]['3d'].position.x], 
						y: [_t.sections[event.detail]['3d'].position.y], 
						z: [_t.sections[event.detail]['3d'].position.z]
					},
					lookAt: { 
						x: [_t.sections[event.detail]['3d'].coordinates.x], 
						y: [_t.sections[event.detail]['3d'].coordinates.y], 
						z: [_t.sections[event.detail]['3d'].coordinates.z]
					},
					orbitScale1: 5,
					orbitScale2: 20
				}, 1500 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

					_t.Screen.controls.setLookAt( v.position.x,v.position.y,v.position.z, v.lookAt.x,v.lookAt.y,v.lookAt.z, true );

					if(_i.current.cluster && _i.current.cluster.orbits){
						for(let orbit in _i.current.cluster.orbits){
							_i.current.cluster.orbits[orbit].figure.scale.set(v.orbitScale1,v.orbitScale1,v.orbitScale1)
						}
					}

					if(_i.current.prevCluster && _i.current.prevCluster.orbits){	
						for(let orbit in _i.current.prevCluster.orbits){
							_i.current.prevCluster.orbits[orbit].figure.scale.set(v.orbitScale2,v.orbitScale2,v.orbitScale2)
						}
					}

				}).onComplete((v)=>{

					_t.Screen.controls.minZoom = 0.7;
					_t.Screen.controls.zoomTo(1.0, true);

					_i.setDynamicPositions()

					window.dispatchEvent( new CustomEvent('transitionEnd', {detail: event.detail}) );

					if(_callback) _callback();

				}).start();

			} else if(event.detail === 'contact' || event.detail === 'about' || event.detail === 'access' || event.detail === 'events'){

				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				for(_i.tmpCls in _t.Multiverse.clusters){
					_t.Multiverse.clusters[_i.tmpCls].reduce()
				}

				window.dispatchEvent( new CustomEvent('transitionStart', { detail: event.detail }) );
				window.dispatchEvent( new Event('hideGLTxt') );

				_t.Follow.hide();
				_t.Screen.focusDistance = 3000;

				_i.removeKeepClasses(['_'+event.detail, '_institutional']);

				_i.current.prevSection = _t.sections[_i.current.section.path];
				_i.current.prevCluster = _t.Multiverse.clusters[_i.current.section.path];
				_i.current.cluster = false;
				_i.current.section = _t.sections[event.detail];

				_i.onUpdatePath('section', _t.sections[event.detail].title);

				_i.cameraAnimation = new _t.TWEEN.Tween({
					position: { 
						x: _t.Elements.camera.position.x, 
						y: _t.Elements.camera.position.y, 
						z: _t.Elements.camera.position.z
					},
					lookAt: { 
						x: _t.Elements.camera.position.x, 
						y: _t.Elements.camera.position.y, 
						z: _t.Elements.camera.position.z
					},
					orbitScale1: (typeof _i.current.cluster !== 'undefined' && typeof _i.current.cluster.orbits !== 'undefined' ? _i.current.cluster.orbits[Object.keys(_i.current.cluster.orbits)[0]].figure.scale.x : 20),
					orbitScale2: (typeof _i.current.prevCluster !== 'undefined' && typeof _i.current.prevCluster.orbits !== 'undefined' ? _i.current.prevCluster.orbits[Object.keys(_i.current.prevCluster.orbits)[0]].figure.scale.x : 20)
				},  _t.Motion.AUTO ).to({
					position: { 
						x: [_t.sections[event.detail]['3d'].position.x], 
						y: [_t.sections[event.detail]['3d'].position.y], 
						z: [_t.sections[event.detail]['3d'].position.z]
					},
					lookAt: { 
						x: [_t.sections[event.detail]['3d'].coordinates.x], 
						y: [_t.sections[event.detail]['3d'].coordinates.y], 
						z: [_t.sections[event.detail]['3d'].coordinates.z]
					},
					orbitScale1: 5,
					orbitScale2: 20
				}, 1500 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

					_t.Screen.controls.setLookAt( v.position.x,v.position.y,v.position.z, v.lookAt.x,v.lookAt.y,v.lookAt.z, true );

					if(_i.current.cluster && _i.current.cluster.orbits){
						for(let orbit in _i.current.cluster.orbits){
							_i.current.cluster.orbits[orbit].figure.scale.set(v.orbitScale1,v.orbitScale1,v.orbitScale1)
						}
					}

					if(_i.current.prevCluster && _i.current.prevCluster.orbits){	
						for(let orbit in _i.current.prevCluster.orbits){
							_i.current.prevCluster.orbits[orbit].figure.scale.set(v.orbitScale2,v.orbitScale2,v.orbitScale2)
						}
					}

				}).onComplete((v)=>{

					_t.Screen.controls.minZoom = 0.7;
					_t.Screen.controls.zoomTo(1.0, true);

					_i.setDynamicPositions();

					if(!_i.current.lenis){

						_i.current.lenisWrapper = document.getElementById(event.detail);
						_i.current.lenisContent = document.querySelector('#'+event.detail+' .page');

						_i.current.lenisWrapper.style = {
						    "position": "relative",
						    "display": "block",
						    "overflow-x": "hidden",
						    "overflow-y": "auto",
						    "pointer-events": "all"
						}

						_i.current.lenisContent.style = {
						    "display": "block",
						    "position": "relative",
						    "overflow": "visible"
						}

						_i.current.lenis = new Lenis({
						  duration: 1.2,
						  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
						  direction: 'vertical', 
						  gestureDirection: 'vertical',
						  smooth: true,
						  mouseMultiplier: 1,
						  smoothTouch: false,
						  touchMultiplier: 2,
						  infinite: false,
						  wrapper: _i.current.lenisWrapper,
						  content: _i.current.lenisContent
						})

						_t.Motion.animations.lenis = (time)=>{
							if(_i.current.lenis){
								_i.current.lenis.raf(time);
							}
						}
					}

					window.dispatchEvent( new CustomEvent('transitionEnd', {detail: event.detail}) );

					if(_callback) _callback();

				}).start();

			} else {


				_t.Screen.controls.azimuthRotateSpeed = 1;
				_t.Screen.controls.polarRotateSpeed = 1;

				_t.Screen.focusDistance = 600;

				window.dispatchEvent( new CustomEvent('transitionStart', { detail: event.detail }) );
				window.dispatchEvent( new Event('hideGLTxt') );

				if( event.detail ){

					_i.current.prevSection = _t.sections[_i.current.section.path];
					_i.current.prevCluster = _t.Multiverse.clusters[_i.current.section.path];			

					_i.current.cluster = _t.Multiverse.clusters[event.detail];
					_i.current.section = _t.sections[event.detail];

					for(_i.tmpCls in _t.Multiverse.clusters){
						if( _t.Multiverse.clusters[_i.tmpCls] !== _i.current.cluster){
							_t.Multiverse.clusters[_i.tmpCls].hide()	
						}
					}

					if(_i.current.exhibition){
						_i.removeKeepClasses('_exhibition');

						if(_i.current.exhibition.title && _i.current.exhibition.title[lang] && _i.current.exhibition.title[lang] !== ""){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title[lang]);
						} else if(_i.current.exhibition.title && _i.current.exhibition.title.en && _i.current.exhibition.title.en !== ""){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title.en);
						} else if(_i.current.exhibition.title && _i.current.exhibition.title.jp && _i.current.exhibition.title.jp !== ""){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title.jp);
						} else if(_i.current.exhibition.title){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title);
						}
					} else {
						_i.removeKeepClasses('_section');
						_i.onUpdatePath('section', _i.current.section.title);
					}

				} else if( _i.current.menuDetails ){

					_i.current.prevCluster = _t.Multiverse.clusters[_i.current.menuDetails.section.path];
					_i.current.prevSection = _t.sections[_i.current.menuDetails.section.path];

					_i.current.cluster = _t.Multiverse.clusters[_i.current.menuDetails.section.path];
					_i.current.section = _t.sections[_i.current.menuDetails.section.path];	

					for(_i.tmpCls in _t.Multiverse.clusters){
						if( _t.Multiverse.clusters[_i.tmpCls] !== _i.current.cluster){
							_t.Multiverse.clusters[_i.tmpCls].hide()	
						}
					}

					if(_i.current.menuDetails.exhibition){

						_i.current.exhibition = _i.current.menuDetails.exhibition;
						_i.removeKeepClasses('_exhibition');

						if(_i.current.exhibition.title && _i.current.exhibition.title[lang] && _i.current.exhibition.title[lang] !== ""){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title[lang]);
						} else if(_i.current.exhibition.title && _i.current.exhibition.title.en && _i.current.exhibition.title.en !== ""){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title.en);
						} else if(_i.current.exhibition.title && _i.current.exhibition.title.jp && _i.current.exhibition.title.jp !== ""){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title.jp);
						} else if(_i.current.exhibition.title){
							_i.onUpdatePath('exhibition', _i.current.exhibition.title);
						}

					} else {
						_i.removeKeepClasses('_section');
						_i.onUpdatePath('section', _i.current.section.title);
					}

				}
			
				_i.current.cluster.show()
				_t.Follow.hide();

				window.dispatchEvent( new Event('playGalaxy') );

				_i.targetPosition1 = new Vector3(
					_i.current.section['3d'].coordinates.x,
					_i.current.section['3d'].coordinates.y,
					_i.current.section['3d'].coordinates.z+0.01
				).lerp( _t.Elements.camera.position, 0.4 );

				_i.targetPosition2 = new Vector3(
					_i.current.section['3d'].coordinates.x,
					_i.current.section['3d'].coordinates.y,
					_i.current.section['3d'].coordinates.z+0.01
				).lerp( _t.Elements.camera.position, 0.2 );  

				_i.targetLookAt1 = new Vector3(
					_i.current.section['3d'].coordinates.x,
					_i.current.section['3d'].coordinates.y,
					_i.current.section['3d'].coordinates.z
				).lerp( _t.Elements.camera.position, 0.2 );

				_i.targetLookAt2 = new Vector3(
					_i.current.section['3d'].coordinates.x,
					_i.current.section['3d'].coordinates.y,
					_i.current.section['3d'].coordinates.z
				).lerp( _t.Elements.camera.position, 0.01 );			

				_i.cameraAnimation = new _t.TWEEN.Tween({
					position: { 
						x: _t.Elements.camera.position.x, 
						y: _t.Elements.camera.position.y, 
						z: _t.Elements.camera.position.z
					},
					lookAt: { 
						x: _t.Elements.camera.position.x, 
						y: _t.Elements.camera.position.y, 
						z: _t.Elements.camera.position.z
					},
					orbitScale1: (typeof _i.current.cluster !== 'undefined' && typeof _i.current.cluster.orbits !== 'undefined' ? _i.current.cluster.orbits[Object.keys(_i.current.cluster.orbits)[0]].figure.scale.x : 20),
					orbitScale2: (typeof _i.current.prevCluster !== 'undefined' && typeof _i.current.prevCluster.orbits !== 'undefined' ? _i.current.prevCluster.orbits[Object.keys(_i.current.prevCluster.orbits)[0]].figure.scale.x : 20)
				},  _t.Motion.AUTO ).to({
					position: { 
						x: [_i.targetPosition1.x, _i.targetPosition2.x, _i.targetPosition2.x, _i.current.section['3d'].coordinates.x], 
						y: [_i.targetPosition1.y, _i.targetPosition2.y, _i.targetPosition2.y, _i.current.section['3d'].coordinates.y], 
						z: [_i.targetPosition1.z, _i.targetPosition2.z, _i.targetPosition2.z, _i.current.section['3d'].coordinates.z+0.01]
					},
					lookAt: { 
						x: [_i.targetLookAt1.x, _i.targetLookAt2.x, _i.targetLookAt2.x, _i.current.section['3d'].coordinates.x], 
						y: [_i.targetLookAt1.y, _i.targetLookAt2.y, _i.targetLookAt2.y, _i.current.section['3d'].coordinates.y], 
						z: [_i.targetLookAt1.z, _i.targetLookAt2.z, _i.targetLookAt2.z, _i.current.section['3d'].coordinates.z]
					},
					orbitScale1: 5,
					orbitScale2: 20
				}, 1500 ).interpolation(_t.TWEEN.Interpolation.Bezier).easing( _t.TWEEN.Easing.Exponential.Out ).onUpdate((v)=>{

					_t.Screen.controls.setLookAt( v.position.x,v.position.y,v.position.z, v.lookAt.x,v.lookAt.y,v.lookAt.z, true );

					if(_i.current.cluster && _i.current.cluster.orbits){
						for(let orbit in _i.current.cluster.orbits){
							_i.current.cluster.orbits[orbit].figure.scale.set(v.orbitScale1,v.orbitScale1,v.orbitScale1)
						}
					}

					if(_i.current.prevCluster && _i.current.prevCluster.orbits){
						for(let orbit in _i.current.prevCluster.orbits){
							_i.current.prevCluster.orbits[orbit].figure.scale.set(v.orbitScale2,v.orbitScale2,v.orbitScale2)
						}	
					}

				}).onComplete((v)=>{

					if(_i.current.exhibition || (_i.initial && _i.initial.exhibition)){

						_t.Screen.controls.saveState();
						_i.lastPositionSaved = true;

						_i.onEnterExhibition( {detail: false}, _i.current.exhibition, ()=>{
							
						});
					} else {

						window.dispatchEvent( new CustomEvent('transitionEnd', {detail: 'galaxy'}) );

						if(_i.current.section && !_i.current.section.exhibitions[_i.current.section.hero].hdTex && _i.current.section.exhibitions[_i.current.section.hero].poster.hero){
							_i.current.section.exhibitions[_i.current.section.hero].hdTex = _t.Loaders.texLoader.load( _i.current.section.exhibitions[_i.current.section.hero].poster.hero, (tx)=>{
								tx.encoding = sRGBEncoding;
								tx.wrapS = tx.wrapT = RepeatWrapping;
								_i.current.section.exhibitions[_i.current.section.hero].mesh.material.map = tx;
								_i.current.section.exhibitions[_i.current.section.hero].mesh.material.emissiveMap = tx;
								_i.current.section.exhibitions[_i.current.section.hero].texture.dispose();
								_i.current.section.exhibitions[_i.current.section.hero].texture = tx;
								_i.onEnterSection(event, _callback)
							});
						} else {

							_i.onEnterSection(event, _callback)

						}	
					}
				}).start();
			}
		}
	}
	
	_i.onOpenExhibition = ( event )=>{

		event.targetID = 0;

		if(event.detail && event.detail !== 'hero' && event.detail.id){
			event.targetID = parseInt(event.detail.id);
		} else if(event.detail === 'hero'){
			event.targetID = 0;
		} else {
			console.log("CHECK THIS > ", event.detail);
		}

		if(event.detail === 'hero' && _i.current.section){

			_i.onExpandHero(event, _i.current.section.exhibitions[event.targetID], ()=>{

			});

		} else if(typeof event.detail === 'object' && event.detail.type === 'exhibition' && event.detail.name){

			if(_i.current.section !== event.state.section.path){

				_i.current.section = _t.sections[event.state.section.path];

				let _exhibition = 0;

				for(let exh in _i.current.section.exhibitions){
					if(_i.current.section.exhibitions[exh].ID === event.state.exhibition.id){
						_exhibition = exh;
					}
				}

				if(_i.current.exhibition && _i.current.exhibition !== _i.current.section.exhibitions[_exhibition]){
					_i.onLeaveExhibition( event, _i.current.exhibition)
				}

				_i.current.exhibition = _i.current.section.exhibitions[_exhibition];

				_i.onTravelTo({detail: _i.current.section.path}, ()=>{
					_i.onLayoutChange({detail: _i.currentLayout}, ()=>{

						_t.Screen.controls.saveState();
						_i.lastPositionSaved = true;

						_i.onEnterExhibition( event, _i.current.section.exhibitions[_exhibition]);
					}, true)
				})

			} else {

				let _exhibition = 0;

				for(let exh in _i.current.section.exhibitions){
					if(_i.current.section.exhibitions[exh].ID === event.state.exhibition.id){
						_exhibition = exh;
					}
				}

				if(_i.current.exhibition && _i.current.exhibition !== _i.current.section.exhibitions[_exhibition]){
					_i.onLeaveExhibition( event, _i.current.exhibition, ()=>{

					})
				}

				_i.current.exhibition = _i.current.section.exhibitions[_exhibition];

				_i.onLayoutChange({detail: _i.currentLayout}, ()=>{

					_t.Screen.controls.saveState();
					_i.lastPositionSaved = true;

					_i.onEnterExhibition( event, _i.current.section.exhibitions[_exhibition]);
				}, true)
			}
		}
	}

	_i.onUpdatePath = (_type, _title)=>{

		let _cache = {};

		_cache.section = { 
			path: _i.current.section.path,
			camera: _t.Screen.controls.getPosition(),
			target: _t.Screen.controls.getTarget()
		};

		_cache.path = _i.current.section.path;
		_cache.type = _type;

		if(_type === 'exhibition'){
			_cache.exhibition = { id: _i.current.exhibition.ID, path: _i.current.exhibition.path, title: _i.current.exhibition.title };
			_cache.path += "/"+_i.current.exhibition.path;
		} else if(_type === 'hero'){
			_cache.path += "/current";
		} else if(_type === 'menu'){
			if(_i.current.exhibition){
				_cache.exhibition = { id: _i.current.exhibition.ID, path: _i.current.exhibition.path, title: _i.current.exhibition.title };
				_cache.path += "/"+_i.current.exhibition.path;	
			}
		} else if(_type === 'section'){
			_cache.exhibition = false;
		}

		if(!_i.langEN){
			_i.langEN = document.getElementById('langEN');
		}
		if(!_i.langJP){
			_i.langJP = document.getElementById('langJP');
		}

		_i.langEN.href = '/en/'+_cache.path;
		_i.langJP.href = '/jp/'+_cache.path;

		window.history.pushState(_cache, _title, lang+'/'+_cache.path);
	}

	_i.hoverOut = (obj, hover)=>{

		if(_i.pointerTitle && _i.pointerTitleActive){
			_i.pointerTitle.classList.remove('visible');
			_i.pointerTitleActive = false;
		}

		if(obj.hoverAnim){
			_t.Motion.AUTO.remove(obj.hoverAnim);
		}

		obj.hoverAnim = new _t.TWEEN.Tween({

			scale: obj._parent.object.scale.x,
			opacity: obj._parent.bubble.material.opacity,
			scaleInv: obj.tmpData.scaleInv.scale.x,

		}, _t.Motion.AUTO ).to({

			scale: obj.tmpData.scale,
			opacity: 1,
			scaleInv: 1,

		}, 400 ).easing( _t.TWEEN.Easing.Back.In ).onUpdate((v)=>{

			obj._parent.object.scale.set(v.scale,v.scale,v.scale);
			obj._parent.bubble.material.opacity = v.opacity;

			
		}).onComplete((v)=>{

			obj._parent.bubble.material = obj.tmpData.material;
			
		}).onStart((v)=>{

			_t.Assets.materials.hoverOut.opacity = obj._parent.bubble.material.opacity;

			obj._parent.bubble.material = _t.Assets.materials.hoverOut;
			
		}).start();
	}



	_i.hoverIn = (obj)=>{

		if(_i.current.hover && _i.current.hover !== obj){
			_i.hoverOut(_i.current.hover);
		}

		_i.current.hover = obj;

		if(!_i.pointerTitle){
			_i.pointerTitle = document.createElement('div');
			_i.pointerTitle.classList.add('pointer_title');
			_i.pointerTitlePosNorm = new Vector3();
			document.getElementById('webgl').appendChild(_i.pointerTitle);
		}

		if(obj._parent && obj._parent.title && obj._parent.title[lang] && obj._parent.title[lang] !== ""){
			_i.pointerTitle.innerHTML = "<span>"+obj._parent.title[lang]+"</span>";
			_i.pointerTitle.classList.add('visible');
			_i.pointerTitleActive = true;
		} else if(obj._parent && obj._parent.title && obj._parent.title.en && obj._parent.title.en !== ""){
			_i.pointerTitle.innerHTML = "<span>"+obj._parent.title.en+"</span>";
			_i.pointerTitle.classList.add('visible');
			_i.pointerTitleActive = true;
		} else if(obj._parent && obj._parent.title && obj._parent.title.jp && obj._parent.title.jp !== ""){
			_i.pointerTitle.innerHTML = "<span>"+obj._parent.title.jp+"</span>";
			_i.pointerTitle.classList.add('visible');
			_i.pointerTitleActive = true;
		} else {
			_i.pointerTitleActive = false;
			_i.pointerTitle.classList.remove('visible');
		}

		if(_i.pointerTitleActive){

			_i.pointerTitlePos = _t.ObjCoords.cssPosition(obj, _t.Elements.camera, _t.Screen.renderer);

			_i.pointerTitlePosNorm.x = ( _i.pointerTitlePos.x / window.innerWidth ) * -2 + 1;
			_i.pointerTitlePosNorm.y = - ( _i.pointerTitlePos.y / window.innerHeight ) * 2 + 1;
			_i.pointerTitlePosNorm.z = 0.5;

			if(_i.pointerTitlePos.x - 120 < 10){
				_i.pointerTitle.style.left = (Math.max(0, _i.pointerTitlePos.x)+120)+"px";
			} else if(_i.pointerTitlePos.x + 120 > window.innerWidth - 120){
				_i.pointerTitle.style.left = (_i.pointerTitlePos.x-120)+"px";
			} else {
				_i.pointerTitle.style.left = _i.pointerTitlePos.x+"px";
			}
			
			if(_i.pointerTitlePos.y - 120 < 10){
				_i.pointerTitle.style.top = (_i.pointerTitlePos.y+120)+"px";
			} else if(_i.pointerTitlePos.y + 120 > window.innerHeight - 120){
				_i.pointerTitle.style.top = (Math.min(window.innerHeight, _i.pointerTitlePos.y)-120)+"px";
			} else {
				_i.pointerTitle.style.top = (_i.pointerTitlePos.y-120)+"px";
			}

			_i.pointerTitle.style.transform = `scale(`+_i.pointerTitlePos.z+`) translate3d(-50%,-50%,0px)`;
		}


		if(obj.hoverAnim){
			_t.Motion.AUTO.remove(obj.hoverAnim);
		}

		if(!obj.tmpData){
			obj.tmpData = { 
				scale: obj._parent.object.scale.x,
				material: obj._parent.bubble.material,
				index: _i.current.section.exhibitions.indexOf(obj._parent),
				scaleInv: 0,
			};	

			obj.tmpData.altIndex = _i.current.section.exhibitions.length - 1 - obj.tmpData.index;

			if(_i.current.section.exhibitions[obj.tmpData.altIndex]){
				obj.tmpData.scaleInv = _i.current.section.exhibitions[obj.tmpData.altIndex].object;
			} else {
				obj.tmpData.scaleInv = _i.current.section.exhibitions[0].object;
			}

		}

		obj.hoverAnim = new _t.TWEEN.Tween({

			scale: obj._parent.object.scale.x,
			scaleInv: obj.tmpData.scaleInv.scale.x,
			opacity: obj._parent.bubble.material.opacity

		}, _t.Motion.AUTO ).to({

			scale: 1.2,
			opacity: 0.5,
			scaleInv: 0.8,

		}, 400 ).easing( _t.TWEEN.Easing.Circular.Out ).onUpdate((v)=>{

			obj._parent.object.scale.set(v.scale,v.scale,v.scale);
			obj._parent.bubble.material.opacity = v.opacity;

		}).onComplete((v)=>{

		}).onStart((v)=>{

			_t.Assets.materials.hoverIn.opacity = obj._parent.bubble.material.opacity;

			obj._parent.bubble.material = _t.Assets.materials.hoverIn;
		}).start();
		
	}

	window.addEventListener( 'popstate', (evt)=>{
	    if(evt.state){
	        switch(evt.state.type){
	        	case "hero":
	        		if(_i.current.section !== evt.state.section.path){
	        			_i.onTravelTo( {detail: evt.state.section.path} );
	        		} else {
	        			window.dispatchEvent( new CustomEvent('openHero', {detail: evt.state.section.path}) );
	        		}
	        	break;
	        	case "section":
	        		if(_i.current.section !== evt.state.section.path){
	        			_i.onTravelTo( {detail: evt.state.section.path} );
	        		} else {
	        			_i.onLayoutChange({detail: 'sphere'});
	        		}
	        	break;
	        	case "exhibition":
	        		if(_i.current.section !== evt.state.section.path){
	        			_i.onTravelTo( {detail: evt.state.section.path}, ()=>{
	        				window.dispatchEvent( new CustomEvent('openExhibition', {detail: { type: "exhibition", name: evt.state.exhibition.name, id: evt.state.exhibition.id } }) );
	        			})
	        		} else {
	        			_i.onLayoutChange( {detail: 'sphere'}, ()=>{
	        				window.dispatchEvent( new CustomEvent('openExhibition', {detail: { type: "exhibition", name: evt.state.exhibition.name, id: evt.state.exhibition.id } }) );
	        			});
	        		}
	        	break;
	        	case "menu":
	        		window.dispatchEvent( new Event('showMenu') );
	        	break;
	        }
	    }
	}, false);


	window.addEventListener( 'mouseup', _i.onMouseUp, false );
	window.addEventListener( 'mousedown', _i.onMouseDown, false );
	window.addEventListener( 'click', _i.onClick, false );
	window.addEventListener( 'pointermove', _i.onPointerMove, false  );

	
	window.addEventListener( 'closeModal', _i.onCloseModal, false );
	window.addEventListener( 'openBio', _i.onOpenBio, false );

	window.addEventListener( 'openHero', _i.onOpenHero, false  );
	window.addEventListener( 'closeHero', _i.onCloseHero, false  );
	
	window.addEventListener( 'layoutChange', _i.onLayoutChange, false );
	window.addEventListener( 'travelTo', _i.onTravelTo, false );
	window.addEventListener( 'showMenu', _i.onTriggerMenu, false  );
	window.addEventListener( 'leaveExhibition', _i.onLeaveExhibition, false  );

	window.addEventListener( 'openExhibition', _i.onOpenExhibition, false  );

	window.addEventListener( 'nextExhibition', ()=>{
		if(_i.current.exhibition && _i.current.section){
			
			_i.current.index = _i.current.section.exhibitions.indexOf(_i.current.exhibition);
 
			_i.onJumpLeaveExhibition(event, _i.current.section.exhibitions[_i.current.index], ()=>{
				if(_i.current.index+1 > _i.current.section.exhibitions.length-1){
					_i.current.index = 0;
				} else {
					_i.current.index = _i.current.index+1;
				}
				_i.onEnterExhibition(event, _i.current.section.exhibitions[_i.current.index]);
			});
 

			 
		}
	}, false  );

	window.addEventListener( 'prevExhibition', ()=>{
		if(_i.current.exhibition && _i.current.section){
			
			_i.current.index = _i.current.section.exhibitions.indexOf(_i.current.exhibition);

	 
			_i.onJumpLeaveExhibition(event, _i.current.section.exhibitions[_i.current.index], ()=>{
				if(_i.current.index-1 < 0){
					_i.current.index = _i.current.section.exhibitions.length-1;
				} else {
					_i.current.index = _i.current.index-1;
				}
				_i.onEnterExhibition(event, _i.current.section.exhibitions[_i.current.index]);
			});
	 

			 
		}
	}, false  );

	_t.Motion.animations.pointer = ()=>{

		if(_i.switches.raycasting && !_i.switches.isDragging){
			
			_i.raycaster.setFromCamera( _i.pointer, _t.Elements.camera );
			_i.intersects = _i.raycaster.intersectObjects( _t.Elements.intersect );
			
			if(_i.intersects.length > 0){
				if(_i.current.hover !== _i.intersects[0].object){
					_i.hoverIn(_i.intersects[0].object);		
					document.body.style.cursor = 'pointer';	
				}
			} else if(_i.current.hover){
				_i.hoverOut(_i.current.hover);
				_i.current.hover = false;
				document.body.style.cursor = 'default';
			}

		} else if(_i.current.hover){
			_i.hoverOut(_i.current.hover);
			_i.current.hover = false;
			document.body.style.cursor = 'default';
		}
	}

	_i.checkURL = (queryString)=>{

		queryString = queryString.split('/').splice(4, 3);

		if(!_i.initial){
			_i.initial = {};
		}

		if(queryString.length > 1 && queryString[1] !== '' && queryString[1] !== 'current'){

			if( queryString[0] !== '' && _t.sections[queryString[0]]){

				_i.initial.section = _t.sections[queryString[0]];

				for(_i.tmpCnt in _i.initial.section.exhibitions){

					if(_i.initial.section.exhibitions[_i.tmpCnt].path === queryString[1]){

						_i.initial.exhibition = _i.initial.section.exhibitions[_i.tmpCnt];

						_i.onTravelTo({ detail: queryString[0]}, ()=>{
							_i.tmtOut = setTimeout( ()=>{ 
								_i.current.section = _i.initial.section;
								_i.current.exhibition = _i.initial.exhibition;
								_i.onEnterExhibition({ detail: false }, _i.initial.exhibition);
							}, 600);
						})
					}
				}	
			}

			
	 
		} else if((queryString.length === 1 || queryString[1] === '' || queryString[1] === 'current') && queryString[0] !== 'home'){

			if( queryString[0] !== '' && _t.sections[queryString[0]]){
				_i.initial.section = _t.sections[queryString[0]];
				_i.onTravelTo({ detail: queryString[0]}, ()=>{

				})
			}
			
		}
	}

	window.triggerMenu = (event, target)=>{
		event.preventDefault();
		// console.log(event,target);

		_i.onTravelTo({ detail: target}, false, true );

		return false;
	}


	if(end){end()}

}

export { Interaction }