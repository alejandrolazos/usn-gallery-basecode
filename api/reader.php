<?php

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

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
?>