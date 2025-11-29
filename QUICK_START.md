# 🚀 QUICK START - Resume Generator (2 Minutes)

## ✅ System Status
- Backend: **READY** ✓
- Frontend: **READY** ✓
- GitHub Integration: **READY** ✓
- Documentation: **READY** ✓
- Storage System: **READY** ✓

## ⏱️ What You Need To Do (5 Minutes)

### Step 1: Get OpenAI API Key (2 min)
```
1. Open: https://platform.openai.com/api-keys
2. Click "+ Create new secret key"
3. Copy the key (starts with sk-proj-)
4. SAVE IT - you can only see it once!
```

### Step 2: Get GitHub Token (2 min)
```
1. Open: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: Resume-Generator-API
4. Check: ☑️ repo
5. Click Generate
6. Copy the token (starts with ghp_)
7. SAVE IT - you can only see it once!
```

### Step 3: Store Keys (1 min)

**Easiest Method:**

1. Open: https://script.google.com/home/projects/1l5HTDdM-nXOXO5xJ3mruhM4y9K90dSkzZsDLACK4kv2SU920y0p6RPcL/edit

2. Select `setApiKeys` from dropdown:
   ```
   Function dropdown ▼ setApiKeys ▼
   ```

3. Click **Run**

4. In Execution log, run this command (paste your actual keys):
   ```javascript
   setApiKeys('sk-proj-YOUR_OPENAI_KEY_HERE', 'ghp_YOUR_GITHUB_TOKEN_HERE')
   ```

5. You should see: **"API keys stored securely"**

### Step 4: Verify (30 sec)

1. Select `testKeys` from dropdown
2. Click **Run**
3. Check Execution log - should show:
   - `OpenAI: SET`
   - `GitHub: SET`

## 🎉 Done! Test It

1. Open: https://deeepanbe.github.io/resume-generator.html
2. Fill in:
   - Company Name: (any company)
   - Job Title: (any job)
   - Job Description: (paste a real job description)
3. Click "Generate Resume"
4. Wait for PDF/DOCX download links
5. Check GitHub `/resume/` folder - files auto-uploaded!

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API keys not configured" | Run `setApiKeys()` with your keys |
| "401 from OpenAI" | Check your OpenAI key is correct |
| "401 from GitHub" | Check GitHub token has `repo` scope |
| Function dropdown empty | Reload the page |

## 📚 More Help

- Full setup guide: `RESUME_GENERATOR_SETUP.md`
- Backend code: See Apps Script `Code.gs`
- Issues: Check Execution log in Apps Script

---

**Status:** System complete. Your action needed: 5 minutes.

**Last Updated:** November 29, 2025
