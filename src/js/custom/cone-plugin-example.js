/**
 * Copyright 2014, Christophe Rosset (Topheman)
 * http://labs.topheman.com/
 * http://twitter.com/topheman
 * 
 * @dependency BabylonJS - https://github.com/BabylonJS/Babylon.js
 * @dependency handjs - http://handjs.codeplex.com/
 * 
 * This page exposes the plugin extentions possibilities of the Cone class
 * 
 */

//globals so you could play with on the console
var coneList;

window.onload = function(){
  var canvas = document.getElementById("canvas");

  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  }
  else{
    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -2, -1), scene);
    light.intensity = 1.2;
    light.position = new BABYLON.Vector3(20, 60, 30);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 35, BABYLON.Vector3.Zero(), scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas);
    
    //add some objects
    var ground = BABYLON.Mesh.CreatePlane("ground", 50, scene);//Parameters are: name, size, and scene to attach the mesh.
    ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.GLOBAL);

    engine.runRenderLoop(function() {
      scene.render();
    });

    window.addEventListener('resize', function() {
      engine.resize();
    });
    
    coneList = new Cone.List();
    for(var i=0; i<4; i++){
      coneList.push(new Cone(scene,{
        color:Cone.helpers.getRandomColor()
      }));
    }
    
    //shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useVarianceShadowMap = false;
    ground.receiveShadows = true;
    coneList.registerToShadowGenerator(shadowGenerator);
    
    coneList[0].position.x = -10;
    coneList[1].position.z = -10;
    coneList[2].position.x = 10;
    coneList[3].position.z = 10;
    
    canvas.addEventListener('pointerdown', function(e){
      var pickingInfos = scene.pick(e.clientX,e.clientY);
      if(pickingInfos.pickedMesh && pickingInfos.pickedMesh.name.indexOf("cone") > -1){
        var coneName = pickingInfos.pickedMesh.name.split('-')[0];
        coneList.each(function(item){
          if(item.name === coneName){
            item.surprised();
          }
        });
      }
    },false);
    
    var switchingPlaces = false;
    document.getElementById('switchPlaces').addEventListener('click', function() {
      if(switchingPlaces !== true){
        switchingPlaces = true;
        coneList.switchPlaces({
          callback:function(){
            switchingPlaces = false;
        }});
      }
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
    },false);
    
    document.getElementById('infos').classList.add('loaded');
    
  }
};