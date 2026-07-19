# Segmentation App 2

⚠️ Work in progress. This project is currently in an early development stage. Core functionality is being implemented, but many features, components, and integrations are still missing or incomplete. The application may contain bugs, unstable behavior, and breaking changes. Not intended for production use yet.

## Table of Contents

- [Segmentation App 2](#segmentation-app-2)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Architecture](#architecture)
  - [Installation](#installation)
    - [How to Install the Release on Windows](#how-to-install-the-release-on-windows)
    - [How to Install the Release on Linux (Debian)](#how-to-install-the-release-on-linux-debian)
    - [How to Install the Release on macOS](#how-to-install-the-release-on-macos)
  - [Project Structure](#project-structure)
  - [How to Build and Run the Project](#how-to-build-and-run-the-project)
    - [Node.js and Python](#nodejs-and-python)
    - [Installing Node.js packages](#installing-nodejs-packages)
    - [Installing Python packages](#installing-python-packages)
      - [How to Install Python Packages on Windows](#how-to-install-python-packages-on-windows)
      - [How to Install Python Packages on Linux (Debian)](#how-to-install-python-packages-on-linux-debian)
      - [How to Install Python Packages on macOS](#how-to-install-python-packages-on-macos)
    - [How to Build the Electron app](#how-to-build-the-electron-app)
    - [How to Test the Electron App](#how-to-test-the-electron-app)
    - [How to Distribute the Electron App](#how-to-distribute-the-electron-app)
    - [How to Test the Svelte Frontend](#how-to-test-the-svelte-frontend)
    - [How to Build the Svelte Frontend](#how-to-build-the-svelte-frontend)
    - [How to Run Unit Tests in TypeScript](#how-to-run-unit-tests-in-typescript)
    - [Import the Electron project to use Electron Forge](#import-the-electron-project-to-use-electron-forge)
  - [Manual](#manual)
  - [Licence](#licence)

## About

This side project builds on my previous work in machine learning-based image segmentation. The current focus is on enhancing software quality and user experience. It serves as a practical environment to improve and deepen my software engineering skills.

Changes include codebase improvement, automated unit testing, modernizing the UI and adding some features missing in the previous project.

## Architecture

**Backend:**  
[Python](https://www.python.org/) handles core logic and data processing.

**Bridge:**  
[Electron](https://www.electronjs.org/) wraps the frontend as a desktop app and connects to the backend  using [TypeScript](https://www.typescriptlang.org/)  and [Node](https://nodejs.org/en).

**IPC (Inter-Process-Communation) and Client-Server:**  
 Enables real-time communication between frontend client and backend (local) server using [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) technology.

**Frontend:**  
[Svelte](https://svelte.dev/) is for dynamic frontend UI rendering and interaction using web technology.

## Installation

Pre-built binaries for Windows, Linux (Debian), and macOS will be provided via [GitHub Actions](https://docs.github.com/en/actions). Please see the OS-specific sections below for instructions on how to install the corresponding release on your system.  

In future releases the python packages will be installed directly from the app.

### How to Install the Release on Windows

- Download and install [Python](https://www.python.org/downloads/). During installation please **disable** the `MAX_PATH` limit.  
- Download the latest [release](https://github.com/kerimyalcin95/ml-segmentation-2/tags) into your `Desktop` folder. You need the setup executable and the compressed source files.  
- Unzip the source files into your `Desktop` folder.  
- Follow the instructions in [Installing Python packages](#installing-python-packages)
- After `pip` installed all packages, run the setup executable. The executable can also be run before installing all Python packages, but the app won't work.  

### How to Install the Release on Linux (Debian)

TODO

### How to Install the Release on macOS

TODO

## Project Structure

The root project folder `ml-segmentation-2` is divided into three main directories:

- **`\python` directory**  
  contains the backend implementation written in [Python](https://www.python.org/about/).

  This backend runs a server that processes requests sent from the frontend and performs computational tasks such as machine learning, image generation, graphics processing, and data analysis.

  The backend server communicates with the frontend using WebSocket connections, allowing real-time bidirectional communication between the user interface and the processing engine.

- **`\src` directory**  
  contains [TypeScript](https://www.typescriptlang.org/) application logic responsible for starting and coordinating all major components of the desktop application. It acts as the central runtime layer connecting the backend server, the frontend UI, and the desktop container

- **`\svelte-frontend` directory**  
  contains the graphical user interface of the application. The frontend is implemented using [Svelte](https://svelte.dev/) with application logic written in TypeScript.

  The interface is built using [Skeleton](https://www.skeleton.dev/docs/svelte/get-started/introduction) UI, which provides prebuilt UI components and styling utilities for Svelte applications.

Other directories and files included in the root folder:

- `\.github\workflows` contains GitHub Actions workflow YAML files which define automated tasks to build and release the project on different operating systems
- `\dist` contains generated JavaScript files compiled from TypeScript `src` directory after building the Electron app
- `\node_modules` directory contains node packages necessary to build the [Electron](https://www.electronjs.org/) app
- `\out` directory contains the build app binaries and executables generated by Electron Forge
- `\eslint.config.mts` contains the configuration for [ESLint](https://eslint.org/docs/latest/use/configure/)
- `\forge.config.ts` contains the configuration for [Electron Forge](https://www.electronforge.io/config/configuration)
- `\requirements.txt` contains the required packages for Python
- `\tsconfig.json` contains the configuration for the [TypeScript compiler](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

Other directories and files included in the `svelte-frontend` directory:

- `\svelte-frontend\dist` contains the build Svelte frontend web UI
- `\svelte-frontend\node_modules` contains node packages necessary to build the Svelte frontend web UI
- `\svelte-frontend\src` contains the Svelte project for the frontend web UI
- `\svelte-frontend\svelte.config.js` contains the configuration for the [Svelte](https://svelte.dev/docs/kit/configuration) project
- `\svelte-frontend\tsconfig.ts` contains the TypeScript compiler configuration for the Svelte project
- `\svelte-frontend\vite.config.ts` contains the configuration for [Vite](https://vite.dev/config/) for building the Svelte project

*Please note that some directories are only created after applying corresponding `npm` commands.*

## How to Build and Run the Project

### Node.js and Python

Download and install [Node.js](https://nodejs.org/en/download).  
Download and install [Python](https://www.python.org/downloads/).

### Installing Node.js packages

Inside the project folder run:  
`npm install`

Then inside the `/svelte-frontend` folder run  
`npm install`  
again.

### Installing Python packages

#### How to Install Python Packages on Windows

Before installing update the package manager `pip`:  
`python -m pip install --upgrade pip`

Open a terminal and run:  
`pip install websockets`  
`pip install opencv-python`  
`pip install fastai`  

or run:  
`pip install websockets opencv-python fastai`  

Please note that the current project development state requires just the `websockets` package.

To remove **all installed packages** from your system run (e.g. in your `Desktop` folder):  
`pip freeze > packages.txt`  
`pip uninstall -r packages.txt -y`

#### How to Install Python Packages on Linux (Debian)

TODO

#### How to Install Python Packages on macOS

TODO

### How to Build the Electron app

Inside the project folder run:  
`npm run build`  

The project backend TypeScript files are compiled into JavaScript files and saved into `\dist`.  
Then the project frontend Svelte project is build and saved into `\svelte-frontend\dist`.

### How to Test the Electron App

Inside the project folder run:  
`npm run start`

The project frontend and backend is build and the Electron app is started for testing.

### How to Distribute the Electron App

**Standalone package**:

To create a standalone package, where all components of the app are packaged **inside a folder** run:  
`npm run make-package`

or run:  
`npm run make-standalone`

The standalone package will be created inside `\out`.

**Setup installer**:

To create a setup installer, where all components the app are packaged **inside an installer** run:  
`npm run make-setup`  

or run:  
`npm run make-installer`  

The setup installer will be created inside `\out\make`.

### How to Test the Svelte Frontend

Inside the project folder run:  
`npm run fe-start`

or  
`npm run fe-preview`

The Svelte frontend project files are build and saved into `\svelte-frontend\dist`.  
A local server will be started where the frontend app can be run on a browser.

To kill the server, type:  
`q + enter`

### How to Build the Svelte Frontend

Inside the project folder run:  
`npm run fe-build`  

The Svelte frontend project files are build and saved into `\svelte-frontend\dist`.

### How to Run Unit Tests in TypeScript

The project uses Vitest for Unit testing.  
TypeScript unit test files are saved as `*.test.ts` beside the reference file.

To run a unit test type:  
`npm run test`

### Import the Electron project to use Electron Forge

Use if there is a need to add the Electron project manually to Electron Forge (e.g. accidentally removing all dependencies from `package.json`)

Inside the root project folder `ml-segmentation-2` run:

`npm install --save-dev @electron-forge/cli`  
`npm exec --package=@electron-forge/cli -c "electron-forge import"`

Electron Forge's `import` commmand will import the existing Electron project to Electron Forge automatically. Refer to the [Electron Forge Documentation page](https://www.electronforge.io/import-existing-project) for more details.

## Manual

TODO

## Licence

This project is licensed under the [MIT License](LICENSE).
