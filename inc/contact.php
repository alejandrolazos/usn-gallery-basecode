<div class="page contact">
  <section class="page_header">
    <div class="page_title">
      <small><?php echo $localContentJSON["contact"]["t1"]; ?></small>
      <h1><?php echo $localContentJSON["contact"]["t2"]; ?></h1>
    </div>
  </section>

  <section class="page_content">
    <section class="page_section">

      <div class="row">
        <div class="col">
          <div class="contact_title">
            <h2>Say <span>Hello</span></h2>
          </div>

          <div class="contact_addresses">
            <div class="contact_info">
              <a href="https://www.google.co.jp/maps/place/UltraSuperNew/@35.6744048,139.7061842,19.01z/data=!4m5!3m4!1s0x60188cbc6357d72b:0xd7751a81b3289447!8m2!3d35.6740869!4d139.7071246?hl=en"
                target="_blank"><?php echo $localContentJSON["contact"]["address1"]["title"]; ?></a>
                <address>
                  <?php echo $localContentJSON["contact"]["address1"]["address"]; ?>
                </address>
            </div>
            <div class="contact_info">
              <a href="https://goo.gl/maps/yiiceVoocZq2WatY7" target="_blank"><?php echo $localContentJSON["contact"]["address2"]["title"]; ?></a>
              <address>
                <?php echo $localContentJSON["contact"]["address2"]["address"]; ?>
              </address>
            </div>
          </div>

        </div>
        <div class="col w50" style="align-items: flex-end;">
          <div class="contact_form" style="margin-right: 2.5vw">

            <form action="/?sendform=true" class="form" method="POST" id="cForm" onsubmit="submitForm(event)">

              <div class="form_row">
                <label for="name"><?php echo $localContentJSON["contact"]["form"]["name"]; ?> *
                  <input type="text" id="name" placeholder=" " name="name" required></label>
                <label for="name"><?php echo $localContentJSON["contact"]["form"]["company"]; ?>
                  <input type="text" placeholder=" " name="company"></label>
              </div>

              <div class="form_row">
                <label for="name"><?php echo $localContentJSON["contact"]["form"]["email"]; ?> *
                  <input type="text" placeholder=" " name="email" type="email" required></label>
                <label for="name"><?php echo $localContentJSON["contact"]["form"]["phone"]; ?>
                  <input type="text" placeholder=" " name="phone" type="phone"></label>
              </div>

              <label for="name"><?php echo $localContentJSON["contact"]["form"]["subject"]; ?>
                <input type="text" placeholder=" " name="subject"></label>
              <label for="name"><?php echo $localContentJSON["contact"]["form"]["message"]; ?> *
                <textarea cols="30" rows="6" placeholder=" " name="message" required></textarea>
              </label>

              <div class="form_row">

                <input type="text" name="send" value="true" style="display:none;">

                <button type="submit"><?php echo $localContentJSON["contact"]["form"]["send"]; ?></button>

                <div class="form_newsletter">

                  <label class="switch">
                    <input type="checkbox" name="newsletter" checked>
                    <span class="switch_slider"></span>
                  </label>

                  <p><?php echo $localContentJSON["contact"]["newsletter"]; ?></p>

                </div>

              </div>

              <div class="form_row" id="form_result" style="display:none;"></div>

            </form>

            <?php echo "
              <script type='text/javascript'> 
                let contact_form_msg1 = \"".$localContentJSON["contact"]["msg1"]."\"; 
                let contact_form_msg2 = \"".$localContentJSON["contact"]["msg2"]."\";
              </script>
            "; ?>
            <script type="text/javascript">
              const form = document.getElementById("cForm");
              const formResult = document.getElementById("form_result");
              function submitForm(event){
                  event.preventDefault();
                  formResult.innerHTML = "<p class='loading'>"+contact_form_msg1+"</p>";
                  formResult.style.display = 'block';
                  form.classList.add('sending');
                  const XHR = new XMLHttpRequest();
                  const FD = new FormData(form);
                  XHR.addEventListener("load", (event) => {
                    form.classList.remove('sending');
                    const json = JSON.parse(event.target.responseText);
                    if(json.status === true && json.message){
                      form.reset();
                      formResult.innerHTML = "<p class='success'>"+json.message+"</p>";
                      formResult.style.display = 'block';
                    } else if(json.message){
                      formResult.innerHTML = "<p class='error'>"+json.message+"</p>";
                      formResult.style.display = 'block';
                    } else {
                      formResult.innerHTML = "<p class='error'>"+contact_form_msg2+"</p>";
                      formResult.style.display = 'block';
                    }
                  });
                  XHR.addEventListener("error", (event) => {
                    formResult.innerHTML = "<p class='error'>"+contact_form_msg2+"</p>";
                    formResult.style.display = 'block';
                  });
                  XHR.open("POST", "/contact?sendform=true");
                  XHR.send(FD);
                  return false;
              }
            </script>
          </div>
        </div>
      </div>

    </section>
  </section>
</div>
