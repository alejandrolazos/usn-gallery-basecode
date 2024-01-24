<?php 
	function Connect(){
		$dbhost = 'localhost';
		$dbport = 3306;
		$username = 'root';
		$password = '';
		$dbname = 'usn_gallery_new_site';

		$link = new mysqli($dbhost, $username, $password, $dbname, $dbport);
		// $link = new mysqli('usn-db1.cwlnqoi0m24n.ap-northeast-1.rds.amazonaws.com', 'root', 'pur0j3Kuto', 'gallestagin2', 3306);
		return $link;
	}
?>