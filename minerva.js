// Sines of the Father: Adventures in Triggernometry
// by Alex Thornton-Clark

// based on sines_of_python.py

// Now set up your game (most games will load a separate .js file)
// note we override the location of the image paths because fuck the police
var Q = Quintus({imagePath: "assets/", audioPath: "assets/", audioSupported: ['wav', 'ogg']})   // create a new engine instance
	  .include("Sprites, Anim, Scenes, Input, 2D, Touch, UI, Audio") // Load any needed modules
	  .setup({width: 640, height: 480})  // add a canvas element onto the page, size 480 x 640
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
		asset: "THEBIKE.png",  // give player an image asset
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

	// space makes shoot
	Q.input.on("fire", this, function() {
		if (malformed_packets > 0) {
			var d = new Date();
			// no constant shooting for you
			if (d.getTime() > this.p.lastShot + 200) {
				// "spawn" the shot, put it at our y and offset our x with an offset so we don't collide with the shot
				var shot = this.stage.insert(new Q.LegitPacket({x: this.p.x + 43, y: this.p.y}));
			    Q.audio.play("Packet_Inject.ogg");
				malformed_packets--;
				updateHUD();
				
				this.p.lastShot = d.getTime();
			}
		}
	});
  
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
  } // END STEP
});

Q.Sprite.extend("Coin", {
	// constructor!
    init: function(p) {
        this._super(p, {
		asset: "CryptoDosh.png",  // give the thing an image asset
		h: 32, // sprite width for ease of collisions
		w: 32,  // sprite height for ease of collisions
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE 
		});
	},
	
    // got to call this each frame
    step: function(dt) {
		// clean up if we're off the screen
        if (this.p.x < 0) {
			population--;
			this.destroy();
		}

		this.p.x -= this.p.vx * dt;
		
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
			if(collided) {
				if (collided.obj.isA("Player")) {
					// add to score
					score++;
					total_score++;
					updateHUD();
				    Q.audio.play("Crypto_Get.ogg");
					population--;
					this.destroy();
				}
				return;
			}
		}
	}
});

Q.Sprite.extend("ICE", {
	// constructor!
    init: function(p) {
        this._super(p, {
		asset: "ICE.png",  // give player an image asset
		h: 32, // sprite width for ease of collisions
		w: 32,  // sprite height for ease of collisions
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
		});
	},
	
    // got to call this each frame
    step: function(dt) {
		// clean up if we're off the screen
        if (this.p.x < 0) {
			population--;
			this.destroy();
		}

		this.p.x -= this.p.vx * dt;
		
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
			if(collided) {
				if (collided.obj.isA("Player")) {
				    Q.audio.play("ICE_Crash.ogg");
					// switch scenes on player death
					collided.obj.destroy();
					
					// RESET EVERYTHING
					reset();
					
					//Q.clearStages();
					Q.stageScene("menu", 1);
					Q.pauseGame();
				}
				else {
					return;
				}
			}
		}
	}
});

Q.Sprite.extend("Firewall", {
	// constructor!
    init: function(p) {
        this._super(p, {
		asset: "GreatWallofFire.png",  // give player an image asset
		h: 64, // sprite width for ease of collisions
		w: 64,  // sprite height for ease of collisions
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
		});
	},
	
    // got to call this each frame
    step: function(dt) {
		// clean up if we're off the screen
        if (this.p.x < 0) {
			this.destroy();
		}

		this.p.x -= this.p.vx * dt;
		
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
			if(collided) {
				if (collided.obj.isA("Player")) {
				    Q.audio.play("ICE_Crash.ogg");
					// switch scenes on player death
					collided.obj.destroy();
					
					// RESET EVERYTHING
					reset();
					
					//Q.clearStages();
					Q.stageScene("menu", 1);
					Q.pauseGame();
				}
				
				return;
			}
		}
	}
});

