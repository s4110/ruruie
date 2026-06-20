# Claude Code Hooks for ruruie

このディレクトリには、Claude Codeの動作を制御するhooksが含まれています。

## 有効なフック

### 1. PostToolUse: 自動Biomeフォーマット
**ファイル**: `post-tool-use-biome-format.sh`

**動作**:
- `Edit`または`Write`ツールでTypeScript/JavaScriptファイルを編集した後に自動実行
- Biomeで自動的にフォーマット・リントを実行
- コード品質を自動的に保証

**対象ファイル**: `.ts`, `.tsx`, `.js`, `.jsx`

### 2. UserPromptSubmit: 日本語応答の強制
**ファイル**: `user-prompt-submit-japanese.md`

**動作**:
- ユーザーがプロンプトを送信するたびに、Claudeにリマインダーを送信
- AGENT.mdで定義された言語ルールを自動適用
- 内部思考は英語、ユーザーへの応答は日本語を強制

### 3. PreToolUse: pnpm強制
**ファイル**: `pre-tool-use-enforce-pnpm.sh`

**動作**:
- `npm`または`yarn`コマンドの実行をブロック
- `pnpm`への変更を提案
- プロジェクトのパッケージマネージャー規約を自動適用

**ブロック対象**:
- `npm install`
- `npm add`
- `yarn add`
- `yarn install`

## Hooksの無効化

特定のhooksを無効化したい場合は、`.claude/hooks.json`から該当エントリを削除してください。

## デバッグ

Hooksが期待通り動作しない場合:

1. スクリプトが実行可能か確認:
   ```bash
   ls -la .claude/hooks/*.sh
   ```

2. 手動でテスト:
   ```bash
   echo '{"tool":"Bash","params":{"command":"npm install"}}' | .claude/hooks/pre-tool-use-enforce-pnpm.sh
   ```

3. Claude Codeを再起動

## 参考

Claude Code Hooks公式ドキュメント:
https://code.claude.com/docs/en/hooks
