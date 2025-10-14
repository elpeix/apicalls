# API Calls

**API Calls** is a desktop application built with Electron, designed to
streamline and simplify the process of making REST API requests.

Whether you're a developer testing endpoints, a QA engineer validating API
responses, or anyone who regularly interacts with RESTful services, API Calls
offers an intuitive interface for sending, receiving, and analyzing API
requests and responses.

![ApiCalls](apicalls.webp)

Feel free to try it out and provide feedback!

## Installation guide

> **Note:** API Calls installable is available for **Linux**, **MacOs** or
> **Windows**.

You can download the latest version from the [releases page](https://github.com/elpeix/apicalls/releases/latest).

Install on Arch (via AUR). Package name: **api-calls-bin**.

## Development

You can run API Calls locally by cloning the repository and running the following
steps:

Clone the repository:

```sh
git clone https://github.com/elpeix/apicalls.git
```

Enter the project directory:

```sh
cd apicalls
```

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

### Building the app

```sh
# For Linux
npm run build:linux

# For macOS
npm run build:mac

# For Windows
npm run build:win
```
