function createScene(engine) {
  //Creation of the scene 
  var scene = new BABYLON.Scene(engine);

  //Adding the light to the scene
  var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 100, 100), scene);

  //Adding an Arc Rotate Camera
  var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, new BABYLON.Vector3.Zero(), scene);
  
  //creating props
  var box = BABYLON.Mesh.CreateBox("Box", 6.0, scene);//Parameters are: name, size of the box, the scene to attach the mesh.
  var sphere = BABYLON.Mesh.CreateSphere("Sphere", 10.0, 3.0, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
  var plan = BABYLON.Mesh.CreatePlane("Plane", 50.0, scene);//Parameters are: name, size, and scene to attach the mesh.
  var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 3, 3, 3, 15, scene, false);//Parameters are: name, height, diameterTop, diameterBottom, tessellation (highly detailed or not), scene, updatable.
  var torus = BABYLON.Mesh.CreateTorus("torus", 5, 1, 30, scene, false);//Parameters are: name, diameter, thickness, tessellation (highly detailed or not), scene, updatable.
  
  //updating props coordinate
  box.position.x = 10;
  cylinder.position.x = -10;
  plan.position.z = -5;
  plan.rotation.x = Math.PI;
  
  return scene;
}