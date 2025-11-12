# CI/CD Pipeline for PM2 Deployment

This repository contains a GitHub Actions workflow that automatically deploys your application to an AWS EC2 instance (Ubuntu) and manages PM2 processes.
Testing the user
## Features
redeploy
- ✅ Automatic deployment on code push
- ✅ SSH connection to AWS EC2 instance
- ✅ Automatic code pull from repository
- ✅ PM2 process management (stop/start)
- ✅ Automatic failure detection
- ✅ Log capture and display in GitHub Actions

## Setup Instructions

### 1. GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add the following:

   - **`SSH_HOST`**: Your AWS EC2 instance public IP address or Elastic IP
     - Example: `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`
     - You can find this in AWS Console → EC2 → Instances → Your instance → Public IPv4 address
   
   - **`SSH_USER`**: SSH username for your AWS EC2 Ubuntu instance
     - For Ubuntu AMI: `ubuntu` (default)
     - For Amazon Linux: `ec2-user`
     - For other Linux: `root` or your custom username
   
   - **`SSH_PRIVATE_KEY`**: Your private SSH key for authentication
     - Copy the entire private key (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)
     - Make sure there are no extra spaces or line breaks
   
   - **`DEPLOY_PATH`**: The path on your server where the code should be deployed
     - Example: `/var/www/myapp` or `/home/ubuntu/myapp`

**Note**: The repository URL is automatically detected from GitHub Actions context, so you don't need to configure it manually!

### 2. SSH Key Setup

If you don't have an SSH key pair yet:

1. **Generate SSH key pair** (on your local machine):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions"
   ```

2. **Copy public key to AWS EC2 server**:
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@your-ec2-ip
   ```
   
   **Note for AWS EC2**: If you're using the default AWS key pair (.pem file), you can also:
   - Use the existing key pair and convert it, or
   - Add the new public key to `~/.ssh/authorized_keys` on your EC2 instance

3. **Copy private key to GitHub Secrets**:
   ```bash
   cat ~/.ssh/id_rsa
   ```
   Copy the entire output and paste it into the `SSH_PRIVATE_KEY` secret.

   **If using AWS EC2 default .pem key file**:
   ```bash
   # Convert .pem to the format needed (if needed)
   chmod 400 your-key.pem
   # The .pem file content can be used directly in SSH_PRIVATE_KEY secret
   cat your-key.pem
   ```
   Note: AWS .pem files are typically in OpenSSH format and should work directly. If you get format errors, you may need to convert it.

### 3. AWS EC2 Security Group Configuration

**Important**: Make sure your EC2 Security Group allows SSH connections:

1. Go to AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Add inbound rule:
   - Type: SSH
   - Protocol: TCP
   - Port: 22
   - Source: Your IP or `0.0.0.0/0` (less secure, use only for testing)

### 4. PM2 Configuration

Make sure your AWS EC2 instance has:

- **PM2 installed globally**:
  ```bash
  npm install -g pm2
  ```

- **PM2 configuration file** (one of these):
  - `ecosystem.config.js` (recommended)
  - `app.js` (if using direct node start)
  - `package.json` with start script

### 5. Git Configuration on Server

**Good News**: The workflow automatically handles git repository setup! 

- **First Time**: If the deployment directory doesn't exist or isn't a git repository, the workflow will automatically clone your repository using the GitHub repository URL (automatically detected from GitHub Actions).
- **Subsequent Deployments**: The workflow will pull the latest code from the `main` branch.

**Manual Setup (Optional)**: If you prefer to set up the repository manually before the first deployment:

```bash
cd /path/to/your/deploy/path
git clone https://github.com/your-username/your-repo.git .
```

**Note**: The workflow uses `git pull origin main`, so make sure:
- The branch is `main` (or update the workflow to match your branch name)
- The repository URL is automatically provided by GitHub Actions (no secret needed!)

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
- Check that the EC2 Security Group allows SSH (port 22) from GitHub Actions IPs
- Verify the EC2 instance is running and accessible
- Check AWS EC2 instance status in the AWS Console
- If using Elastic IP, ensure it's associated with your instance

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
- ✅ For AWS EC2: Consider restricting Security Group to specific IP ranges instead of `0.0.0.0/0`
- ✅ Use IAM roles and policies for better AWS security
- ✅ Consider using AWS Systems Manager Session Manager as an alternative to direct SSH
