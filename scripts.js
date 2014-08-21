$(document).ready(function() {

    $("#spinner").hide();
    $("#chain").hide();

    fragments = [];
    frags = "";
    dex = 0;

    // see how we get the value from a group of checkboxes
    $.get("crystal.php", function(data) {
	      $("#spinning").hide();
	      $("#spinner").show();
	      $("#chain").show();
	      fragments = data.split(" ");
	  });

    $("#chain").click(function() {
	if (dex < fragments.length) {
	    // now see if that worked
	    frags = frags + " " + fragments[dex];
	    dex++;
	    $("#key").text(frags);
	}
    });
});