Q.Sprite.extend("System", {
	// constructor!
    init: function(p) {
        this._super(p, {
		sprite: "SYSTEM",  // set up graphical assets for THE SYSTEM
		sheet: "SYSTEM",
		h: 500, // sprite width for ease of collisions
		w: 100,  // sprite height for ease of collisions
		opacity: 1,
		});
		
		this.add("animation");
	},
	
    // got to call this each frame
    step: function(dt) {
	
		// handle boss moving into the screen
		if (this.p.moving) {
			this.p.x -= 20 * dt;
			if (this.p.x <= (Q.width - 50)) {
				this.p.moving = false;
				boss_firing = true;
			}
		}
		
		if (this.p.fade) {
			this.p.opacity -= dt;
			
			if (this.p.opacity <= 0) {
				this.destroy();
			}
		}
	},
	
	die: function() {
		this.p.fade = true;
	}
});

Q.Sprite.extend("Packet", {
	// constructor!
    init: function(p) {
        this._super(p, {
		asset: "Packet.png",  // give the thing an image asset
		h: 32, // sprite width for ease of collisions
		w: 32,  // sprite height for ease of collisions
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE 
		});
	},
	
    // got to call this each frame
    step: function(dt) {
		// clean up if we're off the screen
        if (this.p.x < 0) {
			this.destroy();
		}

		this.p.x -= this.p.vx * dt;
		
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
			if(collided) {
				if (collided.obj.isA("Player") && boss_firing) {
				    Q.audio.play("Packet_Get.ogg");
					// the player now has more ammunition
					malformed_packets++;
					
					updateHUD();
					
					this.destroy();
				}
				return;
			}
		}
	}
});

Q.Sprite.extend("LegitPacket", {
	// constructor!
    init: function(p) {
        this._super(p, {
		asset: "TotallyLegit.png",  // give shot an image asset
		x: 30,           			// set shot position
		y: 30, 
		h: 32, // sprite width for ease of collisions
		w: 32,  // sprite height for ease of collisions
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE 
		});
	},
	
    // got to call this each frame
    step: function(dt) {
        this.p.x += 5;
		// clean up if we've gone too far
        if (this.p.x > Q.width) {
			this.destroy();
		}
		
		// manually check for collisions because I don't like how Quintus' 2d component does it
		// plus this is closer to how I did it in the original python
		while((collided = this.stage.search(this))) {
			if(collided) {
				if (collided.obj.isA("System")) {
				    Q.audio.play("Explosion.ogg");
					boss_health--;
					collided.obj.play("damage");
					
					// handle boss death and spawning datas
					if (boss_health <= 0) {
						boss_health = 0;
						boss_reset();
						collided.obj.die();
						updateHUD();
						
						for (var i = 0; i < 10; i++) {
							// look ma, all on one line
							this.stage.insert(new Q.Data({x: Q.width + 32, y: 64 * Math.floor(Math.random() * 7) + 31, vx: 200 + (50 * diff_var) + (25 * Math.random()) - (25 * Math.random())}));
						}
					}
					
					this.destroy();
				}
				
				return;
			}
		}
	}
});

Q.Sprite.extend("Data", {
	// constructor!
    init: function(p) {
        this._super(p, {
		asset: "PreciousData.png",  // give the thing an image asset
		h: 32, // sprite width for ease of collisions
		w: 32,  // sprite height for ease of collisions
		// set the shot's collision type to Q.SPRITE_PARTICLE so that nothing considers colliding with it
		type: Q.SPRITE_PARTICLE,
		// set the shot's collision mask so it only collides with things that have default collisions on
		collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE 
		});
	},
	
    // got to call this each frame
    step: function(dt) {
		// clean up if we're off the screen
        if (this.p.x < 0) {
			population--;
			this.destroy();
		}

		this.p.x -= this.p.vx * dt;
		
		// manually check for collisions because I don't like how Quintus' 2d component does it
		while((collided = this.stage.search(this))) {
			if(collided) {
				if (collided.obj.isA("Player")) {
					// add to score
					total_score += 5;
				    Q.audio.play("Data_Get.ogg");
					updateHUD();
					this.destroy();
				}
				return;
			}
		}
	}
});

Q.Sprite.extend("Splash", {
	// constructor!
    init: function(p) {
        this._super(p, {
		x: 40,
		y: Q.height - 30,
		asset: "Monstersoul.png",
		});
	},
});

