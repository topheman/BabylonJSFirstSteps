/*!
 * Copyright 2014, Christophe Rosset (Topheman)
 * http://labs.topheman.com/
 * http://twitter.com/topheman
 * 
 * @dependency BabylonJS - https://github.com/BabylonJS/Babylon.js
 * 
 */

(function(ConeExport) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(ConeExport);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConeExport();
  } else {
    // Browser globals
    window.Cone = ConeExport();
  }
})(function() {
  
  /*** Cone (Public Class Methods below) ***/

  var CONE_CYLINDER_TOP_DIAMETER = 2;
  var CONE_CYLINDER_BOTTOM_DIAMETER = 5;
  var CONE_CYLINDER_HEIGHT = 5;
  var PARENT_EYES_ORIGINAL_SCALING_Y = 1.5;
  var PARENT_EYES_ORIGINAL_POSITION_X = 1;
  var PARENT_EYES_ORIGINAL_POSITION_Y = 3.5;
    
  //Contructor
  var Cone = function(scene, options) {
    options = typeof options === 'object' ? options : {};
    
    this._size = {
      topDiameter : CONE_CYLINDER_TOP_DIAMETER,
      bottomDiameter : CONE_CYLINDER_BOTTOM_DIAMETER,
      height : CONE_CYLINDER_HEIGHT
    };
    
    //single name
    this.name = typeof options.name !== 'undefined' ? options.name : "cone"+(new Date()).getTime();

    //default settings
    this.moveStep = typeof options.moveStep !== 'undefined' ? options.moveStep : 0.1;
    this.turnStep = typeof options.turn !== 'undefined' ? options.turnStep : 0.1;
    this.eyeSize = typeof options.eyeSize !== 'undefined' ? options.eyeSize : 1.5;
    this.color = typeof options.color !== 'undefined' ? (isRgb(options.color) ? options.color : hexToRgb(options.color)) : {r: 0.564, g: 0, b: 0};//#900000
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
    this.parentEyes.setPositionWithLocalVector(new BABYLON.Vector3(PARENT_EYES_ORIGINAL_POSITION_X, PARENT_EYES_ORIGINAL_POSITION_Y, 0));
    this.parentEyes.scaling.y = PARENT_EYES_ORIGINAL_SCALING_Y;
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
    
    //states
    this.bumping = false;
    this.widenningEyes = false;
    this.eyesWiden = false;
    this.alphaAnimatingCylinder = false;
    this.alphaAnimatingLeftEye = false;
    this.alphaAnimatingRightEye = false;
    
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
    
    this.getMainMesh = function() {
      return parentMesh;
    };

    //customizable animations are added/removed on the fly
    
    this._coneTailing = false;
    this._coneTailedBy = false;
    
    this._animationQueue = [];
    
  };

  //Instance methode shared on the prototype
  Cone.prototype = {
    _resolveAnimationQueue: function(){
      console.log('_resolveAnimationQueue');
      if(this._animationQueue.length > 0){
        this._animationQueue.shift();
      }
      if(this._animationQueue.length > 0){
        this._animationQueue[0]();
      }
    },
    _pushToAnimationQueue: function(animationLauncher){
      this._animationQueue.push(animationLauncher);
    },
    flushAnimationQueue: function(){
      this.stopAllAnimationsRunning();
      removeAllAnimations(this);
      this._animationQueue.length = 0;
    },
    getAnimationQueue: function(){
      return this._animationQueue;
    },
    getPosition:function(){
      return this.getMainMesh().position;
    },
    setColor: function(color){
      if(isRgb(color) === false){
        color = hexToRgb(color);
      }
      this.cylinder.material.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
    },
    setAlpha: function(alpha){
      this.cylinder.material.alpha = alpha;
      this.leftEye.material.alpha = alpha;
      this.rightEye.material.alpha = alpha;
    },
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
    isAnimationRunning: function(){
      return this.isBumping() && this.isWidenningEyes() && this.isChangingAlpha();
    },
    stopAllAnimationsRunning: function(){
      if(this.isBumping()){
        this.stopBump();
      }
      if(this.isWidenningEyes()){
        this.stopWidenEyes();
      }
      if(this.isChangingAlpha()){
        this.stopAnimateAlpha();
      }
    },
    widenEyes: function(options){
      var from, to, endState, eyesWidenState;
      options = typeof options === 'undefined' ? {} : options;
      options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 5 : options.speed;
      options.loop = (typeof options.loop === 'undefined') ? false : options.loop;
      options.callback = (typeof options.callback !== 'function') ? null : options.callback;
      options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
      options.break = (typeof options.break === 'undefined') ? false : options.break;
      if(options.loop !== false && options.callback !== null){
        console.warn("Can't apply callback on looped animation");
      }
      if(options.close === true){
        from = 50;
        to = 100;
        endState = false;
        eyesWidenState = false;
      }
      else if(options.full === true){
        from = 0;
        to = 100;
        endState = false;
        eyesWidenState = false;
      }
      else{
        from = 0;
        to = 50;
        endState = true;
        eyesWidenState = true;
      }
      
      if(options.break === true){
        this.flushAnimationQueue();
      }
      
      var index = this._animationQueue.push((function(that){
        return function(){
          //to avoid collision between animations @todo animation queue
          that.stopAllAnimationsRunning();
          removeAllAnimations(that);

          addWidenEyesAnimation(that);
          that.widenningEyes = true;
          that.eyesWiden = false;
          that.parentEyes.getScene().beginAnimation(that.parentEyes, from, to, options.loop, options.speed,function(){
            that.widenningEyes = endState;
            that.eyesWiden = eyesWidenState;
            removeWidenEyesAnimation(that);
            setTimeout(function(){//setTimeout needed
              if(options.callback !== null){
                options.callback.call({},that);
              }
              that._resolveAnimationQueue();
            },options.delay);
          });
        };
      })(this));

      if(index === 1){
        this._animationQueue[0]();
      }
      
      return this;
    },
    unWidenEyes: function(options){
      options = typeof options === 'undefined' ? {} : options;
      options.close = true;
      return this.widenEyes(options);
    },
    stopWidenEyes: function(){
      this.parentEyes.getScene().stopAnimation(this.parentEyes);
      removeWidenEyesAnimation(this);
      this.resetWidenEyes();
      return this;
    },
    resetWidenEyes: function(){
      this.parentEyes.scaling.y = PARENT_EYES_ORIGINAL_SCALING_Y;
      this.parentEyes.position.x = PARENT_EYES_ORIGINAL_POSITION_X;
      this.parentEyes.position.y = PARENT_EYES_ORIGINAL_POSITION_Y;
      this.widenningEyes = false;
    },
    isWidenningEyes: function(){
      return this.widenningEyes;
    },
    isEyesWiden: function(){
      return this.eyesWiden;
    },
    bump: function(options) {
      options = typeof options === 'undefined' ? {} : options;
      options.scale = (typeof options.scale === 'undefined' || options.scale === 0) ? 1.2 : options.scale;
      options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 3 : options.speed;
      options.loop = (typeof options.loop === 'undefined') ? false : options.loop;
      options.callback = (typeof options.callback !== 'function') ? null : options.callback;
      options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
      options.break = (typeof options.break === 'undefined') ? false : options.break;
      if(options.loop !== false && options.callback !== null){
        console.warn("Can't apply callback on looped animation");
      }
      
      if(options.break === true){
        this.flushAnimationQueue();
      }
      
      var index = this._animationQueue.push((function(that){
        return function(){
          //to avoid collision between animations @todo animation queue
          that.stopAllAnimationsRunning();
          removeAllAnimations(that);

          addBumpAnimation(that,options.scale);
          that.cylinder.getScene().beginAnimation(that.cylinder, 0, 100, options.loop, options.speed, function() {
            that.resetBump();
            removeBumpAnimation(that);
            setTimeout(function(){//setTimeout needed
              if(options.callback !== null){
                options.callback.call({},that);
              }
              that._resolveAnimationQueue();
            },options.delay);
          });
          that.bumping = true;
        };
      })(this));

      if(index === 1){
        this._animationQueue[0]();
      }
      
      return this;
    },
    stopBump: function() {
      this.cylinder.getScene().stopAnimation(this.cylinder);
      this.resetBump();
      removeBumpAnimation(this);
      return this;
    },
    resetBump: function(){
      this.cylinder.scaling.y = 1;
      this.bumping = false;
    },
    isBumping: function() {
      return this.bumping;
    },
    toggleBump: function(options) {
      if (this.isBumping()) {
        this.stopBump();
      }
      else {
        this.bump(options);
      }
      return this;
    },
    animateAlpha: function(options){
      var that = this;
      options = typeof options === 'undefined' ? {} : options;
      options.alpha = typeof options.alpha === 'undefined' ? 0 : options.alpha;
      options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 3 : options.speed;
      options.loop = typeof options.loop === 'undefined' ? false : options.loop;
      options.callback = (typeof options.callback !== 'function') ? null : options.callback;
      options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
      options.break = (typeof options.break === 'undefined') ? false : options.break;
      options.cylinder = typeof options.cylinder === 'undefined' ? true : options.cylinder;
      options.leftEye = typeof options.leftEye === 'undefined' ? true : options.leftEye;
      options.rightEye = typeof options.rightEye === 'undefined' ? true : options.rightEye;
      if(options.loop !== false && options.callback !== null){
        console.warn("Can't apply callback on looped animation");
      }
      
      if(options.break === true){
        this.flushAnimationQueue();
      }
      
      var index = this._animationQueue.push((function(that){
        return function(){
          //to avoid collision between animations @todo animation queue
          that.stopAllAnimationsRunning();
          removeAllAnimations(that);

          addAlphaAnimation(that,options);

          var callback = function(cone){
            if(cone.isChangingAlpha() === true){
              removeAlphaAnimation(cone);
              setTimeout(function(){//setTimeout needed
                if(options.callback !== null){
                  options.callback.call({},that);
                }
                that._resolveAnimationQueue();
              },options.delay);
            }
            that.alphaAnimatingCylinder = false;
            that.alphaAnimatingLeftEye = false;
            that.alphaAnimatingRightEye = false;
          };

          if(options.cylinder === true){
            that.alphaAnimatingCylinder = true;
            that.cylinder.getScene().beginAnimation(that.cylinder, 0, 100, options.loop, options.speed, function(){
              callback(that);
            });
          }
          if(options.leftEye === true){
            that.alphaAnimatingLeftEye = true;
            that.leftEye.getScene().beginAnimation(that.leftEye, 0, 100, options.loop, options.speed, function(){
              callback(that);
            });
          }
          if(options.rightEye === true){
            that.alphaAnimatingRightEye = true;
            that.rightEye.getScene().beginAnimation(that.rightEye, 0, 100, options.loop, options.speed, function(){
              callback(that);
            });
          }
        };
      })(this));

      if(index === 1){
        this._animationQueue[0]();
      }
      
      return this;
    },
    stopAnimateAlpha: function(){
      this.cylinder.getScene().stopAnimation(this.cylinder);
      this.leftEye.getScene().stopAnimation(this.leftEye);
      this.rightEye.getScene().stopAnimation(this.rightEye);
      removeAlphaAnimation(this);
      return this;
    },
    fadeIn: function(options){
      options = typeof options === 'undefined' ? {} : options;
      options.alpha = 1;
      return this.animateAlpha(options);
    },
    fadeOut: function(options){
      options = typeof options === 'undefined' ? {} : options;
      options.alpha = 0;
      return this.animateAlpha(options);
    },
    isChangingAlpha: function(){
      return this.alphaAnimatingCylinder && this.alphaAnimatingLeftEye && this.alphaAnimatingRightEye;
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
    getDistance: function(cone){
      return Math.sqrt((this.position.x - cone.position.x)*(this.position.x - cone.position.x)+(this.position.z - cone.position.z)*(this.position.z - cone.position.z));
    },
    /**
     * Checks if two cones intersect (based on the bottom diameter)
     * If a cone has been rescaled, it's taken account (although, if scaling x and z are different the bigger one is taken in account)
     * @param {Cone} cone
     * @returns {Boolean}
     */
    intersectsCone: function(cone){
      var distance = this.getDistance(cone);
      if(distance < (this.getBottomDiameter() + cone.getBottomDiameter())/2){
        return true;
      }
      return false;
    },
    /**
     * 
     * @param {BABYLON.Mesh} ground (plane)
     * @param {Boolean} replace if you wan't not only to check the limit but also keep the cone inside it
     * @returns {Boolean}
     */
    intersectsGroundLimits: function(ground,replace){
      var boundingInfos = ground.getBoundingInfo(), result = false;
      if((this.position.x + this.getBottomDiameter()/2) > boundingInfos.boundingBox.maximum.x){
        if(replace === true){
          this.position.x = boundingInfos.boundingBox.maximum.x - this.getBottomDiameter()/2;
        }
        result = true;
      }
      if((this.position.x - this.getBottomDiameter()/2) < boundingInfos.boundingBox.minimum.x){
        if(replace === true){
          this.position.x = boundingInfos.boundingBox.minimum.x + this.getBottomDiameter()/2;
        }
        result = true;
      }
      if((this.position.z + this.getBottomDiameter()/2) > boundingInfos.boundingBox.maximum.y){
        if(replace === true){
          this.position.z = boundingInfos.boundingBox.maximum.y - this.getBottomDiameter()/2;
        }
        result = true;
      }
      if((this.position.z - this.getBottomDiameter()/2) < boundingInfos.boundingBox.minimum.y){
        if(replace === true){
          this.position.z = boundingInfos.boundingBox.minimum.y + this.getBottomDiameter()/2;
        }
        result = true;
      }
      return result;
    },
    /**
     * 
     * @param {BABYLON.Vector3} point
     * @returns {undefined}
     */
    lookAt: function(point){
      point.y = this.getMainMesh().position.y;
      this.getMainMesh().lookAt(point,Math.PI/2);
    },
    follow: function(point){
      if(point && point.subtract(this.getPosition()).length() > 0.05){
        this.lookAt(point);
        this.moveForward();
      }
    },
    //@todo implement a hasMoved tag to know if the instance has moved (update it in a registerBeforeRenderLoop)
    /**
     * Attaches this cone to the one passed in parameter
     * If you try to tail a cone already followed by another, your cone will follow the last one in the tail
     * It returns the cone you end up tailing
     * @param {Cone} cone
     * @param {Object} options
     * @returns {Cone}
     */
    tail: function(cone,options){
      var fullTail;
      options = typeof options === 'undefined' ? {} : options;
      options.distance = typeof options.distance === 'undefined' ? (this.getBottomDiameter() + cone.getBottomDiameter())/2 : options.distance;
      this._tailingOptions = options;
      
      //if cones are already following, chose the last one in the tail
      fullTail = cone.getFullTail();
      console.log(fullTail);
      if(fullTail.length > 0){
        cone = fullTail[fullTail.length-1];
      }
      
      this._coneTailing = cone;
      cone._coneTailedBy = this;
      var thisCone = this;
      this._tailingBeforeRender = function(){
        if(thisCone.getDistance(cone) > options.distance){
          thisCone.follow(new BABYLON.Vector3(cone.position.x,0,cone.position.z));
        }
      };
      this.getMainMesh().getScene().registerBeforeRender(this._tailingBeforeRender);
      return cone;
    },
    /**
     * Detaches your cone, returns the cone it was tailing
     * @returns {Cone}
     */
    unTail: function(){
      var cone = this._coneTailing;
      cone._coneTailedBy = false;
      this._coneTailing = false;
      this.getMainMesh().getScene().unRegisterBeforeRender(this._tailingBeforeRender);
      return cone;
    },
    /**
     * Returns the cone instance which this cone is tailing
     * @returns {Boolean|Cone}
     */
    isTailing: function(){
      return this._coneTailing;
    },
    /**
     * Returns the cone instance which this cone is tailed by
     * @returns {Boolean}
     */
    isTailed: function(){
      return this._coneTailedBy;
    },
    /**
     * Returns an array of the cones tailing this one
     * @returns {Array[Cone]}
     */
    getFullTail: function(){
      var fullTail = [], reccursiveTailingConesDiscovery;
      reccursiveTailingConesDiscovery = function(cone){
        var tailingCone = cone.isTailed();
        if(tailingCone !== false){
          fullTail.push(tailingCone);
          reccursiveTailingConesDiscovery(tailingCone);
        }
      };
      reccursiveTailingConesDiscovery(this);
      return fullTail;
    },
    fade: function(options){
      
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
      r: parseInt(result[1], 16) / 256,
      g: parseInt(result[2], 16) / 256,
      b: parseInt(result[3], 16) / 256
    } : null;
  };
  
  var isRgb = function(color){
    if(typeof color !== 'undefined' && typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number'){
      return true;
    }
    return false;
  };
  
  var removeAllAnimations = function(cone){
    removeBumpAnimation(cone);
    removeWidenEyesAnimation(cone);
    removeAlphaAnimation(cone);
  };

  /**
   * @param {Cone} cone
   * @param {Number} scale description
   */
  var addBumpAnimation = function(cone,scale) {
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
    cone.cylinder.animations.push(bumpAnimation);
  };
  
  /**
   * @param {Cone} cone
   */
  var removeBumpAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.cylinder, "bumpAnimation");
  };
  
  var addWidenEyesAnimation = function(cone){
    var parentEyesAnimationScalingY = new BABYLON.Animation("parentEyesAnimationScalingY", "scaling.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var parentEyesAnimationScalingYKeys = [];
    parentEyesAnimationScalingYKeys.push({
      frame: 0,
      value: PARENT_EYES_ORIGINAL_SCALING_Y
    });
    parentEyesAnimationScalingYKeys.push({
      frame: 50,
      value: PARENT_EYES_ORIGINAL_SCALING_Y*1.8
    });
    parentEyesAnimationScalingYKeys.push({
      frame: 100,
      value: PARENT_EYES_ORIGINAL_SCALING_Y
    });
    parentEyesAnimationScalingY.setKeys(parentEyesAnimationScalingYKeys);
    cone.parentEyes.animations.push(parentEyesAnimationScalingY);
    
    var parentEyesAnimationPositionX = new BABYLON.Animation("parentEyesAnimationPositionX", "position.x", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var parentEyesAnimationPositionXKeys = [];
    parentEyesAnimationPositionXKeys.push({
      frame: 0,
      value: PARENT_EYES_ORIGINAL_POSITION_X
    });
    parentEyesAnimationPositionXKeys.push({
      frame: 50,
      value: PARENT_EYES_ORIGINAL_POSITION_X+1
    });
    parentEyesAnimationPositionXKeys.push({
      frame: 100,
      value: PARENT_EYES_ORIGINAL_POSITION_X
    });
    parentEyesAnimationPositionX.setKeys(parentEyesAnimationPositionXKeys);
    cone.parentEyes.animations.push(parentEyesAnimationPositionX);
    
    var parentEyesAnimationPositionY = new BABYLON.Animation("parentEyesAnimationPositionY", "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var parentEyesAnimationPositionYKeys = [];
    parentEyesAnimationPositionYKeys.push({
      frame: 0,
      value: PARENT_EYES_ORIGINAL_POSITION_Y
    });
    parentEyesAnimationPositionYKeys.push({
      frame: 50,
      value: PARENT_EYES_ORIGINAL_POSITION_Y+1
    });
    parentEyesAnimationPositionYKeys.push({
      frame: 100,
      value: PARENT_EYES_ORIGINAL_POSITION_Y
    });
    parentEyesAnimationPositionY.setKeys(parentEyesAnimationPositionYKeys);
    cone.parentEyes.animations.push(parentEyesAnimationPositionY);
  };
  
  /**
   * 
   * @param {Cone} cone
   */
  var removeWidenEyesAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.parentEyes, "parentEyesAnimationScalingY");
    helpers.removeAnimationFromMesh(cone.parentEyes, "parentEyesAnimationPositionX");
    helpers.removeAnimationFromMesh(cone.parentEyes, "parentEyesAnimationPositionY");
  };
  
  /**
   * 
   * @param {Cone} cone
   * @param {Object} options
   */
  var addAlphaAnimation = function(cone,options){
    
    if(options.cylinder === true){
      var cylinderAlphaAnimation = new BABYLON.Animation("cylinderAlphaAnimation", "material.alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      var cylinderAlphaAnimationKeys = [];
      cylinderAlphaAnimationKeys.push({
        frame: 0,
        value: cone.cylinder.material.alpha
      });
      cylinderAlphaAnimationKeys.push({
        frame: 100,
        value: options.alpha
      });
      cylinderAlphaAnimation.setKeys(cylinderAlphaAnimationKeys);
      cone.cylinder.animations.push(cylinderAlphaAnimation);
    }
    
    if(options.leftEye === true){
      var leftEyeAlphaAnimation = new BABYLON.Animation("leftEyeAlphaAnimation", "material.alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      var leftEyeAlphaAnimationKeys = [];
      leftEyeAlphaAnimationKeys.push({
        frame: 0,
        value: cone.leftEye.material.alpha
      });
      leftEyeAlphaAnimationKeys.push({
        frame: 100,
        value: options.alpha
      });
      leftEyeAlphaAnimation.setKeys(leftEyeAlphaAnimationKeys);
      cone.leftEye.animations.push(leftEyeAlphaAnimation);
    }
    
    if(options.rightEye === true){
      var rightEyeAlphaAnimation = new BABYLON.Animation("rightEyeAlphaAnimation", "material.alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      var rightEyeAlphaAnimationKeys = [];
      rightEyeAlphaAnimationKeys.push({
        frame: 0,
        value: cone.rightEye.material.alpha
      });
      rightEyeAlphaAnimationKeys.push({
        frame: 100,
        value: options.alpha
      });
      rightEyeAlphaAnimation.setKeys(rightEyeAlphaAnimationKeys);
      cone.rightEye.animations.push(rightEyeAlphaAnimation);
    }
    
  };
  
  var removeAlphaAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.cylinder, "cylinderAlphaAnimation");
    helpers.removeAnimationFromMesh(cone.leftEye, "leftEyeAlphaAnimation");
    helpers.removeAnimationFromMesh(cone.rightEye, "rightEyeAlphaAnimation");
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
    },
    cloneObject: function(obj){
      var result = {}, key;
      for(key in obj){
        result[key] = obj[key];
      }
      return result;
    }
  };
  
  /*** Cone.List ***/
  
  var animationMethods = [
    'widenEyes',
    'unWidenEyes',
    'bump',
    'animateAlpha',
    'fadeIn',
    'fadeOut'
  ];
  
  var stopAnimationMethods = [
    'stopWidenEyes',
    'stopBump',
    'stopAnimateAlpha'
  ];
  
  /**
   * 
   * @param {Array[Cone]|Cone} coneList
   * @returns {Cone.List}
   */
  Cone.List = function(coneList){
    var MESSAGE_ERROR = 'Cone.List only accepts Cone object or Array of Cone objects';
    if(coneList instanceof Cone){
      this.push(coneList);
    }
    else if(coneList instanceof Array){
      for(var i=0;i<coneList.length;i++){
        if(coneList[i] instanceof Cone){
          this.push(coneList[i]);
        }
        else{
          throw new Error(MESSAGE_ERROR);
        }
      }
    }
    else if(typeof coneList !== 'undefined'){
      throw new Error(MESSAGE_ERROR);
    }
  };
  
  Cone.List.prototype = [];
  
  Cone.List.prototype.animate = function(options){
    var that = this;
    options = typeof options === 'undefined' ? {} : options;
    options.totalCallback = typeof options.callback !== 'function' ? null : options.callback;
    options.totalLoop = (typeof options.loop === 'undefined') ? true : options.loop;
    options.callback = typeof options.eachCallback !== 'function' ? null : options.eachCallback;
    options.totalDelay = (typeof options.delay === 'undefined') ? 0 : options.delay;
    options.delay = (typeof options.eachDelay === 'undefined') ? 0 : options.eachDelay;
    if(typeof options.method === 'undefined'){
      throw new Error('method needs to be specified');
    }
    if(animationMethods.indexOf(options.method) === -1 && stopAnimationMethods.indexOf(options.method) === -1){
      throw new Error('"'+options.method+'" : method not allowed');
    }
    if(this.length > 0){
      for(var i=0; i<this.length; i++){
        //on the last cone, set the totalCallback
        if(i === (this.length - 1)){
          var lastConeOptions = helpers.cloneObject(options);
          lastConeOptions.callback = (function(){
            return function(cone){
              if(options.callback !== null){
                options.callback.call({},cone);
              }
              if(options.totalCallback !== null){
                setTimeout(function(){
                  options.totalCallback.call({},that);
                },options.totalDelay);
              }
            };
          })(options);
          this[i][options.method](lastConeOptions);
        }
        else{
          this[i][options.method](options);
        }
      }
    }
  };
  
  var addConeListAnimateShortcuts = function(proto,methods){
    var i;
    for(i=0; i<methods.length; i++){
      proto[methods[i]] = (function(methodName){
        return function(options){
          options = typeof options === 'undefined' ? {} : options;
          options.method = methodName;
          console.log(options, methodName);
          this.animate(options);
        };
      })(methods[i]);
    }
  };
  
  addConeListAnimateShortcuts(Cone.List.prototype, animationMethods);
  addConeListAnimateShortcuts(Cone.List.prototype, stopAnimationMethods);
  
  Cone.List.prototype.animateCascade = function(options){
    options = typeof options === 'undefined' ? {} : options;
    options.totalCallback = typeof options.callback !== 'function' ? null : options.callback;
    options.totalLoop = (typeof options.loop === 'undefined') ? true : options.loop;
    options.callback = typeof options.eachCallback !== 'function' ? null : options.eachCallback;
    options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
    if(typeof options.method === 'undefined'){
      throw new Error('method needs to be specified');
    }
  };

  return Cone;

});