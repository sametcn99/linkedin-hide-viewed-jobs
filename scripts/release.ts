const ROOT = import.meta.dir.replace('/scripts', '')

async function $(cmd: string[]): Promise<string> {
  const { stdout } = await Bun.spawn(cmd, { cwd: ROOT, stdout: 'pipe' }).exited
  return new TextDecoder().decode(stdout).trim()
}

async function checkPrerequisites(): Promise<{ version: string; tag: string; repo: string }> {
  const pkg = await Bun.file(`${ROOT}/package.json`).json()
  const version = pkg.version as string
  const tag = `v${version}`
  const repo = (pkg.repository.url as string)
    .replace('git+https://github.com/', '')
    .replace('.git', '')

  console.log(`Version: ${version}`)
  console.log(`Tag: ${tag}`)
  console.log(`Repo: ${repo}`)

  const existingTag = await $(['git', 'tag', '--list', tag])
  if (existingTag) {
    console.error(`Tag ${tag} already exists. Increment version in package.json first.`)
    process.exit(1)
  }

  const status = await $(['git', 'status', '--porcelain'])
  if (status) {
    console.error('Working tree has uncommitted changes. Commit or stash first.')
    process.exit(1)
  }

  return { version, tag, repo }
}

async function buildAll(): Promise<void> {
  console.log('\nBuilding userscript...')
  await Bun.spawn(['bun', 'run', 'build'], { cwd: ROOT, stdout: 'inherit' }).exited

  console.log('Building extension...')
  await Bun.spawn(['bun', 'run', 'build:extension'], { cwd: ROOT, stdout: 'inherit' }).exited
}

async function packageAll(): Promise<void> {
  console.log('\nPackaging Chrome extension...')
  await Bun.spawn(['bun', 'run', 'package:chrome'], { cwd: ROOT, stdout: 'inherit' }).exited

  console.log('Packaging Firefox extension...')
  await Bun.spawn(['bun', 'run', 'package:firefox'], { cwd: ROOT, stdout: 'inherit' }).exited
}

async function main(): Promise<void> {
  const { version, tag, repo } = await checkPrerequisites()
  await buildAll()
  await packageAll()

  console.log(`\nLocal build complete for ${tag}!`)
  console.log(`Run the GitHub Actions 'Release' workflow to publish.`)
  console.log(`Repo: https://github.com/${repo}`)
}

main().catch((err) => {
  console.error('Release failed:', err)
  process.exit(1)
})
