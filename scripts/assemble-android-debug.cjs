const { spawnSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const { join } = require('node:path')

const androidDir = join(process.cwd(), 'android')
const isWin = process.platform === 'win32'
const gradlew = join(androidDir, isWin ? 'gradlew.bat' : 'gradlew')

if (!existsSync(gradlew)) {
  console.error('Android project is missing. Run: npx cap add android')
  process.exit(1)
}

const result = spawnSync(isWin ? `"${gradlew}"` : gradlew, ['assembleDebug'], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWin,
})

process.exit(result.status ?? 1)
