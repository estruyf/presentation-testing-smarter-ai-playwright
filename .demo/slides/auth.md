---
theme: mc2mc
layout: intro
---

# AUTH

<style>
  h1 {
    font-size: 10em !important;
  }
</style>

---
---

# Authenticated browser state

- Contains cookies, local storage, session storage
- Run `npx playwright codegen <url> --save-storage=<path>`

<br />
<br />
<br />

> More info: <https://www.eliostruyf.com/e2e-testing-mfa-environment-playwright-auth-session/>

<style>
	a {
		color: rgb(0 0 0 / .65) !important;
	}
</style>

---
---

```json
{
	"servers": {
		"playwright": {
			"type": "stdio",
			"command": "npx",
			"args": [
				"@playwright/mcp@latest",
				"--isolated",
				"--storage-state=${input:playwright_storage_state}"
			]
		}
	},
	"inputs": [
		{
			"id": "playwright_storage_state",
			"type": "promptString",
			"description": "Path to Playwright storage state JSON file for authentication"
		}
	]
}
```

<style>
  .slide__content__inner {
    margin: 0 !important;
    padding: 0 !important;
  }

  pre {
    padding: .25em !important;
  }
</style>
