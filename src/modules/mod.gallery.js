const Gallery = (container)=>{

	let _g = {}

	_g.classes = [ "current", "next","prev","future","past","hidden"];

	_g.removeKeepClasses = (obj, _keep)=>{

		if(obj && obj.classList){
			for(let idx in _g.classes){
				if( (_keep && _g.classes[idx].indexOf(_keep) < 0) || !_keep){
					obj.classList.remove(_g.classes[idx]);
				}
			}
			if( _keep && Array.isArray(_keep) ){
				for(let idx in _keep){
					obj.classList.add(_keep[idx]);
				}
			} else if(_keep){
				obj.classList.add(_keep);
			}
		}
		
	}

	_g.update = (elements, index)=>{

		if(elements){
			_g.elements = elements;	
		}

		if(_g.elements){
			for(_g.cnt in _g.elements){
				if(parseInt(_g.cnt) === index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'current');
				} else if(parseInt(_g.cnt) === index + 1){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'next');
				} else if(parseInt(_g.cnt) === index - 1){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'prev');
				} else if(parseInt(_g.cnt) > index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'future');
				} else if(parseInt(_g.cnt) < index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'past');
				} else {
					_g.removeKeepClasses(_g.elements[_g.cnt], 'hidden');
				}
			}
		}
		
	}

	window.addEventListener("galleryUpdate", (event)=>{
		_g.update(false, event.detail.index);
	}, false);

	return _g;
}


const Photos = (container)=>{

	let _g = {}
	_g.classes = [ "current", "next","prev","future","past","hidden"];

	_g.removeKeepClasses = (obj, _keep)=>{

		if(obj && obj.classList){
			for(let idx in _g.classes){
				if( (_keep && _g.classes[idx].indexOf(_keep) < 0) || !_keep){
					obj.classList.remove(_g.classes[idx]);
				}
			}
			if( _keep && Array.isArray(_keep) ){
				for(let idx in _keep){
					obj.classList.add(_keep[idx]);
				}
			} else if(_keep){
				obj.classList.add(_keep);
			}
		}
		
	}

	_g.update = (elements, index)=>{

		if(elements){
			_g.elements = elements;	
		}

		if(_g.elements){
			for(_g.cnt in _g.elements){
				if(parseInt(_g.cnt) === index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'current');
				} else if(parseInt(_g.cnt) === index + 1){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'next');
				} else if(parseInt(_g.cnt) === index - 1){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'prev');
				} else if(parseInt(_g.cnt) > index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'future');
				} else if(parseInt(_g.cnt) < index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'past');
				} else {
					_g.removeKeepClasses(_g.elements[_g.cnt], 'hidden');
				}
			}
		}
		
	}

	window.addEventListener("photosUpdate", (event)=>{
		_g.update(false, event.detail.index);
	}, false);

	return _g;
}

const Slider = (_t)=>{

	let _g = {}

	const _i = _t.Interaction;

	_g.videos = {}

	_g.lastIndex = 0;
	_g.player = false;
	_g.classes = [ "current", "next","prev","future","past","hidden"];

	_g.removeKeepClasses = (obj, _keep)=>{

		if(obj && obj.classList){
			for(let idx in _g.classes){
				if( (_keep && _g.classes[idx].indexOf(_keep) < 0) || !_keep){
					obj.classList.remove(_g.classes[idx]);
				}
			}
			if( _keep && Array.isArray(_keep) ){
				for(let idx in _keep){
					obj.classList.add(_keep[idx]);
				}
			} else if(_keep){
				obj.classList.add(_keep);
			}
		}
		
	}

	_g.destroy = (obj)=>{

		window.removeEventListener("playVideo", _g._playVideo, true);
		window.removeEventListener("sliderUpdate", _g._sliderUpdate, true);

		for(let prop in obj) {
		  	if (obj[prop]){
		    		delete obj[prop];
		  	} else if (typeof obj[prop] === 'object'){
		    		_g.destroy(obj[prop]);
		  	}
		}
	  	
	  	return obj;
	}

	_g.update = (elements, index)=>{

		if(elements){
			_g.elements = elements;	
		}

		if(_g.elements){

			_g.elements[_g.lastIndex].classList.remove('playing');

			for(_g.cnt in _g.elements){
				if(parseInt(_g.cnt) === index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'current');
				} else if(parseInt(_g.cnt) === index + 1){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'next');
				} else if(parseInt(_g.cnt) === index - 1){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'prev');
				} else if(parseInt(_g.cnt) > index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'future');
				} else if(parseInt(_g.cnt) < index){
					_g.removeKeepClasses(_g.elements[_g.cnt], 'past');
				} else {
					_g.removeKeepClasses(_g.elements[_g.cnt], 'hidden');
				}
			}

			_g.lastIndex = index;
		}

	}

	_g.playVideo = (index, __callback)=>{

		if(_g.elements[index] && !window.videoPlayer && _g.elements[index].dataset && _g.elements[index].dataset.video){
			window.videoPlayer = new YT.Player('youtube_wrapper', {
			  height: window.innerHeight * 0.8,
			  width: window.innerWidth * 0.8,
			  videoId: _g.elements[index].dataset.video,
			  playerVars: { 
			  	'controls': 1, 
			  	'autoplay': 1,
			  	'color': "white",
			  	'disablekb': 1,
			  	'enablejsapi': 1,
			  	'iv_load_policy': 3,
			  	'playsinline': 1,
			  	'rel':0,
			  	'modestbranding':1,
			  	'showinfo':0
			  },
			  events: {
			    
			  }
			});
		} else {
			window.videoPlayer.loadVideoById({
				height: window.innerHeight * 0.8,
				width: window.innerWidth * 0.8,
				videoId: _g.elements[index].dataset.video,
				playerVars: { 
					'controls': 1, 
					'autoplay': 1,
					'color': "white",
					'disablekb': 1,
					'enablejsapi': 1,
					'iv_load_policy': 3,
					'playsinline': 1,
					'rel':0,
					'modestbranding':1,
					'showinfo':0
				}
			})
		}

		if(!_i.modal){
			_i.modal = document.getElementById('modal');
		}

		if(_i.modalTmtOut){
			clearTimeout(_i.modalTmtOut);
		}

		_i.modal.classList.remove('art', 'ph');

		_i.modal.style.display = 'flex';
		_i.modal.style.zIndex = 100000;
		_i.modal.classList.add('active', 'vid');
		_i.modalTmtOut = setTimeout( ()=>{
			_i.modal.style.opacity = 1;
		}, 350);

		if(__callback) __callback();
	}

	_g._playVideo = (event)=>{
		_g.playVideo(event.detail.index);
	}
	window.addEventListener("playVideo", _g._playVideo, true);

	_g._sliderUpdate = (event)=>{
		_g.update(false, event.detail.index);
		_g.lastIndex = event.detail.index;
	}
	window.addEventListener("sliderUpdate", _g._sliderUpdate, true);

	return _g;
}

export { Gallery, Photos, Slider }