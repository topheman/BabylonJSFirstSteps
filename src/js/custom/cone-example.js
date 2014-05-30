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
    light.position = new BABYLON.Vector3(20, 60, 30);

    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 35, BABYLON.Vector3.Zero(), scene);
    scene.activeCamera = camera;
//    camera.attachControl(canvas);
    // deactivate keyboard binding
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.keysLeft = [];
    
    //add some objects
    ground = BABYLON.Mesh.CreatePlane("ground", 50, scene);//Parameters are: name, size, and scene to attach the mesh.
    ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.GLOBAL);
    
    ground.isPickable = true;
//    ground.isVisible = false;
    ground.material = new BABYLON.StandardMaterial("ground-texture", scene);
    ground.material.backFaceCulling = false;
    
    //create cones
    coneMain = new Cone(scene,{name:"coneMain",$intersected: false});//global on purpose
    //test cones to check correct behavior
    coneTest1 = new Cone(scene,{name:"coneTest1",$intersected: false,color:{r:0.2,g:0.5,b:0.8}});//blue
    coneTest2 = new Cone(scene,{name:"coneTest2",$intersected: false,color:'#ffd53d'});//yellow
    coneTest1.position.x = 10;
    coneTest2.position.z = -10;
    coneTest2.rotation.y = -1;
    
    coneListAll = new Cone.List();
    coneListAll.push(coneMain);
    coneListAll.push(coneTest1);
    coneListAll.push(coneTest2);
    
    coneListOthers = new Cone.List();
    coneListOthers.push(coneTest1);
    coneListOthers.push(coneTest2);
    
    
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
    
    coneListAll.setAlpha(0).fadeIn();
    
    coneMain.bump({scale:1.2,speed:5});
    
    //custom user chainable queues
//    coneTest2.queue('color');
//    coneTest2.delay('color',4000)
//      .then(function(next,cone){ coneTest2.setColor('#00C510');console.log('cone',cone);next(); })
//      .delay(1000)
//      .then(function(next,cone){ cone.setColor('#C56E00');console.log('cone',cone);next(); })
//      .then(function(next){ coneTest2.bump({callback:next}); })
//      .then(function(next,cone){ coneTest2.setColor('#ffd53d');console.log('cone',cone);next(); })
//      .delay(1000)
//      .then(function(next,cone){ coneTest2.setColor('#00D500');console.log('cone',cone);next(); })
//      .then(function(next){ coneTest2.widenEyes({full:true,speed:1,callback:next}); })
//      .then(function(next,cone){ cone.setColor('#ffd53d');next(); });
    
    camera.target = coneMain.getMainMesh();
    var cameraMouseMode = false;

    //shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useVarianceShadowMap = false;
//    shadowGenerator.alpha = 0.8;
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
        if(coneMain.tailingCone() !== false){
          coneMain.unTail();
          coneMain.stopBump();
        }
        coneMain.moveForward();
        coneMain.$hasMoved = true;
      }
      if (state.down) {
        if(coneMain.tailingCone() !== false){
          coneMain.unTail();
          coneMain.stopBump();
        }
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
        if(cones[state.pointer.coneName].instance.tailingCone() !== false){
          cones[state.pointer.coneName].instance.unTail();
          cones[state.pointer.coneName].instance.stopBump();
        }
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
      for(i=0; i<coneListAll.length; i++){
        //loop from the second cone
        for(j=i+1; j<coneListAll.length; j++){
          if(coneListAll[i].intersectsCone(coneListAll[j])){
            //only do something to the instance that is not moving
            if(coneListAll[j].$hasMoved === true){
              coneListAll[i].$intersected = coneListAll[j];
            }
            else if(coneListAll[i].$hasMoved === true){
              coneListAll[j].$intersected = coneListAll[i];
            }
          }
        }
        coneListAll[i].intersectsGroundLimits(ground,true);//keep cones inside ground
        coneListAll[i].$hasMoved = false;//reset tag
      }
    
      for(i=0; i<coneListAll.length; i++){
        if(coneListAll[i].$intersected !== false && coneListAll[i].isWidenningEyes() === false){
          if(coneListAll[i].tailingCone() === false){
            coneListAll[i].widenEyes({
              callback:(function(cone){
                return function(){
                  setTimeout(function(){
                    if(cone.isEyesWiden() === true){
                      cone.unWidenEyes();
                    }
                    cone.bump({loop:true});
                  },800);
                };
              })(coneListAll[i])
            }).tail(coneListAll[i].$intersected,{distance:5.5});
          }
        }
        else if(coneListAll[i].$intersected === false && coneListAll[i].isEyesWiden()){
          coneListAll[i].unWidenEyes();
        }
        coneListAll[i].$intersected = false;
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
            speed:cones[coneName].bumpSettings.speed,
            loop: false
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