Q.GameObject.extend("Spawner",{
  init: function() {
	this.p = {};
  },

  update: function(dt) {
	// handle boss shenanigans
	if (boss_mode) {
		if (population <= 0) {
			this.stage.insert(new Q.System({x: Q.width + 32, y: Math.floor(Q.height / 2), moving: true, fade: false}));
			boss_spawned = true;
			boss_health = 5 + diff_adjust;
			packet_time = 2 + Math.random() - Math.random();
			boss_mode = false;
		}
	}
	else if (boss_spawned) {
		if (boss_firing) {
			// fire ballers
			fireball_secs += dt;
			
			packet_secs += dt;
			
			// spawn the firewall with a gap to exploit
			if (fireball_secs >= 4) {
				var gap = Math.floor(Math.random() * 7);
				for (var i = 0; i < 8; i++) {
					if (i != gap) {
						this.stage.insert(new Q.Firewall({x: Q.width + 32, y: 64 * i + 31, vx: 150 + (50 * diff_adjust)}));
					}
				}
				fireball_secs = 0;
			}
			
			// spawn packets
			if (packet_secs >= packet_time) {
				this.stage.insert(new Q.Packet({x: Q.width + 32, y: 64 * Math.floor(Math.random() * 7) + 31, vx: 200 + (50 * diff_adjust) + (25 * Math.random()) - (25 * Math.random())}));
				packet_secs = 0;
				packet_time = 3 + Math.random() - Math.random();
			}
		}
	}
	else {
		if (total_secs < 30) {
			// timer
			total_secs += dt;
		
			// maken them bad guys
			if (secs < diff_secs) {
				secs += dt;
				
				if (secs >= diff_secs) {
					// now we calculate difficulty based on how long the game's been going and the player's score and progress
					diff_var = Math.floor(Math.sqrt(Math.floor(total_secs) + Math.floor(Math.sqrt(score)))) + diff_adjust;
				
					for (var i = 0; i < diff_var; i++) {
						// should produce a random integer between 0 and 2
						// and then between 0 and 7
						// as if by magic
						var choice = Math.floor(Math.random() * 3);
						var height = Math.floor(Math.random() * 7) + 1;
						
						// speed of new things starts at 200 + difficulty, then add/subtract random factor
						var speed = 200 + (50 * diff_var) + (50 * Math.random()) - (50 * Math.random());
						
						if (choice == 0) {
							this.stage.insert(new Q.Coin({x: Q.width + 32  + Math.floor(Math.random() * 320), y: 64 * height + (32 * Math.random()) - (32 * Math.random()), vx: speed}));
						}
						else {
							this.stage.insert(new Q.ICE({x: Q.width + 32 + Math.floor(Math.random() * 320), y: 64 * height + (32 * Math.random()) - (32 * Math.random()), vx: speed}));
						}
						
						population++;
					}
					
					secs = 0;
				}
			}
		}
		else {
			// adjust vars for boss mode (reset timer & difficulty, but increase base difficulty)
			boss_mode = true;
			total_secs = 0;
			diff_var = 0;
			secs = 0;
			score = 0;
			diff_adjust++;
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
var population = 0;
var score = 0;
var total_score = 0;

// boss state vars
var boss_mode = false;
var boss_spawned = false;
var boss_firing = false;
var boss_health = 5;
var malformed_packets = 0;
var packet_timer = 0;
var fireball_secs = 0;
var packet_secs = 0;
var packet_time = 0;

// difficulty vars
var diff_secs = 1;
var diff_var = 0;
var diff_adjust = 0;

function boss_reset() {
	boss_mode = false;
	boss_spawned = false;
	boss_firing = false;
	boss_health = 5;
	malformed_packets = 0;
	packet_timer = 0;
	fireball_secs = 0;
	packet_secs = 0;
	packet_time = 0;
}

function reset() {
	score = 0;
	frame = 0;
	secs = 0;
	total_secs = 0;
	population = 0;
	score = 0;
	total_score = 0;
	diff_secs = 1;
	diff_var = 0;
	diff_adjust = 0;
	
	boss_reset();
}

function updateHUD() {
	Q.stageScene("hud", 3, {num: total_score, packets: malformed_packets});
}

// game loops start here

// regular game scene
Q.scene("game",function(stage) {

	// need to be sure to put the skies in the right place so it looks like the background is scrolling
	var sky1 = stage.insert(new Q.Cyberspace({x: Q.width/2, y: Q.height / 2}));
	var sky2 = stage.insert(new Q.Cyberspace({x:3 * Q.width/2, y: Q.height / 2}));
	
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
		x: 0, 
		y: 0,
		label: "Score: " + stage.options.num,
		color: "#00FF00",
		family: "Courier New"
	}));
	
	for (var i = 0; i < stage.options.packets; i++) {
		stage.insert(new Q.UI.Button({
			asset: 'TotallyLegit.png',
			x: 32 + (i * 32),
			scale: 0.5,
			y: Q.height - 50
		}));
	}
	
	container.fit(20);
});

// I dunno, game over meny or something
Q.scene("menu", function(stage) {
	var box = stage.insert(new Q.UI.Container({
		x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	}));

	var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#00FF00",
										   label: "Run Again", fontColor: "#000000", font: "400 20px Courier New" }));
	var button2 = box.insert(new Q.UI.Button({ x: 0, y: 50, fill: "#00FF00",
										   label: "Jack Out", fontColor: "#000000", font: "400 20px Courier New" })) 										   
	var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
										label: "Dial-Up'd!", color: "#00FF00", family: "Courier New"}));								

	button.on("click",function() {
	    Q.clearStages();
	    reset();
		Q.stageScene('game');
		updateHUD();
		Q.unpauseGame();
	});
	
	button2.on("click",function() {
		Q.clearStages();
		reset();
		Q.stageScene('splash');
		Q.unpauseGame();
	});
	
	box.fit(20);
});

