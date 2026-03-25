# ProtecX-JS 🔐

[![Banner](protecx_banner_1774420591959.png)](https://github.com/himudit/protecx-js)

**ProtecX-JS** is a powerful, lightweight JavaScript SDK for both client-side and server-side authentication. It simplifies secure user signups, logins, and profile management with built-in token rotation, automatic refresh logic, and robust verification middleware.

---

## 🚀 Features

- **🛡️ Secure Auth**: Full support for JWT-based authentication using RS256 algorithms.
- **🔄 Auto-Refresh**: Seamlessly handles token expiration and rotation using refresh tokens.
- **⚙️ Multi-Environment**: Dedicated implementations for both Client (Browsers/Universal) and Server (Node.js).
- **🛠️ Flexible Config**: Easy setup with customizable base URLs, project IDs, and API keys.
- **🚀 One-Step Middleware**: Ready-made Express-style middleware for fast server-side protection.

---

## 📦 Installation

To get started, install the package using your favorite package manager:

```bash
npm install @protecx/js
# or
yarn add @protecx/js
# or
pnpm add @protecx/js
```

---

## 🧑‍💻 Client SDK Usage

The client SDK is designed to handle all aspects of user authentication on the frontend.

### Initialization

```javascript
import { ProtecXClient } from '@protecx/js';

const protecx = new ProtecXClient({
  baseUrl: 'https://api.protecx.io', // Your ProtecX base URL
  projectId: 'your_project_id',
  apiKey: 'your_api_key',
  persistTokens: true // (Optional) Saves tokens to localStorage
});
```

### Signup & Login

```javascript
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

### Accessing User Profile

The `profile()` method automatically handles token refresh if your current access token is expired!

```javascript
try {
  const profile = await protecx.profile();
  console.log('User Profile:', profile);
} catch (error) {
  console.error('Session expired, please login again.');
}
```

---

## 🛠️ Server SDK Usage

Use the server implementation for token verification and route protection.

### Initialization

```javascript
import { ProtecXServer } from '@protecx/js/server';

const server = new ProtecXServer({
  publicKeyPEM: `-----BEGIN PUBLIC KEY-----
...Your RSA Public Key...
-----END PUBLIC KEY-----`
});
```

### Protect Routes with Middleware

If you are using Express or a similar framework, you can use the built-in middleware:

```javascript
import express from 'express';

const app = express();

app.get('/protected', server.middleware(), (req, res) => {
  res.json({
    message: 'Welcome to the secret area!',
    user: req.user // The decoded JWT claims are available here
  });
});
```

### Manual Token Verification

```javascript
const claims = server.verifyToken(tokenString);
if (claims) {
  console.log('Valid token for user:', claims.userId);
} else {
  console.log('Invalid or expired token.');
}
```

---

## ⚙️ Configuration Options

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `string` | **Yes** | The root URL of your ProtecX instance. |
| `projectId` | `string` | **Yes** | Your unique ProtecX project identifier. |
| `apiKey` | `string` | **Yes** | API key used for requests from the client. |
| `persistTokens` | `boolean` | No | Whether to save tokens in `localStorage` (Client only). Defaults to `true`. |
| `publicKeyPEM` | `string` | **Yes** | Your project's RSA public key in PEM format (Server only). |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <b>Mudit Garg</b></p>