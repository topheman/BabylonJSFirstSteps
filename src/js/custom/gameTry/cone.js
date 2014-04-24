(function(ConeExport) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(ConeExport);
  } else {
    // Browser globals
    window.Cone = ConeExport();
  }
  //@todo add CommonJS support for browserify
})(function() {

  //Contructor
  var Cone = function(scene, options) {
    options = typeof options === 'object' ? options : {};

    var CONE_CYLINDER_TOP_DIAMETER = 2;
    var CONE_CYLINDER_BOTTOM_DIAMETER = 5;
    var CONE_CYLINDER_HEIGHT = 5;

    //single name
    this.name = (new Date()).getTime();

    //default settings
    this.step = typeof options.step !== 'undefined' ? options.step : 0.1;
    this.turn = typeof options.turn !== 'undefined' ? options.turn : 0.1;
    this.eyeSize = typeof options.eyeSize !== 'undefined' ? options.eyeSize : 1.5;
    this.color = typeof options.color !== 'undefined' ? hexToRgb(options.color) : {r: 0.564, g: 0, b: 0};//#900000

    //parent mesh to group all the others
    var parentMesh = BABYLON.Mesh.CreatePlane(this.name + "-group", 1, scene);
    parentMesh.isVisible = false;

    //create + link + reposition the cylinder inside the group
    this.cylinder = BABYLON.Mesh.CreateCylinder(this.name + "-group-cylinder", CONE_CYLINDER_HEIGHT, CONE_CYLINDER_BOTTOM_DIAMETER, CONE_CYLINDER_TOP_DIAMETER, 20, scene);
    var pivot = BABYLON.Matrix.Translation(0,CONE_CYLINDER_HEIGHT/2,0);
    this.cylinder.setPivotMatrix(pivot);
    this.cylinder.parent = parentMesh;
    this.cylinder.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0));

    //create a parent mesh for the eyes + link it to the global parent mesh + reposition and scale
    this.parentEyes = BABYLON.Mesh.CreatePlane(this.name + "-group-eyesGroup", 1, scene);
    this.parentEyes.parent = parentMesh;
    this.parentEyes.isVisible = false;
    this.parentEyes.setPositionWithLocalVector(new BABYLON.Vector3(1, 3.5, 0));
    this.parentEyes.scaling.y = 1.5;

    //create eyes + link them to the parentEyes mesh
    this.leftEye = BABYLON.Mesh.CreateSphere(this.name + "-group-eyesGroup-left-eye", 10.0, this.eyeSize, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
    this.leftEye.parent = this.parentEyes;
    this.leftEye.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0.7));

    this.rightEye = BABYLON.Mesh.CreateSphere(this.name + "-group-eyesGroup-right-eye", 10.0, this.eyeSize, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
    this.rightEye.parent = this.parentEyes;
    this.rightEye.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, -0.7));

    //add texture to the cylinder
    this.cylinder.material = new BABYLON.StandardMaterial(this.name + "-texture-cyclinder", scene);
    this.cylinder.material.diffuseColor = new BABYLON.Color3(this.color.r, this.color.g, this.color.b);

    //add texture to the eyes
    this.leftEye.material = new BABYLON.StandardMaterial(this.name + "-material-leftEye", scene);
    this.rightEye.material = new BABYLON.StandardMaterial(this.name + "-material-rightEye", scene);
    this.leftEye.material.diffuseTexture = new BABYLON.Texture("./assets/gameTry/eye-light.png", scene);
    this.rightEye.material.diffuseTexture = new BABYLON.Texture("./assets/gameTry/eye-light.png", scene);

    this.rightEye.material.diffuseTexture.vOffset = -0.245;
    this.rightEye.material.diffuseTexture.uOffset = 0;

    this.leftEye.material.diffuseTexture.vOffset = -0.245;
    this.leftEye.material.diffuseTexture.uOffset = 0;
    
    //add animations
    this.cylinder.animations.push(getBumpAnimation());


    //emulate getters setters on position babylonjs style
    var position = {};
    Object.defineProperties(position, {
      'x': {
        get: function() {
          return parentMesh.position.x;
        },
        set: function(x) {
          return parentMesh.position.x = x;
        }
      },
      'y': {
        get: function() {
          return parentMesh.position.y;
        },
        set: function(y) {
          return parentMesh.position.y = y;
        }
      },
      'z': {
        get: function() {
          return parentMesh.position.z;
        },
        set: function(z) {
          return parentMesh.position.z = z;
        }
      }
    });
    this.position = position;
    this._getMeshGroup = function() {
      return parentMesh;
    };

  };

  //Instance methode shared on the prototype
  Cone.prototype = {
    moveForward: function() {
      this._getMeshGroup().translate(BABYLON.Axis.X, this.step, BABYLON.Space.LOCAL);
    },
    moveBack: function() {
      this._getMeshGroup().translate(BABYLON.Axis.X, -this.step, BABYLON.Space.LOCAL);
    },
    moveLeft: function() {
      this._getMeshGroup().translate(BABYLON.Axis.Z, this.step, BABYLON.Space.LOCAL);
    },
    moveRight: function() {
      this._getMeshGroup().translate(BABYLON.Axis.Z, -this.step, BABYLON.Space.LOCAL);
    },
    turnLeft: function() {
      this._getMeshGroup().rotate(BABYLON.Axis.Y, -this.turn, BABYLON.Space.LOCAL);
    },
    turnRight: function() {
      this._getMeshGroup().rotate(BABYLON.Axis.Y, this.turn, BABYLON.Space.LOCAL);
    },
    registerToShadowGenerator: function(shadowGenerator) {
      var renderList = shadowGenerator.getShadowMap().renderList;
      renderList.push(this.cylinder);
      renderList.push(this.leftEye);
      renderList.push(this.rightEye);
    },
    squint: function() {
      if (this.rightEye.material.diffuseTexture.uOffset < 0.08) {
        this.leftEye.material.diffuseTexture.vOffset += 0.005;
        this.rightEye.material.diffuseTexture.vOffset -= 0.005;
        this.leftEye.material.diffuseTexture.uOffset += 0.003;
        this.rightEye.material.diffuseTexture.uOffset += 0.003;
        return true;
      }
      return false;
    },
    unSquint: function() {
      if (this.rightEye.material.diffuseTexture.uOffset > 0) {
        this.leftEye.material.diffuseTexture.vOffset -= 0.005;
        this.rightEye.material.diffuseTexture.vOffset += 0.005;
        this.leftEye.material.diffuseTexture.uOffset -= 0.003;
        this.rightEye.material.diffuseTexture.uOffset -= 0.003;
        return true;
      }
      return false;
    },
    bump: function() {
      this.cylinder.getScene().beginAnimation(this.cylinder, 0, 100, true, 3, function(){
        console.log('bumping - back normal');
      });
      this.bumping = true;
    },
    stopBump: function() {
      this.cylinder.getScene().stopAnimation(this.cylinder);
      this.bumping = false;

    },
    isBumping: function() {
      return this.bumping;
    }
  };

  //Private methods

  //this method is inpired by http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  };

  /**
   * Private BABYLON.Animation shared by all Cone instances, create it with getBumpAnimation.
   * @type BABYLON.Animation
   */
  var bumpAnimation = null;
  /**
   * Acts like a singleton, all the instances will share the same BABYLON.Animation to save memory.
   * @returns {BABYLON.Animation}
   */
  var getBumpAnimation = function() {
    if(bumpAnimation !== null){
      return bumpAnimation;
    }
    bumpAnimation = new BABYLON.Animation("bumpAnimation", "scaling.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];
    keys.push({
      frame: 0,
      value: 1
    });
    keys.push({
      frame: 50,
      value: 1.2
    });
    keys.push({
      frame: 100,
      value: 1
    });
    bumpAnimation.setKeys(keys);
    return bumpAnimation;
  };

  return Cone;

});