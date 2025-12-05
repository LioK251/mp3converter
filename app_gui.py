import threading
import time
import sys
import os
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import webview
    HAS_WEBVIEW = True
except ImportError:
    HAS_WEBVIEW = False
    print("Warning: webview not installed. Install with: pip install pywebview")

from app import app

server_running = False
server_thread = None

def start_flask_server():
    global server_running
    try:
        app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        print(f"Error starting Flask server: {e}")
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
        except:
            time.sleep(0.1)
    return False

def main():
    global server_running, server_thread
    ENABLE_TOPMOST = True
    
    if not HAS_WEBVIEW:
        print("ERROR: pywebview is not installed!")
        print("Please install it with: pip install pywebview")
        print("\nFalling back to opening in default browser...")
        server_thread = threading.Thread(target=start_flask_server, daemon=True)
        server_thread.start()
        time.sleep(2)
        webbrowser.open("http://127.0.0.1:5000/")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down...")
        return
    
    server_running = True
    server_thread = threading.Thread(target=start_flask_server, daemon=True)
    server_thread.start()
    
    print("Starting server...")
    if not wait_for_server():
        print("ERROR: Server failed to start!")
        return
    
    print("Server started! Opening window...")
    
    icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates', 'icon.ico')
    window = webview.create_window(
        'MP3 → MIDI CONVERTER',
        'http://127.0.0.1:5000/',
        width=1200,
        height=800,
        min_size=(800, 600),
        resizable=True,
        fullscreen=False,
        on_top=ENABLE_TOPMOST,
        text_select=True,
        icon=icon_path if os.path.exists(icon_path) else None,
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
                        hwnd = win32gui.FindWindow(None, 'Audio Converter')
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
        print("Topmost window enabled - window will stay on top")
    else:
        print("Topmost window disabled")
    
    try:
        webview.start(debug=False)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        server_running = False

if __name__ == "__main__":
    main()
