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
    "@semantic-release/npm",
    {
      "npmPublish": false,
    },
    "@semantic-release/github",
    "@semantic-release/git"

],
}
