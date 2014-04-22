window.onload = function() {
  var canvas = document.getElementById("canvas");

  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  }
  else {
    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 10, 10), scene);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 140, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas);

    //add some objects
    var plan = BABYLON.Mesh.CreatePlane("Plane", 100, scene);//Parameters are: name, size, and scene to attach the mesh.
    plan.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.GLOBAL);

    cone = new Cone(scene);//global on purpose

    engine.runRenderLoop(function() {
      scene.render();
    });

    window.addEventListener('resize', function() {
      engine.resize();
    });
  }
};