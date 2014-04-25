window.onload = function() {
  var canvas = document.getElementById("canvas");

  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  }
  else {
    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);

//    var omniLight = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-20, 10, 30), scene);
//    omniLight.intensity = 0.5;

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -2, -1), scene);
    light.intensity = 1.2;
    light.position = new BABYLON.Vector3(20, 60, 20);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 25, BABYLON.Vector3.Zero(), scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas);
    // deactivate keyboard binding
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.keysLeft = [];
    
    //add some objects
    var plan = BABYLON.Mesh.CreatePlane("Plane", 100, scene);//Parameters are: name, size, and scene to attach the mesh.
    plan.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.GLOBAL);
    
    plan.isPickable = false;

    //shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useVarianceShadowMap = false;
    shadowGenerator.alpha = 0.8;
    plan.receiveShadows = true;

    cone = new Cone(scene,{name:"coneMain"});//global on purpose
    //test cones to check correct behavior
    coneTest1 = new Cone(scene,{name:"coneTest1",color:'#3d9aff'});
    coneTest2 = new Cone(scene,{name:"coneTest2",color:'#ffd53d'});
    coneTest1.position.x = 10;
    coneTest2.position.z = -10;
    coneTest2.rotation.y = -1;
    cone.registerToShadowGenerator(shadowGenerator);
    coneTest1.registerToShadowGenerator(shadowGenerator);
    coneTest2.registerToShadowGenerator(shadowGenerator);
    
    //@note teporary commented - this kind of physics not supported directly in BabylonJS (needs CannonJS)
//    //gravity
//    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
//    scene.collisionsEnabled = true;
//    cone.applyGravity = true;
//    coneTest1.applyGravity = true;
//    coneTest2.applyGravity = true;
//    coneTest1.position.y = 10;
//    plan.checkCollisions = true;

    //event management

    var state = {
      up: false,
      down: false,
      left: false,
      right: false,
      squint : false,
      unSquint : false
    };

    window.addEventListener('keydown', function(e) {
      switch (e.keyCode) {
        case 17 :
          state.unSquint = true;
          break;
        case 16 :
          state.squint = true;
          break;
        case 38 :
          state.up = true;
          break;
        case 37 :
          state.left = true;
          break;
        case 40 :
          state.down = true;
          break;
        case 39 :
          state.right = true;
          break;
      }
    });

    window.addEventListener('keyup', function(e) {
      switch (e.keyCode) {
        case 17 :
          state.unSquint = false;
          break;
        case 16 :
          state.squint = false;
          break;
        case 38 :
          state.up = false;
          break;
        case 37 :
          state.left = false;
          break;
        case 40 :
          state.down = false;
          break;
        case 39 :
          state.right = false;
          break;
      }
    });

    scene.registerBeforeRender(function() {
      if (state.unSquint) {
        cone.unSquint();
      }
      if (state.squint) {
        cone.squint();
      }
      if (state.up) {
        cone.moveForward();
      }
      if (state.down) {
        cone.moveBack();
      }
      if (state.left) {
        cone.turnLeft();
      }
      if (state.right) {
        cone.turnRight();
      }
    });

    engine.runRenderLoop(function() {
      scene.render();
    });

    window.addEventListener('resize', function() {
      engine.resize();
    });
    
    window.addEventListener('pointerdown', function(e){
      console.log(e.x,e.y,scene.pick(e.x,e.y));
      var pickingInfos = scene.pick(e.x,e.y);
      if(pickingInfos.pickedMesh && pickingInfos.pickedMesh.name.indexOf("cone") > -1){
        switch(pickingInfos.pickedMesh.name.split('-')[0]){
          case "coneMain" :
            cone.toggleBump();
            break;
          case "coneTest1" :
            coneTest1.toggleBump(1.5,2);
            break;
          case "coneTest2" :
            coneTest2.toggleBump(0.5,4);
            break;
        }
      }
    });
    
    document.getElementById('toggleBumping').addEventListener('click',function(){
      if(cone.isBumping()){
        cone.stopBump();
      }
      else{
        cone.bump();
      }
    },false);

    document.getElementById('toggleFullScreen').addEventListener('click', function() {
      var rootDiv = document.getElementById('rootDiv');
      if (rootDiv.requestFullscreen) {
        rootDiv.requestFullscreen();
      }
      else if (rootDiv.mozRequestFullScreen) {
        rootDiv.mozRequestFullScreen();
      }
      else if (rootDiv.webkitRequestFullscreen) {
        rootDiv.webkitRequestFullscreen();
      }
      else if (rootDiv.msRequestFullscreen) {
        rootDiv.msRequestFullscreen();
      }
      //@todo back to normal
    },false);
  }
};