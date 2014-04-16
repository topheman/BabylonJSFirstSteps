var canvas = document.getElementById("canvas");

// Check support
if (!BABYLON.Engine.isSupported()) {
  window.alert('Browser not supported');
} else {
  // Babylon
  var engine = new BABYLON.Engine(canvas, true);

  //Creation of the scene 
  var scene = new BABYLON.Scene(engine);

  //Adding the light to the scene
  var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 100, 100), scene);

  //Adding an Arc Rotate Camera
  var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 10, new BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas);
  
  BABYLON.SceneLoader.ImportMesh("car", "./assets/firstTry/", "firstTry.babylon", scene, function(newMeshes, particleSystems) {

  });

  // Once the scene is loaded, just register a render loop to render it
  engine.runRenderLoop(function() {
    scene.render();
  });

  // Resize
  window.addEventListener("resize", function() {
    engine.resize();
  });
}