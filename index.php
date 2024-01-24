<?php 
    if( isset($_GET['sendform']) && isset($_POST['send'])){
        require_once('./api/mailer.php');
        exit();
    } else if( isset($_GET['sendnewsletter']) && isset($_POST['email'])){
        require_once('./api/send.newsletter.php');
        exit();
    } else if( isset($_GET['newsletter']) ){
        include_once('./api/view.newsletter.php');
        exit();
    }
?>
<!DOCTYPE html>
<html>
	<head>
		<base href="<?php echo file_get_contents('root.txt'); ?>">
		
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="An interactive space that curates and brings together creatives from all backgrounds to ignite discovery, imagination, and conversation in Tokyo and Singapore.">
		<meta name="keywords" content="UltraSuperNew, Tokyo, Harajuku, Singapore, Creative Agency,  クリエイティブエージェンシー, 原宿, シンガポール, グローバル, 東京"> 

		<meta name="twitter:title" content="UltraSuperNew Gallery | Tokyo &amp; Singapore">
		<meta property="og:image" content="https://ultrasupernew.gallery/assets/images/og-share.jpg" />
		<meta property="og:locale" content="en_US" />
		<meta property="og:site_name" content="UltraSuperNew Gallery | Tokyo &amp; Singapore" />
		<meta property="og:title" content="Homepage" />
		<meta property="og:url" content="https://ultrasupernew.gallery" />
		<meta property="og:type" content="website" />
		<meta property="og:description" content="UltraSuperNew Gallery. An interactive space that curates and brings together creatives from all backgrounds to ignite discovery, imagination, and conversation." />
		<meta property="og:image" content="https://ultrasupernew.gallery/assets/images/og-share.jpg" />
		<meta itemprop="name" content="Homepage" />
		<meta itemprop="headline" content="Homepage" />
		<meta itemprop="description" content="UltraSuperNew Gallery. An interactive space that curates and brings together creatives from all backgrounds to ignite discovery, imagination, and conversation." />
		<meta itemprop="image" content="https://ultrasupernew.gallery/assets/images/og-share.jpg" />
		<meta itemprop="author" content="usn" />
		<meta name="twitter:title" content="Homepage" />
		<meta name="twitter:url" content="https://ultrasupernew.gallery" />
		<meta name="twitter:description" content="UltraSuperNew Gallery. An interactive space that curates and brings together creatives from all backgrounds to ignite discovery, imagination, and conversation." />
		<meta name="twitter:image" content="https://ultrasupernew.gallery/assets/images/og-share.jpg" />
		<meta name="twitter:card" content="summary_large_image" />

		<?php require_once('inc/head.php'); ?>

	</head>
	<body class="<?php echo $bodyClass.' '.$lang; ?>">
		<div id="webgl">
			<?php require_once('inc/webgl.php'); ?>
		</div>
		<div id="usn-app">
			<header id="header">
				<?php require_once('inc/header.php'); ?>
			</header>
			<main id="content">
				<?php require_once('inc/home.php'); ?>	
			</main>
			<aside id="sidebar" class="sidebar">
				<?php require_once('inc/sidebar.php'); ?>				
			</aside>
			<section id="menu" style='display:none;'>
				<?php require_once('inc/menu.php'); ?>
			</section>
			<section id="hero" style='display:none;'>
				<?php require_once('inc/hero.php'); ?>
			</section>
			<section id="exhibition" style='display:none;'>
				<?php require_once('inc/exhibition.php'); ?>
			</section>
			<section id="about" style='display:none;'>
				<?php require_once('inc/about.php'); ?>
			</section>
			<section id="events" style='display:none;'>
				<?php require_once('inc/events.php'); ?>
			</section>
			<section id="access" style='display:none;'>
				<?php require_once('inc/access.php'); ?>
			</section>
			<section id="contact" style='display:none;'>
				<?php require_once('inc/contact.php'); ?>
			</section>
			<section id="modal">
				<?php require_once('inc/modal.php'); ?>
			</section>
			<footer id="footer"></footer>
		</div>
		<div id="preloader" class="preloader">
			<?php require_once('inc/preloader.php'); ?>
		</div>
		<div id="scripts">
			<?php require_once('inc/scripts.php'); ?>
		</div>

	</body>
</html>