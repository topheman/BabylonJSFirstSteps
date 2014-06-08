BabylonJS first steps
=====================

Those are my first steps on BabylonJS. I'm creating a class that will let you manipulate 3d cones with eyes. There is a full API ([doc's here](http://labs.topheman.com/babylonjs/js/vendor/Cone/yuidoc/ "Cone.js documentation")), if you wan't to take a look at the Cone.js file : [there you go](https://github.com/topheman/BabylonJSFirstSteps/blob/master/src/js/vendor/Cone/Cone.js "Cone.js - sources").

You can simply use the [Cone.js](https://github.com/topheman/BabylonJSFirstSteps/blob/master/src/js/vendor/Cone/Cone.js "Cone.js - sources") file, or if you wan't to go further, here are the steps for development and generating doc.

**You may take a look at the [example](http://labs.topheman.com/babylonjs/ "BabylonJS - first steps") ...**

More infos on this [blog post](http://dev.topheman.com/babylonjs-first-steps-cone/ "Blog post").

----------

After you have cloned the repository :

* `npm install`
* `grunt serve` will launch an http server for the `src` folder

Those steps are not mandatory, but it can be comfortable to have an http server.

You can generate the API doc of `/src/js/vendor/Cone/Cone.js` by running `npm run yuidoc`.

Though, you will need to have yuidocjs, if you don't, just run : `npm install yuidocjs -g`