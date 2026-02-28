---
title: "UMD For Everyone"
description: "A response to 'UMD is a lie' — examining the trade-offs of Universal Module Definitions"
date: 2014-07-24
tags: ["javascript"]
---

> _Hey there, time traveler. Some ancient link has led you to a post from 2014 — over a decade ago. I've kept it here so you don't get a 404, but fair warning: the module wars this post is about? They're over. Ancient history. ES Modules (`import`/`export`) won. They're natively supported in browsers and Node.js, no loader gymnastics required. The whole "AMD vs. CommonJS vs. UMD" debate is now a historical curiosity, a bit like arguing over VHS vs. Betamax after Netflix showed up. If you're starting fresh, head straight for [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). If you're here because you inherited a codebase that still has `define()` calls in it — well, you have my sympathy, and this post might actually still help._

I never thought I'd be one to write a response blog post. _Sigh_, now I'm _that_ guy. However, I had an interesting [conversation](https://twitter.com/ifandelse/status/491964823048323073) on twitter today with [Ryan Florence](https://twitter.com/ryanflorence) after he said this:

> I wish everybody would quit screwing around with modules and just use CJS, it is the biggest pain as a library author to deal with this.— Ryan Florence (@ryanflorence) July 23, 2014

I was honestly curious as to what kinds of problems Ryan was running into. You can read the [conversation](https://twitter.com/ifandelse/status/491964823048323073) for more details, but suffice it to say: while I've been successfully using UMD-wrapped libs for a long time, I'd be foolish to not constantly keep my opinions on trial. Turns out, our conversation prompted a [blog post](http://ryanflorence.com/blog/umd-is-a-lie.html) from Ryan.

At the outset, I want to say that I respect Ryan. I _definitely_ feel the same pain he describes. We just disagree on the solution. Humanity isn't the best at disagreeing while also maintaining a respectful view towards those we disagree with. This is my attempt to do that. The tl;dr is that it _all comes down to trade-offs_.

## The Premise

> "UMD is a lie" – Ryan

While I disagree with the premise, Ryan raises an _excellent_ point.

His primary complaint is that UMDs break down once you have dependencies. In his post he says:

> "If I'm wrong, please make a repository that depends on underscore and querystring that works with an application using RequireJS without a build and also an application using browserify."

Underscore supports either "global exports" (i.e. - on the `window`) or node.js's flavor CommonJS, and querystring is CommonJS. (_Update: John-David Dalton pointed out that underscore just added [AMD support](https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L1331-L1342) back in._) Both can be consumed by AMD _and_ CommonJS modules **if loader/bundler plugins are utilized** in build steps. In fact, a build step would likely not be needed if using [RequireJS](http://requirejs.org/)/[Cajon](https://www.npmjs.org/package/cajon) or [curl.js](https://github.com/cujojs/curl/wiki/Using-curl.js-with-CommonJS-Modules#unwrapped-cjs-modules) and you were OK with multiple requests being made for the libs - not ideal for production (curl.js supports an experimental feature to load unwrapped CJS modules).

But Ryan's talking about _libs_ (i.e. - an OSS project you want others to be able to consume). Effectively he's asking "If you want to distribute your lib with a UMD wrapper, but it depends on plain global and CommonJS wrapped libs, how can this work without a build step?"

## Reactions

I have a few reactions to this.

**First**, it's a bit of a ["Perfect Solution" fallacy](http://www.skepdic.com/nirvanafallacy.html). Why draw the arbitrary line saying a build step can't be involved? To quote [Scott Andrews](https://twitter.com/scothis): "_A lib demands a dependency, the app has to provide and resolve the dependency._" Unless you're only using browser globals, your loader/build process is going to play a part in resolving those dependencies.

About the need to have build tools in order to achieve this, Ryan says:

> "If we're going to be prescribing something, we still haven't achieved the interoperability goal."

Why not? This is akin to saying CommonJS shouldn't be used in the browser because it requires tools like browserify. You have a _prescriptive tool_ that makes your _CommonJS_ modules usable in the _browser_ after a build step. Does that make CommonJS a lie? No way. I'd say it's a win for any dev that <3's CommonJS.

**Second**, as a lib author, you have the choice of _what dependencies you want to use_. Your favorite dependency only has an AMD wrapper, and you want it to support CommonJS (or vice versa) - why not submit a PR? I wrote about how to do that [here](http://ifandelse.com/its-not-hard-making-your-library-support-amd-and-commonjs/). If a lib hasn't already been written with a CommonJS assumption, it's actually quite easy to add the wrapper you need (more on "CommonJS" assumption in a sec). If you _must_, for example, use a dep that doesn't play well with UMD's in the browser without a build step, you can also document for your users how they can configure that dependency in their loader/bundler environment.

**Third**, as a lib author, you can do things to make this choice easier for other developers. For a while now, I've been writing my major projects _agnostic of any module system_. I use the [gulp-imports](https://github.com/ifandelse/gulp-imports) plugin in my project's build step to concatenate the files inside a UMD wrapper. This gives me the flexibility of keeping my larger projects broken into separate files, if I so desire, while _not_ baking in a CommonJS-style assumption of requiring them inline, which would force that assumption on consumers. You don't _have_ to have a "lib build step" separate from an app build. However, using one to wrap a module-system-agnostic lib in a UMD will make the task of consuming devs _much_ easier. It may not be perfect, but that doesn't disqualify it as a solution.

The key stickler in Ryan's challenge above is querystring. Its `index.js` looks like this:

```js
"use strict";

exports.decode = exports.parse = require("./decode");
exports.encode = exports.stringify = require("./encode");
```

The assumption here is CommonJS, and that's OK. You just have to understand the trade-offs. There's no way around requiring non-CJS consumers of your lib to run a build/transformation step in their app if you wanted to release a UMD-wrapped lib with this as a dependency. (Remember - if they _are_ using CJS in the browser, they still have to run a build step _anyway_.)

I guess I don't fully understand the aversion to a build step for your lib if that step achieves the goal of making your module more widely consumable. Build tooling has come such a long way that the pain of implementing this is _very_ low. If you don't care about your lib being useful outside the module system of your choice, that's your call. Encouraging authors to drop support for global exports and AMD is detrimental to everyone who isn't using CommonJS in the browser.

## Developers Will Develop

_Every_ module approach has ugly pain points. UMD modules _are_ easier to maintain when they're dependency-free or their dependencies are compatible with your loader of choice. The only way forward with libraries that don't work well with UMD and aren't open to PRs is using a loader/bundler capable of handling all the formats in question or forking and maintaining your own copy (less ideal). For this reason, I prefer libraries by authors who use UMDs - because they, like me, prefer inclusive designs.

> "My own experience has shown there are no silver bullets; no config style supports all use cases... UMD isn't a lie, it works, but it is a compromise... Ultimately there are trade offs, but the notion of UMD handles them better than anything else I've seen."
> – Scott Andrews

And we haven't even touched ES6 modules yet! The module problem already has a solution on the way (we'll still get to debate about non-JS assets as module deps, though). We just need old browsers to die.

If you only care about supporting CommonJS, fantastic - that's your perogative. Guess what? I can still consume your lib with Webpack (or RequireJS/r.js, curl.js or jspm). There's a lot of devs that might be bummed to miss out on your awesome code, though.

## Addendum - Build Steps, or Not

To illustrate the wacky world of various module formats working together, here's an example of how you _can_ use underscore and querystring together, without a build step: [https://github.com/ifandelse/UMD-Examples](https://github.com/ifandelse/UMD-Examples)

Currently, that repo only has one example. It's using [cajon](https://www.npmjs.org/package/cajon) (based on RequireJS), which is capable of loading AMD and CommonJS modules without a build step. You can see in the code below that the relative paths in querystring's `index.js` were a problem, but the two sub-modules can be required without an issue:

```js
/*
 The bummer is that cajon isn't quite sure what
 to do about the relative paths inside querystrings's
 index.js. BUT, we can require those two modules
 directly and it all works without a build. I would
 never do this without a build, though.
*/
define(["underscore", "decode", "encode"], function (_, decode, encode) {
  return {
    hasUnderscore: function () {
      return typeof _ !== "undefined";
    },
    hasQueryString: function () {
      return typeof decode !== "undefined" && typeof encode !== "undefined";
    },
  };
});
```

Having to require querystring's individual files isn't ideal at all (yuck!) - but I share this to show that CJS interop (especially with AMD) is often impossible without a build step because module ID resolution is handled differently. If querystring was built in a module-agnostic fashion, and then concatenated inside a UMD wrapper, this wouldn't be necessary. (_Not_ a criticism of querystring, just examining trade-offs.) There's a lot that could be improved here (maybe some improvements might be possible to cajon's resolver?) - and it would be a win for users of any module system.

As a general rule, we could all benefit from hearing [John-David Dalton's perspective on the JSJ Podcast](http://javascriptjabber.com/079-jsj-lo-dash-with-john-david-dalton/):

> I've always come at it from a dev perspective. Is this helping devs? Is this hurting devs? Is this going to allow it to be used in more environments or something like that? So I try to keep it positive...
