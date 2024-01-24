<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>UltraSuperNew - Admin Area</title>
</head>
<body>
	<?php 
		if( 
			isset( $_POST['username'] ) && $_POST['username'] === 'usn_overlord' && 
			isset( $_POST['password'] ) && $_POST['password'] === 'imtherabbit!' 
		){
			
			$txtlist = file_get_contents('api/cache/newsletter.cache');
			if(strlen($txtlist) > 0){
				echo '<pre class="list">'; 
					$list = explode(',', file_get_contents('api/cache/newsletter.cache'));
					$cleanList = [];
					$tmpList = [];
					foreach ($list as $key => $value) {
						$tmpList[$value] = $value;
					}
					foreach ($tmpList as $key => $value) {
						array_push($cleanList, $value);
					}
					echo json_encode($cleanList, JSON_PRETTY_PRINT);
				echo "</pre>"; 	
			} else {
				echo '<div class="list"><i>Newsletter list is empty</i></div>';
			}

		 } else { ?>
			<div class="identify">
				<h2>Who are you?</h2>
				<form action="/?newsletter" method="POST" accept-charset="utf-8">
					<label>
						<span>Username</span>
						<input type="text" name="username" required>
					</label>
					<label>
						<span>Password</span>
						<input type="password" name="password" required>
					</label>
					<button type="submit">LOGIN</button>
				</form>
			</div>	
		<?php } ?>
</body>
</html>