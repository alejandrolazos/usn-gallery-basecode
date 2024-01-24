<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

function test_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

$formData = test_input($_POST['email']);

$errors = [];

if($formData === ""){
	array_push($errors, "Email: Email can't be empty");
} else if (!filter_var($formData, FILTER_VALIDATE_EMAIL)) {
  array_push($errors, "Email: Invalid email format");
}

if( count($errors) > 0){

	header('Content-Type: application/json; charset=utf-8');
	echo '{ "status": false, "message": "Validation fail. Check email address." }';

} else {

	$cache = file_get_contents('./api/cache/newsletter.cache');
	if(strlen($cache) === 0){
		$cache = $formData;
	} else {
		$cache .= ','.$formData;
	}
	file_put_contents('./api/cache/newsletter.cache', $cache);

	$mail = new PHPMailer(true);

	try {

	    $mail->isSMTP();                                        
	    $mail->Host       = 'smtp.hostinger.com';
	    $mail->SMTPAuth   = true;
	    $mail->Username   = 'usngallery@alelazos.com';
	    $mail->Password   = 'Gallery23!';
	    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
	    $mail->Port       = 465; 

	    //Recipients
	    $mail->setFrom('usngallery@alelazos.com', 'UltraSuperNew Gallery');
	    $mail->addAddress('gallery@ultrasupernew.com');
	    $mail->addCC('usngallery@alelazos.com');
	    $mail->addReplyTo($formData);

	    //Content
	    $mail->isHTML(true);                                  //Set email format to HTML
	    $mail->Subject = "UltraSuperNew Gallery - Visitor added to the newsletter";
	    $mail->Body    = '
	    	<div style="position: relative;">
	    		<p>A visitor has been added to the newsletter:</p>
	    		<ul>
	    			<li><b>Email:</b> '.($formData).'</li>
	    		</ul>
	    		<p><a href="https://gallery.ultrasupernew.com/?newsletter" target="_blank">Click here</a> to view the list of addresses</p>
	    	</div>';
	    $mail->AltBody = 'Please open this email on a modern email manager.';
	    $mail->send();

	    header('Content-Type: application/json; charset=utf-8');
	    echo '{ "status": true, "message": "Email address has been added to the newsletter" }';

	} catch (Exception $e) {

		header('Content-Type: application/json; charset=utf-8');
		echo `{ "status": false, "message": "Email address can't be added to the newsletter!" }`;

	}
}



?>