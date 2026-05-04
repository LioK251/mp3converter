#!/bin/zsh

set -u

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR" || exit 1

export PATH="/opt/homebrew/bin:/usr/local/bin:/opt/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

if [[ -x "$SCRIPT_DIR/.venv/bin/python" ]]; then
  PYTHON="$SCRIPT_DIR/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
else
  echo "Python 3 not found. Install Python 3.10+ and try again."
  read -r "?Press Enter to close..."
  exit 1
fi

echo "MP3 -> MIDI Converter"
echo "Project: $SCRIPT_DIR"
echo "Python:  $PYTHON"
echo

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Warning: ffmpeg was not found in PATH."
  echo "Install it with: brew install ffmpeg"
  echo
fi

if ! command -v transkun >/dev/null 2>&1; then
  echo "Warning: transkun was not found in PATH."
  echo "Conversions may fail until Transkun is installed and available."
  echo
fi

"$PYTHON" "$SCRIPT_DIR/app_gui.py"
EXIT_CODE=$?

echo
echo "App closed with exit code $EXIT_CODE."
read -r "?Press Enter to close..."
exit "$EXIT_CODE"