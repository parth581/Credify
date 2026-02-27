# HF Deployment Checklist

## What's Been Created ✅
- [x] FastAPI server (`hf-deployment/app.py`)
- [x] Docker configuration (`hf-deployment/Dockerfile`)
- [x] Python dependencies (`hf-deployment/requirements.txt`)
- [x] Next.js HF API route (`app/api/face-comparison/route-hf.ts`)
- [x] Environment config template (`.env.hf-deployment`)
- [x] Deployment guide (`HF_DEPLOYMENT_SETUP.md`)

---

## Your Next Steps (In Order)

### ✅ Step 1: Create Hugging Face Account
- [ ] Go to https://huggingface.co/signup
- [ ] Sign up or login
- [ ] Generate API token (Settings → Access Tokens)

### ✅ Step 2: Create Space on Hugging Face
- [ ] Go to https://huggingface.co/spaces
- [ ] Click "Create new Space"
- [ ] Name: `credify-face-comparison`
- [ ] SDK: **Docker**
- [ ] License: MIT
- [ ] Create Space

### ✅ Step 3: Upload Files to Your Space
- [ ] Go to your new Space
- [ ] Click "Files and versions"
- [ ] Upload these 3 files from your `hf-deployment/` folder:
  - `Dockerfile`
  - `requirements.txt`
  - `app.py`
- [ ] Commit changes

### ✅ Step 4: Wait for Build
- [ ] Space will auto-build (takes 5-10 minutes)
- [ ] Check "Logs" tab if you see warnings
- [ ] Wait until Status shows "Running" (green ✓)

### ✅ Step 5: Copy Your Space URL
- [ ] Your Space URL will look like:
  ```
  https://your-username-credify-face-comparison.hf.space
  ```
- [ ] Copy this URL

### ✅ Step 6: Configure Your App
- [ ] Add to `.env.local`:
  ```
  HF_SPACE_URL=https://your-username-credify-face-comparison.hf.space
  ```
- [ ] In your project folder:
  ```bash
  # Backup old local version
  mv app/api/face-comparison/route.ts app/api/face-comparison/route-local.ts
  
  # Activate HF version
  mv app/api/face-comparison/route-hf.ts app/api/face-comparison/route.ts
  ```

### ✅ Step 7: Restart Your App
- [ ] Press `Ctrl+C` to stop dev server (if running)
- [ ] Run:
  ```bash
  npm run dev
  ```
- [ ] App restarts with new configuration

### ✅ Step 8: Test It
- [ ] Go to your KYC login page
- [ ] Take a face photo for verification
- [ ] Compare with ID
- [ ] Should be MUCH faster (2-3 seconds)
- [ ] Check console logs to confirm it's calling HF Space

---

## File Structure Created

```
d:\Backend practice\Practice\credify-ui\
├── hf-deployment/                    ← NEW folder
│   ├── app.py                        ← FastAPI server
│   ├── Dockerfile                    ← Docker config
│   └── requirements.txt              ← Python dependencies
├── app/
│   └── api/
│       └── face-comparison/
│           ├── route-local.ts        ← Your old local version (after moving)
│           ├── route-hf.ts           ← NEW HF version
│           └── route.ts              ← Will become route-hf.ts after step 6
├── .env.hf-deployment                ← NEW template file
├── HF_DEPLOYMENT_SETUP.md            ← NEW detailed guide
└── HF_DEPLOYMENT_CHECKLIST.md        ← This file
```

---

## Key Points

### Timing Expectations
| Scenario | Time |
|----------|------|
| First request after deployment | 15-20 sec (model loading) |
| Subsequent requests | 2-3 seconds |
| vs Local setup | **3-5x faster** |
| Space cold start (after 48h sleep) | 30-60 sec |

### Free Tier Benefits
- ✅ Completely FREE
- ✅ No setup required (auto-deployment)
- ✅ Scales to handle multiple users
- ✅ Model pre-loads (fast responses)
- ⏱️ Space sleeps after 48 hours (no cost, wakes on first request)

### If Something Goes Wrong
1. Check Space → Logs tab for errors
2. See troubleshooting in `HF_DEPLOYMENT_SETUP.md`
3. Your local version is backed up, can switch back if needed

---

## Commands Reference

### Check Space Status
```bash
# Open in browser
https://your-username-credify-face-comparison.hf.space/health
```

### View Space Logs
```bash
# Go to: Hugging Face Space → Logs tab
```

### Roll Back to Local (if needed)
```bash
# In your project:
mv app/api/face-comparison/route.ts app/api/face-comparison/route-hf.ts
mv app/api/face-comparison/route-local.ts app/api/face-comparison/route.ts

# Restart:
npm run dev
```

---

## Questions? Check These

| Question | Answer |
|----------|--------|
| Where do I upload files? | HF Space → Files and versions tab |
| How long does build take? | 5-10 minutes |
| When do I copy the URL? | After space shows "Running" status |
| Will it work without Python on my PC? | YES! That's the whole point |
| Can I switch back to local? | YES! We kept a backup |
| How much does this cost? | FREE (Hugging Face free tier) |
| Will first request be slow? | YES, but then super fast |

---

## Ready? Start with Step 1! 🚀
