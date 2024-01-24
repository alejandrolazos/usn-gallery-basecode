<?php
	/* 
		author: Leo Katz
		website: www.leoktz.com
		company: TriXYZ
		company website: www.trixyz.com
	*/

	
	$dbhost = 'usn-db1.cwlnqoi0m24n.ap-northeast-1.rds.amazonaws.com';
	$username = 'gallery-admin';
	$password = '2YFr1&6te42#';
	$tbname = 'usn_gallery_new_site';
	$dbport = 3306;
/*
	$mysqli = new mysqli($dbhost, $username, $password, $dbname, $dbport);

	// Check connection
	if ($mysqli -> connect_errno) {
	  echo "Failed to connect to MySQL: " . $mysqli -> connect_error;
	  exit();
	} 
	
	// Perform query
	if ($result = $mysqli -> query("SHOW TABLES")) {
	  echo "Returned rows are: " . $result -> num_rows;
	  // Free result set
	  $result -> free_result();
	}

	$mysqli -> close();

	*/




	$con = mysqli_connect($dbhost,$username,$password,$tbname,$dbport);

	if (mysqli_connect_errno()) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	  exit();
	}

	// Perform query
	if ($result = mysqli_query($con, "SHOW COLUMNS")) {
	  echo "Returned rows are: " . mysqli_num_rows($result);
	  // Free result set
	  mysqli_free_result($result);
	}

	mysqli_close($con);
	
?>