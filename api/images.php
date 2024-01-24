<?php 

	$rewrite = false;

	function ToAlphaEdges($w, $h, $path){
		$img = imagecreatetruecolor($w, $h);
		$bgcolor = imagecolorallocate($img, 0, 0, 0);
		
		$size = (int)($w / 100 * 8);
		imagefilledrectangle($img, 0, 0, $w, $h, $bgcolor);

		$frcolor = imagecolorallocate($img, 255, 255, 255);
		imagefilledrectangle($img, $size, $size, $w - $size, $h - $size, $frcolor);

		$img = ImageResize($img, 128, 128);

		for ($i = 0; $i < 40; $i++) {
		    imagefilter($img, IMG_FILTER_GAUSSIAN_BLUR);
		}

		imagepng($img, $path, 4);
	}

	function ImageResize($image, $w, $h){
	    $oldw = imagesx($image);
	    $oldh = imagesy($image);
	    $temp = imagecreatetruecolor($w, $h);
	    imagecopyresampled($temp, $image, 0, 0, 0, 0, $w, $h, $oldw, $oldh);
	    return $temp;
	}

	function ImageAutoResize($image_name,$new_width,$new_height,$uploadDir,$moveToDir)
	{
	    $path = $uploadDir . '/' . $image_name;

	    $mime = getimagesize($path);

	    if($mime['mime']=='image/png') { 
	        $src_img = imagecreatefrompng($path);
	    }
	    if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
	        $src_img = imagecreatefromjpeg($path);
	    }   

	    $old_x          =   imageSX($src_img);
	    $old_y          =   imageSY($src_img);

	    if($old_x > $old_y) 
	    {
	        $thumb_w    =   $new_width;
	        $thumb_h    =   $old_y*($new_height/$old_x);
	    }

	    if($old_x < $old_y) 
	    {
	        $thumb_w    =   $old_x*($new_width/$old_y);
	        $thumb_h    =   $new_height;
	    }

	    if($old_x == $old_y) 
	    {
	        $thumb_w    =   $new_width;
	        $thumb_h    =   $new_height;
	    }

	    $dst_img        =   ImageCreateTrueColor(round($thumb_w),round($thumb_h));

	    imagecopyresampled($dst_img,$src_img,0,0,0,0,round($thumb_w),round($thumb_h),round($old_x),round($old_y)); 


	    // New save location
	    $new_thumb_loc = $moveToDir . $image_name;

	    if($mime['mime']=='image/png') {
	        $result = imagepng($dst_img,$new_thumb_loc,4);
	    }
	    if($mime['mime']=='image/jpg' || $mime['mime']=='image/jpeg' || $mime['mime']=='image/pjpeg') {
	        $result = imagejpeg($dst_img,$new_thumb_loc,80);
	    }

	    imagedestroy($dst_img); 
	    imagedestroy($src_img);

	    return $result;
	}

	function _ImageAutoResize($path, $target, $w, $h){
		if(file_exists($path)){
			if(str_contains($path, 'png') === true){
				$image = imagecreatefrompng($path);
				$image = ImageResize($image, $w, $h);
				imagepng($image, $target);
				imagedestroy($image);
			} else if( str_contains($path, 'jpeg') === true || str_contains($path, 'jpg') === true){
				$image = imagecreatefromjpeg($path);
				$image = ImageResize($image, $w, $h);
				imagejpeg($image, $target);
				imagedestroy($image);
			}
		}
	}

	function BlurPNG($path, $pathBlur){

		global $rewrite;

		if($rewrite === true || file_exists($pathBlur) === false){

			$image = imagecreatefrompng($path);
			$image = ImageResize($image, 512, 512);

			for ($i = 0; $i < 20; $i++) {
			    imagefilter($image, IMG_FILTER_SMOOTH, 6);
			    imagefilter($image, IMG_FILTER_GAUSSIAN_BLUR);
			}

			imagefilter($image, IMG_FILTER_BRIGHTNESS, -15);

			imagepng($image, $pathBlur);
			imagedestroy($image);
		}
		return $pathBlur;
	}

	function BlurJPG($path, $pathBlur){
		
		global $rewrite;

		if($rewrite === true || file_exists($pathBlur) === false){

			$image = imagecreatefromjpeg($path);
			$image = ImageResize($image, 512, 512);

			for ($i = 0; $i < 20; $i++) {
			    imagefilter($image, IMG_FILTER_SMOOTH, 6);
			    imagefilter($image, IMG_FILTER_GAUSSIAN_BLUR);
			}

			imagefilter($image, IMG_FILTER_BRIGHTNESS, -15);
			imagejpeg($image, $pathBlur);
			imagedestroy($image);
		}
		return $pathBlur;
	}

	function bwPNG($path, $pathBW){
		
		global $rewrite;

		if($rewrite === true || file_exists($pathBW) === false){
			
			$image = imagecreatefrompng($path);
			$image = ImageResize($image, 256, 256);

			for ($i = 0; $i < 20; $i++) {
			    imagefilter($image, IMG_FILTER_SMOOTH, -5);
			    imagefilter($image, IMG_FILTER_GAUSSIAN_BLUR);
			}

			imagefilter($image, IMG_FILTER_CONTRAST, -10);
			imagefilter($image, IMG_FILTER_GRAYSCALE);

			imagepng($image, $pathBW);
			imagedestroy($image);
		}
		return $pathBW;
	}

	function bwJPG($path, $pathBW){
		global $rewrite;

		if($rewrite === true || file_exists($pathBW) === false){
			
			$image = imagecreatefromjpeg($path);
			$image = ImageResize($image, 256, 256);

			for ($i = 0; $i < 20; $i++) {
			    if ($i % 2 == 0) {
			        imagefilter($image, IMG_FILTER_SMOOTH, -5);
			    }
			    imagefilter($image, IMG_FILTER_GAUSSIAN_BLUR);
			}
			imagefilter($image, IMG_FILTER_CONTRAST, -10);
			imagefilter($image, IMG_FILTER_GRAYSCALE);

			imagejpeg($image, $pathBW);
			imagedestroy($image);
		}
		return $pathBW;
	}

?>