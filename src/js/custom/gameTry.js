/**
 * Copyright 2014, Christophe Rosset (Topheman)
 * http://labs.topheman.com/
 * http://twitter.com/topheman
 * 
 * @dependency BabylonJS - https://github.com/BabylonJS/Babylon.js
 * @dependency handjs - http://handjs.codeplex.com/
 * 
 * This file may seem poorly coded (global variables, etc ...), this is only to test the framework
 * I don't really have a clue of what I will do exactly (a game probably)
 * If you have ideas please share them !
 */

var camera, coneMain, coneTest1, coneTest2, ground, coneList1, coneList2;

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
//    camera.attachControl(canvas);
    // deactivate keyboard binding
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.keysLeft = [];
    
    //add some objects
    ground = BABYLON.Mesh.CreatePlane("ground", 30, scene);//Parameters are: name, size, and scene to attach the mesh.
    ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.GLOBAL);
    
    ground.isPickable = true;
//    ground.isVisible = false;
    
    //create cones
    coneMain = new Cone(scene,{name:"coneMain"});//global on purpose
    //test cones to check correct behavior
    coneTest1 = new Cone(scene,{name:"coneTest1",color:'#3d9aff'});//blue
    coneTest2 = new Cone(scene,{name:"coneTest2",color:'#ffd53d'});//yellow
    coneTest1.position.x = 10;
    coneTest2.position.z = -10;
    coneTest2.rotation.y = -1;
    
    coneList1 = new Cone.List();
    coneList1.push(coneMain);
    coneList1.push(coneTest1);
    coneList1.push(coneTest2);
    
    coneList2 = new Cone.List();
    coneList2.push(coneTest1);
    coneList2.push(coneTest2);
    
    
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
    //put them as an array as well
    var conesArray = [];
    for (var currentCone in cones){
      conesArray.push(cones[currentCone].instance);
      cones[currentCone].instance.setAlpha(0);//set all of them to alpha = 0
    }
    
    var coneIndex, previousOptions;
    for(coneIndex = conesArray.length; coneIndex > 0; coneIndex--){
      console.log(coneIndex, previousOptions);
      previousOptions = (function(coneIndex, previousOptions){
        var options;
        if(coneIndex < conesArray.length){
          options = {
            callback:function(){
              previousOptions.speed = 1.5;
              console.log('a',coneIndex,previousOptions);
              conesArray[coneIndex].fadeIn(previousOptions);
            }
          };
        }
        else{
          options = {speed:1.5};
        }
        return options;
      })(coneIndex, previousOptions);
    }
    
    conesArray[0].fadeIn(previousOptions);
    
//    coneMain.fadeIn({
//      callback:function(){
//        coneTest1.fadeIn({
//          callback:function(){
//            coneTest2.fadeIn();
//          }
//        });
//      }
//    });
    
    camera.target = coneMain.getMainMesh();
    var cameraMouseMode = false;

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
      unSquint : false,
      pointer : {
        coneName : false,
        lastCoords : false,
        i : 0
      }
    };

    window.addEventListener('keydown', function(e) {
      switch (e.keyCode) {
        case 17 :
          state.unSquint = true;
          break;
        case 18 :
          state.camera = true;
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
        case 18 :
          state.camera = false;
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
        coneMain.$hasMoved = true;
      }
      if (state.down) {
        coneMain.moveBack();
        coneMain.$hasMoved = true;
      }
      if (state.left) {
        coneMain.turnLeft();
      }
      if (state.right) {
        coneMain.turnRight();
      }
      if(state.pointer.coneName && state.pointer.lastCoords){
        cones[state.pointer.coneName].instance.follow(state.pointer.lastCoords);
        cones[state.pointer.coneName].instance.$hasMoved = true;
      }
      if(state.camera === true && cameraMouseMode === false){
        camera.attachControl(canvas);
        cameraMouseMode = true;
      }
      if(state.camera === false && cameraMouseMode === true){
        camera.detachControl(canvas);
        cameraMouseMode = false;
      }
      //this loop can be optimize (according to exactly what we want to do)
      var i,j;
      //loop from the 1rst cone
      for(i=0; i<conesArray.length; i++){
        //loop from the second cone
        for(j=i+1; j<conesArray.length; j++){
          if(conesArray[i].intersectsCone(conesArray[j])){
            //only do something to the instance that is not moving
            if(conesArray[j].$hasMoved === true){
              conesArray[i].$intersected = true;
            }
            else if(conesArray[i].$hasMoved === true){
              conesArray[j].$intersected = true;
            }
          }
        }
        conesArray[i].intersectsGroundLimits(ground,true);//keep cones inside ground
        conesArray[i].$hasMoved = false;//reset tag
      }
    
      for(i=0; i<conesArray.length; i++){
        if(conesArray[i].$intersected === true && conesArray[i].isWidenningEyes() === false){
//          conesArray[i].widenEyes();
        }
        else if(conesArray[i].$intersected === false && conesArray[i].isEyesWiden()){
//          conesArray[i].unWidenEyes();
        }
        conesArray[i].$intersected = false;
      }
    });

    engine.runRenderLoop(function() {
      scene.render();
    });

    window.addEventListener('resize', function() {
      engine.resize();
    });
    
    canvas.addEventListener('pointerdown', function(e){
      var pickingInfos = scene.pick(e.clientX,e.clientY);
      if(pickingInfos.pickedMesh && pickingInfos.pickedMesh.name.indexOf("cone") > -1){
        var coneName = pickingInfos.pickedMesh.name.split('-')[0];
        state.pointer.coneName = coneName;
        state.pointer.i = 0;
      }
    },false);
    
    canvas.addEventListener('pointermove', function(e){
      if(state.pointer.coneName !== false){
        //to check if the cone has been moved (a pointermove is triggered after the pointerup)
        //so this is how a simple click is detected
        state.pointer.i++;
        var pickingInfos = scene.pick(e.clientX,e.clientY);
        if(pickingInfos.pickedPoint){
          state.pointer.lastCoords = pickingInfos.pickedPoint;
        }
      }
    },false);
    
    canvas.addEventListener('pointerup', function(e){
      if(state.pointer.coneName !== false){
        state.pointer.coneName = false;
      }
      if(state.pointer.i === 0){
        var pickingInfos = scene.pick(e.clientX,e.clientY);
        if(pickingInfos.pickedMesh && pickingInfos.pickedMesh.name.indexOf("cone") > -1){
          var coneName = pickingInfos.pickedMesh.name.split('-')[0];
          cones[coneName].instance.toggleBump({
            scale:cones[coneName].bumpSettings.scale,
            speed:cones[coneName].bumpSettings.speed
          });
        }
      }
      state.pointer.i = 0;
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
    
    document.getElementById('infos').classList.add('loaded');
    
  }
};