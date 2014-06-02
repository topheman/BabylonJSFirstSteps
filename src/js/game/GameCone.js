(function(){
  var stateFullMethods = {
    animation1 : function(){
      return this.bump().widenEyes({full:true}).bump().delay(200).widenEyes({full:true});
    }
  };
  
  Cone.List.fn.tailEachOther = function(options){
    
  };
  
  Cone.addMethods(stateFullMethods);
  Cone.List.addMethods(stateFullMethods);
})(Cone);