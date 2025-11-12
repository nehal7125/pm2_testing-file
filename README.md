# CI/CD Pipeline for PM2 Deployment

This repository contains a GitHub Actions workflow that automatically deploys your application to an Excloud instance and manages PM2 processes.

## Features
redeploy
- ✅ Automatic deployment on code push
- ✅ SSH connection to Excloud instance
- ✅ Automatic code pull from repository
- ✅ PM2 process management (stop/start)
- ✅ Automatic failure detection
- ✅ Log capture and display in GitHub Actions

## Setup Instructions

### 1. GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add the following:

   - **`SSH_HOST`**: Your Excloud instance IP address or hostname
     - Example: `123.45.67.89` or `your-server.excloud.com`
   
   - **`SSH_USER`**: SSH username for your Excloud instance
     - Example: `ubuntu`, `root`, or your custom username
   
   - **`SSH_PRIVATE_KEY`**: Your private SSH key for authentication
     - Copy the entire private key (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)
     - Make sure there are no extra spaces or line breaks
   
   - **`DEPLOY_PATH`**: The path on your server where the code should be deployed
     - Example: `/var/www/myapp` or `/home/ubuntu/myapp`

### 2. SSH Key Setup

If you don't have an SSH key pair yet:

1. **Generate SSH key pair** (on your local machine):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions"
   ```

2. **Copy public key to Excloud server**:
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub your-user@your-server
   ```

3. **Copy private key to GitHub Secrets**:
   ```bash
   cat ~/.ssh/id_rsa
   ```
   Copy the entire output and paste it into the `SSH_PRIVATE_KEY` secret.

### 3. PM2 Configuration

Make sure your Excloud instance has:

- **PM2 installed globally**:
  ```bash
  npm install -g pm2
  ```

- **PM2 configuration file** (one of these):
  - `ecosystem.config.js` (recommended)
  - `app.js` (if using direct node start)
  - `package.json` with start script

### 4. Git Configuration on Server

Ensure your deployment path on the server is a git repository:

```bash
cd /path/to/your/deploy/path
git init
git remote add origin https://github.com/your-username/your-repo.git
# Or use SSH: git remote add origin git@github.com:your-username/your-repo.git
```

## Workflow Behavior

### On Successful Deployment:
1. ✅ Code is pulled from the repository
2. ✅ PM2 processes are stopped
3. ✅ PM2 processes are restarted
4. ✅ All processes are verified to be online

### On Failure:
1. ❌ The workflow detects failed PM2 processes
2. 📋 Automatically captures logs for failed processes
3. 📊 Displays full PM2 status
4. 📋 Shows detailed logs in GitHub Actions output

## Customization

### Change Trigger Branch

Edit `.github/workflows/deploy.yml` and modify:
```yaml
on:
  push:
    branches:
      - main  # Change to your branch name
```

### Change PM2 Start Command

The workflow tries multiple PM2 start commands in order:
1. `pm2 start ecosystem.config.js`
2. `pm2 start app.js`
3. `pm2 start npm -- start`

You can modify the workflow file to use your specific command.

## Troubleshooting

### SSH Connection Issues
- Verify your SSH key is correctly formatted in GitHub Secrets
- Ensure the SSH user has proper permissions
- Check that the server allows SSH connections

### PM2 Not Found
- Install PM2 on your server: `npm install -g pm2`
- Ensure PM2 is in the PATH for the SSH user

### Permission Denied
- Ensure the deployment path is accessible by the SSH user
- Check file permissions: `chmod -R 755 /path/to/deploy`

## Security Notes

- ⚠️ Never commit SSH keys or secrets to the repository
- ✅ Always use GitHub Secrets for sensitive information
- ✅ Use SSH keys with proper permissions (read-only if possible)
- ✅ Regularly rotate SSH keys
