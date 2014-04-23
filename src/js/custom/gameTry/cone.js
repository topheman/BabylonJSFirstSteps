function Cone(scene, options){
  options = typeof options === 'object' ? options : {};
  
  //single name
  this.name = (new Date()).getTime();
  
  //default settings
  this.step = typeof options.step !== 'undefined' ? options.step : 0.1;
  this.turn = typeof options.turn !== 'undefined' ? options.turn : 0.1;
  
  //parent mesh to group all the others
  var parent = BABYLON.Mesh.CreatePlane("Plane", 1, scene);
  parent.isVisible = false;
  
  //create + link + reposition the cylinder inside the group
  this.cylinder = BABYLON.Mesh.CreateCylinder("coneCylinder"+this.name, 5, 5, 3, 20, scene, true);
  this.cylinder.parent = parent;
  this.cylinder.setPositionWithLocalVector(new BABYLON.Vector3(0,2.5,0));
  
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