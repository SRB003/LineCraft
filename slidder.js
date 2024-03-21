  var Webflow = Webflow || [];
  Webflow.push(function() {
    var tabTimeout;
    clearTimeout(tabTimeout);
    tabLoop();

    // define loop - cycle through all tabs
    function tabLoop() {
      tabTimeout = setTimeout(function() {
        var $next = $('.auto-tabs-menu').children('.w--current:first').next();

        if ($next.length) {
          $next.click(); // click resets timeout, so no need for interval
        } else {
          $('.auto-tab-link:first').click();
        }
      }, 5000);
    }

    // reset timeout if a tab is clicked
    $('.auto-tab-link').click(function() {
      clearTimeout(tabTimeout);
      tabLoop();
    });
