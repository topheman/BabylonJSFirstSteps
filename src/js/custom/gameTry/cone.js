function Cone(scene, options){
  options = typeof options === 'object' ? options : {};
  
  //single name
  this.name = (new Date()).getTime();
  
  //default settings
  this.step = typeof options.step !== 'undefined' ? options.step : 0.1;
  this.turn = typeof options.turn !== 'undefined' ? options.turn : 0.1;
  this.eyeSize = typeof options.eyeSize !== 'undefined' ? options.eyeSize : 1.5;
  
  //parent mesh to group all the others
  var parent = BABYLON.Mesh.CreatePlane(this.name+"-group", 1, scene);
  parent.isVisible = false;
  
  //create + link + reposition the cylinder inside the group
  this.cylinder = BABYLON.Mesh.CreateCylinder(this.name+"-group-cylinder", 5, 5, 2, 20, scene);
  this.cylinder.parent = parent;
  this.cylinder.setPositionWithLocalVector(new BABYLON.Vector3(0,2.5,0));
  
  //create a parent mesh for the eyes + link it to the global parent mesh + reposition and scale
  this.parentEyes = BABYLON.Mesh.CreatePlane(this.name+"-group-eyesGroup", 1, scene);
  this.parentEyes.parent = parent;
  this.parentEyes.isVisible = false;
  this.parentEyes.setPositionWithLocalVector(new BABYLON.Vector3(1,3.5,0));
  this.parentEyes.scaling.y = 1.5;
  
  //create eyes + link them to the parentEyes mesh
  this.leftEye = BABYLON.Mesh.CreateSphere(this.name+"-group-eyesGroup-left-eye", 10.0, this.eyeSize, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
  this.leftEye.parent = this.parentEyes;
  this.leftEye.setPositionWithLocalVector(new BABYLON.Vector3(0,0,0.7));
  
  this.rightEye = BABYLON.Mesh.CreateSphere(this.name+"-group-eyesGroup-right-eye", 10.0, this.eyeSize, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
  this.rightEye.parent = this.parentEyes;
  this.rightEye.setPositionWithLocalVector(new BABYLON.Vector3(0,0,-0.7));
  
  //add texture to the cylinder
  this.cylinder.material = new BABYLON.StandardMaterial(this.name+"-texture-cyclinder", scene);
  this.cylinder.material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
  
  //add texture to the eyes
  var eyeMaterial = new BABYLON.StandardMaterial(this.name+"-texture-eye", scene);
  eyeMaterial.diffuseTexture = new BABYLON.Texture("./assets/gameTry/eye.png", scene);
  this.leftEye.material = eyeMaterial;
  this.rightEye.material = eyeMaterial;
  eyeMaterial.diffuseTexture.vOffset = 1.5;
  eyeMaterial.diffuseTexture.vScale = 2;
  
  
  //emulate getters setters on position babylonjs style
  var position = {};
  Object.defineProperties(position,{
    'x' : {
      get : function(){return parent.position.x;},
      set : function(x){return parent.position.x = x;}
    },
    'y' : {
      get : function(){return parent.position.y;},
      set : function(y){return parent.position.y = y;}
    },
    'z' : {
      get : function(){return parent.position.z;},
      set : function(z){return parent.position.z = z;}
    }
  });
  this.position = position;
  this._getMeshGroup = function(){
    return parent;
  };
  
};

Cone.prototype = {
  moveForward : function(){
    this._getMeshGroup().translate(BABYLON.Axis.X, this.step, BABYLON.Space.LOCAL);
  },
  moveBack : function(){
    this._getMeshGroup().translate(BABYLON.Axis.X, -this.step, BABYLON.Space.LOCAL);
  },
  moveLeft : function(){
    this._getMeshGroup().translate(BABYLON.Axis.Z, this.step, BABYLON.Space.LOCAL);
  },
  moveRight : function(){
    this._getMeshGroup().translate(BABYLON.Axis.Z, -this.step, BABYLON.Space.LOCAL);
  },
  turnLeft : function(){
    this._getMeshGroup().rotate(BABYLON.Axis.Y, -this.turn, BABYLON.Space.LOCAL);
  },
  turnRight : function(){
    this._getMeshGroup().rotate(BABYLON.Axis.Y, this.turn, BABYLON.Space.LOCAL);
  }
};