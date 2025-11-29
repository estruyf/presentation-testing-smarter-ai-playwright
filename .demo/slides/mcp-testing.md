---
theme: espc25
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
		color: #fff !important;
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

---
layout: intro
---

# Playwright Test MCP

<style>
	h1 {
		font-size: 6em !important;
	}
</style>

---
---

# Playwright Test MCP

- Build into Playwright Test framework
- Created for E2E testing with AI agents
- Comes with agents:
	- Planner
	- Generator
	- Healer

---
layout: intro
---

# `npx playwright init-agents --loop=vscode`

<style>
	h1 {
		font-size: 2em !important;
	}
</style>