# /// script
# requires-python = ">=3.9"
# dependencies = ["pyyaml"]
# ///
"""Check that each file opens with a YAML frontmatter block that parses to a mapping.

Run with uv, which gets PyYAML by itself:

    uv run .claude/skills/_shared/check-frontmatter.py <file>...

Plain `python3` also works when PyYAML is installed. Prints `ok N files`,
or one line per broken file and exits with status 1.
"""
import re
import sys

import yaml

FRONTMATTER = re.compile(r"---\n(.*?)^---\n", re.S | re.M)


def problem(path):
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        return f"{path}: {e.strerror}"
    m = FRONTMATTER.match(text)
    if not m:
        return f"{path}: no frontmatter block"
    try:
        data = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        return f"{path}: " + " ".join(str(e).split())
    if not isinstance(data, dict):
        return f"{path}: frontmatter is not a mapping"
    return None


def main(paths):
    if not paths:
        print("usage: check-frontmatter.py <file>...", file=sys.stderr)
        return 2
    problems = [p for p in map(problem, paths) if p]
    for p in problems:
        print(p)
    if problems:
        return 1
    print("ok", len(paths), "files")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
