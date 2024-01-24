<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

//Create an instance; passing `true` enables exceptions

function test_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

$formData = array(
	"name"=> test_input($_POST['name']),
	"company"=> test_input($_POST['company']),
	"email"=> test_input($_POST['email']),
	"phone"=> test_input($_POST['phone']),
	"subject"=> test_input($_POST['subject']),
	"message"=> test_input($_POST['message']),
	"send"=> test_input($_POST['send']),
	"newsletter"=> test_input($_POST['newsletter'])
);


$errors = [];

if($formData['name'] === ""){
	array_push($errors, "Name: Name can't be empty");
} else if (!preg_match("/^[a-zA-Z-' ]*$/",$formData['name'])) {
  	$errors['name'] = "Name: Only letters and white space allowed";
}

if($formData['email'] === ""){
	array_push($errors, "Email: Email can't be empty");
} else if (!filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
  	$errors['email'] = "Email: Invalid email format";
}

if ($formData['message'] === "") {
  array_push($errors, "Message: Message can't be empty");
}

if( count($errors) > 0){

	header('Content-Type: application/json; charset=utf-8');
	echo '{ "status": false, "message": "Validation fail. Check your name, email and message." }';

} else {

	if($formData['newsletter'] === 'on'){
		$cache = file_get_contents('./api/cache/newsletter.cache');
		if(strlen($cache) === 0){
			$cache = $formData['email'];
		} else {
			$cache .= ','.$formData['email'];
		}
		file_put_contents('./api/cache/newsletter.cache', $cache);
	}

	$mail = new PHPMailer(true);

	try {
	    //Server settings
	    $mail->isSMTP();                                        
	    // $mail->Host       = 'smtp.hostinger.com';
	    $mail->Host       = 'smtp.ultrasupernew.com';
	    $mail->SMTPAuth   = true;
	    // $mail->Username   = 'usngallery@alelazos.com';
	    $mail->Username   = 'website@ultrasupernew.com';
	    // $mail->Password   = 'Gallery23!';
	    $mail->Password   = 'vg2VfqJLVO55GGrFUpQUglao';
	    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
	    $mail->Port       = 465; 

	    //Recipients
	    // $mail->setFrom('usngallery@alelazos.com', 'UltraSuperNew Gallery');
	    $mail->setFrom('website@ultrasupernew.com', 'UltraSuperNew Gallery');
	    $mail->addAddress('gallery@ultrasupernew.com');
	    // $mail->addCC('usngallery@alelazos.com');
	    $mail->addCC('website@ultrasupernew.com');
	    $mail->addReplyTo($formData['email'], $formData['name']);

	    $mail->isHTML(true);
	    $mail->Subject = "UltraSuperNew Gallery - New message from a visitor";
	    $mail->Body    = '
	    	<div style="position: relative;">
	    		<p><b>'.strtoupper($formData['name']).'</b> has sent the following message:</p>
	    		<ul>
	    			<li><b>Name:</b> '.strtoupper($formData['name']).'</li>
	    			<li><b>Company:</b> '.strtoupper($formData['company']).'</li>
	    			<li><b>Email:</b> '.($formData['email']).'</li>
	    			<li><b>Phone:</b> '.($formData['phone']).'</li>
	    			<li><b>Subject:</b> '.($formData['subject']).'</li>
	    			<li><b>Message:</b> <p>'.($formData['message']).'</p></li>
	    			<li><b>Newsletter:</b> '.($formData['newsletter']).'</li>
	    		</ul>
	    	</div>';
	    $mail->AltBody = 'Please open this email on a modern email manager.';
	    $mail->send();

	    header('Content-Type: application/json; charset=utf-8');
	    echo '{ "status": true, "message": "Message has been sent" }';

	} catch (Exception $e) {

		header('Content-Type: application/json; charset=utf-8');
		echo '{ "status": false, "message": "Message could not be sent. Mailer Error: {$mail->ErrorInfo}" }';

	}
}



?>