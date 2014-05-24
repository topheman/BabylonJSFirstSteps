/*!
 * Copyright 2014, Christophe Rosset (Topheman)
 * http://labs.topheman.com/
 * http://twitter.com/topheman
 * 
 * @requires BabylonJS - https://github.com/BabylonJS/Babylon.js
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
"use strict";
  
  /**
   * @module Cone
   */
  
  //Constants
  var CONE_CYLINDER_TOP_DIAMETER = 2;
  var CONE_CYLINDER_BOTTOM_DIAMETER = 5;
  var CONE_CYLINDER_HEIGHT = 5;
  var PARENT_EYES_ORIGINAL_SCALING_Y = 1.5;
  var PARENT_EYES_ORIGINAL_POSITION_X = 1;
  var PARENT_EYES_ORIGINAL_POSITION_Y = 3.5;
  var DEFAULT_FOLLOW_STEP_PRECISION = 0.5;
    
  /**
   * Creates a new cone
   * @class Cone
   * @constructor
   * @param {BABYLON.Scene} scene
   * @param {Object} options
   * @return {Cone}
   */
  var Cone = function(scene, options) {
    options = typeof options === 'object' ? options : {};
    
    /**
     * Original sizes
     * @private
     * @property {Object] _size
     */
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
    this.color = typeof options.color !== 'undefined' ? ( isRgb(options.color) ? options.color : hexToRgb(options.color) ) : {r: 0.564, g: 0, b: 0};//#900000
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
    this.leftEye.material.diffuseTexture = new BABYLON.Texture("./assets/Cone/eye-light.png", scene);
    this.rightEye.material.diffuseTexture = new BABYLON.Texture("./assets/Cone/eye-light.png", scene);

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
    /**
     * x postion of the cone in the space
     * @property position.x
     * @type number
     */
    /**
     * y postion of the cone in the space
     * @property position.y
     * @type number
     */
    /**
     * z postion of the cone in the space
     * @property position.z
     * @type number
     */
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
    /**
     * x rotation of the cone in the space
     * @property rotation.x
     * @type number
     */
    /**
     * y rotation of the cone in the space
     * @property rotation.y
     * @type number
     */
    /**
     * z rotation of the cone in the space
     * @property rotation.z
     * @type number
     */
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
    /**
     * x scaling of the cone
     * @property scaling.x
     * @type number
     */
    /**
     * y scaling of the cone
     * @property scaling.y
     * @type number
     */
    /**
     * z scaling of the cone
     * @property scaling.z
     * @type number
     */
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
    
    this._queue = {
      fx : [],
      move : []
    };
    
    //used for .then() to know on which queue add the callback
    this._lastQueueNameCalled = 'fx';
    
    this._currentMoveBeforeRenderLoopCallback = null;
    
  };

  //Instance methode shared on the prototype
  Cone.fn = Cone.prototype = {
    /**
     * Launches the next callback in the queue then removes it from the queue
     * @method dequeue
     * @param {string} queueName
     * @return {Cone}
     * @chainable
     */
    dequeue: function(queueName){
      var next = function(){}, that = this;
      if(typeof this._queue[queueName] === 'undefined'){
        throw new Error('No queue "'+queueName+'" found');
      }
      setTimeout(function(){
        if(that._queue[queueName].length > 0){
          if(that._queue[queueName].length > 1){
            next = (function(queueName){
              return function(){
                that.dequeue(queueName);
              };
            })(queueName);
          }
          that._queue[queueName][0].call({},next);
        }
        if(that._queue[queueName].length > 0){
          that._queue[queueName].shift();
        }
      },0);
      
      return this;
    },
    /**
     * * Call it only with the queueName : **Returns the queue**.
     * * Call it with queueName + callback : registers the callback in the queue. This
     * callback has a "next" parameter to launch the next callback in the queue. **Returns the cone to chain**.
     * * Call it with queueName + array of callback to replace the queue. **Returns the cone to chain**
     * 
     * @method queue
     * @param {string} queueName
     * @param {function|Array<function>} [callback] use the next param like : `function(next){ myCone.fadeOut().delay(1000).then(next); }`
     * @return {Cone|Array<function>}
     * @chainable
     */
    queue: function(queueName, callback){
      var result;
      if(typeof this._queue[queueName] === 'undefined'){
        if(typeof callback === 'undefined'){
          if(this.warnings === true){
            console.warn('queue "'+queueName+'" is not registered');
          }
        }
        result = this._queue[queueName] = [];
        }
      if(typeof callback === 'function'){
        this._queue[queueName].push(callback);
        if(this._queue[queueName].length === 1){
          this.dequeue(queueName);
        }
        this._lastQueueNameCalled = queueName;
        result = this;
      }
      else if(callback instanceof Array){
        this._queue[queueName] = callback;
        this._lastQueueNameCalled = queueName;
        result = this._queue[queueName];
      }
      else{
        result = this._queue[queueName];
      }
      return result;
    },
    /**
     * Adds callback to the last used queue
     * 
     * @method then
     * @param {function} callback `function(next){}`
     * @return {Cone}
     * @chainable
     * @example ```js
     * var myCone = new Cone(scene);
     * myCone
     *   .fadeOut()
     *   .fadeIn()
     *   .delay(1000)
     *   .widenEyes()
     *   .unWidenEyes()
     *   .then(function(next){myCone.setColor('#900000'); next()})
     *   .bump();
     * ```
     */
    then: function(callback){
      if(typeof callback !== 'function'){
        throw new Error('callback must be a function');
      }
      return this.queue(this._lastQueueNameCalled,callback);
    },
    /**
     * Delays the next event in the queue of "delay" ms.
     * 
     * You can force the queue name.
     * 
     * Can also be used without the `queueName` if you're alredy chaining on the right queue like : `myCone.fadeOut().delay(2000).fadeIn()`
     * 
     * @method delay
     * @param {string} queueName
     * @param {number} delay
     * @return {Cone}
     * @chainable
     */
    delay: function(){
      var delay, queueName = null;
      //case only a delay was specified
      if(arguments.length === 1){
        queueName = this._lastQueueNameCalled;
        delay = arguments[0];
      }
      else if(arguments.length === 2){
        queueName = arguments[0];
        delay = arguments[1];
      }
      if(typeof delay !== 'number'){
        throw new Error('delay must be a number');
      }
      if(queueName !== null && typeof queueName !== 'string'){
        throw new Error('queueName must be a string');
      }
      this.queue(queueName,function(next){
        setTimeout(function(){
          next();
        },delay);
      });
      return this;
    },
    /**
     * Clears the queue
     * 
     * @method clearQueue
     * @param {string} queueName
     * @return {Cone}
     * @chainable
     */
    clearQueue: function(queueName){
      this._queue[queueName] = [];
      return this;
    },
    /**
     * Stops all the animations on the fx queue then clears the queue
     * (all other queues continue)
     * 
     * @method flushAnimationQueue
     * @return {Cone}
     * @chainable
     */
    flushAnimationQueue: function(){
      this.stopAllAnimationsRunning();
      this.clearQueue('fx');
      return this;
    },
    /**
     * Returns cone position
     * 
     * @method getPosition
     * @return {BABYLON.Vector3}
     */
    getPosition:function(){
      return this.getMainMesh().position;
    },
    /**
     * Returns true if an fx animation is running
     * 
     * @method isAnimationRunning
     * @return {Boolean}
     */
    isAnimationRunning: function(){
      return this.isBumping() && this.isWidenningEyes() && this.isChangingAlpha();
    },
    /**
     * Returns true if the cone is widenning eyes
     * 
     * @method isWidenningEyes
     * @return {Boolean}
     */
    isWidenningEyes: function(){
      return this.widenningEyes;
    },
    /**
     * Returns true if the cone has its eyes widen
     * 
     * @method isEyesWiden
     * @return {Boolean}
     */
    isEyesWiden: function(){
      return this.eyesWiden;
    },
    /**
     * @method isBumping
     * @return {Boolean}
     */
    isBumping: function() {
      return this.bumping;
    },
    /**
     * Returns true if alpha is animating on the cone
     * 
     * @method isChangingAlpha
     * @return {Boolean}
     */
    isChangingAlpha: function(){
      return this.alphaAnimatingCylinder && this.alphaAnimatingLeftEye && this.alphaAnimatingRightEye;
    },
    /**
     * @method getMoveStep
     * @return {number}
     */
    getMoveStep: function() {
      return this.moveStep;
    },
    /**
     * @method getTurnStep
     * @return {number}
     */
    getTurnStep: function() {
      return this.turnStep;
    },
    /**
     * @method getHeight
     * @return {number}
     */
    getHeight: function(){
      return this._size.height*this.cylinder.scaling.y*this.scaling.y;
    },
    /**
     * @method getTopDiameter
     * @return {number}
     */
    getTopDiameter: function(){
      return this._size.topDiameter*(this.cylinder.scaling.x > this.cylinder.scaling.z ? this.cylinder.scaling.x : this.cylinder.scaling.z)*(this.scaling.x > this.scaling.z ? this.scaling.x : this.scaling.z);
    },
    /**
     * @method getBottomDiameter
     * @return {number}
     */
    getBottomDiameter: function(){
      return this._size.bottomDiameter*(this.cylinder.scaling.x > this.cylinder.scaling.z ? this.cylinder.scaling.x : this.cylinder.scaling.z)*(this.scaling.x > this.scaling.z ? this.scaling.x : this.scaling.z);
    },
    /**
     * @method getDistance
     * @param {Cone} cone
     * @return {number}
     */
    getDistance: function(cone){
      return Math.sqrt((this.position.x - cone.position.x)*(this.position.x - cone.position.x)+(this.position.z - cone.position.z)*(this.position.z - cone.position.z));
    },
    /**
     * Checks if two cones intersect (based on the bottom diameter)
     * 
     * If a cone has been rescaled, it's taken account (although, if scaling x and z are different the bigger one is taken in account)
     * 
     * @method intersectsCone
     * @param {Cone} cone
     * @return {Boolean}
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
     * @method intersectsGroundLimits
     * @param {BABYLON.Mesh} ground (plane)
     * @param {Boolean} replace if you wan't not only to check the limit but also keep the cone inside it
     * @return {Boolean}
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
    //@todo implement a hasMoved tag to know if the instance has moved (update it in a registerBeforeRenderLoop)
    /**
     * * Attaches this cone to the one passed in parameter
     * * If you try to tail a cone already followed by another, your cone will follow the last one in the tail
     * * Returns the cone you end up tailing
     * 
     * @method tail
     * @param {Cone} cone
     * @param {Object} [options]
     * @param {number} [options.distance] By default the sum of the radiuses of the cones
     * @return {Cone}
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
     * 
     * @method unTail
     * @return {Cone}
     */
    unTail: function(){
      var cone = this._coneTailing;
      cone._coneTailedBy = false;
      this._coneTailing = false;
      this.getMainMesh().getScene().unRegisterBeforeRender(this._tailingBeforeRender);
      return cone;
    },
    /**
     * Returns the cone instance which this cone is tailing or false in none
     * 
     * @method isTailing
     * @return {Boolean|Cone}
     */
    isTailing: function(){
      return this._coneTailing;
    },
    /**
     * Returns the cone instance which this cone is tailed by or false in none
     * 
     * @method isTailed
     * @return {Boolean|Cone}
     */
    isTailed: function(){
      return this._coneTailedBy;
    },
    /**
     * Returns a Cone.List of the cones tailing this one
     * 
     * @method getFullTail
     * @return {Cone.List}
     */
    getFullTail: function(){
      var fullTail = new Cone.List, reccursiveTailingConesDiscovery;
      reccursiveTailingConesDiscovery = function(cone){
        var tailingCone = cone.isTailed();
        if(tailingCone !== false){
          fullTail.push(tailingCone);
          reccursiveTailingConesDiscovery(tailingCone);
        }
      };
      reccursiveTailingConesDiscovery(this);
      return fullTail;
    }
  };
  
  var stateFullMethods = {
    /**
     * Registers the cone to a BABYLON.ShadowGenerator to be able to render shadows on the shadow map
     * 
     * @method registerToShadowGenerator
     * @param {BABYLON.ShadowGenerator} shadowGenerator
     * @return {Cone}
     * @chainable
     */
    registerToShadowGenerator: function(shadowGenerator) {
      var renderList = shadowGenerator.getShadowMap().renderList;
      renderList.push(this.cylinder);
      renderList.push(this.leftEye);
      renderList.push(this.rightEye);
      return this;
    },
    /**
     * Squints the eyes of one step
     * Returns true if the eyes are not all squinted
     * Returns false if they are and stop squint
     * 
     * @method squint
     * @return {Boolean}
     */
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
    /**
     * Unsquints the eyes of one step
     * Returns true if the eyes are not all unsquinted
     * Returns false if they are and stop squint
     * 
     * @method unSquint
     * @return {Boolean}
     */
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
    /**
     * Sets the color of the cylinder
     * Accepts hexa or rgb color
     * 
     * @method setColor
     * @param {string|object} color
     * @return {Cone}
     * @chainable
     */
    setColor: function(color){
      if(isRgb(color) === false){
        color = hexToRgb(color);
      }
      this.cylinder.material.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
      return this;
    },
    /**
     * Sets the scale on all the cone
     * 
     * @method setScale
     * @param {number} scale
     * @returns {Cone}
     * @chainable
     */
    setScale: function(scale){
      this.getMainMesh().scaling.x = scale;
      this.getMainMesh().scaling.y = scale;
      this.getMainMesh().scaling.z = scale;
      return this;
    },
    /**
     * Sets the alpha on all the cone
     * 
     * @method setAlpha
     * @param {number} alpha
     * @return {Cone}
     * @chainable
     */
    setAlpha: function(alpha){
      this.cylinder.material.alpha = alpha;
      this.leftEye.material.alpha = alpha;
      this.rightEye.material.alpha = alpha;
      return this;
    },
    /**
     * Moves the cone forward of one moveStep
     * 
     * @method moveForward
     * @return {Cone}
     * @chainable
     */
    moveForward: function() {
      this.getMainMesh().translate(BABYLON.Axis.X, this.moveStep, BABYLON.Space.LOCAL);
      return this;
    },
    /**
     * Moves the cone backwards of one moveStep
     * 
     * @method moveBack
     * @return {Cone}
     * @chainable
     */
    moveBack: function() {
      this.getMainMesh().translate(BABYLON.Axis.X, -this.moveStep, BABYLON.Space.LOCAL);
      return this;
    },
    /**
     * Moves the cone left of one moveStep
     * 
     * @method moveLeft
     * @return {Cone}
     * @chainable
     */
    moveLeft: function() {
      this.getMainMesh().translate(BABYLON.Axis.Z, this.moveStep, BABYLON.Space.LOCAL);
      return this;
    },
    /**
     * Moves the cone right of one moveStep
     * 
     * @method moveRight
     * @return {Cone}
     * @chainable
     */
    moveRight: function() {
      this.getMainMesh().translate(BABYLON.Axis.Z, -this.moveStep, BABYLON.Space.LOCAL);
      return this;
    },
    /**
     * Turns the cone left of one turnStep
     * 
     * @method turnLeft
     * @return {Cone}
     * @chainable
     */
    turnLeft: function() {
      this.getMainMesh().rotate(BABYLON.Axis.Y, -this.turnStep, BABYLON.Space.LOCAL);
      return this;
    },
    /**
     * Turns the cone right of one turnStep
     * 
     * @method turnRight
     * @return {Cone}
     * @chainable
     */
    turnRight: function() {
      this.getMainMesh().rotate(BABYLON.Axis.Y, this.turnStep, BABYLON.Space.LOCAL);
      return this;
    },
    /**
     * Stops all the fx animations
     * 
     * @method stopAllAnimationsRunning
     * @return {Cone}
     * @chainable
     */
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
      removeAllAnimations(this);
      return this;
    },
    /**
     * Stops eyes fx animation
     * 
     * @method stopWidenEyes
     * @return {Cone}
     * @chainable
     */
    stopWidenEyes: function(){
      this.parentEyes.getScene().stopAnimation(this.parentEyes);
      removeWidenEyesAnimation(this);
      this.resetWidenEyes();
      return this;
    },
    /**
     * Reset eyes to orginal scale and position
     * 
     * @method resetWidenEyes
     * @return {Cone}
     * @chainable
     */
    resetWidenEyes: function(){
      this.parentEyes.scaling.y = PARENT_EYES_ORIGINAL_SCALING_Y;
      this.parentEyes.position.x = PARENT_EYES_ORIGINAL_POSITION_X;
      this.parentEyes.position.y = PARENT_EYES_ORIGINAL_POSITION_Y;
      this.widenningEyes = false;
      return this;
    },
    /**
     * Stops cylinder fx animation
     * 
     * @method stopBump
     * @return {Cone}
     * @chainable
     */
    stopBump: function() {
      this.cylinder.getScene().stopAnimation(this.cylinder);
      this.resetBump();
      removeBumpAnimation(this);
      return this;
    },
    /**
     * Reset cylinder to orginal scale and position
     * 
     * @method resetBump
     * @return {Cone}
     * @chainable
     */
    resetBump: function(){
      this.cylinder.scaling.y = 1;
      this.bumping = false;
      return this;
    },
    /**
     * @method toggleBump
     * @param {Object} options
     * @return {Cone}
     * @chainable
     */
    toggleBump: function(options) {
      if (this.isBumping()) {
        this.stopBump();
      }
      else {
        this.bump(options);
      }
      return this;
    },
    /**
     * @method stopAnimateAlpha
     * @return {Cone}
     * @chainable
     */
    stopAnimateAlpha: function(){
      this.cylinder.getScene().stopAnimation(this.cylinder);
      this.leftEye.getScene().stopAnimation(this.leftEye);
      this.rightEye.getScene().stopAnimation(this.rightEye);
      removeAlphaAnimation(this);
      return this;
    },
    /**
     * @method setMoveStep
     * @param {number} moveStep
     * @return {Cone}
     * @chainable
     */
    setMoveStep: function(moveStep) {
      this.moveStep = moveStep;
      return this;
    },
    /**
     * @method setTurnStep
     * @param {number} turnStep
     * @return {Cone}
     * @chainable
     */
    setTurnStep: function(turnStep) {
      this.turnStep = turnStep;
      return this;
    },
    /**
     * @method lookAt
     * @param {BABYLON.Vector3|Cone} point
     * @return {Cone}
     * @chainable
     */
    lookAt: function(point){
      if(point instanceof Cone){
        point = new BABYLON.Vector3(point.getPosition().x,point.getPosition().y,point.getPosition().z);
      }
      point.y = this.getMainMesh().position.y;
      this.getMainMesh().lookAt(point,Math.PI/2);
      return this;
    },
    /**
     * Moves the cone towards "point" of one moveStep
     * 
     * @method follow
     * @param {BABYLON.Vector3|Cone} point
     * @param {function}[callback] callback executed when the cone gets to point `function(point){}`
     * @return {Cone}
     * @chainable
     */
    follow: function(point,callback){
      if(point instanceof Cone){
        point = new BABYLON.Vector3(point.getPosition().x,point.getPosition().y,point.getPosition().z);
      }
      if(point && point.subtract(this.getPosition()).length() > DEFAULT_FOLLOW_STEP_PRECISION){
        this.lookAt(point);
        this.moveForward();
      }
      else{
        this.position.x = point.x;
        this.position.y = point.y;
        this.position.z = point.z;
        if(typeof callback === 'function'){
          callback.call({},point);
        }
      }
      return this;
    }
  };
  
  //add the stateFull methods to the Cone.prototype
  (function($, methods){
    for(var methodName in methods){
      $[methodName] = methods[methodName];
    }
  })(Cone.fn, stateFullMethods);
  
  //Those methods are added to the Cone.prototype below
  var animationMethods = {
    'fx': {
      /**
       * 
       * @method widenEyes
       * @param {Object} [options]
       * @param {number} [options.speed=5] 
       * @param {boolean|number} [options.loop=false] 
       * @param {function} [options.callback=null] `function(cone){}`
       * @param {number} [options.delay=0] 
       * @param {boolean} [options.break=false] 
       * @param {boolean} [options.full=false] 
       * @param {boolean} [options.close=false] 
       * @return {Cone}
       * @chainable
       */
      widenEyes: function(options){
        var from, to, endState, eyesWidenState;
        options = typeof options === 'undefined' ? {} : options;
        options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 5 : options.speed;
        options.loop = (typeof options.loop === 'undefined') ? false : options.loop;
        options.callback = (typeof options.callback !== 'function') ? null : options.callback;
        options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
        options.break = (typeof options.break === 'undefined') ? false : options.break;
        if(options.loop === true && options.callback !== null){
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

        this.queue('fx',(function(that){
          return function(){
            //to avoid collision between animations @todo animation queue
            that.stopAllAnimationsRunning();

            addWidenEyesAnimation(that);
            that.widenningEyes = true;
            that.eyesWiden = false;
            that.parentEyes.getScene().beginAnimation(that.parentEyes, from, to, typeof options.loop === 'number' ? false : options.loop, options.speed,function(){
              that.widenningEyes = endState;
              that.eyesWiden = eyesWidenState;
              removeWidenEyesAnimation(that);
              setTimeout(function(){
                if(options.callback !== null){
                  options.callback.call({},that);
                }
                that.dequeue('fx');
              },options.delay);
            });
          };
        })(this));

        return this;
      },
      unWidenEyes: function(options){
        options = typeof options === 'undefined' ? {} : options;
        options.close = true;
        return this.widenEyes(options);
      },
      bump: function(options) {
        options = typeof options === 'undefined' ? {} : options;
        options.scale = (typeof options.scale === 'undefined' || options.scale === 0) ? 1.2 : options.scale;
        options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 3 : options.speed;
        options.loop = (typeof options.loop === 'undefined') ? false : options.loop;
        options.callback = (typeof options.callback !== 'function') ? null : options.callback;
        options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
        options.break = (typeof options.break === 'undefined') ? false : options.break;
        if(options.loop === true && options.callback !== null){
          console.warn("Can't apply callback on looped animation");
        }

        if(options.break === true){
          this.flushAnimationQueue();
        }

        this.queue('fx',(function(that){
          return function(){
            //to avoid collision between animations @todo animation queue
            that.stopAllAnimationsRunning();

            addBumpAnimation(that,options.scale);
            that.cylinder.getScene().beginAnimation(that.cylinder, 0, 100, typeof options.loop === 'number' ? false : options.loop, options.speed, function() {
              that.resetBump();
              removeBumpAnimation(that);
              setTimeout(function(){
                if(options.callback !== null){
                  options.callback.call({},that);
                }
                that.dequeue('fx');
              },options.delay);
            });
            that.bumping = true;
          };
        })(this));

        return this;
      },
      animateAlpha: function(options){
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
        if(options.loop === true && options.callback !== null){
          console.warn("Can't apply callback on looped animation");
        }

        if(options.break === true){
          this.flushAnimationQueue();
        }

        this.queue('fx',(function(that){
          return function(){
            //to avoid collision between animations @todo animation queue
            that.stopAllAnimationsRunning();

            addAlphaAnimation(that,options);

            var callback = function(cone){
              if(cone.isChangingAlpha() === true){
                removeAlphaAnimation(cone);
                setTimeout(function(){
                  if(options.callback !== null){
                    options.callback.call({},that);
                  }
                  that.dequeue('fx');
                },options.delay);
              }
              that.alphaAnimatingCylinder = false;
              that.alphaAnimatingLeftEye = false;
              that.alphaAnimatingRightEye = false;
            };

            if(options.cylinder === true){
              that.alphaAnimatingCylinder = true;
              that.cylinder.getScene().beginAnimation(that.cylinder, 0, 100, typeof options.loop === 'number' ? false : options.loop, options.speed, function(){
                callback(that);
              });
            }
            if(options.leftEye === true){
              that.alphaAnimatingLeftEye = true;
              that.leftEye.getScene().beginAnimation(that.leftEye, 0, 100, typeof options.loop === 'number' ? false : options.loop, options.speed, function(){
                callback(that);
              });
            }
            if(options.rightEye === true){
              that.alphaAnimatingRightEye = true;
              that.rightEye.getScene().beginAnimation(that.rightEye, 0, 100, typeof options.loop === 'number' ? false : options.loop, options.speed, function(){
                callback(that);
              });
            }
          };
        })(this));

        return this;
      },
      animateScale: function(options){
        options = typeof options === 'undefined' ? {} : options;
        options.scale = typeof options.scale === 'undefined' ? 1 : options.scale;
        options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 3 : options.speed;
        options.loop = typeof options.loop === 'undefined' ? false : options.loop;
        options.callback = (typeof options.callback !== 'function') ? null : options.callback;
        options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
        options.break = (typeof options.break === 'undefined') ? false : options.break;
        if(options.loop === true && options.callback !== null){
          console.warn("Can't apply callback on looped animation");
        }

        if(options.break === true){
          this.flushAnimationQueue();
        }
        
        this.queue('fx',(function(that){
          return function (){
            //to avoid collision between animations @todo animation queue
            that.stopAllAnimationsRunning();
            
            addScaleAnimation(that,options);            
            that.getMainMesh().getScene().beginAnimation(that.getMainMesh(), 0, 100, typeof options.loop === 'number' ? false : options.loop, options.speed, function() {
              setTimeout(function(){
                if(options.callback !== null){
                  options.callback.call({},that);
                }
                that.dequeue('fx');
              },options.delay);
            });
            
          };
        })(this));
        
        return this;
      },
      animateColor: function(options){
        options = typeof options === 'undefined' ? {} : options;
        if(typeof options.color === 'undefined'){
          throw new Error('options.color mandatory');
        }
        if(isRgb(options.color) === false){
          options.color = hexToRgb(options.color);
        }
        options.color = new BABYLON.Color3(options.color.r, options.color.g, options.color.b);
        options.speed = (typeof options.speed === 'undefined' || options.speed === 0) ? 3 : options.speed;
        options.loop = typeof options.loop === 'undefined' ? false : options.loop;
        options.callback = (typeof options.callback !== 'function') ? null : options.callback;
        options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
        options.break = (typeof options.break === 'undefined') ? false : options.break;
        if(options.loop === true && options.callback !== null){
          console.warn("Can't apply callback on looped animation");
        }

        if(options.break === true){
          this.flushAnimationQueue();
        }
        
        this.queue('fx',(function(that){
          return function (){
            //to avoid collision between animations @todo animation queue
            that.stopAllAnimationsRunning();
            
            addColorAnimation(that,options);
            that.cylinder.getScene().beginAnimation(that.cylinder, 0, 100, typeof options.loop === 'number' ? false : options.loop, options.speed, function() {
              removeColorAnimation(that);
              setTimeout(function(){
                if(options.callback !== null){
                  options.callback.call({},that);
                }
                that.dequeue('fx');
              },options.delay);
            });
          };
        })(this));
        
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
      }
    },
    'move':{
      moveTo: function(options){
        options = typeof options === 'undefined' ? {} : options;
        options.callback = (typeof options.callback !== 'function') ? null : options.callback;
        options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
        options.break = (typeof options.break === 'undefined') ? false : options.break;
        if(typeof options.position === 'undefined'){
          throw new Error('options.position mandatory. accepts Cone, BABYLON.Vector3, {x,y,z}, {x,z}');
        }
        else if(options.position instanceof Cone){
          options.position = new BABYLON.Vector3(options.position.getPosition().x,options.position.getPosition().y,options.position.getPosition().z);
        }
        if( (options.position instanceof BABYLON.Vector3 || typeof options.position === 'object') && typeof options.position.x !== 'undefined' && typeof options.position.z !== 'undefined'){
          options.position.y = typeof options.position.y === 'undefined' ? this.getPosition().y : options.position.y;
          options.position = new BABYLON.Vector3(options.position.x,options.position.y,options.position.z);
        }
        this.queue('move',(function(that){
          var currentMoveBeforeRenderLoopCallback = function(){
            that.follow(options.position,function(){
              that.getMainMesh().getScene().unregisterBeforeRender(currentMoveBeforeRenderLoopCallback);
              that.dequeue('move');
            });
          };
          return function(){
            that.getMainMesh().getScene().registerBeforeRender(currentMoveBeforeRenderLoopCallback);
          };
        })(this));
        return this;
      }
    }
  };
  /**
   * Run any animate methods such as :
   * 
   * * animateAlpha
   * * bump
   * * fadeIn
   * * fadeOut
   * * unWidenEyes
   * * widenEyes
   * 
   * Just specify it in `options.method`. Those methods are also accessible directly via shorcuts on the {{#crossLink "Cone"}}Cone{{/crossLink}} instance.
   * 
   * @method animate
   * @param {Object} options
   * @param {String} options.method
   * @return {Cone}
   * @chainable
   * 
   * @example ```js
   * //you can use the .animate() dispatcher as well as the shortcuts, directly on a cone instance :
   * var myCone = new Cone(scene);
   * myCone
   *   .fadeOut()
   *   .fadeIn()
   *   .delay(1000)
   *   .widenEyes()
   *   .unWidenEyes()
   *   .then(function(next){myCone.setColor('#900000'); next()})
   *   .bump();
   * ```
   */
  Cone.fn.animate = function(options){
    if(typeof options === 'undefined' || typeof options.method === 'undefined'){
      throw new Error('options.method mandatory');
    }
    else if(animationMethodExists(options.method) === false){
      throw new Error('"'+options.method+'" : method not allowed');
    }
    var queueName = getAnimationMethodQueueName(options.method);//@todo find the exact queueName for the method
    return animationMethods[queueName][options.method].call(this,options);
  };
  
  //add the animation methods to the Cone.prototype
  (function($, methods){
    for(var queueName in methods){
      for(var methodName in methods[queueName]){
        $[methodName] = (function(methodNameToCall){
          return function(options){
            options = typeof options === 'undefined' ? {} : options;
            options.method = methodNameToCall;
            if(typeof options.loop === 'number' && options.loop > 1){
              for(var i=0;i<options.loop;i++){
                (function(cone,timeToAssign,optionsPassed){
                  var optionsToUse = Cone.helpers.cloneObject(optionsPassed);
                  if(typeof options.callback === 'function'){
                    optionsToUse.callback = function(){
                      return options.callback.call({},cone,timeToAssign);
                    };
                  }
                  cone.animate(optionsToUse);
                })(this,i,options);
              }
              return this;
            }
            else{
              return this.animate(options);
            }
          };
        })(methodName);
      }
    }
  })(Cone.fn, animationMethods);

  //you can set this off, not to see the warnings
  Cone.fn.warnings = true;

  //Private methods
  
  /**
   * 
   * @method animationMethodExists
   * @private
   * @param {string} methodName
   * @return {Boolean}
   */
  var animationMethodExists = function(methodName){
    return !!getAnimationMethodQueueName(methodName);
  };
  
  /**
   * 
   * @method getAnimationMethodQueueName
   * @private
   * @param {string} methodName
   * @return {Boolean|string}
   */
  var getAnimationMethodQueueName = function(methodName){
    for(var queueName in animationMethods){
      if(typeof animationMethods[queueName][methodName] !== 'undefined'){
        return queueName;
      }
    }
    return false;
  };

  /**
   * this method is inpired by http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
   * 
   * @method hexToRgb
   * @private
   * @param {String} hex
   * @return {Object}
   */
  var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 256,
      g: parseInt(result[2], 16) / 256,
      b: parseInt(result[3], 16) / 256
    } : null;
  };
  
  /**
   * @method isRgb
   * @private
   * @param {Object} color
   * @return {Boolean}
   */
  var isRgb = function(color){
    if(typeof color !== 'undefined' && typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number'){
      return true;
    }
    return false;
  };
  
  /**
   * @method removeAllAnimations
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
  var removeAllAnimations = function(cone){
    removeBumpAnimation(cone);
    removeWidenEyesAnimation(cone);
    removeAlphaAnimation(cone);
    removeColorAnimation(cone);
    removeScaleAnimation(cone);
  };

  /**
   * 
   * @method addBumpAnimation
   * @private
   * @param {Cone} cone
   * @param {Number} scale description
   * @return {undefined}
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
   * @method removeBumpAnimation
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
  var removeBumpAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.cylinder, "bumpAnimation");
  };
  
  /**
   * @method addWidenEyesAnimation
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
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
   * @method removeWidenEyesAnimation
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
  var removeWidenEyesAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.parentEyes, "parentEyesAnimationScalingY");
    helpers.removeAnimationFromMesh(cone.parentEyes, "parentEyesAnimationPositionX");
    helpers.removeAnimationFromMesh(cone.parentEyes, "parentEyesAnimationPositionY");
  };
  
  /**
   * @method addAlphaAnimation
   * @private
   * @param {Cone} cone
   * @param {Object} options
   * @return {undefined}
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
  
  /**
   * @method removeAlphaAnimation
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
  var removeAlphaAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.cylinder, "cylinderAlphaAnimation");
    helpers.removeAnimationFromMesh(cone.leftEye, "leftEyeAlphaAnimation");
    helpers.removeAnimationFromMesh(cone.rightEye, "rightEyeAlphaAnimation");
  };
  
  /**
   * @method addScaleAnimation
   * @private
   * @param {Cone} cone
   * @param {Object} options
   * @return {undefined}
   */
  var addScaleAnimation = function(cone, options){

    var mainMeshAnimationScalingX = new BABYLON.Animation("mainMeshAnimationScalingX", "scaling.x", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var mainMeshAnimationScalingXKeys = [];
    mainMeshAnimationScalingXKeys.push({
      frame: 0,
      value: cone.scaling.x
    });
    mainMeshAnimationScalingXKeys.push({
      frame: 100,
      value: options.scale
    });
    mainMeshAnimationScalingX.setKeys(mainMeshAnimationScalingXKeys);
    cone.getMainMesh().animations.push(mainMeshAnimationScalingX);

    var mainMeshAnimationScalingY = new BABYLON.Animation("mainMeshAnimationScalingY", "scaling.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var mainMeshAnimationScalingYKeys = [];
    mainMeshAnimationScalingYKeys.push({
      frame: 0,
      value: cone.scaling.x
    });
    mainMeshAnimationScalingYKeys.push({
      frame: 100,
      value: options.scale
    });
    mainMeshAnimationScalingY.setKeys(mainMeshAnimationScalingYKeys);
    cone.getMainMesh().animations.push(mainMeshAnimationScalingY);

    var mainMeshAnimationScalingZ = new BABYLON.Animation("mainMeshAnimationScalingZ", "scaling.z", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var mainMeshAnimationScalingZKeys = [];
    mainMeshAnimationScalingZKeys.push({
      frame: 0,
      value: cone.scaling.x
    });
    mainMeshAnimationScalingZKeys.push({
      frame: 100,
      value: options.scale
    });
    mainMeshAnimationScalingZ.setKeys(mainMeshAnimationScalingZKeys);
    cone.getMainMesh().animations.push(mainMeshAnimationScalingZ);
    
  };
  
  /**
   * @method removeScaleAnimation
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
  var removeScaleAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.getMainMesh(), "mainMeshAnimationScalingX");
    helpers.removeAnimationFromMesh(cone.getMainMesh(), "mainMeshAnimationScalingY");
    helpers.removeAnimationFromMesh(cone.getMainMesh(), "mainMeshAnimationScalingZ");
  };
  
  /**
   * @todo since under development
   * @method addColorAnimation
   * @private
   * @param {Cone} cone
   * @param {Object} options
   * @return {undefined}
   */
  var addColorAnimation = function(cone, options){
    
    var cylinderColorAnimation = new BABYLON.Animation("cylinderColorAnimation", "material.diffuseColor", 60, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var cylinderColorAnimationKeys = [];
    cylinderColorAnimationKeys.push({
      frame: 0,
      value: new BABYLON.Color3(1,0,0)
    });
    cylinderColorAnimationKeys.push({
      frame: 100,
      value: options.color
    });
    cylinderColorAnimation.setKeys(cylinderColorAnimationKeys);
    cone.cylinder.animations.push(cylinderColorAnimation);
    
  };
  
  /**
   * @method removeColorAnimation
   * @private
   * @param {Cone} cone
   * @return {undefined}
   */
  var removeColorAnimation = function(cone){
    helpers.removeAnimationFromMesh(cone.cylinder, "cylinderColorAnimation");
  };

  /**
   * 
   * Bunch of methods I didn't find inside BabylonJS, that I coded for myself.
   * Please tell me if they exist
   * 
   * @class Cone.helpers
   */
  var helpers = {
    /**
     * @method getAnimationNamesFromMesh
     * @static
     * @param {BABYLON.Mesh} mesh
     * @return {Array}
     */
    getAnimationNamesFromMesh: function(mesh) {
      var result = mesh.animations.map(function(item, index) {
        return item.name;
      });
      return result;
    },
    /**
     * @method isAnimationRegistered
     * @static
     * @param {BABYLON.Mesh} mesh
     * @param {String} animationName
     * @return {Boolean}
     */
    isAnimationRegistered: function(mesh, animationName) {
      return helpers.getAnimationNamesFromMesh(mesh).indexOf(animationName) > -1;
    },
    /**
     * @method removeAnimationFromMesh
     * @static
     * Removes the animation from the mesh
     * returns true if the animation was removed / false if there was no animation to remove
     * @param {BABYLON.Mesh} mesh
     * @param {String} animationName
     * @return {Boolean}
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
    /**
     * @method cloneObject
     * @static
     * Clone object (simple, not deep reccursive)
     * @param {Object} obj
     * @return {Object}
     */
    cloneObject: function(obj){
      var result = {}, key;
      for(key in obj){
        result[key] = obj[key];
      }
      return result;
    }
  };
  
  Cone.helpers = helpers;
  
  /**
   * Creates a new cone list
   * 
   * @class Cone.List
   * @constructor
   * @param {Array<Cone>|Cone} coneList
   * @return {Cone.List}
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
  
  Cone.List.fn = Cone.List.prototype = [];
  
  /**
   * Loops through the cone list providing a callback like `function(cone, index){}`
   * 
   * Return false in the callback to stop the loop
   * 
   * @method each
   * @param {function} callback
   * @return {Cone.List}
   * @chainable
   */
  Cone.List.fn.each = function(callback){
    if(this.length > 0){
      for(var i=0; i<this.length; i++){
        if(callback.call({},this[i],i) === false){
          break;
        }
      }
    }
    return this;
  };
  
  /**
   * Run any animate methods such as :
   * 
   * * animateAlpha
   * * bump
   * * fadeIn
   * * fadeOut
   * * unWidenEyes
   * * widenEyes
   * 
   * Just specify it in `options.method`. Those methods are also accessible via the same shortcuts like you would use on a {{#crossLink "Cone"}}Cone{{/crossLink}} instance.
   * 
   * @method animate
   * @param {Object} options same options as the ones on the cone for each animation method
   * @param {String} options.method
   * @return {Cone.List}
   * @chainable
   * 
   * @example ```js
   * //you can use the .animate() dispatcher as well as the shortcuts, directly on a conelist :
   * var myConeList = new ConeList([myCone1,myCone2,myCone3]);
   * myConeList
   *   .fadeOut()
   *   .fadeIn()
   *   .delay(1000)
   *   .widenEyes()
   *   .unWidenEyes()
   *   .then(function(next){myConeList.setColor('#900000'); next()})
   *   .bump();
   * ```
   */
  Cone.List.fn.animate = function(options){
    options = typeof options === 'undefined' ? {} : options;
    options.loop = (typeof options.loop === 'undefined') ? false : options.loop;
    options.callback = typeof options.callback !== 'function' ? null : options.callback;
    options.delay = (typeof options.delay === 'undefined') ? 0 : options.delay;
    if(typeof options.method === 'undefined'){
      throw new Error('method needs to be specified');
    }
    if(animationMethodExists(options.method) === false){
      throw new Error('"'+options.method+'" : method not allowed');
    }
    this.each(function(cone){
      cone[options.method](options);
    });
    return this;
  };
  
  //add the animation methods to the Cone.List.prototype
  (function($,animationMethods){
    var i, queueName, methodName;
    for(queueName in animationMethods){
      for(methodName in animationMethods[queueName]){
        $[methodName] = (function(curMethodName){
          return function(options){
            options = typeof options === 'undefined' ? {} : options;
            options.method = curMethodName;
            return this.animate(options);
          };
        })(methodName);
      }
    }
  })(Cone.List.fn, animationMethods);
  
  /**
   * @method changeStateDispatcher
   * @private
   * @param {Cone.List} coneList
   * @param {string} methodName
   * @param {Array} args
   * @return {Cone.List}
   */
  var changeStateDispatcher = function(coneList, methodName, args){
    return coneList.each(function(cone){
      stateFullMethods[methodName].apply(cone,args);
    });
  };
  
  //add the stateFull methods to the COne.List.prototype
  (function($, methods){
    for(var methodName in methods){
      $[methodName] = (function(methodName){
        return function(){
          return changeStateDispatcher(this, methodName, arguments);
        };
      })(methodName);
    }
  })(Cone.List.fn, stateFullMethods);
  
  
  Cone.List.fn.animateCascade = function(options){
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