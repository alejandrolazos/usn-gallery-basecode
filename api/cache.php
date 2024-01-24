<?php 
	
	global $root_path;
	global $lang;
	global $localContentJSON;

	$filename = './api/cache/cache_last.json';

	if( file_exists($filename) === 1 && time()-filemtime($filename) < 2 * 3600){
		
		$json = file_get_contents($filename);
		$json = json_decode($json, true);
		
	} else {

		$json = file_get_contents($root_path.'/cms/wp-json/custom-routes/v1/galaxies');
		$galaxies = json_decode($json, true);

		$metaverses = array(
			"home"=> array(
				"title"=> ["en"=>"UltraSuperNew Gallery", "jp"=>"UltraSuperNew ギャラリー"],
				"path"=> "home",
				"subtitle"=> $localContentJSON['home']['intro_title'],
				"3d"=> array(
					"render"=> true,
					"coordinates"=> array("x"=> -2000, "y"=> 3000, "z"=> 6000),
					"position"=> array("x"=> 0, "y"=> 0, "z"=> 0),
					"colors"=> ["#ff0054", "#00382b"],
					"radius"=> 100000,
					"displacement"=> 800,
					"stars"=> false,
					"gas"=> false,
					"arms"=> 0
				)
			),
			"menu"=> array(
				"title"=> ["en"=>"Menu", "jp"=>"メニュー"],
				"path"=> "menu",
				"subtitle"=> "",
				"3d"=> array(
					"render"=> false,
					"coordinates"=> array("x"=> 0, "y"=> 1000, "z"=> -4000.001),
					"position"=> array("x"=> 0, "y"=> 1000, "z"=> -4000),
					"colors"=> ["#ffaa00", "#996600"],
					"radius"=> 100000,
					"displacement"=> 800,
					"stars"=> false,
					"gas"=> false,
					"orbitting"=> ['mushroom_big', 'origami', 'sneaker'],
					"arms"=> 0
				)
			),
			"about"=> array(
				"title"=> ["en"=>"About", "jp"=>"だいたい"],
				"path"=> "about",
				"subtitle"=> "",
				"3d"=> array(
					"render"=> false,
					"coordinates"=> array("x"=> 4000.001, "y"=> 1000, "z"=> 4100),
					"position"=> array("x"=> 4000, "y"=> 1000, "z"=> 4000),
					"colors"=> ["#ffaa00", "#996600"],
					"radius"=> 100000,
					"displacement"=> 800,
					"stars"=> false,
					"gas"=> false,
					"orbitting"=> [],
					"arms"=> 0
				)
			),
			"events"=> array(
				"title"=> ["en"=>"Events", "jp"=>"イベント"],
				"path"=> "events",
				"subtitle"=> "",
				"3d"=> array(
					"render"=> false,
					"coordinates"=> array("x"=> -4000, "y"=> 1000, "z"=> 4100),
					"position"=> array("x"=> -4000, "y"=> 1000, "z"=> 4000),
					"colors"=> ["#ffaa00", "#996600"],
					"radius"=> 100000,
					"displacement"=> 800,
					"stars"=> false,
					"gas"=> false,
					"orbitting"=> [],
					"arms"=> 0
				)
			),
			"contact"=> array(
				"title"=> ["en"=>"Contact", "jp"=>"コンタクト"],
				"path"=> "contact",
				"subtitle"=> "",
				"3d"=> array(
					"render"=> false,
					"coordinates"=> array("x"=> -2000, "y"=> 4000, "z"=> -2000),
					"position"=> array("x"=> 0, "y"=> 0, "z"=> 0),
					"colors"=> ["#ffaa00", "#996600"],
					"radius"=> 100000,
					"displacement"=> 800,
					"stars"=> false,
					"gas"=> false,
					"orbitting"=> [],
					"arms"=> 0
				)
			),
			"access"=> array(
				"title"=> ["en"=>"Access", "jp"=>"アクセス"],
				"path"=> "access",
				"subtitle"=> "",
				"3d"=> array(
					"render"=> false,
					"coordinates"=> array("x"=> 4000, "y"=> 4500, "z"=> 100),
					"position"=> array("x"=> 0, "y"=> 0, "z"=> 0),
					"colors"=> ["#ffaa00", "#996600"],
					"radius"=> 100000,
					"displacement"=> 800,
					"stars"=> false,
					"gas"=> false,
					"orbitting"=> [],
					"arms"=> 0
				)
			)
		);

		for ($i=0; $i < count($galaxies); $i++) { 

			$src_galaxy = $galaxies[$i];

			if(isset($src_galaxy['path'])){
				$src_galaxy['slug'] = $src_galaxy['path'];
			} else if(!isset($src_galaxy['slug'])){

				if( isset($src_galaxy['galaxy'][$lang]) && $src_galaxy['galaxy'][$lang] !== '' ){
					$src_galaxy['slug'] = Slug($src_galaxy['galaxy'][$lang]);	
				} else if( isset($src_galaxy['galaxy']['en']) && $src_galaxy['galaxy']['en'] !== '' ){
					$src_galaxy['slug'] = Slug($src_galaxy['galaxy']['en']);	
				} else if( isset($src_galaxy['galaxy']['jp']) && $src_galaxy['galaxy']['jp'] !== '' ){
					$src_galaxy['slug'] = Slug($src_galaxy['galaxy']['jp']);	
				} else {
					$src_galaxy['slug'] = false;
				}

			}

			if(!isset($src_galaxy['slug'])){
				if( isset($src_galaxy['galaxy'][$lang]) && $src_galaxy['galaxy'][$lang] !== '' ){
					$src_galaxy['slug'] = Slug($src_galaxy['galaxy'][$lang]);	
				} else if( isset($src_galaxy['galaxy']['en']) && $src_galaxy['galaxy']['en'] !== '' ){
					$src_galaxy['slug'] = Slug($src_galaxy['galaxy']['en']);	
				} else if( isset($src_galaxy['galaxy']['jp']) && $src_galaxy['galaxy']['jp'] !== '' ){
					$src_galaxy['slug'] = Slug($src_galaxy['galaxy']['jp']);	
				} else {
					$src_galaxy['slug'] = false;
				}
			}

			if(!!$src_galaxy['slug']){

				$metaverses[ $src_galaxy['slug'] ] = array(
					"title"=> $src_galaxy['galaxy'],
					"path"=> $src_galaxy['slug'],
					"3d"=> array(
						"render"=> (bool)$src_galaxy['active'],
						"coordinates"=> array(
							"x"=> (float)str_replace(',', '.', $src_galaxy['3d']['coordinates']['x']), 
							"y"=> (float)$src_galaxy['3d']['coordinates']['y'], 
							"z"=> (float)$src_galaxy['3d']['coordinates']['z']
						),
						"position"=> array(
							"x"=> (float)$src_galaxy['3d']['position']['x'], 
							"y"=> (float)$src_galaxy['3d']['position']['y'], 
							"z"=> (float)$src_galaxy['3d']['position']['z']
						),
						"colors"=> explode(",", str_replace(" ", "", $src_galaxy['3d']['colors'])),
						"radius"=> (float)$src_galaxy['3d']['radius'],
						"displacement"=> (float)$src_galaxy['3d']['displacement'],
						"stars"=> (bool)$src_galaxy['3d']['stars'],
						"gas"=>  (bool)$src_galaxy['3d']['gas'],
						"orbitting"=> explode(",", str_replace(" ", "", $src_galaxy['3d']['orbitting'])),
						"arms"=> (int)$src_galaxy['3d']['arms'],
					),
				    "hero"=> 0,
				    "exhibitions"=> []
				);

				if(strtolower($src_galaxy['slug']) !== 'nft'){
					$metaverses[ $src_galaxy['slug'] ]['exhibitions'] = GetExhibitionsJSON($src_galaxy['apiendpoint']);
				}

				if(strtolower($src_galaxy['slug']) === 'nft'){
					array_push( $metaverses[ $src_galaxy['slug'] ]['3d']['orbitting'], 'cube');
					// array_push( $metaverses[ $src_galaxy['slug'] ]['orbitting'], 'boat');
				} else if(strtolower($src_galaxy['slug']) === 'tokyo'){
					array_push( $metaverses[ $src_galaxy['slug'] ]['3d']['orbitting'], 'origami');
				} else if(strtolower($src_galaxy['slug']) === 'singapore'){
					array_push( $metaverses[ $src_galaxy['slug'] ]['3d']['orbitting'], 'icecream');
				}

				if(count($metaverses[ $src_galaxy['slug'] ]["exhibitions"]) > 0 && isset($src_galaxy['current_exhibition']) && is_array($src_galaxy['current_exhibition']) && count($src_galaxy['current_exhibition']) > 0){
					for ($ci=0; $ci < count($metaverses[ $src_galaxy['slug'] ]["exhibitions"]); $ci++) { 
						if($metaverses[ $src_galaxy['slug'] ]["exhibitions"][$ci]['ID'] === $src_galaxy['current_exhibition'][0]){
							$metaverses[ $src_galaxy['slug'] ]['hero'] = $ci;
						}
					}
				}
			}
		}

		$metaverses['last_update'] = date('d-m-y H:i');

		$json = json_encode($metaverses);

		file_put_contents($filename, $json);
	}
	
?>