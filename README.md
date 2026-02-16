<p align="center">
    <a href="https://jsr.io/@darkbluestudios/jupyter-deno-utils/doc" alt="Documentation">
        <img src="https://img.shields.io/badge/Documentation-here-informational" />
    </a>
    <a href="https://jupyter-ijavascript-utils.onrender.com/LICENSE" alt="License">
        <img src="https://img.shields.io/badge/License-MIT-green" />
    </a>
    <img src="https://img.shields.io/badge/Coverage-98-green" />
    <a href="https://www.npmjs.com/package/jupyter-ijavascript-utils" alt="npm">
        <img src="https://img.shields.io/badge/deno-%5E1.X-red" />
    </a>
    <a href="https://github.com/darkbluestudios/jupyter-deno-utils" alt="npm">
        <img src="https://img.shields.io/badge/github-here-black" />
    </a>
</p>

# Overview

This is a library to make working with Deno in Jupyter more pleasant, and make it faster to prototype and rapidly get answers from Jupyter.

Jupyter is a way to load and explore data, and ultimately tell compelling stories with visuals.  Notebooks are a way to explore and experiment, in addition to write and explain ideas.

**All of the tutorials provided here, including this one, was written as a notebook and simply exported.**

![Screenshot](docResources/img/started_jupyterSideBySide.jpg)

# Documentation

See documentation at: [https://jsr.io/@darkbluestudios/jupyter-deno-utils/doc](https://jsr.io/@darkbluestudios/jupyter-deno-utils/doc)

# What is this?

The [jupyter-deno-utils](https://jsr.io/@darkbluestudios/jupyter-deno-utils) library is simply a collection of utility methods for Node, JavaScript, TypeScript and Deno Developers interested in Data Science.

* Load
* Aggregate
* Manipulate
* Format / Visualize
* Refine and Explore
* Export

# Getting Started

* Install Deno
* Install the Deno Kernel for Jupyter
* Use the Kernel in your notebook
* Use this module within your notebook

## NOTE - Deno First Party support for Jupyter

See the Deno Documentation on the official support for jupyter here:

https://docs.deno.com/runtime/reference/cli/jupyter/

This includes:

* TypeScript support out of the box
* Support for ESM Modules out of the box
* Symbol support for [rendering Custom Classes to Jupyter](https://github.com/rgbkrk/denotebooks/blob/main/02.5_One%20Symbol%20to%20Rule%20them%20All.ipynb)
* [IO Pub Channel broadcasting](https://docs.deno.com/runtime/reference/cli/jupyter/#io-pub-channel-broadcasting) - to provide live updates for long running computations
* More direct support for Visual Studio Code execution of Jupyter Notebooks

See Example Notebooks for using Deno with Jupyter here:

https://github.com/rgbkrk/denotebooks

## NOTE - iJavaScript Stalemate

The previous project was the [jupyter-ijavascript-utils](https://jupyter-ijavascript-utils.onrender.com/) library.

The following were why we made the switch to Deno:

* Deno has first party support for Jupyter, as opposed to NodeJS.

* Deno offers full support for many Jupyter 

* nriesco has done a wonderful job with the [iJavaScript](https://github.com/n-riesco/ijavascript) kernel, but it doesn't have official backing or support :(

* iJavaScript currently requires node v20 to run, and fails on versions higher due to zeromq issues [See bug 297 on iJavaScript](https://github.com/n-riesco/ijavascript/issues/297)

* Additionally, vega has now moved to ESM Modules - [vega versions](https://www.npmjs.com/package/vega?activeTab=versions), and [vega-lite versions](https://www.npmjs.com/package/vega-lite?activeTab=versions)

* iJavaScript only supports ESM Modules with [esm-hook](https://www.npmjs.com/package/esm-hook) - [see issue 210](https://github.com/n-riesco/ijavascript/issues/210)

# What's New 
* 0.1 - working up to full support on jsr

# Running Your Own Notebooks

@TODO

Documentation will be generated through jupyter notebooks. We are hoping to make those also available.

# Rapidly Prototyping within Jupyter

Often - Jupyter is not the best place to do development, and folks would like to develop in their own favourite IDE. We also want to use unit testing, linting etc.

With traditional Jupyter, this means that you must re-run your entire notebook each time, which can be problematic if your issue occurs in the middle of your code.

Our preference is to write local modules (ex: `lib.js` or `lib.ts`) relative to your notebook, and then use `import from './lib.ts` to access them in your notebook.

NOTE: re-running the require will use a `cached version` of your module, and `may not reflect changes you just made`.

(For this and other reasons, it can be helpful to have a `version` attribute to your module - to ensure the latest code is accessible)

There typically are two options:

* re-run the entire notebook

* use a "cache bypass" only for your local library. ex: [https://www.npmjs.com/package/import-fresh](import-fresh)

Using a cache bypass is fairly simple, and behaves somethng similar to this:

```
import from jsr:@darkbluestudios/jupyter-deno-utils'
const localLib = import(importFresh('./lib/MyLibrary.ts'));
```

and if you change your library, you can then just run tat cell again

# License

See [License](https://jupyter-ijavascript-utils.onrender.com/LICENSE) (MIT License).

# Issues

If you have any questions first file it on [issues](https://github.com/paulroth3d/jupyter-ijavascript-utils/issues) before contacting authors.

## Toubleshooting

iJavaScript does not currently support AMD Modules, due to open issues with nodejs [see iJavaScript issue #210 for more](https://github.com/n-riesco/ijavascript/issues/210)

# Contributions

Your contributions are welcome: both by reporting issues on [GitHub issues](https://github.com/darkbluestudios/jupyter-deno-utils/issues) or pull-requesting patches.

If you want to implement any additional features, to be added to JSforce to our master branch, which may or may not be merged please first check current [opening issues](https://github.com/darkbluestudios/jupyter-deno-utils/issues?q=is%3Aissue%20state%3Aopen) with milestones and confirm whether the feature is on road map or not.

If your feature implementation is brand-new or fixing unsupposed bugs in the library's test cases, please include addtional test codes in the `tests` directory.


## Further Reading

* [Jupyter Kernel for Deno](https://docs.deno.com/runtime/reference/cli/jupyter/)
* [Example Deno Utils](https://github.com/rgbkrk/denotebooks)
* [Nodejs-Polars](https://github.com/pola-rs/nodejs-polars)
