---
title: "It's Not Hard: Making Your Library Support AMD and CommonJS"
description: "A practical guide to writing Universal Module Definitions (UMD) for JavaScript libraries"
date: 2014-07-14
tags: ["javascript"]
---

> _Hey there, time traveler. Some ancient link has led you to a post from 2014 — over a decade ago. I've kept it here so you don't get a 404, but fair warning: the AMD vs. CommonJS debate this post wades into was settled years ago. ES Modules (`import`/`export`) won. They're natively supported in browsers and Node.js, and unless you're maintaining legacy code that predates the heat death of RequireJS, you almost certainly want [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) instead of anything described below. That said, if you *are* maintaining legacy code — my condolences, and read on._

Proponents of [AMD](https://github.com/amdjs/amdjs-api) and [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) – two different 'specs' around creating modules in JavaScript – have been arguing for _years_ at this point over which one is the best approach. I've heard devs on both sides of the debate declare that their side had won, debate over. Myopic nonsense.

It's easy to come away from this debate thinking you're stuck with an "either-or" decision. After all - they're very different approaches. Requiring modules in an AMD scenario is an _asynchronous_ operation, and the opposite is true of the CJS inline-require approach. For example, here's what's involved when requiring [postal.js](https://github.com/postaljs/postal.js) in both contexts:

```js
// CommonJS
var postal = require("postal");
// yay, postal is available

// AMD
define([ "postal", function(postal) {
//yay, postal is available
});
```

There's no mystery here. CJS's require is synchronous, AMD's is not. However - postal (like any of the libs I write that can be used in node and the browser) supports both CJS _and_ AMD.

## The Burden Shouldn't Be On The Build System

Contrary to some of the misinformation I've heard repeated in podcasts/blog posts, require.js _does_ support [using CommonJS modules](http://requirejs.org/docs/commonjs.html), and browserify _does_ support [consuming AMD modules](https://github.com/jaredhanson/deamdify). [Webpack](http://webpack.github.io/) is in a league of its own in easily consuming _both_ formats with _very little fuss_.

However, library authors should support both module wrappers - making the choice of consuming developers to use their library a painless one, free of the question of _"but wait, does it work with the module and build system we've chosen?"_

Placing this burden on the build system is completely ignoring the huge number of developers that _aren't even using a formal module system like AMD or CJS_ - either by choice or because they're support legacy code.

### How Can This Be Done?

Let's pretend I'm writing a module that depends on postal.js. The module will mostly be used in the browser, but I can think of a couple of instances where it could be useful in node.js as well. If I've been a good browser JavaScript citizen, I already have my "module" wrapped in an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/):

```js
window.myModule = (function (postal) {
  var sub;
  var ch = postal.channel("myModule");
  var myModule = {
    sayHi: function () {
      ch.publish("hey.yall", { msg: "myModule sez hai" });
    },
    dispose: function () {
      sub.unsubscribe();
    },
  };
  return myModule;
})(postal);
```

The above snippet is one variation of the typical approaches you see these days with "plain", hand-rolled JavaScript modules. The key thing to notice is that inside our IIFE, I have a function that takes `postal` as a dependency, and it returns the module value, which we're assigning to a prop on the `window` (our global in the browser). The problem with the above approach is that I'm assuming I can just drop it on the window - and this won't work in node. It would be wise to take a step back and stop thinking of `window` specifically, but instead think of "whatever the global object is". We'll call it `root`.

Let's take a page from James Burke here, and refactor our module just a bit:

```js
(function (root, factory) {
  root.myModule = factory(root.postal);
})(this, function (postal) {
  var sub;
  var ch = postal.channel("myModule");
  var myModule = {
    sayHi: function () {
      ch.publish("hey.yall", { msg: "myModule sez hai" });
    },
    dispose: function () {
      sub.unsubscribe();
    },
  };
  return myModule;
});
```

(Don't worry - this might feel a bit strange, but it will make sense as we expand it.)

So - we now have a function that takes a `root` object and a `factory` callback that should return a module value. Inside the function, we invoke the `factory` callback, and pass in our dependency. It assigns the module value to the root object under the property name `myModule`:

```js
function (root, factory) {
 root.myModule = factory(root.postal);
}
```

We're taking the above function and turning it into an IIFE, passing `this` as the `root` argument, and our module method from earlier as the `factory` argument. If we run this in the browser, `this`, will be the `window`.

This is still a "plain JS" module wrapper, but it's primed and ready for extension.

### Adding CommonJS

A simple way to test to see if you are in a CommonJS loader environment (like node.js) could be done like this:

```js
if (typeof module === "object" && module.exports) {
  // Yep. Looks, tastes & smells like CommonJS
}
```

However, Alexandre Morgaut pointed out in the comments that node.js diverges from the CommonJS spec a bit by using `module`. The advantage of using `module` in node means you can assign an existing object/function to be the exported value rather than adding to `exports` for each member. Using that advantage, though, may limit your module's use in other CJS environments.

We could make this detection friendlier to other CommonJS environments by doing this instead:

```js
// paranoid test for truthiness on exports
// since typeof null is still an object in JS
if (typeof exports === "object" && exports) {
  // Yep. Looks, tastes & smells like CommonJS
}
```

My CommonJS use-case involves node 99.9% of the time, so I'll be making use of `module.exports` for the remainder of these examples. Just be aware of the different noted above if you need to support other server-side CommonJS.

If we were writing our example module as a node.js/CommonJS module, it might look like this:

```js
var postal = require("postal");
var sub;
var ch = postal.channel("myModule");
var myModule = {
  sayHi: function () {
    ch.publish("hey.yall", { msg: "myModule sez hai" });
  },
  dispose: function () {
    sub.unsubscribe();
  },
};
module.exports = myModule;
```

What if we wanted to use our `factory` function from earlier that takes `postal` as a dependency and returns the module value in a CommonJS environment?

```js
var postal = require("postal");
var factory = function (postal) {
  var sub;
  var ch = postal.channel("myModule");
  var myModule = {
    sayHi: function () {
      ch.publish("hey.yall", { msg: "myModule sez hai" });
    },
    dispose: function () {
      sub.unsubscribe();
    },
  };
  return myModule;
};
module.exports = factory(postal);
```

_WHY_ in the world am I even considering the above approach? Well - to show that we can take our generic "plain JS" wrapper from earlier and make it support CommonJS in addition to standard browser environments:

#### Browser and CommonJS Support

```js
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("postal"));
  } else {
    root.myModule = factory(root.postal);
  }
})(this, function (postal) {
  var sub;
  var ch = postal.channel("myModule");
  var myModule = {
    sayHi: function () {
      ch.publish("hey.yall", { msg: "myModule sez hai" });
    },
    dispose: function () {
      sub.unsubscribe();
    },
  };
  return myModule;
});
```

### AMD Support

OK - if we'd written `myModule` to be an AMD module, it would likely look something like this:

```js
define(["postal"], function (postal) {
  var sub;
  var ch = postal.channel("myModule");
  var myModule = {
    sayHi: function () {
      ch.publish("hey.yall", { msg: "myModule sez hai" });
    },
    dispose: function () {
      sub.unsubscribe();
    },
  };
  return myModule;
});
```

Wow - that AMD module factory callback (second argument to `define`) looks _exactly_ like the one we're using in our wrapper that supports plain browser and CommonJS environments. All we need to do is figure out how to detect if we're in an AMD environment, similar to how we're detecting CommonJS. Turns out, there's a way to do that as well:

```js
if (typeof define === "function" && define.amd) {
  // Yay! AMD environment present
}
```

In fact, if you've ever plumbed the depths of libs like jQuery, lodash and others, you've probably spotted this detection script:

```js
//jquery 2.1.1 snippet:
if (typeof define === "function" && define.amd) {
  define("jquery", [], function () {
    return jQuery;
  });
}
```

When jQuery does the above check for AMD, it will call `define` and pass in the module id argument (which tells the loader [require.js for example] that this module's id is "jquery"), the dependencies array (which is empty in this case), and the factory function, which returns the `jQuery` object.

We can take a similar approach in our wrapper:

#### AMD, CommonJS and Plain Browser Support

```js
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["postal"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("postal"));
  } else {
    root.myModule = factory(root.postal);
  }
})(this, function (postal) {
  var sub;
  var ch = postal.channel("myModule");
  var myModule = {
    sayHi: function () {
      ch.publish("hey.yall", { msg: "myModule sez hai" });
    },
    dispose: function () {
      sub.unsubscribe();
    },
  };
  return myModule;
});
```

(One difference with how I implemented the `define` call above compared to jQuery's version is that I did not include the module id argument. This is because I keep my modules in separate files until an AMD-aware build process concatenates and generates the id-aware define wrapper for me (r.js and webpack both do this).

## Nutshell

What did we do, really?

- We took the behavior that creates our module instance and we encapsulated it within a function that takes any dependencies as arguments.
- We added tests for CommonJS and AMD environments and executed the appropriate behavior (via using `module.exports` and `define()`) for exporting the module value in those environments.
- If neither AMD nor CommonJS detections pass, we fall back and assume a plain browser scenario, where we assign the module value to a property on the `root` object, which will be the `window`.

What we've created is referred to as a Universal Module Definition (UMD). People _much_ smarter than me have written at length on UMDs - and many variations of creating them exist. It's not difficult to create a wrapper like this (and it doesn't require multiple builds, unless you really want that). We as library authors _should be using them_, period.

### Postscript

I find the CommonJS/AMD wars annoying, unhelpful and filled with too much FUD. Both have merit - and _lots_ of intelligent people are doing amazing things in each ecosystem. The most constructive debates about each module approach focus on things like:

- Which best models the reality of what's going on? (hint: it depends on which environment you're running in.)
- Which is easier for developers to ramp up on? (hint: again, it depends. No surprise to hear developers used to synchronous requires compain - understandably so - about the mental shift and boilerplate involved with AMD)
- Which best expresses dependency relationships? (I believe that AMD wins this one, but at a cost.)

### _Update_

[Tim Branyen](http://tbranyen.com/) suggested I add some information about the necessity of registering in multiple environments (i.e. - still register a global along with an AMD `define` or CJS `module.exports`). Tim pointed out [this GitHub thread](https://github.com/mbostock/d3/pull/1921) as a good discussion example about why this might be necessary. If a popular library, like d3, does _not_ export a global (i.e. - assign itself to the window in the browser) when it detects an AMD module loader environment, then that means _any other non-AMD library that depends on d3 (like plugins) will break_.

The whole point of my post is to encourage lib authors to make their projects accessible and easy to consume by developers in any of the major module ecosystems - and Tim's point is spot-on. One approach in implementing his suggestion would be to alter our wrapper to look like this (see the AMD section, specifically):

```js
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    define(["postal"], function (postal) {
      return (root.myModule = factory(postal));
    });
  } else if (typeof module === "object" && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = root.myModule = factory(require("postal"));
  } else {
    root.myModule = factory(root.postal);
  }
})(this, function (postal) {
  // module code here....
  return myModule;
});
```

[RequireJS](http://requirejs.org/)'s [shim](http://requirejs.org/docs/api.html#config-shim) feature is great when you need to consume plainJS libs that don't include an AMD wrapper as a dependency in your AMD-based app, but that won't help you if you have a scenario like this:

- You're using RequireJS
- You have a module "A" that does not export a global when AMD is detected
- You have a module "B" that's plain JS (wrapped in an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/), hopefully) that expects module "A" to exist on the `window`.

If you run into this situation, and editing the wrapper of Module "A" is out of the question, you _do_ have options - they're just uglier:

- Load Module A in a `<script>` tag before require, and then include a shim in your `require.config` so that any AMD modules that depend on it will still get it.
- Shim Module "B" in `require.config`, but make sure you `require` module "A" _before_ Module "B", and assign module A to the window.

#### Strawmen & Tradeoffs

The AMD purist might (understandably) balk at putting something in the global scope outside the module loader registry. I get it - in a perfect world, we'd only be interacting with a specific module's export value and not looking for it on the global. The "uglier" steps described above are there to enable you, as a lib _consumer_, to take advantage of the greats libs that are out there - even if the author subscribes to a different module approach than you. Exporting a global in addition to AMD/CJS is something you should do as a lib _author_ to keep consuming devs from having to take one of those ugly steps.

There _are_ tradeoffs. If you're in an AMD environment and you need to support multiple versions of a module - if that module is exporting a global it's not going to work so well, especially if non-AMD modules depend on a specific version of that module. I've run into this scenario only once or twice in several years. In those cases, we modified the AMD wrapper to not export a global. My advice, though, is err on the side of helping developers using your module. Odds are you will never run into this scenario.

### _Update #2_

[James Kyle](https://twitter.com/thejameskyle) made a great point in the comments that there are some build tools that expose an `exports` object, which might cause things to break if the CommonJS check happens before the AMD check (see [this](https://github.com/umdjs/umd/pull/22)). To prevent this problem, put your AMD check first. The earlier version of this post checked CommonJS first, but I've since updated the examples. Now I need to go update my own projects. :-)

## Further Reading

- [UMDJS repo on GitHub](https://github.com/umdjs/umd)
- [CujoJS - Authoring UMD Modules](http://know.cujojs.com/tutorials/modules/authoring-umd-modules)
- [Writing Modular JS - Addy Osmani](http://addyosmani.com/writing-modular-js/)
- [James Burke's Gist on UMDs (~2011)](https://gist.github.com/jrburke/1262861)
