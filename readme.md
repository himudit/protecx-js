# ProtecX-JS <img src="https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript" />

![Version](https://img.shields.io/badge/version-1.0.1-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**ProtecX-JS** is a powerful, lightweight JavaScript SDK for both client-side and server-side authentication. It simplifies secure user signups, logins, and profile management with built-in token rotation, automatic refresh logic, and robust verification middleware.

---

## 📚 Table of Contents

- [🚀 Features](#-features)
- [📦 Installation](#-installation)
- [🧑‍💻 Client SDK Usage](#-client-sdk-usage)
- [🛠️ Server SDK Usage](#️-server-sdk-usage)
- [⚙️ Configuration Options](#️-configuration-options)
- [📄 License](#-license)

---

## 🚀 Features

- **🛡️ Secure Auth**: Full support for JWT-based authentication using RS256 algorithms.
- **🔄 Auto-Refresh**: Seamlessly handles token expiration and rotation using refresh tokens.
- **⚙️ Multi-Environment**: Dedicated implementations for both Client (Browsers/Universal) and Server (Node.js).
- **🛠️ Flexible Config**: Easy setup with customizable base URLs, project IDs, and API keys.
- **🚀 One-Step Middleware**: Ready-made Express-style middleware for fast server-side protection.
- **📘 TypeScript Support**: Fully typed for better developer experience and safety.

---

## 📦 Installation

Install the package using your favorite package manager:

```bash
npm install protecx-js
````

---

## 🧑‍💻 Client SDK Usage

The client SDK is designed to handle all aspects of user authentication on the frontend.

### 🔧 Initialization

```ts
import { ProtecXClient } from 'protecx-js/client';

export const protecx = new ProtecXClient({
  baseUrl: "https://protecx.onrender.com/api/v1/",
  projectId: "<PROJECT_ID>",
  apiKey: "<API_KEY>",
  persistTokens: true
});
```

---

### 🔐 Signup & Login

```ts
// Sign up a new user
const newUser = await protecx.signup({
  email: 'user@example.com',
  password: 'secure_password',
  name: 'John Doe'
});

// Log in an existing user
const session = await protecx.login({
  email: 'user@example.com',
  password: 'secure_password'
});

console.log('Logged in as:', session.user.name);
```

---

### 👤 Accessing User Profile

The `profile()` method automatically refreshes tokens if needed:

```ts
try {
  const profile = await protecx.profile();
  console.log('User Profile:', profile);
} catch (error) {
  console.error('Session expired, please login again.');
}
```

---

## 🛠️ Server SDK Usage

Use the server SDK for token verification and securing backend routes.

### 🔧 Initialization

```ts
import { ProtecXServer } from 'protecx-js/server';

const server = new ProtecXServer({
  publicKeyPEM: `-----BEGIN PUBLIC KEY-----
...Your RSA Public Key...
-----END PUBLIC KEY-----`
});
```

---

### 🔒 Protect Routes with Middleware

```ts
import express from 'express';

const app = express();

app.get('/protected', server.middleware(), (req, res) => {
  res.json({
    message: 'Welcome to the secret area!',
    user: req.user
  });
});
```

---

### ✅ Manual Token Verification

```ts
const claims = server.verifyToken(tokenString);

if (claims) {
  console.log('Valid token for user:', claims.userId);
} else {
  console.log('Invalid or expired token.');
}
```

---

## ⚙️ Configuration Options

| Option          | Type      | Required | Description                                  |
| :-------------- | :-------- | :------- | :------------------------------------------- |
| `baseUrl`       | `string`  | **Yes**  | Root URL of your ProtecX instance            |
| `projectId`     | `string`  | **Yes**  | Unique project identifier                    |
| `apiKey`        | `string`  | **Yes**  | API key for client requests                  |
| `persistTokens` | `boolean` | No       | Store tokens in localStorage (default: true) |
| `publicKeyPEM`  | `string`  | **Yes**  | RSA public key (Server only)                 |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Contributors

* **Mudit Garg**

---

<p align="center">Made with ❤️ by <b>Mudit Garg</b></p>
