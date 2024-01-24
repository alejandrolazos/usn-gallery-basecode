<?php 
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

	global $root_path;
	global $lang;
	global $localContentJSON;

	require_once('images.php');

	function readAPI($end=false){

		$api_path = "api";
		$cache_path = "cache";
		
		$startpoint = "api/cache/last_update.json";
		$endpoint = "https://api.mybae.io/gallery/0xc65e4b12574e172f698dbe0fadbc4482d9cb2194/1";
		if($end !== false){
			$endpoint = "https://api.mybae.io/".$end;
		}

		if( !is_dir($api_path.'/'.$cache_path) ){
			mkdir($api_path.'/'.$cache_path);
		}

		if(!file_exists($startpoint)){
			file_put_contents($startpoint, '{ "last_update": "'.date("Y-m-d h:i:s").'" }');
		}

		$today = date("Y-m-d h:i:s");
		$today_time = strtotime($today);

		$last_update = json_decode(file_get_contents($startpoint), true)['last_update'];
		$last_update_time = strtotime($last_update);
		
		$time_diff = floor(($today_time - $last_update_time)/3600) % 60;

		if ($time_diff > 30) {
			$read_endpoint = file_get_contents($endpoint);
			if($read_endpoint){
				file_put_contents($cache_path."/data.json", $read_endpoint);	
				file_put_contents($startpoint, '{ "last_update": "'.date("Y-m-d h:i:s").'" }');
			}
		}

		$data = json_decode(file_get_contents('api/'.$cache_path."/data.json"), true);

		return $data;
	}

	function Slug($string){
	    // convert to entities
	    $string = htmlentities( $string, ENT_QUOTES, 'UTF-8' );
	    // regex to convert accented chars into their closest a-z ASCII equivelent
	    $string = preg_replace( '~&([a-z]{1,2})(?:acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml);~i', '$1', $string );
	    // convert back from entities
	    $string = html_entity_decode( $string, ENT_QUOTES, 'UTF-8' );
	    // any straggling caracters that are not strict alphanumeric are replaced with a dash
	    $string = preg_replace( '~[^0-9a-z]+~i', '-', $string );
	    // trim / cleanup / all lowercase
	    $string = trim( $string, '-' );
	    $string = strtolower( $string );
	    return $string;
	}

	function GetExhibitionsJSON($path){

		global $root_path;
		global $lang;
		global $localContentJSON;

		if($path !== ''){
			$json = file_get_contents($root_path.'/'.$path);
			if($json){
				$exhibitions_array = json_decode($json, true);
				$exhibitions_return = [];

				foreach ($exhibitions_array as $key => $exhib) {

					$exhibition = []; 

					$exhibition['ID'] = $exhib['id'];
					$exhibition['section'] = $exhib['post_type'];
					$exhibition['title'] = $exhib['exhibition'];

					if(isset($exhib['exhibition']['slug']) && $exhib['exhibition']['slug'] !== ""){
						$exhibition['path'] = Slug($exhib['exhibition']['slug']);
					} else if(isset($exhib['exhibition']['en']) && $exhib['exhibition']['en'] !== ""){
						$exhibition['path'] = Slug($exhib['exhibition']['en']);	
					} else if(isset($exhib['exhibition']['jp']) && $exhib['exhibition']['jp'] !== ""){
						$exhibition['path'] = Slug($exhib['exhibition']['jp']);
					} else {
						$exhibition['path'] = false;
					}

					if(
						$exhibition['path'] !== false && 
						isset($exhib['poster']['hero']) && $exhib['poster']['hero'] !== "" && $exhib['poster']['hero'] !== false &&
						isset($exhib['poster']['thumbnail']) && $exhib['poster']['thumbnail'] !== "" && $exhib['poster']['thumbnail'] !== false
					){
						$exhibition['subtitle'] = $exhib['subtitle'];
						$exhibition['intro'] = $exhib['intro'];
						$exhibition['description'] = $exhib['description'];
						$exhibition['artists'] = $exhib['artists_id'];

						$exhibition['gallery'] = $exhib['gallery'];
						$exhibition['slider'] = $exhib['slider'];
						$exhibition['photos'] = $exhib['photos'];
						
						$exhibition['extras'] = $exhib['extras'];
						$exhibition['opening'] = $exhib['opening'];
						$exhibition['party'] = $exhib['party'];
						$exhibition['free'] = (bool)$exhib['free'];
						$exhibition['price'] = $exhib['price'];
						$exhibition['ticket'] = $exhib['ticket'];
						$exhibition['date'] = $exhib['date'];
						$exhibition['content_bottom'] = $exhib['content_bottom'];

						$exhibition['poster'] = $exhib['poster'];
						$exhibition['poster'] = ProcessExhibitions($exhibition, $exhib['post_type']);

						array_push($exhibitions_return, $exhibition);

						// echo '<pre>';
						// print_r($exhibition);
						// echo '</pre>';
					}

				}
			} else {
				$exhibitions_return = [];	
			}
			
		} else {
			$exhibitions_return = [];
		}

		return $exhibitions_return;
	}

	function ProcessExhibitions($r, $section){

		$returns = array();

		if( isset($r['poster']['hero'])  ){

			if(!is_dir('content/desktop')){
				mkdir('content/desktop');
			}
			$dir = 'content/desktop/'.$section;

			if(!is_dir($dir)){
				mkdir($dir);
			}
			if(!is_dir($dir.'/thumbs')){
				mkdir($dir.'/thumbs');
			}

			/*
			if(!is_dir($dir.'/alpha')){
				mkdir($dir.'/alpha');
			}
			*/

			if(!is_dir($dir.'/posters')){
				mkdir($dir.'/posters');
			}
			if(!is_dir($dir.'/blur')){
				mkdir($dir.'/blur');
			}
			if(!is_dir($dir.'/bw')){
				mkdir($dir.'/bw');
			}
			if(is_dir($dir.'/thumbs')){

				$fname = $r["ID"].'_'.basename($r['poster']['hero']);
				
				if( !file_exists($dir.'/'.$fname ) ){

					/*****************************************/
					
					$file = file_get_contents( $r['poster']['hero'] );

					if(isset($file) && strlen($file) > 0){

						file_put_contents($dir.'/'.$fname, $file);

						$mime = getimagesize($dir.'/'.$fname);

						if( !file_exists($dir.'/thumbs/'.$fname ) ){
							ImageAutoResize($fname,512,512,$dir,$dir.'/thumbs/');
						}
						if( !file_exists($dir.'/posters/'.$fname ) ){
							ImageAutoResize($fname,1024,1024,$dir,$dir.'/posters/');
						}

						/*
						if( !file_exists($dir.'/alpha/'.$fname ) ){
							ToAlphaEdges($mime[0],$mime[1],$dir.'/alpha/'.$fname);
						}
						*/

						

						if( !file_exists($dir.'/blur/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								BlurPNG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}
							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								BlurJPG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}  
						}
						
						if( !file_exists($dir.'/bw/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								bwPNG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}
							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								bwJPG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}  
						}

					}
				} else if( 
					!file_exists($dir.'/thumbs/'.$fname ) || 
					!file_exists($dir.'/posters/'.$fname ) || 
					!file_exists($dir.'/blur/'.$fname ) || 
					// !file_exists($dir.'/alpha/'.$fname ) || 
					!file_exists($dir.'/bw/'.$fname ) 
				){

					$file = file_get_contents( $dir.'/'.$fname );

					if(isset($file) && strlen($file) > 0){

						$mime = getimagesize($dir.'/'.$fname);

						if( !file_exists($dir.'/thumbs/'.$fname ) ){
							ImageAutoResize($fname,512,512,$dir,$dir.'/thumbs/');
						}
						if( !file_exists($dir.'/posters/'.$fname ) ){
							ImageAutoResize($fname,1024,1024,$dir,$dir.'/posters/');
						}

						/*
						if( !file_exists($dir.'/alpha/'.$fname ) ){
							ToAlphaEdges($mime[0],$mime[1],$dir.'/alpha/'.$fname);
						}
						*/

						if( !file_exists($dir.'/blur/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								BlurPNG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}

							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								BlurJPG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}  
						}

						if( !file_exists($dir.'/bw/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								bwPNG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}

							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								bwJPG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}  

						}

					}

				}
			}

			$returns['hero'] = $dir.'/posters/'.$fname;
			$returns['thumbnail'] = $dir.'/thumbs/'.$fname;
			$returns['blur'] = $dir.'/blur/'.$fname;
			$returns['bw'] = $dir.'/bw/'.$fname;
			// $returns['alpha'] = $dir.'/alpha/'.$fname;
		}
		return $returns;
	}

	function ProcessNFT($r, $section){

		$returns = [];

		if( isset($r["image"]) ){
				
			if(!is_dir('content/desktop')){
				mkdir('content/desktop');
			}
			$dir = 'content/desktop/'.$section;
			if(!is_dir($dir)){
				mkdir($dir);
			}
			if(!is_dir($dir.'/thumbs')){
				mkdir($dir.'/thumbs');
			}

			/*
			if(!is_dir($dir.'/alpha')){
				mkdir($dir.'/alpha');
			}
			*/

			if(!is_dir($dir.'/posters')){
				mkdir($dir.'/posters');
			}
			if(!is_dir($dir.'/blur')){
				mkdir($dir.'/blur');
			}
			if(!is_dir($dir.'/bw')){
				mkdir($dir.'/bw');
			}
			if(is_dir($dir.'/thumbs')){

				$fname = basename($r["image"]);
				
				if( !file_exists($dir.'/'.$fname ) ){

					$file = file_get_contents( $r["image"] );

					if(isset($file) && strlen($file) > 0){

						file_put_contents($dir.'/'.$fname, $file);

						$mime = getimagesize($dir.'/'.$fname);

						if( !file_exists($dir.'/thumbs/'.$fname ) ){
							ImageAutoResize($fname,512,512,$dir,$dir.'/thumbs/');
						}
						if( !file_exists($dir.'/posters/'.$fname ) ){
							ImageAutoResize($fname,1024,1024,$dir,$dir.'/posters/');
						}

						/*
						if( !file_exists($dir.'/alpha/'.$fname ) ){
							ToAlphaEdges($mime[0],$mime[1],$dir.'/alpha/'.$fname);
						}
						*/

						if( !file_exists($dir.'/blur/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								BlurPNG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}
							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								BlurJPG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}  
						}
						
						if( !file_exists($dir.'/bw/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								bwPNG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}
							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								bwJPG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}  
						}

					}
				} else if( 
					!file_exists($dir.'/thumbs/'.$fname ) || 
					!file_exists($dir.'/posters/'.$fname ) || 
					!file_exists($dir.'/blur/'.$fname ) || 
					// !file_exists($dir.'/alpha/'.$fname ) || 
					!file_exists($dir.'/bw/'.$fname ) 
				){

					$file = file_get_contents( $dir.'/'.$fname );

					if(isset($file) && strlen($file) > 0){

						$mime = getimagesize($dir.'/'.$fname);

						if( !file_exists($dir.'/thumbs/'.$fname ) ){
							ImageAutoResize($fname,512,512,$dir,$dir.'/thumbs/');
						}
						if( !file_exists($dir.'/posters/'.$fname ) ){
							ImageAutoResize($fname,1024,1024,$dir,$dir.'/posters/');
						}

						/*
						if( !file_exists($dir.'/alpha/'.$fname ) ){
							ToAlphaEdges($mime[0],$mime[1],$dir.'/alpha/'.$fname);
						}
						*/

						if( !file_exists($dir.'/blur/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								BlurPNG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}

							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								BlurJPG($dir.'/posters/'.$fname, $dir.'/blur/'.$fname);
							}  
						}

						if( !file_exists($dir.'/bw/'.$fname ) ){

							if($mime['mime']=='image/png') { 
								bwPNG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}

							if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
								bwJPG($dir.'/posters/'.$fname, $dir.'/bw/'.$fname);
							}  

						}

					}

				}
			}
			$returns['poster'] = $dir.'/posters/'.$fname;
			$returns['thumbnail'] = $dir.'/thumbs/'.$fname;
			$returns['blur'] = $dir.'/blur/'.$fname;
			$returns['bw'] = $dir.'/bw/'.$fname;
			// $returns['alpha'] = $dir.'/alpha/'.$fname;
		}

		return $returns;
	}

?>