# Segmentation App 2

⚠️ Work in progress. This project is currently in an early development stage. Core functionality is being implemented, but many features, components, and integrations are still missing or incomplete. The application may contain bugs, unstable behavior, and breaking changes. Not intended for production use yet.

## Table of Contents

- [Segmentation App 2](#segmentation-app-2)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Architecture](#architecture)
  - [Installation](#installation)
    - [How to Install the Release](#how-to-install-the-release)
  - [Project Structure](#project-structure)
  - [How to Build and Run the Project](#how-to-build-and-run-the-project)
    - [Recommended VS Code extensions](#recommended-vs-code-extensions)
    - [Install VS Code extensions](#install-vs-code-extensions)
    - [Download the repository](#download-the-repository)
    - [Install Node.js and Python](#install-nodejs-and-python)
    - [Install Node.js packages](#install-nodejs-packages)
    - [Install Python packages](#install-python-packages)
    - [Build the Electron app](#build-the-electron-app)
    - [Test the Electron App](#test-the-electron-app)
    - [Distribute the Electron App with Electron Builder](#distribute-the-electron-app-with-electron-builder)
    - [Test the Svelte Frontend](#test-the-svelte-frontend)
    - [Build the Svelte Frontend](#build-the-svelte-frontend)
    - [Run Unit Tests in TypeScript](#run-unit-tests-in-typescript)
  - [Manual](#manual)
  - [License](#license)

## About

This side project builds on my previous work in machine learning-based image segmentation. The current focus is on enhancing software quality, maintainability, and user experience. It serves as a practical environment to improve and deepen my software engineering skills while exploring modern software development practices.

The application is designed for end-to-end image segmentation workflows using the fastai API. It enables users to create and manage segmentation datasets, annotate images, perform image editing and cropping, train neural network models, and generate segmentation predictions from trained models. By integrating dataset preparation, model training, and inference into a single application, the project provides a streamlined workflow for developing and evaluating image segmentation models.

Recent improvements include codebase refactoring, automated unit testing, UI modernisation, performance enhancements, and the addition of new features that were missing in the previous version.

## Architecture

**Backend:**  
[Python](https://www.python.org/) implements the core application logic and data processing. It runs a local server responsible for receiving and transmitting commands, image data, and application state. The backend integrates the [fastai](https://www.fast.ai/) framework to train neural networks for image segmentation and perform predictions using trained models. It also manages dataset preparation, model loading, training workflows, and inference pipelines.

**Bridge:**  
[Electron](https://www.electronjs.org/) packages the frontend as a cross-platform desktop application and provides the connection layer between the user interface and the Python backend using [TypeScript](https://www.typescriptlang.org/) and [Node.js](https://nodejs.org/).

**IPC (Inter-Process Communication) and Client–Server:**  
The application uses a local client–server architecture to enable communication between the frontend client and the Python backend server. [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) technology provides real-time, bidirectional communication for exchanging commands, image data, segmentation results, and application events.

**Frontend:**  
[Svelte](https://svelte.dev/) is used for dynamic UI rendering and interactive user experiences. The interface is built with [shadcn-svelte](https://www.shadcn-svelte.com/) components, styled using [Tailwind CSS](https://tailwindcss.com/), and uses [Konva](https://konvajs.org/) for interactive canvas-based image editing, drawing, annotation, and segmentation mask manipulation.

**Cross-Platform Distribution:**  
The complete pipeline is open source and distributed as native desktop applications for multiple platforms, including **Windows**, **Linux** (Debian and Ubuntu), and **macOS**. This provides a consistent installation and user experience across supported operating systems.

## Installation

Pre-built binaries for Windows, Linux (Debian), and macOS will be provided via [GitHub Actions](https://docs.github.com/en/actions). Please see the OS-specific sections below for instructions on how to install the corresponding release on your system.  

In future releases the python packages will be installed directly from the app.

### How to Install the Release

- Download and install [Python](https://www.python.org/downloads/). During installation please **disable** the `MAX_PATH` limit.  
- Download the latest release from GitHub and place it in your Desktop folder. Make sure to download both the compiled application binary (named according to the format ${productName}-${version}-${arch}) and the compressed source archive. The binary is required to install and run the application, while the source files are needed for the Python package installation steps.  
- The installation procedure depends on your operating system. Follow the platform-specific instructions: run the installer on Windows, move the application to the appropriate application directory on macOS, or follow the recommended installation steps for your Linux distribution.
- Unzip the source files into your `Desktop` folder.  
- Follow the instructions in [Installing Python packages](#installing-python-packages)
- After `pip` installed all packages, run the setup executable. The executable can also be run before installing all Python packages, but the app won't work.  

## Project Structure

The root project folder `ml-segmentation-2` is divided into three main directories:

- **`\python` directory**  
  contains the backend implementation written in [Python](https://www.python.org/about/).

  This backend runs a server that processes requests sent from the frontend and performs computational tasks such as machine learning, image generation, graphics processing, and data analysis.

  The backend server communicates with the frontend using WebSocket connections, allowing real-time bidirectional communication between the user interface and the processing engine.

  The Python server integrates the [fastai](https://www.fast.ai/) API to provide deep learning functionality for image segmentation tasks. It uses pretrained or custom-trained models to perform pixel-level image segmentation predictions, identifying and classifying specific regions within input images.

  In addition to inference, the backend supports model training workflows through the fastai training API. It manages dataset preparation, model configuration, training execution, validation, and model updates, enabling users to train and improve segmentation models based on new image data.

- **`\src` directory**  
  contains [TypeScript](https://www.typescriptlang.org/) application logic responsible for starting and coordinating all major components of the desktop application. It acts as the central runtime layer connecting the backend server, the frontend UI, and the desktop container.

  The code implements the [Electron](https://www.electronjs.org/) API for creating cross-platform desktop applications. Electron provides the runtime environment that combines web technologies with native operating system capabilities, allowing the application to run on multiple platforms such as Windows, macOS, and Linux using a shared codebase.

  The Electron layer acts as an interface between the [Svelte](https://svelte.dev/) frontend and operating system-specific functionality. It exposes controlled APIs that allow the frontend user interface to communicate with native system commands, access desktop features, and execute platform-dependent operations while maintaining separation between the UI and the underlying operating system.

- **`\svelte-frontend` directory**  
  contains the graphical user interface of the application. The frontend is implemented using [Svelte](https://svelte.dev/) with application logic written in TypeScript.

  The interface uses [shadcn-svelte](https://www.shadcn-svelte.com/) components, which provide reusable and customizable UI elements designed specifically for Svelte applications. These components are styled and adapted using [Tailwind CSS](https://tailwindcss.com/), a utility-first CSS framework that provides predefined styling classes for controlling layout, spacing, colors, typography, and responsive behavior directly within the application markup. This approach enables consistent design patterns while allowing fine-grained customization of the user interface.

  For interactive image processing functionality, the frontend integrates [Konva](https://konvajs.org/), a 2D canvas framework that enables high-performance rendering and manipulation of graphical objects in the browser. Konva is used to implement image editing features such as annotation, drawing, object manipulation, image cropping, and interactive visualization of image data. It provides the foundation for creating a dynamic workspace where users can modify and analyze images directly within the application.

Other directories and files included in the root folder:

- `\.github\workflows` contains GitHub Actions workflow YAML files that define automated processes for continuous integration, including building, testing, and releasing the application on different operating systems.
- `\assets` contains static application resources such as images, icons, and other files required by the application.
- `\dist` contains generated build files produced during the compilation process of the Electron application, including compiled JavaScript output from the TypeScript `src` directory.
- `\make` contains configuration and generated files used by Electron Builder during the application packaging process.
- `\node_modules` contains Node.js packages and dependencies required to develop, build, and run the Electron application.
- `\python` contains the Python backend implementation, including the server logic, machine learning functionality, and required Python dependencies.
- `\src` contains the main Electron application source code written in TypeScript, responsible for managing the desktop application lifecycle, communication between components, and integration with the operating system.
- `\svelte-frontend` contains the Svelte-based graphical user interface of the application.
- `\.gitignore` defines files and directories that are excluded from version control using Git.
- `\.prettierrc` contains the configuration for [Prettier](https://prettier.io/), which automatically formats source code according to predefined style rules.
- `eslint.config.ts` contains the configuration for [ESLint](https://eslint.org/docs/latest/use/configure/), which analyzes TypeScript and JavaScript code to detect errors and enforce coding standards.
- `forge.config.ts` contains the configuration for [Electron Forge](https://www.electronforge.io/config/configuration), which manages application packaging, building, and distribution.
- `package.json` defines the Node.js project configuration, including dependencies, scripts, and metadata required for building and running the application.
- `package-lock.json` records the exact versions of installed Node.js dependencies to ensure reproducible installations.
- `tsconfig.json` contains the configuration for the [TypeScript compiler](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
- `vitest.config.ts` contains the configuration for [Vitest](https://vitest.dev/config/), which is used for running automated tests.

Other directories and files included in the `svelte-frontend` directory:

- `\svelte-frontend\.vscode` contains Visual Studio Code workspace settings and configuration files used to customize the development environment for the frontend project.
- `\svelte-frontend\dist` contains the production build output generated by Vite, including optimized JavaScript, CSS, and static assets used when deploying the frontend application.
- `\svelte-frontend\node_modules` contains Node.js packages and dependencies required to develop, build, and run the Svelte frontend application.
- `\svelte-frontend\public` contains static assets that are directly copied into the final frontend build without additional processing by Vite.
- `\svelte-frontend\src` contains the main Svelte frontend source code, including components, application logic, styles, and other resources required to build the user interface.
- `\svelte-frontend\.gitignore` defines files and directories that are excluded from version control using Git.
- `\svelte-frontend\components.json` contains the configuration for [shadcn-svelte](https://www.shadcn-svelte.com/) components, defining component paths and styling-related settings.
- `\svelte-frontend\index.html` contains the main HTML entry point used by Vite to initialize and load the Svelte application.
- `\svelte-frontend\package.json` defines the frontend project configuration, including dependencies, scripts, and metadata required for development and building.
- `\svelte-frontend\package-lock.json` records the exact versions of installed Node.js dependencies to ensure reproducible installations.
- `\svelte-frontend\svelte.config.js` contains the configuration for the [Svelte](https://svelte.dev/docs/kit/configuration) framework.
- `\svelte-frontend\tsconfig.json` contains the base configuration for the [TypeScript compiler](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
- `\svelte-frontend\tsconfig.app.json` contains TypeScript compiler settings specific to the Svelte application source code.
- `\svelte-frontend\tsconfig.node.json` contains TypeScript compiler settings for Node.js-based configuration files such as Vite configuration.
- `\svelte-frontend\vite.config.ts` contains the configuration for [Vite](https://vite.dev/config/), which manages the frontend development server, module bundling, and production builds.

> Note: Directories such as `\svelte-frontend\dist` and `\svelte-frontend\node_modules` are generated automatically after running corresponding `npm` commands and build processes.*

## How to Build and Run the Project

### Recommended VS Code extensions

The following VS Code extensions are recommended to provide a consistent development environment for contributors.

| Extension | Purpose |
|---|---|
| `aaron-bond.better-comments` | Improves code comments by adding visual categories such as notes, warnings, and TODOs. |
| `bierner.markdown-preview-github-styles` | Provides a GitHub-like preview for Markdown documentation. |
| `bmalehorn.shell-syntax` | Adds syntax highlighting for shell scripts and commands. |
| `bradlc.vscode-tailwindcss` | Provides Tailwind CSS IntelliSense and class suggestions. |
| `christian-kohler.npm-intellisense` | Provides autocomplete for npm modules in JavaScript and TypeScript files. |
| `christian-kohler.path-intellisense` | Provides autocomplete for file paths. |
| `davidanson.vscode-markdownlint` | Checks Markdown files for formatting and documentation quality issues. |
| `dbaeumer.vscode-eslint` | Detects JavaScript and TypeScript code quality issues. |
| `donjayamanne.githistory` | Displays Git file history and commit information. |
| `donjayamanne.python-environment-manager` | Helps manage Python environments inside VS Code. |
| `esbenp.prettier-vscode` | Automatically formats code using Prettier. |
| `formulahendry.auto-close-tag` | Automatically adds closing HTML/XML tags. |
| `formulahendry.auto-rename-tag` | Renames matching HTML/XML tags automatically. |
| `formulahendry.code-runner` | Allows quick execution of code snippets and scripts. |
| `gruntfuggly.todo-tree` | Collects and displays TODO comments across the project. |
| `htmlhint.vscode-htmlhint` | Checks HTML files for common issues and best practices. |
| `humao.rest-client` | Allows testing HTTP requests directly from VS Code. |
| `jasonnutter.search-node-modules` | Helps locate and search installed npm dependencies. |
| `ms-playwright.playwright` | Provides tools for browser automation and end-to-end testing. |
| `ms-python.autopep8` | Automatically formats Python code according to PEP 8. |
| `ms-python.debugpy` | Provides Python debugging support. |
| `ms-python.pylint` | Performs Python code quality checks. |
| `ms-python.python` | Adds Python language support. |
| `ms-python.vscode-pylance` | Provides Python IntelliSense, type checking, and analysis. |
| `ms-python.vscode-python-envs` | Provides Python environment management features. |
| `ms-toolsai.jupyter` | Adds support for Jupyter notebooks. |
| `ms-toolsai.jupyter-keymap` | Adds familiar Jupyter keyboard shortcuts. |
| `ms-toolsai.jupyter-renderers` | Improves rendering of Jupyter outputs. |
| `ms-toolsai.vscode-jupyter-cell-tags` | Supports Jupyter cell metadata and tagging. |
| `ms-toolsai.vscode-jupyter-slideshow` | Allows creating presentations from Jupyter notebooks. |
| `ms-vscode-remote.remote-containers` | Enables development inside Docker containers. |
| `ms-vscode-remote.remote-ssh` | Allows development on remote machines through SSH. |
| `ms-vscode-remote.remote-wsl` | Enables development using Windows Subsystem for Linux. |
| `ms-vscode-remote.vscode-remote-extensionpack` | Installs common extensions for remote development. |
| `openai.chatgpt` | Provides AI-assisted coding, debugging, and documentation support. |
| `redhat.vscode-yaml` | Provides YAML validation and editing support. |
| `ritwickdey.liveserver` | Starts a local development server with live browser updates. |
| `rvest.vs-code-prettier-eslint` | Integrates Prettier formatting with ESLint rules. |
| `selemondev.vscode-shadcn-svelte` | Provides support for shadcn-svelte components. |
| `svelte.svelte-vscode` | Adds Svelte language support and IntelliSense. |
| `vitest.explorer` | Provides a graphical interface for running Vitest tests. |
| `xabikos.javascriptsnippets` | Provides useful JavaScript code snippets. |
| `yzhang.markdown-all-in-one` | Adds Markdown shortcuts, formatting, and navigation features. |
| `zainchen.json` | Improves JSON editing and formatting. |

These extensions can be installed automatically using the recommended extensions file located at `.vscode/extensions.json`.

### Install VS Code extensions

Open the project in VS Code and install the recommended extensions when prompted.

Alternatively, open the Extensions panel (`Ctrl + Shift + X`) and select **Install Workspace Recommended Extensions**.

### Download the repository

Download the repository as a ZIP file, extract it, and navigate to the root folder `ml-segmentation-app-2`.

Alternatively, clone the repository from GitHub using Git:

```bash
git clone https://github.com/kerimyalcin95/ml-segmentation-app-2.git
```

Navigate into the project directory:

```bash
cd ml-segmentation-app-2
```

### Install Node.js and Python

Install [Node.js](https://nodejs.org/en/download) and [Python](https://www.python.org/downloads/).

**Windows (console):**

```bash
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip
```

Verify installation:

```bash
node --version
npm --version
python --version
```

### Install Node.js packages

Install the project dependencies by running the following command inside the root folder `ml-segmentation-2`:

```bash
npm install
```

Then navigate to the `/svelte-frontend` folder and install its dependencies:

```bash
cd svelte-frontend
npm install
```

### Install Python packages

Install the required Python dependencies using `pip`.

**Windows (console):**

Update `pip` before installing packages:

```bash
python -m pip install --upgrade pip
```

Install the required packages:

```bash
pip install websockets opencv-python fastai
```

Alternatively, install packages individually:

```bash
pip install websockets
pip install opencv-python
pip install fastai
```

> Note: The current development version of the project only requires the `websockets` package.

To remove all installed packages from the current Python environment:

```bash
pip freeze > packages.txt
pip uninstall -r packages.txt -y
```

**Linux (Ubuntu/Debian):**

Install Python and `pip` if not already installed:

```bash
sudo apt update
sudo apt install python3 python3-pip
```

Update `pip`:

```bash
python3 -m pip install --upgrade pip
```

Install the required packages:

```bash
pip3 install websockets opencv-python fastai
```

**macOS:**

Install Python using [Homebrew](https://brew.sh/) if not already installed:

```bash
brew install python
```

Update `pip`:

```bash
python3 -m pip install --upgrade pip
```

Install the required packages:

```bash
pip3 install websockets opencv-python fastai
```

To remove all installed packages from the current Python environment:

```bash
pip3 freeze > packages.txt
pip3 uninstall -r packages.txt -y
```

### Build the Electron app

Inside the project folder run:  
`npm run build`  

The project backend TypeScript files are compiled into JavaScript files and saved into `\dist`.  
Then the project frontend Svelte project is build and saved into `\svelte-frontend\dist`.

### Test the Electron App

Inside the project folder run:  
`npm run start`

The project frontend and backend is build and the Electron app is started for testing.

### Distribute the Electron App with Electron Builder

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

### Test the Svelte Frontend

Inside the project folder run:  
`npm run fe-start`

or  
`npm run fe-preview`

The Svelte frontend project files are build and saved into `\svelte-frontend\dist`.  
A local server will be started where the frontend app can be run on a browser.

To kill the server, type:  
`q + enter`

### Build the Svelte Frontend

Inside the project folder run:  
`npm run fe-build`  

The Svelte frontend project files are build and saved into `\svelte-frontend\dist`.

### Run Unit Tests in TypeScript

The project uses Vitest for Unit testing.  
TypeScript unit test files are saved as `*.test.ts` beside the reference file.

To run a unit test type:  
`npm run test`

## Manual

TODO

## License

This project is licensed under the [MIT License](LICENSE).

Some components of this project use third-party software. The corresponding licenses and notices can be found in [THIRD_PARTY_LICENSE](THIRD_PARTY_LICENSE).
