# Resume Generator - API Keys Setup Guide

## Overview
The AI Resume Generator Backend uses secure property storage in Google Apps Script to store your API keys.

## What You Need
1. **OpenAI API Key** - For GPT-4 powered resume generation
2. **GitHub Personal Access Token (PAT)** - For uploading resumes to GitHub

## Step 1: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Log in with your OpenAI account
3. Click "+ Create new secret key"
4. Copy the key (starts with `sk-proj-`)
5. **Save it safely - you can only view it once!**

## Step 2: Get Your GitHub PAT

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: `Resume-Generator-API`
4. Select scope: ☑️ **repo** (read/write contents)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. **Save it safely - you can only view it once!**

## Step 3: Store Keys in Google Apps Script

### Option A: Using Apps Script Editor Console

1. Go to: https://script.google.com/home/projects/1l5HTDdM-nXOXO5xJ3mruhM4y9K90dSkzZsDLACK4kv2SU920y0p6RPcL/edit
2. In the function dropdown, select `setApiKeys`
3. Click **Run**
4. You'll see a popup: enter your keys when prompted
5. Check Execution logs for confirmation

### Option B: Direct Console Execution

1. Open the Apps Script project
2. Click **Debug** or open **Execution log**
3. In the console, run:
```javascript
setApiKeys('YOUR_OPENAI_KEY', 'YOUR_GITHUB_PAT')
```
4. Replace with your actual keys
5. You should see: "API keys stored securely"

## Verify Keys Are Stored

1. In Apps Script, select `testKeys` from the function dropdown
2. Click **Run**
3. Check Execution log - you should see:
   - `OpenAI: SET`
   - `GitHub: SET`

## Security Notes

- ✅ Keys are stored in Google's encrypted UserProperties
- ✅ Keys are **never** in your code or repository
- ✅ Only you can access these keys (account-specific)
- ✅ Your GitHub frontend cannot access these keys
- ✅ Keys are automatically passed to backend functions

## Testing the System

1. Open: https://deeepanbe.github.io/resume-generator.html
2. Fill in:
   - Company Name
   - Job Title
   - Job Description
3. Click "Generate Resume"
4. Wait for PDF/DOCX links
5. Files auto-upload to `/resume/` folder

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API keys not configured" | Run `setApiKeys()` function |
| "401 from OpenAI" | Check OpenAI key is correct |
| "401 from GitHub" | Check GitHub PAT has `repo` scope |
| Resumes not uploading | Verify GitHub PAT permissions |

## Questions?

Check the backend code comments in Apps Script for more details.

---
**Last Updated:** November 29, 2025
