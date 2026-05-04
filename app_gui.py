import threading
import time
import sys
import os
import webbrowser
import logging

from console_ui import cmd_log, install_pretty_console

install_pretty_console(logging.INFO)
logger = logging.getLogger("audio::window")
WEBVIEW_WARNINGS = []

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import webview
    HAS_WEBVIEW = True
except ImportError as exc:
    HAS_WEBVIEW = False
    WEBVIEW_WARNINGS.append(f"pywebview not installed: {exc}")

from app import app, show_startup_console

server_running = False
server_thread = None


def start_flask_server():
    global server_running
    try:
        app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        cmd_log(logger, "-", "Error starting Flask server: %s", e, level=logging.ERROR)
    finally:
        server_running = False


def wait_for_server(max_wait=10):
    import requests
    url = "http://127.0.0.1:5000/"
    for _ in range(max_wait * 10):
        try:
            response = requests.get(url, timeout=0.1)
            if response.status_code == 200:
                return True
        except Exception:
            time.sleep(0.1)
    return False


def main():
    global server_running, server_thread
    ENABLE_TOPMOST = True
    WINDOW_TITLE = 'MP3 -> MIDI CONVERTER'

    show_startup_console("Desktop window", "127.0.0.1", 5000)
    for warning in WEBVIEW_WARNINGS:
        logger.warning(warning)

    if not HAS_WEBVIEW:
        cmd_log(logger, "-", "pywebview is not installed", level=logging.ERROR)
        cmd_log(logger, "i", "Install it with: pip install pywebview")
        cmd_log(logger, "i", "Falling back to the default browser")
        server_thread = threading.Thread(target=start_flask_server, daemon=True)
        server_thread.start()
        time.sleep(2)
        webbrowser.open("http://127.0.0.1:5000/")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            cmd_log(logger, "i", "Shutting down")
        return

    server_running = True
    server_thread = threading.Thread(target=start_flask_server, daemon=True)
    server_thread.start()

    cmd_log(logger, "i", "Starting Flask server")
    if not wait_for_server():
        cmd_log(logger, "-", "Server failed to start", level=logging.ERROR)
        return

    cmd_log(logger, "+", "Server started; opening window")

    SETTINGS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'settings.json')

    def save_settings(settings_json):
        try:
            with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
                f.write(settings_json)
            return True
        except Exception as e:
            cmd_log(logger, "-", "Error saving settings: %s", e, level=logging.ERROR)
            return False

    def load_settings():
        try:
            if os.path.exists(SETTINGS_FILE):
                with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                    return f.read()
            return None
        except Exception as e:
            cmd_log(logger, "-", "Error loading settings: %s", e, level=logging.ERROR)
            return None

    window = webview.create_window(
        WINDOW_TITLE,
        'http://127.0.0.1:5000/',
        width=1200,
        height=800,
        min_size=(800, 600),
        resizable=True,
        fullscreen=False,
        on_top=ENABLE_TOPMOST,
        text_select=True,
        js_api={
            'save_settings': save_settings,
            'load_settings': load_settings,
        }
    )

    def set_window_topmost():
        if not ENABLE_TOPMOST:
            return

        import platform
        if platform.system() == 'Windows':
            try:
                import win32gui
                import win32con

                def set_topmost_win32():
                    for _ in range(10):
                        hwnd = win32gui.FindWindow(None, WINDOW_TITLE)
                        if hwnd:
                            win32gui.SetWindowPos(
                                hwnd,
                                win32con.HWND_TOPMOST,
                                0, 0, 0, 0,
                                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE
                            )
                            break
                        time.sleep(0.1)

                threading.Timer(0.5, set_topmost_win32).start()
            except ImportError:
                pass

    if ENABLE_TOPMOST:
        set_window_topmost()
        cmd_log(logger, "+", "Topmost window enabled")
    else:
        cmd_log(logger, "i", "Topmost window disabled")

    try:
        webview.start(debug=False)
    except KeyboardInterrupt:
        cmd_log(logger, "i", "Shutting down")
    finally:
        server_running = False


if __name__ == "__main__":
    main()
