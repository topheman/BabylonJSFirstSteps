function Cone(scene, options){
  //single name
  this.name = (new Date()).getTime();
  
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
  
};

Cone.prototype = {
  
};