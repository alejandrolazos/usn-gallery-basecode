<nav class="navigation" id="navigation">
	<div class="maskmenu"></div>
	<ul>
		<li class="navigation_link-1">
			<a href="/home" title="Galleries" onclick="window.triggerMenu(event, 'home')" data-text="<?php echo $localContentJSON['menu']['home']; ?>"><?php echo $localContentJSON['menu']['home']; ?></a>
			<div>
				<img src="assets/menu/menu-1.png" alt="Galleries" style="max-width: 720px;">
			</div>
		</li>
		<li class="navigation_link-2"><a href="/events" title="Events" onclick="window.triggerMenu(event, 'events')" data-text="<?php echo $localContentJSON['menu']['events']; ?>"><?php echo $localContentJSON['menu']['events']; ?></a>
			<div>
				<span>
					<img src="assets/menu/bb-1.png" alt="Events" class="bubbles-1">
					<img src="assets/images/bubbles-1.png" class="bubbles-2">
					<img src="assets/menu/menu-2-1.jpg" alt="Events" class="menu-2-1">
					<img src="assets/menu/menu-2-2.jpg" alt="Events" class="menu-2-2">
				</span>
				<span>
					<img src="assets/menu/menu-2-3.jpg" alt="Events" class="menu-2-3">
					<img src="assets/menu/menu-2-4.jpg" alt="Events" class="menu-2-4">
				</span>
			</div>
		</li>
		<li class="navigation_link-3"><a href="/about" title="About" onclick="window.triggerMenu(event, 'about')" data-text="<?php echo $localContentJSON['menu']['about']; ?>"><?php echo $localContentJSON['menu']['about']; ?></a>
			<div>
				<img src="assets/images/bubbles-1.png" class="bubbles">
				<img src="assets/images/bubbles-1.png" class="bubbles">
				<img src="assets/menu/menu-3-1.jpg" alt="About" class="menu-3-1">
				<img src="assets/menu/menu-3-2.jpg" alt="About" class="menu-3-2">
			</div>
		</li>
		<li class="navigation_link-4"><a href="/access" title="Access" onclick="window.triggerMenu(event, 'access')" data-text="<?php echo $localContentJSON['menu']['access']; ?>"><?php echo $localContentJSON['menu']['access']; ?></a>
			<div>
				<img src="assets/menu/menu-tokyo.png" alt="Access" class="menu-4-1">
				<img src="assets/menu/menu-singapore.png" alt="Access" class="menu-4-2">
			</div>
		</li>
		<li class="navigation_link-5"><a href="/contact" title="Contact" onclick="window.triggerMenu(event, 'contact')" data-text="<?php echo $localContentJSON['menu']['contact']; ?>"><?php echo $localContentJSON['menu']['contact']; ?></a>
			<div>
				<img src="assets/images/bubbles-1.png" class="bubbles">
				<img src="assets/images/bubbles-1.png" class="bubbles">
				<img src="assets/menu/menu-5-1.jpg" alt="Contact" class="menu-5-1">
				<img src="assets/menu/menu-5-2.jpg" alt="Contact" class="menu-5-2">
			</div>
		</li>
	</ul>

  <!-- Hover -->
	<div class="navigation_info" style="pointer-events:none;"> 
	</div>

	<!-- Newsletter -->
	<form id="nForm" class="newsletter" method="POST" onsubmit="submitNForm(event)">
		<label><?php echo $localContentJSON['menu']['subscribe']; ?></label>
		<input type="email" name="email" placeholder="<?php echo $localContentJSON['menu']['email']; ?>" />		
		<button type="submit">
			<svg width="14.118" height="16" viewBox="0 0 14.118 16">
				<path id="icon-send"
					d="M20.118,16.353,14.471,22l-1.336-1.336,3.379-3.369H6V6H7.882v9.412h8.631l-3.379-3.369,1.336-1.336Z"
					transform="translate(-6 -6)" />
			</svg>
		</button>
		<div class="form_row" id="nform_result" style="display:none;"></div>
	</form>

	<!-- Website link -->
	<div class="navigation_usn">
		<a href="https://www.ultrasupernew.com" target="_blank" title="UltraSuperNew" class="link link--kale">UltraSuperNew</a>
	</div>
</nav>
<script>
	const buttons = document.querySelectorAll('.navigation ul li a');
	buttons.forEach(function (button) {
		button.addEventListener('mouseenter', () => {
			buttons.forEach(button => button.classList.remove('active'));
			button.classList.add('active');
		})
	})

	const nForm = document.getElementById("nForm");
	const nFormResult = document.getElementById("nform_result");

	function submitNForm(event){

	    event.preventDefault();

	    nFormResult.innerHTML = "<p class='loading'>"+localContent.menu.msg1+"</p>";
	    nFormResult.style.display = 'block';
	    nForm.classList.add('sending');

	    const XHR = new XMLHttpRequest();
	    const FD = new FormData(nForm);

	    XHR.addEventListener("load", (event) => {

	      nForm.classList.remove('sending');

	      const json = JSON.parse(event.target.responseText);

	      if(json.status === true && json.message){
	        nForm.reset();
	        nFormResult.innerHTML = "<p class='success'>"+json.message+"</p>";
	        nFormResult.style.display = 'block';
	      } else if(json.message){
	        nFormResult.innerHTML = "<p class='error'>"+json.message+"</p>";
	        nFormResult.style.display = 'block';
	      } else {
	        nFormResult.innerHTML = "<p class='error'>"+localContent.menu.msg2+"</p>";
	        nFormResult.style.display = 'block';
	      }
	    });

	    XHR.addEventListener("error", (event) => {
	      nFormResult.innerHTML = "<p class='error'>"+localContent.menu.msg2+"</p>";
	      nFormResult.style.display = 'block';
	    });

	    XHR.open("POST", "index.php?sendnewsletter=true");
	    XHR.send(FD);

	    return false;
	}
</script> 