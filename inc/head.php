<meta charset="utf-8">
<?php 
	$root_path = 'https://ultrasupernew.gallery';
	$lang = 'en';
	$_fakeGET = explode('/', $_SERVER['REQUEST_URI']);
	$GET = [];
	if(isset($_fakeGET[1]) && strlen($_fakeGET[1]) > 0){
		$GET['lang'] = str_replace(" ", "", strtolower($_fakeGET[1]));
	}
	if(isset($_fakeGET[2]) && strlen($_fakeGET[2]) > 0){
		$GET['section'] = str_replace(" ", "", strtolower($_fakeGET[2]));
	}
	if(isset($_fakeGET[3]) && strlen($_fakeGET[3]) > 0){
		$GET['exhibition'] = str_replace(" ", "", strtolower($_fakeGET[3]));
	}
	if( isset($GET['lang']) && $GET['lang'] === 'jp' ){ 
		$lang = 'jp'; 
	}
	
	$localContent = file_get_contents('../content/'.$lang.'.json');
	$localContent = stripslashes(html_entity_decode($localContent));
	$localContentJSON = json_decode($localContent, TRUE);

	echo '<title>UltraSuperNew Gallery</title>';

	require_once('../api/content.php');

	$bodyClass = '_intro'; 

	if( isset($GET['exhibition']) ){ 
		$bodyClass = '_exhibition'; 
	} 

	if ( isset($GET['section']) && $GET['section'] !== 'home' ){ 
		$bodyClass = '_section'; 
	}

	if(file_exists('./api/cache/cache_'.date('dmyHi').'.json')){
		$cache = file_get_contents('./api/cache/cache_'.date('dmyHi').'.json');	
	} else {
		$cache = '';
	}

	if( strlen($cache) > 100){

		echo '
			<script type="text/javascript">
				const appData = '.$cache.';
				const lang = "'.$lang.'";
				const localContent = '.$localContent.';
			</script>
		';

	} else {
		
		require_once('../api/cache.php');

		echo '
			<script type="text/javascript">
				const appData = '.$json.';
				const lang = "'.$lang.'";
				const localContent = '.$localContent.';
			</script>
		';	
	}

?>
<link rel="icon" href="/assets/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">

<link rel="stylesheet" type="text/css" href="dist/style/photoswipe.css?rand=<?php echo rand()*rand(); ?>">
<link rel="stylesheet" type="text/css" href="dist/style/style.css?rand=<?php echo rand()*rand(); ?>">
<link rel="stylesheet" type="text/css" href="dist/style/gallery.css?rand=<?php echo rand()*rand(); ?>">
<link rel="stylesheet" type="text/css" href="dist/app.min.css?rand=<?php echo rand()*rand(); ?>">
