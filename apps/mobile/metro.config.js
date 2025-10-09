/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

const blockListPatterns = [
  new RegExp('functions/(?:node_modules|ignored_[^/]+)/.*'),
  new RegExp('node_modules/\\.pnpm/firebase-functions/.*'),
];

config.resolver.blockList = new RegExp(
  blockListPatterns.map(pattern => `(${pattern.source})`).join('|')
);

module.exports = config;
