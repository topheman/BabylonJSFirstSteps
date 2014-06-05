/**
 * This file extends the Cone class with other method
 * You can do that like you would on a jQuery plugin
 */
(function(){
  //those methods will be accessible on Cone as well on Cone.List
  var stateFullMethods = {
    /**
     * Acts the cone surprise widening its eyes and bumping it
     * @returns {Cone}
     */
    surprised: function(){
      return this.widenEyes({full:true}).bump();
    }
  };
  
  /**
   * 
   * @param {Object} [options]
   * @param {function} [options.callback] Executed when all the cones have switched place
   * @returns {Cone.List}
   */
  Cone.List.fn.switchPlaces = function(options){
    options = typeof options === 'undefined' ? {} : options;
    if(this.length < 2){
      console.warn('need more than one cone to switch places');
      return this;
    }
    var firstConePosition = this[0].position;
    var list = this;
    this.each(function(item,index){
      if(list.length !== index+1){
        item.widenEyes({full:true});
        item.moveTo({position:list[index+1].position}).queue('move',function(next,cone){
          cone.bump();
        });
      }
      //for the last one
      else{
        item.moveTo({position:firstConePosition}).queue('move',function(next,cone){
          cone.bump();
          if(options.callback){
            cone.then(options.callback);
          }
        });
      }
    });
    return this;
  };
  
  /**
   * Returns an RGB random color
   * @returns {Object}
   */
  Cone.helpers.getRandomColor = function(){
    return{
      r:Math.random(),
      g:Math.random(),
      b:Math.random()
    };
  };
  
  Cone.addMethods(stateFullMethods);
  Cone.List.addMethods(stateFullMethods);
})(Cone);