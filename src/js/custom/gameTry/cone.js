/*!
 * Copyright 2014, Christophe Rosset (Topheman)
 * http://labs.topheman.com/
 * http://twitter.com/topheman
 * 
 * @dependency BabylonJS - https://github.com/BabylonJS/Babylon.js
 * @dependency handjs - http://handjs.codeplex.com/
 * 
 */

(function(ConeExport) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(ConeExport);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConeExport;
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
    
    this._size = {
      topDiameter : CONE_CYLINDER_TOP_DIAMETER,
      bottomDiameter : CONE_CYLINDER_BOTTOM_DIAMETER,
      height : CONE_CYLINDER_HEIGHT
    };
    
    //single name
    this.cone = true;
    this.name = typeof options.name !== 'undefined' ? options.name : "cone"+(new Date()).getTime();

    //default settings
    this.moveStep = typeof options.moveStep !== 'undefined' ? options.moveStep : 0.1;
    this.turnStep = typeof options.turn !== 'undefined' ? options.turnStep : 0.1;
    this.eyeSize = typeof options.eyeSize !== 'undefined' ? options.eyeSize : 1.5;
    this.color = typeof options.color !== 'undefined' ? hexToRgb(options.color) : {r: 0.564, g: 0, b: 0};//#900000
    options.pickable = typeof options.pickable === 'undefined' ? true :  options.pickable;

    //parent mesh to group all the others
    var parentMesh = BABYLON.Mesh.CreatePlane(this.name + "-group", 1, scene);
    parentMesh.isVisible = false;
    parentMesh.isPickable = false;
    
    //create + link + reposition the cylinder inside the group
    this.cylinder = BABYLON.Mesh.CreateCylinder(this.name + "-group-cylinder", CONE_CYLINDER_HEIGHT, CONE_CYLINDER_BOTTOM_DIAMETER, CONE_CYLINDER_TOP_DIAMETER, 20, scene);
    var pivot = BABYLON.Matrix.Translation(0, CONE_CYLINDER_HEIGHT / 2, 0);
    this.cylinder.setPivotMatrix(pivot);
    this.cylinder.parent = parentMesh;
    this.cylinder.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0));
    this.cylinder.isPickable = options.pickable;

    //create a parent mesh for the eyes + link it to the global parent mesh + reposition and scale
    this.parentEyes = BABYLON.Mesh.CreatePlane(this.name + "-group-eyesGroup", 1, scene);
    this.parentEyes.parent = parentMesh;
    this.parentEyes.isVisible = false;
    this.parentEyes.setPositionWithLocalVector(new BABYLON.Vector3(1, 3.5, 0));
    this.parentEyes.scaling.y = 1.5;
    this.parentEyes.isPickable = false;

    //create eyes + link them to the parentEyes mesh
    this.leftEye = BABYLON.Mesh.CreateSphere(this.name + "-group-eyesGroup-left-eye", 10.0, this.eyeSize, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
    this.leftEye.parent = this.parentEyes;
    this.leftEye.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0.7));
    this.leftEye.isPickable = options.pickable;

    this.rightEye = BABYLON.Mesh.CreateSphere(this.name + "-group-eyesGroup-right-eye", 10.0, this.eyeSize, scene);//Parameters are: name, number of segments (highly detailed or not), size, scene to attach the mesh. Beware to adapt the number of segments to the size of your mesh ;)
    this.rightEye.parent = this.parentEyes;
    this.rightEye.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, -0.7));
    this.rightEye.isPickable = options.pickable;

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

    //emulate getter

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
    
    //emulate getters setters on rotation babylonjs style
    var rotation = {};
    Object.defineProperties(rotation, {
      'x': {
        get: function() {
          return parentMesh.rotation.x;
        },
        set: function(x) {
          return parentMesh.rotation.x = x;
        }
      },
      'y': {
        get: function() {
          return parentMesh.rotation.y;
        },
        set: function(y) {
          return parentMesh.rotation.y = y;
        }
      },
      'z': {
        get: function() {
          return parentMesh.rotation.z;
        },
        set: function(z) {
          return parentMesh.rotation.z = z;
        }
      }
    });
    this.rotation = rotation;
    
    //emulate getters setters on rotation babylonjs style
    var scaling = {};
    Object.defineProperties(scaling, {
      'x': {
        get: function() {
          return parentMesh.scaling.x;
        },
        set: function(x) {
          return parentMesh.scaling.x = x;
        }
      },
      'y': {
        get: function() {
          return parentMesh.scaling.y;
        },
        set: function(y) {
          return parentMesh.scaling.y = y;
        }
      },
      'z': {
        get: function() {
          return parentMesh.scaling.z;
        },
        set: function(z) {
          return parentMesh.scaling.z = z;
        }
      }
    });
    this.scaling = scaling;
    
