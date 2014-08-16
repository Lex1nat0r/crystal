$(document).ready(function() {

    $("#spinner").hide();
    $("#chain").hide();

    fragments = [];
    frags = "";
    dex = 0;

    // see how we get the value from a group of checkboxes
    $.get("chains.php?pref="+$("input:radio[name=prefixes]:checked").val()+
	  "&mode=u"+
	  "&words=200", function(data) {
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
	    $("#chained").val(frags);
	}
    });
});
