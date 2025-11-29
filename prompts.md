# Prompts

## Test IDs

Can you analyse the `apps/website` and check which components are important for end-to-end testing. Can you please add `data-testid` attributes to those components.

Please add all the retrieved an created test IDs in a TypeScript constant file under `apps/website/src/constants/testIds.ts`. That way, it is easier to be reused in the E2E tests later.

## Create me E2E tests

Can you create me E2E tests for the `apps/website` which is available at `http://localhost:5173`. These tests need to created within the `tests` folder and created with Playwright. use context7