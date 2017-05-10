# georeference-js

Copyright 2017 Michael Hughes

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Description

JavaScript library implementing functions for a few different georeference systems

## Commands

Runs with npm, but yarn is preferred and a lock file is provided.

- `yarn run lint` Runs the eslint runs against the project, these are AirBnB's style guide with a couple minor tweaks
- `yarn run test` Runs the jest based tests against the library
- `yarn run dist` Runs the browserify/babelify build
- `yarn run build` Runs lint, test, and the browserify/babelify build in order to generate a script file usable by a browser

## Files

### `dist/`

`dist/` contains the browserified distributed of the library.

### `index.js` and `src`

Contain the es2015 source using es2015 modules. Note, this means that even for node this code might
have to be run through babel. This is not currently implemented.
