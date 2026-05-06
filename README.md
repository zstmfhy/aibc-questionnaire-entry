# AIBC Questionnaire Web App

Static entry page and custom web questionnaire for AIBC members.

## Storage

Submissions are written to Feishu Base table `网页调研提交`.

Required runtime env for the API:

```bash
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx
FEISHU_APP_TOKEN=PoJrbBdotaAeyOsieF9c6y3Xn8e
FEISHU_TABLE_ID=tblVYgISp5ZSmPY1
ALLOWED_ORIGINS=https://your-domain.example
```

`index.html` is the old role-router entry. `survey.html` is the new full web questionnaire.
