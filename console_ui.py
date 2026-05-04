import ctypes
import logging
import os
import shutil
import sys


PINK = "38;2;255;154;221"
PINK_DIM = "38;2;186;114;163"
GREEN = "38;2;93;232;147"
CYAN = "38;2;111;214;255"
YELLOW = "38;2;255;214;102"
RED = "38;2;255;104;104"
DIM = "2"
RESET = "\033[0m"


BANNER = r"""
 ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓███████▓▒░▒▓████████▓▒░▒▓████████▓▒░▒▓███████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓██████▓▒░ ░▒▓███████▓▒░  ░▒▓█▓▒░   ░▒▓██████▓▒░ ░▒▓███████▓▒░  
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
 ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░  ░▒▓██▓▒░  ░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ 
                                                                                                                      
                                                                                                                      
"""


def enable_ansi() -> None:
    if os.name != "nt":
        return

    try:
        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-11)
        mode = ctypes.c_uint()
        if kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
            kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        pass


def use_color(stream=None) -> bool:
    stream = stream or sys.stdout
    if os.environ.get("NO_COLOR"):
        return False
    if os.environ.get("FORCE_COLOR"):
        return True
    return hasattr(stream, "isatty") and stream.isatty()


def paint(text: str, *codes: str, stream=None) -> str:
    if not codes or not use_color(stream):
        return text
    return f"\033[{';'.join(codes)}m{text}{RESET}"


def set_console_title(title: str) -> None:
    try:
        if os.name == "nt":
            ctypes.windll.kernel32.SetConsoleTitleW(title)
        elif use_color():
            sys.stdout.write(f"\033]0;{title}\a")
            sys.stdout.flush()
    except Exception:
        pass


def clear_console() -> None:
    if not use_color():
        return
    os.system("cls" if os.name == "nt" else "clear")


def print_banner(subtitle: str = "", clear: bool = True) -> None:
    enable_ansi()
    if clear and os.environ.get("AUDIO_CONSOLE_CLEAR", "1") != "0":
        clear_console()

    width = shutil.get_terminal_size((96, 24)).columns
    print()
    for line in BANNER.strip("\n").splitlines():
        print(paint(line.center(width), PINK, "1"))

    if subtitle:
        print(paint(subtitle.center(width), PINK_DIM))
    print(paint(("-" * min(width, 96)).center(width), PINK_DIM))


class PrettyConsoleFormatter(logging.Formatter):
    MARKERS = {
        logging.DEBUG: (".", CYAN),
        logging.INFO: ("+", GREEN),
        logging.WARNING: ("!", YELLOW),
        logging.ERROR: ("-", RED),
        logging.CRITICAL: ("!", RED),
    }

    def format(self, record: logging.LogRecord) -> str:
        default_marker, default_color = self.MARKERS.get(record.levelno, ("i", CYAN))
        marker = getattr(record, "cmd_marker", default_marker)
        marker_color = getattr(record, "cmd_color", default_color)
        scope = getattr(record, "cmd_scope", None) or record.name

        if scope == "__main__":
            scope = "audio::server"
        else:
            scope = scope.replace(".", "::")

        if len(scope) > 32:
            scope = scope[-32:]

        timestamp = self.formatTime(record, "%H:%M:%S")
        message = record.getMessage()
        if record.exc_info:
            message = f"{message}\n{self.formatException(record.exc_info)}"

        prefix = (
            f"{paint(f'[{marker}]', marker_color)} "
            f"[{timestamp}]"
            f"{paint(f'[{scope}]', PINK_DIM)} - "
        )
        return prefix + message


def install_pretty_console(level: int = logging.INFO) -> None:
    enable_ansi()
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [
        handler
        for handler in root.handlers
        if not getattr(handler, "_audio_pretty_console", False)
    ]

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(PrettyConsoleFormatter())
    handler._audio_pretty_console = True
    root.addHandler(handler)


def cmd_log(logger: logging.Logger, marker: str, message: str, *args, level: int = logging.INFO) -> None:
    logger.log(level, message, *args, extra={"cmd_marker": marker})
