window.onload = function() {
  var canvas = document.getElementById("canvas");

  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  }
  else {
    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);

    var omniLight = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-20, 10, 30), scene);
    omniLight.intensity = 0.5;

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
    light.intensity = 0.9;
    light.position = new BABYLON.Vector3(20, 40, 20);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 25, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas);
    // deactivate keyboard binding
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.keysLeft = [];

    //add some objects
    var plan = BABYLON.Mesh.CreatePlane("Plane", 100, scene);//Parameters are: name, size, and scene to attach the mesh.
    plan.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.GLOBAL);

    cone = new Cone(scene);//global on purpose

    //shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useVarianceShadowMap = false;
    shadowGenerator.alpha = 0.8;
    cone.registerToShadowGenerator(shadowGenerator);
    plan.receiveShadows = true;

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
      console.log(e);
      switch (e.keyCode) {
        case 17 :
          state.unSquint = true;
          break;
        case 32 :
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
        case 32 :
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
    });
  }
};