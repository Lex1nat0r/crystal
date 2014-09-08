// Machine Truth Fragments
// by Alex Thornton-Clark

// based on CRYPTO FACIST BIKE SMASH and A Thing in Chains by same

$(document).ready(function() {

    fragments = [];
    badfrags = [];
    frags = [];
    dex = 0;
    data_got = false;

    butts_frags = [];

    for (i = 0; i < 64; i++) {
	butts_frags.push("butts ");
    }

    $.get("crystal.php", function(data) {
	data = $.parseJSON(data);
	console.log(data.key);
	console.log(data.badkey);
	fragments = $.trim(data.key).split(" ");
	badfrags = data.badkey.split(" ");
	data_got = true;
    });

    // Now set up your game (most games will load a separate .js file)
    // note we override the location of the image paths because fuck the police
    var Q = Quintus({imagePath: "assets/", audioPath: "assets/", audioSupported: ['wav', 'ogg']})   // create a new engine instance
	.include("Sprites, Anim, Scenes, Input, 2D, Touch, UI, Audio") // Load any needed modules
	.setup("crystal_canvas")  // bind to crystal_canvas on the page
	.controls()                        // Add in default controls (keyboard, buttons)
	.touch()                           // Add in touch support (for the UI)
        .enableSound()		     // THIS IS IMPORTANT FOR SOUND YOU SILLY
    
    // set up sweet custom inputs
    // arrows and space are already done for us
    Q.input.keyboardControls({
	16: "UpAmp",
	17: "DownAmp",
	18: "Anchor",
	82: "Reset"
    });
    
    Q.Sprite.extend("Cyberspace", {
	init: function(p) {
	    this._super(p, {
		asset: "skyberspace.jpg", // background image based on art by Jill Sauer
		x: 0,
		// set the sky's collision type to Q.SPRITE_NONE so that nothing considers colliding with it
		type: Q.SPRITE_NONE
	    });
	    
	    this.p.vx = 5;
	},
	
	step: function(dt) {
	    this.p.x -= 5;
	    if (this.p.x < -320) {
		this.p.x = Q.width + 315;
	    }
	}
    });

    Q.Sprite.extend("Player",{

	// the init constructor is called on creation
	// it sets up a lot of stuff that will be used in the future
	init: function(p) {
	    
	    // You can call the parent's constructor with this._super(..)
	    this._super(p, {
		asset: "avatar.png",  // give player an image asset
		x: 60,           			// set player position
		y: Q.height / 2, 
		h: 26, // sprite width for ease of collisions
		w: 83,  // sprite height for ease of collisions
		lastShot: 0,
	    });
	    
	    if(!this.p.stepDistance) {
		this.p.stepDistance = 7;
	    }
	    if(!this.p.stepDelay) {
		this.p.stepDelay = 0.1;
	    }
	    var spawn = this.leftEchelon;
	},
	
	step: function(dt) { // BEGIN STEP

	    // #realtalk: I stole most of this from Quintus' stepControls
	    // modified a little for taste
	    var moved = false;
	    var p = this.p;

	    if(p.stepping) {
		p.x += p.diffX * dt / p.stepDelay;
		p.y += p.diffY * dt / p.stepDelay;
	    }
	    
	    if(p.stepping) {
		p.x = p.destX;
		p.y = p.destY;
	    }
	    
	    p.stepping = false;

	    p.diffX = 0;
	    p.diffY = 0;

	    if(Q.inputs['left']) {
		p.diffX = -p.stepDistance;
	    } else if(Q.inputs['right']) {
		p.diffX = p.stepDistance;
	    }

	    if(Q.inputs['up']) {
		p.diffY = -p.stepDistance;
	    } else if(Q.inputs['down']) {
		p.diffY = p.stepDistance;
	    }

	    if(p.diffY || p.diffX ) { 
		p.stepping = true;
		p.origX = p.x;
		p.origY = p.y;
		p.destX = p.x + p.diffX;
		p.destY = p.y + p.diffY;
	    }
	    
	    // prevent player from going off screen
	    if(p.stepping) {
		if (p.destY > Q.height|| p.destY < 0) {
		    p.stepping = false;
		    p.destY = p.origY;
		}
		
		if (p.destX < 0 || p.destX > Q.width) {
		    p.stepping = false;
		    p.destX = p.origX;
		}
	    }
	    
	    if (key_get) {
		fadeMe(this, dt);
		if (this.p.opacity <= 0) {
		    data_got = false;
		    Q.clearStages();
		    Q.stageScene("menu", 1);
		    Q.pauseGame();
		    $.get("crystal.php", function(data) {
			data = $.parseJSON(data);
			console.log(data.key);
			console.log(data.badkey);
			fragments = $.trim(data.key).split(" ");
			badfrags = data.badkey.split(" ");
			data_got = true;
		    });
		}
	    }

	} // END STEP
    });

    Q.Sprite.extend("Truth", {
	// constructor!
	init: function(p) {
            this._super(p, {
		sprite: "truths",  // give the frags a sheet and anim
		sheet: "truths",
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
	    });
	    this.add("animation");
	},
	
	// got to call this each frame
	step: function(dt) {
	    this.play("tspin");
	    // clean up if we're off the screen
            if (this.p.x < 0) {
		this.destroy();
	    }

	    this.p.x -= this.p.vx * dt;
	    
	    if (key_get) {
		fadeMe(this, dt);
		if (this.p.opacity <= 0) {
		    this.destroy();
		}
	    }
	    else {
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
		    if(collided) {
			if (collided.obj.isA("Player")) {
			    // add to score
			    frags = frags.concat((" " + fragments[dex]).split(''));
			    dex++;
			    score++;
			    //$("#key").html(frags);
			    updateHUD();
			    Q.audio.play("Crypto_Get.ogg");
			    if (dex >= fragments.length) {
				key_get = true;
			    }
			    this.destroy();
			}
			return;
		    }
		}
	    }
	}
    });

    Q.Sprite.extend("False", {
	// constructor!
	init: function(p) {
            this._super(p, {
		sprite: "falses",  // give frags a spritesheet
		sheet: "falses",
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
	    });
	    this.add("animation");
	},
	
	// got to call this each frame
	step: function(dt) {
	    this.play("fspin");
	    // clean up if we're off the screen
            if (this.p.x < 0) {
		this.destroy();
	    }

	    this.p.x -= this.p.vx * dt;
	    
	    if (key_get) {
		fadeMe(this, dt);
		if (this.p.opacity <= 0) {
		    this.destroy();
		}
	    }
	    else {
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
		    if(collided) {
			if (collided.obj.isA("Player")) {
			    if (dex < fragments.length) {
				Q.audio.play("ICE_Crash.ogg");
				frags = frags.concat((" <span>" + badfrags[dex] + "</span>").split(''));
				dex++;
				updateHUD();
				//$("#key").html(frags);
				if (dex >= fragments.length) {
				    key_get = true;
				}
				this.destroy();
			    }
			}
			return;
		    }
		}
	    }
	}
    });

    Q.GameObject.extend("Spawner",{
	init: function() {
	    this.p = {};
	},

	update: function(dt) {
	    // doing a lot of work here to get the constructed key to appear procedurally
	    if (frag_dex < frags.length) {
		// frags was originally a string, but converting it to an array allows us to 
		// index into it to add one character per frame to the key we're displaying
		display_key += frags[frag_dex];
		updateHUD();
		$("#key").html(display_key);
		frag_dex++;
	    }
	    if (!key_get) {
		// timer
		total_secs += dt;
		
		// maken them bad guys
		if (secs < diff_secs) {
		    secs += dt;
		
		    if (secs >= diff_secs) {
			// now we calculate difficulty based on how long the game's been going and the player's score and progress
			diff_var = Math.floor(Math.sqrt(Math.floor(total_secs/2) + Math.floor(Math.sqrt(score))));
			
			for (var i = 0; i < diff_var; i++) {
			    // should produce a random integer between 0 and 2
			    // and then between 0 and 7
			    // as if by magic
			    var choice = Math.floor(Math.random() * 3);
			    var height = Math.floor(Math.random() * 7) + 1;
			    
			    // speed of new things starts at 200 + difficulty, then add/subtract random factor
			    var speed = 200 + (50 * diff_var) + (50 * Math.random()) - (50 * Math.random());
			    
			    if (choice == 0) {
				this.stage.insert(new Q.Truth({x: Q.width + 32  + Math.floor(Math.random() * 320), y: 64 * height + (32 * Math.random()) - (32 * Math.random()), vx: speed}));
			    }
			    else {
				this.stage.insert(new Q.False({x: Q.width + 32 + Math.floor(Math.random() * 320), y: 64 * height + (32 * Math.random()) - (32 * Math.random()), vx: speed}));
			    }
			    
			}
			
			secs = 0;
		    }
		}
	    }
	},
	
	render: function() {
	    // WHY DOES THIS EVEN NEED TO BE HERE
	}
    });

    // front matter

    // FPS?
    var FPS = 60;

    // nope, no gravity here	  
    Q.gravityX = 0;
    Q.gravityY = 0;

    // control vars (some of these could be moved to player but like I give a fuck)
    var score = 0;
    var frame = 0;
    var secs = 0;
    var total_secs = 0;
    var score = 0;
    var key_get = false;
    var key = "";
    var display_key = "";
    var frag_dex = 0;

    // difficulty vars
    var diff_secs = 1;
    var diff_var = 0;

    function reset() {
	score = 0;
	frame = 0;
	secs = 0;
	total_secs = 0;
	score = 0;
	diff_secs = 1;
	diff_var = 0;
	frags = [];
	dex = 0;
	key = "";
	display_key = "";
	frag_dex = 0;
	key_get = false;
	$("#key").text("");
    }

    function updateHUD() {
	Q.stageScene("hud", 3, {num: score, total_frags: dex});
    }

    function fadeMe(obj, dt) {
	if (obj.p.opacity > 0) {
	    obj.p.opacity -= (dt/2);
	}
    }

    // game loops start here

    // regular game scene
    Q.scene("game",function(stage) {

	// need to be sure to put the skies in the right place so it looks like the background is scrolling
	//var sky1 = stage.insert(new Q.Cyberspace({x: Q.width/2, y: Q.height / 2}));
	//var sky2 = stage.insert(new Q.Cyberspace({x:3 * Q.width/2, y: Q.height / 2}));
	
	var spawner = stage.insert(new Q.Spawner());
	
	// put our guy in the place
	var player = stage.insert(new Q.Player());
	
	
	stage.add("viewport")
	    .centerOn(Math.floor(Q.width/2), Math.floor(Q.height/2));
    });

    // this is where things get tricky
    Q.scene("hud", function(stage) {
	var container = stage.insert(new Q.UI.Container({
	    x: 75,
	    y: 25
	}));
	
	var label = container.insert(new Q.UI.Text({
	    x: 128, 
	    y: 0,
	    label: (stage.options.num/fragments.length * 100).toFixed(2) + '%' + ' ' + stage.options.total_frags + '/' + fragments.length,
	    color: "#00FF00",
	    family: "Courier New"
	}));
	
	container.fit(20);
    });

    // I dunno, game over meny or something
    Q.scene("menu", function(stage) {
	var box = stage.insert(new Q.UI.Container({
	    x: Q.width/2, y: Q.height - 80, fill: "rgba(0,0,0,0.5)"
	}));

	var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#00FF00",
						  label: "Run Again", fontColor: "#000000", font: "400 20px Courier New" }));
	var button2 = box.insert(new Q.UI.Button({ x: 0, y: 50, fill: "#00FF00",
						   label: "Jack Out", fontColor: "#000000", font: "400 20px Courier New" })) 										   
	var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
					      label: "Key was " + (score/fragments.length * 100).toFixed(2) + '% recovered', color: "#00FF00", family: "Courier New"}));								

	button.on("click",function() {
	    if (data_got) {
		Q.clearStages();
		reset();
		Q.stageScene('game');
		updateHUD();
		Q.unpauseGame();
	    }
	});
	
	button2.on("click",function() {
	    Q.clearStages();
	    reset();
	    Q.stageScene('splash');
	    Q.unpauseGame();
	})

	box.fit(20);
    });

    // splash screen, whatever
    Q.scene("splash", function(stage) {
	var box = stage.insert(new Q.UI.Container({
	    x: 0, y: 0
	}));

	var button = box.insert(new Q.UI.Button({ x: Q.width/2, y: 300, fill: "#00FF00",
						  label: "Enter", fontColor: "#000000", font: "400 20px Courier New" }));
	var button2 = box.insert(new Q.UI.Button({ x: Q.width/2, y: 350, fill: "#00FF00",
						   label: "Help", fontColor: "#000000", font: "400 20px Courier New" }));										   
	var label = box.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2, color: "#00FF00",
					      label: "Machine Truth Fragments", family: "Courier New"}));	

	var butt = box.insert(new Q.UI.Button({ asset:'Monstersoul.png', x:40, y:Q.height-30}));

	button.on("click",function() {
	    if (data_got) {
		Q.clearStages();
		reset();
		Q.stageScene('game');
		updateHUD();
	    }
	});
	
	button2.on("click",function() {
	    if (data_got) {
		Q.clearStages();
		Q.stageScene('help');
	    }
	});
	
	butt.on("click",function() {
	    badfrags = butts_frags;
	    console.log(butts_frags);
	});

	box.fit(Q.width, Q.height);
	
    });

    // help screen, whatever
    Q.scene("help", function(stage) {

	var container = stage.insert(new Q.UI.Container({
	    x:0, y:0
	}));

	var button = container.insert(new Q.UI.Button({
	    asset: 'MachineTruthHelp.png',
	    x: Q.width/2,
	    y: Q.height/2
	}));

	button.on("click",function() {
	    Q.clearStages();
	    Q.stageScene('splash');
	});

	container.fit(Q.width, Q.height);

    });

    // loaden all them assets and get everything rolling
    Q.load(["Monstersoul.png", "avatar.png", "skyberspace.jpg", "FalseSprites.png", "TruthSprites.png", "Crypto_Get.ogg", "Data_Get.ogg", "Explosion.ogg", "ICE_Crash.ogg", "MachineTruthHelp.png"], function () {
	// set up sprite sheets for fragments
	Q.sheet("truths", "TruthSprites.png", {tilew:32, tileh:64});
	Q.sheet("falses", "FalseSprites.png", {tilew:32, tileh:64});
	Q.animations("truths", {tspin: {frames: [0,1,2,3], loop: true, rate: 1/10}});
	Q.animations("falses", {fspin: {frames: [0,1,2,3], loop: true, rate: 1/10}});
	
	Q.stageScene("splash");
    });
});
