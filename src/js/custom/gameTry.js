window.onload = function() {
  var canvas = document.getElementById("canvas");

  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  }
  else {    
    var engine = new BABYLON.Engine(canvas, false);

    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -2, -1), scene);
    light.intensity = 1.2;
    light.position = new BABYLON.Vector3(20, 60, 20);

    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 25, BABYLON.Vector3.Zero(), scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas);
    // deactivate keyboard binding
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.keysLeft = [];
    
    //add some objects
    var ground = BABYLON.Mesh.CreatePlane("Plane", 100, scene);//Parameters are: name, size, and scene to attach the mesh.
    ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.GLOBAL);
    
    ground.isPickable = false;
    
    //create cones
    coneMain = new Cone(scene,{name:"coneMain"});//global on purpose
    //test cones to check correct behavior
    coneTest1 = new Cone(scene,{name:"coneTest1",color:'#3d9aff'});
    coneTest2 = new Cone(scene,{name:"coneTest2",color:'#ffd53d'});
    coneTest1.position.x = 10;
    coneTest2.position.z = -10;
    coneTest2.rotation.y = -1;
    var cones = {
      'coneMain' : {
        'instance' : coneMain,
        'bumpSettings' : {
          'scale' : 1.2,
          'speed': 3
        }
      },
      'coneTest1' : {
        'instance' : coneTest1,
        'bumpSettings' : {
          'scale' : 1.5,
          'speed': 2
        }
      },
      'coneTest2' : {
        'instance' : coneTest2,
        'bumpSettings' : {
          'scale' : 0.5,
          'speed': 4
        }
      }
    };
    
    camera.target = coneMain.getMainMesh();

    //shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useVarianceShadowMap = false;
    shadowGenerator.alpha = 0.8;
    ground.receiveShadows = true;
    coneMain.registerToShadowGenerator(shadowGenerator);
    coneTest1.registerToShadowGenerator(shadowGenerator);
    coneTest2.registerToShadowGenerator(shadowGenerator);

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
        coneMain.unSquint();
      }
      if (state.squint) {
        coneMain.squint();
      }
      if (state.up) {
        coneMain.moveForward();
      }
      if (state.down) {
        coneMain.moveBack();
      }
      if (state.left) {
        coneMain.turnLeft();
      }
      if (state.right) {
        coneMain.turnRight();
      }
    });

    engine.runRenderLoop(function() {
      scene.render();
    });

    window.addEventListener('resize', function() {
      engine.resize();
    });
    
    window.addEventListener('pointerup', function(e){
      console.log(e.x,e.y,scene.pick(e.x,e.y));
      var pickingInfos = scene.pick(e.x,e.y);
      if(pickingInfos.pickedMesh && pickingInfos.pickedMesh.name.indexOf("cone") > -1){
        var coneName = pickingInfos.pickedMesh.name.split('-')[0];
        cones[coneName].instance.toggleBump(cones[coneName].bumpSettings.scale,cones[coneName].bumpSettings.speed);
      }
    });
    
    document.getElementById('toggleBumping').addEventListener('click',function(){
      if(coneMain.isBumping()){
        coneMain.stopBump();
      }
      else{
        coneMain.bump();
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