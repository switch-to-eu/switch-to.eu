# Decap CMS Setup for Vercel

This document explains how to set up Decap CMS with a Next.js application deployed on Vercel.

## Prerequisites

1. A GitHub account
2. A repository on GitHub that contains your Next.js project
3. A Vercel account connected to your GitHub account

## Setup Steps

### 1. Create a GitHub OAuth App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "OAuth Apps" > "New OAuth App"
3. Fill in the following details:
   - Application name: `Switch-to.eu CMS`
   - Homepage URL: `https://switch-to.eu`
   - Authorization callback URL: `https://switch-to.eu/api/auth/start`
4. Click "Register application"
5. After creating the app, you'll see your Client ID
6. Generate a Client Secret

### 2. Configure Environment Variables on Vercel

Add the following environment variables to your Vercel project:

- `GITHUB_OAUTH_CLIENT_ID`: Your GitHub OAuth App Client ID
- `GITHUB_OAUTH_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
- `NEXT_PUBLIC_SITE_URL`: The URL of your deployed site (e.g., `https://switch-to.eu`)

### 3. Update the CMS Configuration

In the `public/admin/config.yml` file, update the following:

```yaml
backend:
  name: github
  repo: switch-to-eu/switch-to.eu
  branch: main
  base_url: https://switch-to.eu
  auth_endpoint: api/auth/start
```

### 4. Deploy Your Site

Push your changes to GitHub and deploy your site on Vercel.

### 5. Access the CMS

Once deployed, you can access the CMS at:

```
https://switch-to.eu/admin/
```

## Local Development

For local development, add these environment variables to your `.env.local` file:

```
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Add Content

Once you've logged in to the CMS, you can start creating and editing content. The content will be committed directly to your GitHub repository, which will trigger a new deployment on Vercel.

## Customizing the CMS

To customize the CMS, refer to the [Decap CMS documentation](https://decapcms.org/docs/intro/).
