# 🚀 Production Deployment Guide

This guide explains how to host your **MySQL Database** and **Spring Boot Backend**, and connect them to your **Vercel Frontend** (`https://smart-parking-system-kappa-olive.vercel.app`).

---

## 🗺️ Deployment Overview

```
                        +----------------------------------+
                        |         Vercel Frontend          |
                        | (smart-parking-system-kappa-...) |
                        +----------------------------------+
                                         |
                                         | HTTPS REST / WSS WebSockets
                                         v
                        +----------------------------------+
                        |   Hosted Spring Boot Backend     |
                        |      (Render or Railway)         |
                        +----------------------------------+
                                         |
                                         | JDBC MySQL Connection
                                         v
                        +----------------------------------+
                        |      Hosted MySQL Database       |
                        |       (Aiven or Railway)         |
                        +----------------------------------+
```

---

## 📁 1. Setup the Database (MySQL)

You need a hosted MySQL database that is accessible over the internet. Here are the two best options:

### Option A: Aiven.io (Recommended - Free Tier Available)
Aiven offers a dedicated, reliable, and completely free MySQL database tier.
1. Sign up at [Aiven.io](https://aiven.io/).
2. Create a new service and select **MySQL**.
3. Choose the **Free Plan** (available in select regions like AWS `eu-west-1` or `us-east-1`).
4. Once the service is running, copy the connection details:
   - **Host / Service URI**
   - **Port** (usually `10000+` or standard `3306`)
   - **User** (usually `avnadmin`)
   - **Password**
   - **Database Name** (default is usually `defaultdb`)

### Option B: Railway.app (Easiest Integration)
If you host your backend on Railway, you can spin up a MySQL database in the same project instantly.
1. Sign up at [Railway.app](https://railway.app/).
2. Click **New Project** -> **Provision MySQL**.
3. Railway automatically sets up the database. Go to the MySQL service -> **Variables** tab to find your connection details:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

---

## 💻 2. Host the Spring Boot Backend

Your backend uses standard WebSockets (`SockJS` / `STOMP`), which requires a **persistent connection**. Serverless platforms like Vercel or Netlify do **not** support WebSockets. You need a containerized hosting provider.

### Option A: Render.com (Free Tier Available)
Render allows you to build and host your backend for free using the `Dockerfile` we created.
1. Sign up at [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing the project.
4. Configure the Web Service:
   - **Root Directory**: `backend` (Important: specify the folder containing your backend code)
   - **Runtime**: `Docker` (Render will automatically detect the `Dockerfile` we created)
   - **Instance Type**: `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://<YOUR_DB_HOST>:<YOUR_DB_PORT>/<YOUR_DB_NAME>?useSSL=true&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME` = `<YOUR_DB_USERNAME>`
   - `SPRING_DATASOURCE_PASSWORD` = `<YOUR_DB_PASSWORD>`
   - `ALLOWED_ORIGINS` = `https://smart-parking-system-kappa-olive.vercel.app` (Your Vercel URL)
   - `JWT_SECRET` = `<Generate a long random string for security>`
6. Deploy! Render will build the Docker container and expose a public URL (e.g., `https://smart-parking-backend.onrender.com`).

> **Note:** Render's free tier services "sleep" after 15 minutes of inactivity. The first request after a sleep period can take 50–90 seconds to wake up the server.

### Option B: Railway.app (Fastest & No Cold Starts)
1. In your Railway project, click **New** -> **GitHub Repo** and connect your repository.
2. Under settings, set the root directory to `backend`.
3. Railway will build the backend using Nixpacks or Dockerfile.
4. Add the same Environment Variables as above. If using Railway's MySQL database, you can bind them directly:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME` = `${{MySQL.MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD` = `${{MySQL.MYSQLPASSWORD}}`
   - `ALLOWED_ORIGINS` = `https://smart-parking-system-kappa-olive.vercel.app`
   - `JWT_SECRET` = `<your-jwt-secret>`
5. Go to service **Settings** -> **Public Networking** and click **Generate Domain** to expose your API.

---

## ⚡ 3. Configure your Vercel Frontend

Now that your backend is hosted, you need to point your React frontend to it.

1. Go to your **Vercel Dashboard**.
2. Click on your **Smart Parking** project.
3. Go to **Settings** -> **Environment Variables**.
4. Add the following variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-domain.com/api` (Replace with your actual hosted backend URL, ending in `/api`)
5. Redeploy your frontend on Vercel to apply the new environment variable.
6. The React code is already configured to automatically derive the WebSocket endpoint from `REACT_APP_API_URL` (replacing `/api` with `/ws` and changing `https://` to `wss://` / `http://` to `ws://` dynamically).

---

## 🧪 4. Verify your Deployment

Once both are deployed, open your frontend:
1. Open Chrome DevTools (F12) -> **Network** and **Console** tabs.
2. Sign up or log in. The login request should hit `https://your-backend-domain.com/api/auth/login`.
3. Check the WebSocket connection in the **Network** tab -> **WS** sub-tab. You should see a connection to `wss://your-backend-domain.com/ws` with a successful STOMP connection.
