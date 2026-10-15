# OpenCode 主配置

本目录已合并 C:\Users\mhb\.config\opencodebak 中可用的配置。原主配置的 provider、MCP、skills.paths、compaction 和 permission 条目保持原值。

## 已启用

- oh-my-opencode-slim@1.1.2：从 H:\allPro\.opencode-runtime\slim\node_modules\oh-my-opencode-slim\dist 加载。原 npm 缓存安装不完整，且 C 盘空间不足，因此运行依赖安装在 H 盘。opencode.json 和 tui.json 使用本地绝对路径。
- opencode-websearch@0.6.0。
- agents/、commands/、skills/、lib/、plugins/ 和 tests/ 中迁入的文件。OpenCode 会自动发现 plugins/ 根目录中的插件。
- 备份新增的 OpenAI、智谱模型定义，以及 git-commit、title Agent 定义。

## 已迁入但暂未启用

- codegraph、chrome-devtools MCP：当前环境找不到备份指定的 codegraph、bunx 命令，故设置 enabled: false。
- dcp.jsonc、better-compact.jsonc 与 plugins/better-compact/：备份未注册 DCP 插件，且主配置已有自动压缩策略；先保留文件，不启用另一套压缩逻辑。
- 备份引用的 plugins/wait-for-user-stop.ts 不存在，故未加入插件列表。
- 备份的 model、small_model、default_agent、通配权限及 lsp: false 没有直接覆盖主配置。Slim 插件在运行时会注册 orchestrator 并将其设为默认 Agent。

备份中的 .envrc、devenv 文件、starship.toml、旧 README 和包锁文件未复制；它们仍保留在 opencodebak。主配置的 package.json、lockfile 与 node_modules 保持原样。

## 回退与验证

原始 JSON 保存为 opencode.json.pre-merge-20261015.bak 和 tui.json.pre-merge-20261015.bak。本次失败安装产生的不完整缓存和临时包保存在 H:\allPro\.opencode-merge-recovery-20261015，未写回主配置。

可运行 opencode debug config、opencode agent list、opencode debug skill 检查配置。修改插件后重启 OpenCode。