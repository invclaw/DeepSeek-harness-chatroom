import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const executablePath = process.env.DSH_CHATROOM_BROWSER_EXECUTABLE_PATH

export default defineConfig({
  test: {
    include: ['tests/browser/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        ...(executablePath === undefined ? {} : { launchOptions: { executablePath } }),
      }),
      instances: [{ browser: 'chromium' }],
    },
  },
})
