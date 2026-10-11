#!/bin/sh
# 本地质量门禁：push 前强制执行（.git/hooks/pre-push 指向本文件）
# 三关：ruff lint → import-linter 分层契约 → pytest 冒烟
# 任一关失败即中止 push。跳过请用 git push --no-verify（不建议）。
set -e
cd "$(git rev-parse --show-toplevel)"

PY=".venv-backend/Scripts/python.exe"
RUFF=".venv-backend/Scripts/ruff.exe"

echo "[gate 1/3] ruff lint..."
"$RUFF" check backend scripts tests

echo "[gate 2/3] import-linter 分层契约..."
"$PY" -m importlinter.cli lint-imports 2>/dev/null || .venv-backend/Scripts/lint-imports

echo "[gate 3/3] pytest 冒烟..."
"$PY" -m pytest

echo "[gate] ALL GREEN"
