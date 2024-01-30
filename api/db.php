<?php 
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

	$tables = ['wp_posts','wp_2_posts', 'wp_3_posts'];

	require_once('images.php');
	require_once('connect.php');
	require_once('reader.php');

	function SplitLang($string){
		if( is_string($string) && str_contains($string, '[:]')  ){

			$en = strstr($string, "[:en]"); //gets all text from needle on
			$en = str_replace("[:en]", '', $en);
			$en = strstr($en, "[:]"); //gets all text before needle
			$en = strstr($en, "[:ja]", true); //gets all text before needle

			$ja = strstr($string, "[:ja]"); //gets all text from needle on
			$ja = str_replace("[:ja]", '', $ja);
			$ja = strstr($ja, "[:]", true); //gets all text before needle

			if($ja || $en){
				$string = ["en"=> $en, "ja"=> $ja];	
			} else if( str_contains($string, '[:en]') && str_contains($string, '[:]') ){
				$string = [ "en" => str_replace(['[:en]', '[:]'], '', $string), "ja" => false ];
			} else if( str_contains($string, '[:ja]') && str_contains($string, '[:]') ){
				$string = [ "en" => false, "ja" => str_replace(['[:en]', '[:]'], '', $string) ];
			}

		} else if( is_string($string) && str_contains($string, '<!--:-->') ){

			$en = strstr($string, "<!--:en-->"); //gets all text from needle on
			$en = str_replace("<!--:en-->", '', $en);
			$en = strstr($en, "<!--:-->"); //gets all text before needle
			$en = strstr($en, "<!--:ja-->", true); //gets all text before needle

			$ja = strstr($string, "<!--:ja-->");  //gets all text from needle on
			$ja = str_replace("<!--:ja-->", '', $ja);
			$ja = strstr($ja, "<!--:-->", true); //gets all text before needle

			if($ja || $en){
				$string = ["en"=> $en, "ja"=> $ja];	
			} else if( str_contains($string, '<!--:en-->') && str_contains($string, '<!--:-->') ){
				$string = [ "en" => str_replace(['<!--:en-->', '<!--:-->'], '', $string), "ja" => false ];
			} else if( str_contains($string, '<!--:ja-->') && str_contains($string, '<!--:-->') ){
				$string = [ "en" => false, "ja" => str_replace(['<!--:en-->', '<!--:-->'], '', $string) ];
			}
		}
		return $string;
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
		}

		return $returns;
	}

	function ProcessRow($r, $section, $table){

		$r['meta'] = GetMeta($table, $r["ID"]);

		$returns = array(
			"ID"=> $r["ID"],
			"post_title"=> $r["post_title"],
			"post_content"=> $r["post_content"],
			"post_name"=> $r["post_name"],
			"guid"=> $r["guid"],
			"post_type"=> $r["post_type"],
			'description' => $r['meta']['project_description'],
			'startdate' => $r['meta']['start_date'],
			'weekend_hours' => $r['meta']['weekend_hours'],
			'opening_hours' => $r['meta']['opening_hours'],
			'end_date' => $r['meta']['end_date'] 
		);

		$returns['images'] = GetThumbnails($table, $returns['ID']);
		$returns['meta'] = $r['meta'];

		if(isset($r['artist'])){
			$returns['artist'] = $r['artist'];
		} else if(isset($r['meta']['artist'])){
			$returns['artist'] = $r['meta']['artist'];
		}
		
		if(isset($r['price'])){
			$returns['price'] = $r['price'];
		} else if(isset($r['meta']['price'])){
			$returns['price'] = $r['meta']['price'];
		}

		if(isset($returns) && isset($section)){

			$matches = [];
			preg_match_all("/\[([^\]]*)\]/", $returns['post_content'], $matches);
			$returns['attachments'] = [];
			foreach($matches as $key => $values) {
				foreach($values as $key2 => $value) {
					if(str_contains( $value, 'post_gallery')){
						$returns['attachments'] = explode(",", str_replace('"', "", explode('usn_slider post_gallery="', $value)[1])); // explode(",", explode('post_gallery=', $value)[1]);
					} else {
						// print_r($value);
					}
				}
			}

			if(isset( $returns['meta']['hero_image'] ) ){
				$hero_image = $returns['meta']['hero_image'];
			}
			$returns['poster'] = false;

			if( isset($hero_image) && isset($hero_image['guid']) && !str_contains($hero_image['guid'], 'gallery.usn.dev.u5n.jp') ){
				$returns['poster'] = $hero_image['guid'];
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

					$fname = $r["ID"].'_'.basename($hero_image['guid']);
					
					if( !file_exists($dir.'/'.$fname ) ){

						$hero_image['guid'] = str_replace('https://gallery.ultrasupernew.com','http://54.250.33.31', $hero_image['guid']);

						$file = file_get_contents( $hero_image['guid'] );

						if(isset($file) && strlen($file) > 0){

							file_put_contents($dir.'/'.$fname, $file);

							$mime = getimagesize($dir.'/'.$fname);

							if( !file_exists($dir.'/thumbs/'.$fname ) ){
								ImageAutoResize($fname,512,512,$dir,$dir.'/thumbs/');
							}
							if( !file_exists($dir.'/posters/'.$fname ) ){
								ImageAutoResize($fname,1024,1024,$dir,$dir.'/posters/');
							}

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
						!file_exists($dir.'/bw/'.$fname ) 
					){

						$hero_image['guid'] = str_replace('https://gallery.ultrasupernew.com','http://54.250.33.31', $hero_image['guid']);

						$file = file_get_contents( $dir.'/'.$fname );

						if(isset($file) && strlen($file) > 0){

							$mime = getimagesize($dir.'/'.$fname);

							if( !file_exists($dir.'/thumbs/'.$fname ) ){
								ImageAutoResize($fname,512,512,$dir,$dir.'/thumbs/');
							}
							if( !file_exists($dir.'/posters/'.$fname ) ){
								ImageAutoResize($fname,1024,1024,$dir,$dir.'/posters/');
							}

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

				$returns["post_title"] = SplitLang($r["post_title"]);
				$returns["post_content"] = SplitLang($r["post_content"]);
			}
		}

		return $returns;
	}
	
	function GetExhibitions($item = false, $section = false){
		global $tables;
		$link = Connect();
		$returns = [];

		if($section !== false){

			if($section === 'nft'){

				$r = readAPI('gallery/0xc65e4b12574e172f698dbe0fadbc4482d9cb2194');
				$images = ProcessNFT($r, $section);

				$exhibition = array(
					"ID"=> false,
					"content"=> false,
					"title"=> $r["name"],
					"name"=> $r["name"],
					// "artist"=> $r["attributes"][2],// readAPI('0xb946ba47aaafcf159985e862786bf18538cdb21f'),
					"price"=> $r["price"],
					"description"=> $r['description'],
					"startdate"=> false,
					"weekend_hours"=> false,
					"opening_hours"=> false,
					"end_date"=> false,
					"guid"=> false,
					"post_type"=> 'nft',
					"poster"=> $images["poster"],
					"blur"=> $images["blur"],
					"bw"=> $images["bw"],
					"thumbnail"=> $images["thumbnail"],
					"attachments"=> false,
					"images" => false,
					"meta" => false
				);

				for ($i=0; $i < count($r["attributes"]); $i++) { 
					if( isset($r["attributes"][$i]['trait_type']) && $r["attributes"][$i]['trait_type'] === 'Artist' ){
						$exhibition["artist"] = $r["attributes"][$i]['value'];
					} else if( isset($r["attributes"][$i]['trait_type']) && $r["attributes"][$i]['trait_type'] === 'Artwork Type' ){
						$exhibition["type"] = $r["attributes"][$i]['value'];
					}
				}

				array_push($returns, $exhibition);

			} else {

				$_section = $section.'';

				switch($section){
					case "tokyo":
						$section = 'wp_2_posts';
					break;
					case "singapore":
						$section = 'wp_3_posts';
					break;
					default: 
						$section = 'wp_posts';
				}

				$sql = "SELECT * FROM ".$section;

				if($item !== false){
					$sql .= " WHERE ID=".$item." AND post_type=\"exhibition\" AND post_status='publish' ORDER BY ID DESC";
					$result = $link->query($sql);
					if($result){
						while($row = $result->fetch_assoc()) {
							$r = ProcessRow($row, $_section, $section);
							if($r["poster"] !== false){
								$returns = array(
									"ID"=> $r["ID"],
									"content"=> $r["post_content"],
									"title"=> $r["post_title"],
									"name"=> $r["post_name"],
									"artist"=> $r["artist"],
									"price"=> $r["price"],
									"description"=> $r['description'],
									"startdate"=> $r['startdate'],
									"weekend_hours"=> $r['weekend_hours'],
									"opening_hours"=> $r['opening_hours'],
									"end_date"=> $r['end_date'],
									"guid"=> $r["guid"],
									"post_type"=> $r["post_type"],
									"poster"=> $r["poster"],
									"blur"=> $r["blur"],
									"bw"=> $r["bw"],
									"thumbnail"=> $r["thumbnail"],
									"attachments"=> $r["attachments"],
									"images" => $r["images"],
									"meta" => $r["meta"]
								);
							}
						}
					}	
				} else {
					$sql .= " WHERE post_type=\"exhibition\" AND post_status='publish' ORDER BY ID DESC";
					$result = $link->query($sql);
					if($result){
						while($row = $result->fetch_assoc()) {
							$r = ProcessRow($row, $_section, $section);
							if($r["poster"] !== false){
								array_push($returns, array(
									"ID"=> $r["ID"],
									"content"=> $r["post_content"],
									"title"=> $r["post_title"],
									"name"=> $r["post_name"],
									"artist"=> $r["artist"],
									"price"=> $r["price"],
									"description"=> $r['description'],
									"startdate"=> $r['startdate'],
									"weekend_hours"=> $r['weekend_hours'],
									"opening_hours"=> $r['opening_hours'],
									"end_date"=> $r['end_date'],
									"guid"=> $r["guid"],
									"post_type"=> $r["post_type"],
									"poster"=> $r["poster"],
									"blur"=> $r["blur"],
									"bw"=> $r["bw"],
									"thumbnail"=> $r["thumbnail"],
									"attachments"=> $r["attachments"],
									"images" => $r["images"],
									"meta" => $r["meta"]
								));
							}
						}
					}
				}

			}
		}

		$link->close();

		return $returns;
	}

	function GetAttachments($item = false, $section = false){
		
		global $tables;
		$link = Connect();
		$returns = [];

		if($section !== false){

			switch($section){
				case "tokyo":
					$section = 'wp_2_posts';
				break;
				case "singapore":
					$section = 'wp_3_posts';
				break;
				default: 
					$section = 'wp_posts';
			}

			$sql = "SELECT * FROM ".$section;

			if($item !== false){
				$sql .= " WHERE post_type=\"attachment\" ORDER BY ID DESC";
				$result = $link->query($sql);
				while($row = $result->fetch_assoc()) {
					$returns = $row;
				}	
			}

		}

		$link->close();

		return $returns;
	}
 
	function GetPosts($item = false, $section = false){
		
		global $tables;
		$link = Connect();
		$returns = [];

		switch($section){
			case "tokyo":
				$section = 'wp_2_posts';
			break;
			case "singapore":
				$section = 'wp_3_posts';
			break;
			default: 
				$section = 'wp_posts';
		}

		$sql = "SELECT * FROM ".$section." ORDER BY ID DESC";

		$result = $link->query($sql);
		while($row = $result->fetch_assoc()) {
			array_push($returns, $row);
		}	

		$link->close();

		return $returns;
	}

	function GetMeta($section = false, $item = false){
		
		global $tables;
		$link = Connect();
		$returns = [];

		$sectionMeta = str_replace("_posts", "_postmeta", $section);
		if($section !== false && $item !== false){
			$sql = "SELECT * FROM $sectionMeta WHERE post_id=$item";
			$result = $link->query( $sql );
			while($row = $result->fetch_assoc()) {
				if(
					$row["meta_key"] === "project_description" ||
					$row["meta_key"] === "start_date" ||
					$row["meta_key"] === "end_date" ||
					$row["meta_key"] === "opening_hours" ||
					$row["meta_key"] === "artist" ||
					$row["meta_key"] === "price" ||
					$row["meta_key"] === "weekend_hours"
				){

					$returns[$row["meta_key"]] = SplitLang($row["meta_value"]);


				} else if($row["meta_key"] === "hero_image"){
					$sql2 = "SELECT * FROM $section WHERE ID='".$row['meta_value']."'";
					$result2 = $link->query( $sql2 );
					while($row2 = $result2->fetch_assoc()) {
						$returns['hero_image'] = array(
							"ID" => $row2["ID"],
							"post_content" => $row2["post_content"],
							"post_title" => $row2["post_title"],
							"post_name" => $row2["post_name"],
							"guid" => $row2["guid"],
							"post_type" => $row2["post_type"],
							"post_mime_type" => $row2["post_mime_type"]
						);
					}
				}
			}
		}

		$link->close();

		return $returns;
	}

	function GetThumbnails($section = false, $item = false){
		
		global $tables;
		$link = Connect();
		$returns = [];

		if($section !== false && $item !== false){
			$sql = "SELECT * FROM $section WHERE post_parent=$item ORDER BY ID DESC";
			$result = $link->query( $sql );
			while($row = $result->fetch_assoc()) {

				array_push($returns, array(
					"ID" => $row["ID"],
					"post_content" => $row["post_content"],
					"post_title" => $row["post_title"],
					"post_name" => $row["post_name"],
					"guid" => $row["guid"],
					"post_type" => $row["post_type"],
					"post_mime_type" => $row["post_mime_type"]
				));
			}
		}

		$link->close();

		return $returns;
	}


	$metaverses = array(
		"home"=> array(
			"title"=> "UltraSuperNew Gallery",
			"path"=> "home",
			"subtitle"=> "An interactive space that curates and brings together creatives from all backgrounds to ignite discovery, imagination, and conversation.",
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
			"title"=> "Menu",
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
				"orbitting"=> [],
				"arms"=> 0
			)
		),
		"about"=> array(
			"title"=> "About",
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
			"title"=> "Events",
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
			"title"=> "Contact",
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
			"title"=> "Access",
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
		),
		"tokyo"=> array(
			"title"=> "Tokyo",
			"path"=> "tokyo",
			"3d"=> array(
				"render"=> true,
				"coordinates"=> array("x"=> -3250, "y"=> 1000, "z"=> -1750),
				"position"=> array("x"=> 0, "y"=> 0, "z"=> 0),
				"colors"=> ["#ff0054", "#690095"],
				"radius"=> 600,
				"displacement"=> 800,
				"stars"=> true,
				"gas"=> true,
				"orbitting"=> ["lamp","tori","confetti1","confetti2"],
				"arms"=> 5
			),
		    "hero"=> 0,
		    "exhibitions"=> GetExhibitions(false, "tokyo")
		),
		"singapore"=> array(
			"title"=> "Singapore",
			"path"=> "singapore",
			"3d"=> array(
				"render"=> true,
				"coordinates"=> array("x"=> 3250, "y"=> 2500, "z"=> -1750),
				"position"=> array("x"=> 0, "y"=> 0, "z"=> 0),
				"colors"=> ["#00b4ff", "#690095"],
				"radius"=> 800,
				"displacement"=> 800,
				"stars"=> true,
				"gas"=> true,
				"orbitting"=> ["statue","wheel","confetti3","confetti4"],
				"arms"=> 2
			),
		    "hero"=> 0,
		    "exhibitions"=> GetExhibitions(false, "singapore")
		),
		"nft"=>array(
			"title"=> "NFT",
			"path"=> "nft",
			"3d"=> array(
				"render"=> true,
				"coordinates"=> array("x"=> 0, "y"=> 100, "z"=> 3750),
				"position"=> array("x"=> 0, "y"=> 0, "z"=> 0),
				"colors"=> ["#00dd92", "#690095"],
				"radius"=> 600,
				"displacement"=> 800,
				"stars"=> true,
				"gas"=> true,
				"orbitting"=> ["sneaker","mushroom_big","confetti5","confetti6"],
				"arms"=> 3
			),
			"hero"=> 0,
			"exhibitions"=> [] // GetExhibitions(false, "nft")
		)
	);
?>