// splash screen, whatever
Q.scene("splash", function(stage) {
	var box = stage.insert(new Q.UI.Container({
		x: 0, y: 0, fill: "#000000"
	}));

	box.insert(new Q.Splash());
	
	var button = box.insert(new Q.UI.Button({ x: Q.width/2, y: 300, fill: "#00FF00",
										   label: "Jack In", fontColor: "#000000", font: "400 20px Courier New" }));
	var button2 = box.insert(new Q.UI.Button({ x: Q.width/2, y: 350, fill: "#00FF00",
										   label: "Help.jpeg", fontColor: "#000000", font: "400 20px Courier New" }));										   
	var label = box.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2, color: "#00FF00",
										label: "CRYPTOFACIST BIKE SMASH", family: "Courier New"}));	

	button.on("click",function() {
		Q.clearStages();
	    reset();
		Q.stageScene('game');
		updateHUD();
	});
	
	button2.on("click",function() {
		Q.clearStages();
		Q.stageScene('help');
	});
	
	box.fit(Q.width, Q.height);
	
});

// help screen, whatever
Q.scene("help", function(stage) {

	var button = stage.insert(new Q.UI.Button({
			asset: 'Help4Noobs.jpeg',
			x: Q.width/2,
			y: Q.height/2
		}));
		
	button.on("click",function() {
		Q.clearStages();
		Q.stageScene('splash');
	});
	
});

// loaden all them assets and get everything rolling
Q.load(["Monstersoul.png", "THEBIKE.png", "CryptoDosh.png", "ICE.png", "skyberspace.jpg", "THESYSTEM.png", "GreatWallofFire.png", "Packet.png", "TotallyLegit.png", "PreciousData.png", "THESYSTEMSHEETStrip.png", "Crypto_Get.ogg", "Data_Get.ogg", "Explosion.ogg", "ICE_Crash.ogg", "Packet_Get.ogg", "Packet_Inject.ogg", "Help4Noobs.jpeg"], function () {
	// set up sprite sheet for THE SYSTEM
	Q.sheet("SYSTEM", "THESYSTEMSHEETStrip.png", {tilew:100, tileh:500});
	// note to you: need to have loop set to false in order for the trigger event to actually trigger
	Q.animations("SYSTEM",  {damage: {frames: [0,1,2,3,4,5,6], loop: false, rate: 1/10}});
	
	Q.stageScene("splash");
});