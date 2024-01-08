module.exports = {
  branches: [{
    name: 'main'
  },
  {
    name: 'dev',
    channel: 'dev',
    prerelease: true
  }],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
],
}
