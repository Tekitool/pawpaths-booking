# Deploying Next.js to AWS Lightsail (Shared with WordPress)

Yes, you **can** host your Next.js app on the same Lightsail instance as your WordPress site. However, you need to be careful about **server resources** (RAM/CPU) and **port configuration**.

> [!WARNING]
> **Resource Warning**: If your instance is small (e.g., 512MB or 1GB RAM), the Next.js build process (`npm run build`) might crash the server. We will enable **Swap Memory** to prevent this.

## Prerequisites
- SSH Access to your Lightsail instance.
- A subdomain (e.g., `booking.yourdomain.com`) pointing to your Lightsail IP.

---

## Step 1: Connect & Prepare Environment

1.  **SSH into your instance** (via Browser Console or Terminal).
2.  **Enable Swap Memory** (Crucial for small instances):
    ```bash
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```
3.  **Install Node.js** (Bitnami instances usually don't have it, or have an old version):
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
4.  **Install PM2** (Process Manager to keep app running):
    ```bash
    sudo npm install -g pm2
    ```

---

## Step 2: Upload Project Files

You can use FileZilla (SFTP) or `scp` to upload your files.
**Do NOT upload:** `node_modules`, `.next`, or `.git`.

1.  Create a directory:
    ```bash
    mkdir -p /home/bitnami/pawpaths-booking
    ```
2.  Upload your project files to this folder.
3.  Create/Upload your `.env.local` file with production values.
4.  **IMPORTANT**: Update `next.config.mjs` to allow your subdomain:
    ```javascript
    experimental: {
      serverActions: {
        allowedOrigins: ['booking.yourdomain.com', 'localhost:3000'],
      },
    },
    ```

---

## Step 3: Install & Build

Navigate to your folder and install dependencies:

```bash
cd /home/bitnami/pawpaths-booking
npm install
npm run build
```

> If `npm run build` fails due to memory, ensure you did Step 1 (Swap).

---

## Step 4: Start with PM2

Start the application on port 3000:

```bash
pm2 start npm --name "pawpaths-booking" -- start
pm2 save
```

Check if it's running:
```bash
curl http://localhost:3000
```

---

## Step 5: Configure Reverse Proxy (Apache)

Most Lightsail WordPress instances use **Apache**. We need to tell Apache to send traffic from `booking.yourdomain.com` (or a specific path) to `localhost:3000`.

### Option A: Subdomain (Recommended)
*Assumes you have `booking.yourdomain.com` DNS pointing to the instance.*

1.  Enable proxy modules:
    ```bash
    sudo sed -i 's/^#LoadModule proxy_module/LoadModule proxy_module/' /opt/bitnami/apache/conf/httpd.conf
    sudo sed -i 's/^#LoadModule proxy_http_module/LoadModule proxy_http_module/' /opt/bitnami/apache/conf/httpd.conf
    ```

2.  Edit the Bitnami Apache configuration:
    ```bash
    sudo nano /opt/bitnami/apache/conf/vhosts/pawpaths-booking-vhost.conf
    ```

3.  Paste this configuration:
    ```apache
    <VirtualHost *:80>
        ServerName booking.yourdomain.com
        ProxyPreserveHost On
        ProxyPass / http://localhost:3000/
        ProxyPassReverse / http://localhost:3000/
    </VirtualHost>

    <VirtualHost *:443>
        ServerName booking.yourdomain.com
        SSLEngine on
        SSLCertificateFile "/opt/bitnami/apache/conf/bitnami/certs/server.crt"
        SSLCertificateKeyFile "/opt/bitnami/apache/conf/bitnami/certs/server.key"
        
        ProxyPreserveHost On
        ProxyPass / http://localhost:3000/
        ProxyPassReverse / http://localhost:3000/
    </VirtualHost>
    ```

4.  Include this file in the main config (if not auto-included):
    *Check `/opt/bitnami/apache/conf/bitnami/bitnami-apps-vhosts.conf` or similar.*

5.  Restart Apache:
    ```bash
    sudo /opt/bitnami/ctlscript.sh restart apache
    ```

### Option B: Sub-path (e.g., yourdomain.com/booking)
*Easier if you don't want to mess with DNS/SSL certs immediately.*

1.  Edit the main WordPress `httpd-app.conf` or similar.
2.  Add:
    ```apache
    ProxyPass /booking http://localhost:3000
    ProxyPassReverse /booking http://localhost:3000
    ```
    *Note: You might need to update `next.config.mjs` with `basePath: '/booking'` for this to work perfectly.*

---

## Troubleshooting

- **502 Bad Gateway**: The Next.js app is not running. Check `pm2 status`.
- **Styles missing**: If using Sub-path, ensure `basePath` is set in Next.js config.
- **Site slow**: Check memory usage with `htop`. You might need to upgrade your instance size.
