window.onload = function() {
  var canvas = document.getElementById("canvas");

  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  }
  else {
    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 10, 10), scene);
    
//    var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
//    light0.diffuse = new BABYLON.Color3(1, 1, 1);
//    light0.specular = new BABYLON.Color3(1, 1, 1);
//    light0.groundColor = new BABYLON.Color3(0, 0, 0);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 25, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas);
    // deactivate keyboard binding
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.keysLeft = [];

    //add some objects
    var plan = BABYLON.Mesh.CreatePlane("Plane", 100, scene);//Parameters are: name, size, and scene to attach the mesh.
    plan.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.GLOBAL);

    cone = new Cone(scene);//global on purpose
    
    //event management
    
    var state = {
      up : false,
      down : false,
      left : false,
      right : false
    };
    
    window.addEventListener('keydown',function(e){
      switch(e.keyCode){
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
    
    window.addEventListener('keyup',function(e){
      switch(e.keyCode){
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
    
    scene.registerBeforeRender(function(){
      if(state.up){
        cone.moveForward();
      }
      if(state.down){
        cone.moveBack();
      }
      if(state.left){
        cone.turnLeft();
      }
      if(state.right){
        cone.turnRight();
      }
    });

    engine.runRenderLoop(function() {
      scene.render();
    });

    window.addEventListener('resize', function() {
      engine.resize();
    });
  }
};