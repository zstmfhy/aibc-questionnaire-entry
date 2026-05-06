# Deploy the Custom Survey

The custom survey needs a serverless backend because Feishu App Secret must not be exposed in browser code.

Recommended deployment target: Vercel.

## Vercel Env Vars

```bash
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx
FEISHU_APP_TOKEN=PoJrbBdotaAeyOsieF9c6y3Xn8e
FEISHU_TABLE_ID=tblVYgISp5ZSmPY1
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

After deployment, root `/` is rewritten to `/survey.html`, and submissions are posted to `/api/submit`.

The current GitHub Pages URL can only preview the question flow because GitHub Pages cannot run `/api/submit`.