//    Object.defineProperty(this,'applyGravity', {
//      get: function() {
//        return parentMesh.applyGravity;
//      },
//      set: function(applyGravity) {
//        return parentMesh.applyGravity = applyGravity;
//      }
//    });
    
    this.getMainMesh = function() {
      return parentMesh;
    };

  };

  //Instance methode shared on the prototype
  Cone.prototype = {
    moveForward: function() {
      this.getMainMesh().translate(BABYLON.Axis.X, this.moveStep, BABYLON.Space.LOCAL);
    },
    moveBack: function() {
      this.getMainMesh().translate(BABYLON.Axis.X, -this.moveStep, BABYLON.Space.LOCAL);
    },
    moveLeft: function() {
      this.getMainMesh().translate(BABYLON.Axis.Z, this.moveStep, BABYLON.Space.LOCAL);
    },
    moveRight: function() {
      this.getMainMesh().translate(BABYLON.Axis.Z, -this.moveStep, BABYLON.Space.LOCAL);
    },
    turnLeft: function() {
      this.getMainMesh().rotate(BABYLON.Axis.Y, -this.turnStep, BABYLON.Space.LOCAL);
    },
    turnRight: function() {
      this.getMainMesh().rotate(BABYLON.Axis.Y, this.turnStep, BABYLON.Space.LOCAL);
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
    bump: function(scale, speed) {
      scale = (typeof scale === 'undefined' || scale === 0) ? 1.2 : scale;
      speed = (typeof speed === 'undefined' || speed === 0) ? 3 : speed;
      if (this.bumpingScale !== scale) {
        this.bumpingScale = scale;
        helpers.removeAnimationFromMesh(this.cylinder, "bumpAnimation");
        this.cylinder.animations.push(getBumpAnimation(scale));
      }
      this.cylinder.getScene().beginAnimation(this.cylinder, 0, 100, true, speed, function() {
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
    },
    toggleBump: function(scale, speed) {
      if (this.isBumping()) {
        this.stopBump();
      }
      else {
        this.bump(scale, speed);
      }
    },
    setMoveStep: function(moveStep) {
      this.moveStep = moveStep;
    },
    getMoveStep: function() {
      return this.moveStep;
    },
    setTurnStep: function(turnStep) {
      this.turnStep = turnStep;
    },
    getTurnStep: function() {
      return this.turnStep;
    },
    getHeight: function(){
      return this._size.height*this.cylinder.scaling.y*this.scaling.y;
    },
    getTopDiameter: function(){
      return this._size.topDiameter*(this.cylinder.scaling.x > this.cylinder.scaling.z ? this.cylinder.scaling.x : this.cylinder.scaling.z)*(this.scaling.x > this.scaling.z ? this.scaling.x : this.scaling.z);
    },
    getBottomDiameter: function(){
      return this._size.bottomDiameter*(this.cylinder.scaling.x > this.cylinder.scaling.z ? this.cylinder.scaling.x : this.cylinder.scaling.z)*(this.scaling.x > this.scaling.z ? this.scaling.x : this.scaling.z);
    },
    /**
     * Checks if two cones intersect (based on the bottom diameter)
     * If a cone has been rescaled, it's taken account (although, if scaling x and z are different the bigger one is taken in account)
     * @param {Cone} cone
     * @returns {Boolean}
     */
    intersectsCone: function(cone){
      var distance = Math.sqrt((this.position.x - cone.position.x)*(this.position.x - cone.position.x)+(this.position.z - cone.position.z)*(this.position.z - cone.position.z));
      console.log(distance);
      if(distance < (this.getBottomDiameter() + cone.getBottomDiameter())/2){
        return true;
      }
      return false;
    }
  };

  //Private methods

  /**
   * this method is inpired by http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
   * @param {String} hex
   * @returns {Object}
   */
  var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  };

  /**
   * Returns a simple bumpAnimation
   * @param {Number} scale description
   * @returns {BABYLON.Animation}
   */
  var getBumpAnimation = function(scale) {
    var bumpAnimation = new BABYLON.Animation("bumpAnimation", "scaling.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];
    keys.push({
      frame: 0,
      value: 1
    });
    keys.push({
      frame: 50,
      value: scale
    });
    keys.push({
      frame: 100,
      value: 1
    });
    bumpAnimation.setKeys(keys);
    return bumpAnimation;
  };

  /**
   * Bunch of methods I didn't find inside BabylonJS, that I coded for myself
   * please tell me if they exist
   */
  var helpers = {
    /**
     * @unused
     * @param {BABYLON.Mesh} mesh
     * @returns {Array}
     */
    getAnimationNamesFromMesh: function(mesh) {
      var result = mesh.animations.map(function(item, index) {
        return item.name;
      });
    },
    /**
     * @unused
     * @param {BABYLON.Mesh} mesh
     * @param {String} animationName
     * @returns {Boolean}
     */
    isAnimationRegistered: function(mesh, animationName) {
      return helpers.getAnimationNamesFromMesh(mesh).indexOf(animationName) > -1;
    },
    /**
     * Removes the animation from the mesh
     * returns true if the animation was removed / false if there was no animation to remove
     * @param {BABYLON.Mesh} mesh
     * @param {String} animationName
     * @returns {Boolean}
     */
    removeAnimationFromMesh: function(mesh, animationName) {
      if (mesh.animations.length > 0) {
        mesh.animations.splice(mesh.animations.indexOf(animationName), 1);
        return true;
      }
      else {
        return false;
      }
    }
  };

  return Cone;

});