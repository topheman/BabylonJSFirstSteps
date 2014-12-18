RELEASES NOTES
==============
#v1.0.0
* added specific templates to yuidoc

#0.3.1

* changed BabylonJS version from v1.11 to v1.12 to fix `scene.pick()` bug on Mac OS X (note : v1.13 and v1.14-beta render completly different - so cannot upgrade more)
* adapt UI for mobile (now also works on iOS)

#0.3.0

* static `.addMethods()` accessible on both `Cone` and `Cone.List` for user plugins
* cones now tail each other on example if pass through
* modified bump animation + bump on space bar
* added a plugin example : `src/cone-plugin-example.html`
* `options.tessalation` on `new Cone()`
* special user options beginning by $ `new Cone()`
* license

#0.2.2

* folder organization
* added .animateColor() (still buggy)
* upgraded to babylon.1.11.js
* added .setScale() + .animateScale()
* added .moveTo()
* loop times number on animations
* switched from jsdoc to yuidoc

#0.2.1

* Cone.List animations chainable
* statefull methods accessible to Cone.List (like setAlpha, setColor ...)

#v0.2.0

* added Cone.intersectsGroundLimits()
* added Cone.widenEyes()
* added Cone.tail()
* added Cone.animateAlpha()
* added Cone.List
* added animate dispatcher method on Cone.List
* added animate dispatcher on Cone
* added Cone.queue().dequeue()
* added ability to chain and queue animation
* added custom user queues
* added Cone.then() and Cone.delay()
* setup jsdoc

#v0.1.0

* Features added to the Cone class
* Cone can now follow the pointer
* Only attach camera when alt key is pressed
* Refactored the landing page

#v0.0.1

* Cone class with a wide API to manipulate it.
* Beginning of using the 3d physics engine API of BabylonJS (CannonJS wrapper) - will drop it for an other implementation for the following (not yet mature enough).