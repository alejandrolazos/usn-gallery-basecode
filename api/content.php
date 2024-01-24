<?php 
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	
	global $root_path;
	global $lang;
	global $localContentJSON;
	
	/*

	Galaxies
	https://usngallery.alelazos.com/wp-json/custom-routes/v1/galaxies 

	---
	Exhibitions (LISTA DE TODAS LAS GALAXIAS)
	https://usngallery.alelazos.com/wp-json/custom-routes/v1/exhibitions

	---
	Singapore (FICHA EXIHIBITION)
	https://usngallery.alelazos.com/wp-json/custom-routes/v1/singapore

	Tokyo (FICHA EXIHIBITION)
	https://usngallery.alelazos.com/wp-json/custom-routes/v1/tokyo

	---
	Artists
	https://usngallery.alelazos.com/wp-json/custom-routes/v1/artists

	---
	Media (librería de todas las imágenes de Wordpress)
	https://usngallery.alelazos.com/wp-json/wp/v2/media/

	* en cada caso se puede poner el ID

	*/

	if( isset($_GET['db'])  ){

		include_once('db.php');

	} else {

		include_once('ep.php');

	}
	
?>