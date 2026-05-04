from logging.handlers import RotatingFileHandler
from flask_wtf import CSRFProtect
from flask_wtf.csrf import generate_csrf
from werkzeug.utils import secure_filename, safe_join
import os
import shutil
import subprocess
import webbrowser
import sys
from flask import Flask, request, render_template, send_from_directory, send_file, flash, g, url_for, abort, jsonify
from threading import Timer, Thread, Event
import yt_dlp
import re
import time
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
import torch
import logging
import json
from datetime import datetime
import secrets
import requests
import hashlib
from urllib.parse import urlparse
import uuid
import pretty_midi

from console_ui import cmd_log, install_pretty_console, print_banner, set_console_title

install_pretty_console(logging.INFO)
STARTUP_WARNINGS = []

try:
    from midi_to_sheets import convert_midi_to_sheets
    HAS_MIDI_TO_SHEETS = True
except ImportError as e:
    HAS_MIDI_TO_SHEETS = False
    STARTUP_WARNINGS.append(f"MIDI to sheets converter not available: {e}")

ALLOWED_EXTENSIONS = {
    "mp3", "wav", "flac", "m4a", "aac", "ogg", "opus", "wma",
    "mp4", "webm", "avi", "mov", "mkv", "flv", "wmv", "m4v"
}
ALLOWED_MIDI_EXTENSIONS = {"mid", "midi"}
HISTORY_FILE = "history.json"
SETTINGS_FILE = "settings.json"

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
CONVERTED_FOLDER = os.environ.get("CONVERTED_FOLDER", "converted")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

COMMON_MACOS_BIN_DIRS = (
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/opt/local/bin",
)
if sys.platform == "win32":
    COMMON_FLUIDSYNTH_PATHS = (
        os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"), "FluidSynth", "bin", "fluidsynth.exe"),
        os.path.join(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)"), "FluidSynth", "bin", "fluidsynth.exe"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "FluidSynth", "bin", "fluidsynth.exe"),
        r"C:\tools\fluidsynth\bin\fluidsynth.exe",
    )
else:
    COMMON_FLUIDSYNTH_PATHS = (
        "/opt/homebrew/bin/fluidsynth",
        "/usr/local/bin/fluidsynth",
        "/opt/local/bin/fluidsynth",
        "/Applications/FluidSynth.app/Contents/MacOS/fluidsynth",
    )

def ensure_common_tool_paths():
    path_parts = os.environ.get("PATH", "").split(os.pathsep)
    extra_paths = [
        path for path in COMMON_MACOS_BIN_DIRS
        if os.path.isdir(path) and path not in path_parts
    ]
    if extra_paths:
        os.environ["PATH"] = os.pathsep.join(extra_paths + path_parts)

ensure_common_tool_paths()

def yt_dlp_js_runtime_options() -> dict:
    for runtime in ("deno", "node", "quickjs", "bun"):
        runtime_path = shutil.which(runtime)
        if runtime_path:
            return {"js_runtimes": {runtime: {"path": runtime_path}}}
    return {}

def compact_tool_output(output: str | None, max_lines: int = 6, max_chars: int = 900) -> str:
    if not output:
        return ""

    cleaned_lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in str(output).replace("\r", "\n").splitlines()
    ]
    cleaned_lines = [line for line in cleaned_lines if line]
    if not cleaned_lines:
        return ""

    summary = " | ".join(cleaned_lines[-max_lines:])
    if len(summary) > max_chars:
        return summary[: max_chars - 3] + "..."
    return summary

class YtDlpConsoleLogger:
    def debug(self, message):
        return

    def warning(self, message):
        details = compact_tool_output(message, max_lines=1, max_chars=500)
        if details:
            logger.warning("yt-dlp: %s", details)

    def error(self, message):
        details = compact_tool_output(message, max_lines=2, max_chars=700)
        if details:
            logger.error("yt-dlp: %s", details)

def quiet_yt_dlp_options() -> dict:
    return {
        "quiet": True,
        "no_warnings": False,
        "noprogress": True,
        "logger": YtDlpConsoleLogger(),
    }

ALLOWED_THUMBNAIL_DOMAINS = (
    "ytimg.com",
    "youtube.com",
    "tiktokcdn.com",
    "tiktokcdn-us.com",
    "tiktokcdn-live.com",
)
ALLOWED_THUMBNAIL_CONTENT_TYPES = ("image/jpeg", "image/png", "image/webp")
MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", os.urandom(32))
app.secret_key = app.config["SECRET_KEY"]
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["CONVERTED_FOLDER"] = CONVERTED_FOLDER
app.config.update({
    "SESSION_COOKIE_SECURE": True,
    "SESSION_COOKIE_HTTPONLY": True,
    "SESSION_COOKIE_SAMESITE": "Lax",
})

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

csrf = CSRFProtect(app)
app.jinja_env.globals['csrf_token'] = generate_csrf

from flask_wtf.csrf import validate_csrf as original_validate_csrf

def patched_validate_csrf(data=None, secret_key=None, time_limit=None, token_key=None):
    from flask import request
    if request.path.startswith('/api/') or request.path == '/history.json' or request.method == 'OPTIONS':
        return True
    if data is not None:
        return original_validate_csrf(data, secret_key, time_limit, token_key)
    return original_validate_csrf()

import flask_wtf.csrf
flask_wtf.csrf.validate_csrf = patched_validate_csrf

from flask_wtf.csrf import CSRFError

@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    from flask import request, jsonify
    if request.path.startswith('/api/') or request.path == '/history.json' or request.method == 'OPTIONS':
        return '', 200
    from flask import render_template
    return render_template('index.html', **({'history': prepare_history_for_ui(load_history())} if 'prepare_history_for_ui' in globals() else {})), 400

logger = logging.getLogger("audio::server")
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("werkzeug").setLevel(logging.WARNING)
logging.getLogger("utils.system_info").setLevel(logging.WARNING)

handler = RotatingFileHandler('app.log', maxBytes=5_000_000, backupCount=3)
handler.setLevel(logging.INFO)
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s"))
app.logger.addHandler(handler)
logger.addHandler(handler)

try:
    from flask_talisman import Talisman
except Exception as exc:
    STARTUP_WARNINGS.append(f"Flask-Talisman not active: {exc}")
else:
    force_https = os.environ.get('FORCE_HTTPS', '').strip().lower() in {'1', 'true', 'yes'}
    Talisman(
        app,
        content_security_policy=None,
        force_https=force_https,
        frame_options='DENY',
        strict_transport_security=force_https,
        strict_transport_security_preload=force_https,
        strict_transport_security_max_age=31536000 if force_https else 0,
        referrer_policy='no-referrer',
        session_cookie_secure=force_https,
        session_cookie_http_only=True,
        session_cookie_samesite='Lax',
    )

logger.debug("PyTorch CUDA available: %s", torch.cuda.is_available())

def torch_mps_available() -> bool:
    try:
        return hasattr(torch.backends, "mps") and torch.backends.mps.is_available()
    except Exception:
        return False

def resolve_transkun_device(device=None) -> str:
    if device is None or device in {"", "auto", "gpu"}:
        if torch.cuda.is_available():
            return "cuda"
        if torch_mps_available():
            return "mps"
        return "cpu"
    if device == "cuda" and not torch.cuda.is_available():
        return "cpu"
    if device == "mps" and not torch_mps_available():
        return "cpu"
    if device not in {"cpu", "cuda", "mps"}:
        return resolve_transkun_device(None)
    return device

def ensure_history_file():
    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)

def load_history(max_items: int | None = None):
    ensure_history_file()
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                return []
            if max_items:
                return list(reversed(data[-max_items:]))
            return list(reversed(data))
    except Exception:
        return []

def append_history(entry: dict):
    ensure_history_file()
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                data = []
    except Exception:
        data = []

    data.append(entry)
    if len(data) > 200:
        data = data[-200:]

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def human_dt(ts: float) -> str:
    try:
        return datetime.fromtimestamp(ts).strftime("%d.%m.%Y %H:%M")
    except Exception:
        return "—"

def prepare_history_for_ui(items: list[dict]):
    prepared = []
    for it in items:
        prepared.append({
            "timestamp": it.get("timestamp"),
            "time_str": human_dt(it.get("timestamp", time.time())),
            "type": it.get("type"),
            "youtube_url": it.get("youtube_url"),
            "tiktok_url": it.get("tiktok_url"),
            "discord_url": it.get("discord_url"),
            "thumbnail_url": it.get("thumbnail_url"),
            "video_id": it.get("video_id"),
            "video_title": it.get("video_title"),
            "mp3_name": it.get("mp3_name"),
            "midi_name": it.get("midi_name"),
            "library": it.get("library"),
            "conversion_time": it.get("conversion_time"),
        })
    return prepared

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "_", name)

def get_unique_filepath(filepath: str) -> str:
    if not os.path.exists(filepath):
        return filepath
    base, ext = os.path.splitext(filepath)
    i = 1
    while True:
        candidate = f"{base}_{i}{ext}"
        if not os.path.exists(candidate):
            return candidate
        i += 1

def is_valid_youtube_url(url: str) -> bool:
    pattern = (
        r'(https?://)?(www\.)?'
        r'(youtube|youtu|youtube\-nocookie)\.(com|be)/'
        r'(watch\?v=|embed/|v/|.+\?v=)?([^\s&]+)'
    )
    return re.match(pattern, url) is not None

def is_valid_tiktok_url(url: str) -> bool:
    pattern = re.compile(
        r'^(https?://)?(www\.)?(m\.)?(tiktok\.com/|vt\.tiktok\.com/|vm\.tiktok\.com/)',
        re.IGNORECASE
    )
    return bool(pattern.search(url))

def is_valid_discord_url(url: str) -> bool:
    pattern = re.compile(
        r'^https?://(cdn|media)\.discordapp\.(com|net)/attachments/',
        re.IGNORECASE
    )
    return bool(pattern.search(url))

def detect_source(url: str) -> str | None:
    if is_valid_youtube_url(url):
        return 'youtube'
    if is_valid_tiktok_url(url):
        return 'tiktok'
    if is_valid_discord_url(url):
        return 'discord'
    return None

def is_allowed_thumbnail_url(url: str) -> bool:
    if not url:
        return False
    parsed = urlparse(url)
    if parsed.scheme not in ('http', 'https'):
        return False
    hostname = parsed.hostname or ''
    return any(
        hostname == domain or hostname.endswith(f'.{domain}')
        for domain in ALLOWED_THUMBNAIL_DOMAINS
    )



def save_thumbnail_locally(url: str, prefix: str = 'thumb') -> str | None:
    if not is_allowed_thumbnail_url(url):
        return None

    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        )
    }

    content_type = ''
    try:
        with requests.get(url, headers=headers, timeout=8, allow_redirects=True, stream=True) as response:
            if response.status_code != 200:
                return None

            content_type = (response.headers.get('Content-Type') or '').split(';')[0].lower()
            if content_type not in ALLOWED_THUMBNAIL_CONTENT_TYPES:
                return None

            data = bytearray()
            for chunk in response.iter_content(8192):
                if not chunk:
                    continue
                data.extend(chunk)
                if len(data) > MAX_THUMBNAIL_BYTES:
                    return None

            if not data:
                return None

            blob = bytes(data)
    except requests.RequestException as exc:
        logger.warning('Failed to fetch thumbnail: %s', exc)
        return None
    except Exception as exc:
        logger.warning('Unexpected error fetching thumbnail: %s', exc)
        return None

    blob_sha = hashlib.sha256(blob).hexdigest()
    uploads_dir = app.config['UPLOAD_FOLDER']
    os.makedirs(uploads_dir, exist_ok=True)

    try:
        for name in os.listdir(uploads_dir):
            candidate = os.path.join(uploads_dir, name)
            if not os.path.isfile(candidate):
                continue
            if os.path.splitext(name)[1].lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
                continue
            with open(candidate, 'rb') as existing:
                if hashlib.sha256(existing.read()).hexdigest() == blob_sha:
                    try:
                        return url_for('serve_upload', filename=name)
                    except Exception:
                        return f"/uploads/{name}"
    except Exception as exc:
        logger.warning('Failed to deduplicate thumbnail: %s', exc)

    ext_map = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
    }
    ext = ext_map.get(content_type, '.jpg')
    filename = f"{prefix}_{blob_sha[:16]}{ext}"
    destination = os.path.join(uploads_dir, filename)

    try:
        if not os.path.exists(destination):
            with open(destination, 'wb') as handle:
                handle.write(blob)
        try:
            return url_for('serve_upload', filename=filename)
        except Exception:
            return f"/uploads/{filename}"
    except Exception as exc:
        logger.warning('Failed to store thumbnail: %s', exc)
        return None


def _resolve_safe_path(base_dir: str, filename: str, allowed_exts: set[str]) -> str:
    if not filename:
        raise ValueError('Missing filename')

    candidate = filename.strip()
    normalized = os.path.normpath(candidate)
    if (
        os.path.isabs(normalized)
        or normalized.startswith('..')
        or normalized.startswith('.\\')
        or normalized.startswith('./')
        or "\\" in normalized
    ):
        raise ValueError('Invalid path requested')

    _, ext = os.path.splitext(normalized)
    if ext.lower() not in allowed_exts:
        raise ValueError('Disallowed file extension')

    safe_path = safe_join(base_dir, normalized)
    if not safe_path:
        raise ValueError('Unsafe path join')

    real_base = os.path.realpath(base_dir)
    real_path = os.path.realpath(safe_path)
    if not real_path.startswith(real_base):
        raise ValueError('Path traversal attempt')

    if not os.path.isfile(real_path):
        raise FileNotFoundError(normalized)

    return os.path.relpath(real_path, real_base)

def allowed_download(filename: str) -> bool:
    try:
        _resolve_safe_path(
            app.config['CONVERTED_FOLDER'],
            filename,
            {'.mid', '.midi', '.mp3', '.wav'},
        )
        return True
    except (ValueError, FileNotFoundError):
        return False

def download_mp3_from_youtube(youtube_url: str, output_dir: str,
                              custom_name: str | None = None,
                              cookiefile: str | None = None) -> tuple[str, str, str]:
    if not is_valid_youtube_url(youtube_url):
        raise ValueError("Invalid YouTube URL")

    outtmpl = os.path.join(output_dir, '%(title)s.%(ext)s')
    
    format_selectors = [
        'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio[ext=opus]/bestaudio[ext!=mhtml]/best[ext!=mhtml]',
        'bestaudio[ext!=mhtml]/best[ext!=mhtml]',
        'bestaudio/best',
    ]
    
    info_dict = None
    prepared = None
    original_ext = None
    
    for format_selector in format_selectors:
        ydl_opts: dict = {
            'format': format_selector,
            'outtmpl': outtmpl,
            'restrictfilenames': True,
            'noplaylist': True,
            'ignoreerrors': True,
            'writesubtitles': False,
            'remote_components': ['ejs:github'],
            'extractor_args': {
                'youtube': {
                    'player_client': ['default'],
                    'webpage_client': ['web_safari'],
                },
            },
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }],
        }
        ydl_opts.update(quiet_yt_dlp_options())
        ydl_opts.update(yt_dlp_js_runtime_options())

        if cookiefile:
            ydl_opts['cookiefile'] = cookiefile

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(youtube_url, download=True)
                if info_dict is None:
                    continue
                prepared = ydl.prepare_filename(info_dict)
                original_ext = info_dict.get('ext', '').lower()
                
                if original_ext == 'mhtml':
                    logger.warning(f"Format selector '{format_selector}' resulted in MHTML, trying next...")
                    continue
                
                break
        except Exception as e:
            logger.debug(f"Format selector '{format_selector}' failed: {e}")
            continue
    
    if info_dict is None:
        raise ValueError('Download failed: Could not find a suitable format for this video. The video may have restrictions or be unavailable.')
    
    if original_ext == 'mhtml':
        raise ValueError('Video downloaded as MHTML format (web archive). This video may have restrictions or audio is not available. Please try a different video.')
    
    src_mp3 = os.path.splitext(prepared)[0] + '.mp3'

    if not os.path.exists(src_mp3):
        original_file = os.path.splitext(prepared)[0] + '.' + original_ext
        if os.path.exists(original_file) and original_ext not in ['mp3', 'mhtml']:
            logger.warning(f"MP3 postprocessing may have failed. Attempting manual conversion from {original_file}")
            try:
                ffmpeg_cmd = [
                    'ffmpeg', '-i', original_file,
                    '-vn', '-acodec', 'libmp3lame', '-ab', '320k',
                    '-ar', '44100', '-y', src_mp3
                ]
                result = subprocess.run(ffmpeg_cmd, capture_output=True, timeout=300)
                if result.returncode == 0 and os.path.exists(src_mp3):
                    try:
                        os.remove(original_file)
                    except OSError:
                        pass
                else:
                    error_msg = result.stderr.decode('utf-8', errors='ignore') if result.stderr else 'Unknown error'
                    raise FileNotFoundError(f'FFmpeg conversion failed: {error_msg}')
            except FileNotFoundError:
                raise FileNotFoundError('FFmpeg not found. Please install FFmpeg to convert audio.')
            except Exception as e:
                raise FileNotFoundError(f'Failed to convert to MP3: {str(e)}')
        else:
            raise FileNotFoundError(f'MP3 file not found after download. Original format: {original_ext}')

    if custom_name:
        sanitized = sanitize_filename(custom_name)
        target_name = (sanitized or 'video') + '.mp3'
    else:
        title = info_dict.get('title') or 'video'
        sanitized_title = sanitize_filename(title)
        target_name = (sanitized_title or 'video') + '.mp3'

    dest_path = os.path.join(output_dir, target_name)
    dest_path = get_unique_filepath(dest_path)

    shutil.move(src_mp3, dest_path)
    if not os.path.exists(dest_path):
        raise FileNotFoundError('Failed to move MP3 to destination')

    video_title = info_dict.get('title', 'video')
    thumbnail_url = info_dict.get('thumbnail', '')
    return dest_path, video_title, thumbnail_url

def download_mp3_from_tiktok(tiktok_url: str, output_dir: str,
                             custom_name: str | None = None,
                             cookiefile: str | None = None) -> tuple[str, str, str]:
    if not is_valid_tiktok_url(tiktok_url):
        raise ValueError("Invalid TikTok URL")

    outtmpl = os.path.join(output_dir, '%(title)s.%(ext)s')
    
    ydl_opts: dict = {
        'format': 'bestaudio/best',
        'outtmpl': outtmpl,
        'restrictfilenames': True,
        'noplaylist': True,
        'ignoreerrors': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '320',
        }],
    }
    ydl_opts.update(quiet_yt_dlp_options())

    if cookiefile:
        ydl_opts['cookiefile'] = cookiefile

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(tiktok_url, download=True)
        if info_dict is None:
            raise ValueError('Download failed')
        prepared = ydl.prepare_filename(info_dict)
        src_mp3 = os.path.splitext(prepared)[0] + '.mp3'

    if custom_name:
        sanitized = sanitize_filename(custom_name)
        target_name = (sanitized or 'video') + '.mp3'
    else:
        title = info_dict.get('title') or 'video'
        sanitized_title = sanitize_filename(title)
        target_name = (sanitized_title or 'video') + '.mp3'

    dest_path = os.path.join(output_dir, target_name)
    dest_path = get_unique_filepath(dest_path)

    if not os.path.exists(src_mp3):
        raise FileNotFoundError('MP3 file not found after download')

    shutil.move(src_mp3, dest_path)
    if not os.path.exists(dest_path):
        raise FileNotFoundError('Failed to move MP3 to destination')

    video_title = info_dict.get('title', 'video')
    raw_thumb = info_dict.get("thumbnail", "")
    thumbnail_url = save_thumbnail_locally(raw_thumb, "tiktok") if raw_thumb else None
    return dest_path, video_title, thumbnail_url

def download_mp3_from_discord(discord_url: str, output_dir: str,
                              custom_name: str | None = None,
                              cookiefile: str | None = None) -> tuple[str, str, str]:
    if not is_valid_discord_url(discord_url):
        raise ValueError("Invalid Discord URL")

    outtmpl = os.path.join(output_dir, '%(title)s.%(ext)s')
    
    ydl_opts: dict = {
        'format': 'bestaudio/best',
        'outtmpl': outtmpl,
        'restrictfilenames': True,
        'noplaylist': True,
        'ignoreerrors': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '320',
        }],
    }
    ydl_opts.update(quiet_yt_dlp_options())

    if cookiefile:
        ydl_opts['cookiefile'] = cookiefile

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(discord_url, download=True)
        if info_dict is None:
            raise ValueError('Download failed')
        prepared = ydl.prepare_filename(info_dict)
        src_mp3 = os.path.splitext(prepared)[0] + '.mp3'

    if custom_name:
        sanitized = sanitize_filename(custom_name)
        target_name = (sanitized or 'video') + '.mp3'
    else:
        title = info_dict.get('title') or 'discord_audio'
        sanitized_title = sanitize_filename(title)
        target_name = (sanitized_title or 'discord_audio') + '.mp3'

    dest_path = os.path.join(output_dir, target_name)
    dest_path = get_unique_filepath(dest_path)

    if not os.path.exists(src_mp3):
        raise FileNotFoundError('MP3 file not found after download')

    shutil.move(src_mp3, dest_path)
    if not os.path.exists(dest_path):
        raise FileNotFoundError('Failed to move MP3 to destination')

    video_title = info_dict.get('title', 'discord_audio')
    raw_thumb = info_dict.get("thumbnail", "")
    thumbnail_url = save_thumbnail_locally(raw_thumb, "discord") if raw_thumb else None
    return dest_path, video_title, thumbnail_url


def convert_to_mp3(input_path: str, output_path: str) -> str:
    try:
        ffmpeg_cmd = [
            'ffmpeg', '-i', input_path,
            '-vn', '-acodec', 'libmp3lame', '-ab', '320k',
            '-ar', '44100', '-y', output_path
        ]
        result = subprocess.run(ffmpeg_cmd, capture_output=True, timeout=600, text=True)
        if result.returncode != 0:
            error_msg = result.stderr if result.stderr else 'Unknown error'
            raise FileNotFoundError(f'FFmpeg conversion failed: {error_msg}')
        if not os.path.exists(output_path):
            raise FileNotFoundError('MP3 file not created after conversion')
        return output_path
    except FileNotFoundError as e:
        if 'ffmpeg' in str(e).lower():
            raise FileNotFoundError('FFmpeg not found. Please install FFmpeg to convert audio/video.')
        raise
    except subprocess.TimeoutExpired:
        raise TimeoutError('FFmpeg conversion timed out (10 minutes)')
    except Exception as e:
        raise Exception(f'Failed to convert to MP3: {str(e)}')

def convert_to_midi(input_path, output_path, device=None):
    try:
        device = resolve_transkun_device(device)
        cmd_log(
            logger,
            "i",
            "Transkun started: %s -> %s (device: %s)",
            os.path.basename(input_path),
            os.path.basename(output_path),
            device,
        )
        transkun_cmd = shutil.which("transkun")
        if transkun_cmd:
            cmd = [transkun_cmd, input_path, output_path, "--device", device]
        else:
            cmd = [sys.executable, "-m", "transkun.transcribe", input_path, output_path, "--device", device]
        subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
        )
        cmd_log(logger, "+", "Transkun finished: %s", os.path.basename(output_path))
        return "transkun"
    except FileNotFoundError:
        raise FileNotFoundError(
            "Transkun not found. Install it with: python3 -m pip install transkun"
        )
    except subprocess.CalledProcessError as e:
        details = compact_tool_output(e.stderr or e.stdout)
        if details:
            cmd_log(logger, "-", "Transkun failed: %s", details, level=logging.ERROR)
        else:
            cmd_log(logger, "-", "Transkun failed with exit code %s", e.returncode, level=logging.ERROR)
        if e.returncode == 1 and not shutil.which("transkun"):
            raise RuntimeError(
                "Transkun is not installed for this Python. Install it with: python3 -m pip install transkun"
            ) from e
        raise
from functools import lru_cache
from utils.system_info import get_system_info

@lru_cache(maxsize=1)
def get_cached_system_info():
    return get_system_info()

@app.before_request
def set_csp_nonce():
    g.csp_nonce = secrets.token_urlsafe(16)

@app.context_processor
def inject_csp_nonce():
    return {"csp_nonce": g.get("csp_nonce", "")}

@app.context_processor
def inject_system_info():
    return {"system_info": get_cached_system_info()}

@app.route("/", methods=["GET", "POST"])
def upload_file():
    video_id = None
    conversion_time = None
    midi_name = None

    def render_with_history(**kwargs):
        history_ui = prepare_history_for_ui(load_history())
        kwargs.setdefault("history", history_ui)
        return render_template("index.html", **kwargs)

    if request.method == "POST":
        mp3_path = None
        midi_path = None

        if "file" in request.files:
            f = request.files["file"]
            if not f or not f.filename:
                flash("No file selected")
                return render_with_history()

            if not allowed_file(f.filename):
                flash(f"Unsupported file format. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}")
                return render_with_history()

            raw_name = secure_filename(f.filename)
            sanitized_name = sanitize_filename(raw_name)
            _, ext = os.path.splitext(sanitized_name)
            
            original_path = get_unique_filepath(os.path.join(app.config['UPLOAD_FOLDER'], sanitized_name))
            f.save(original_path)

            if not os.path.exists(original_path) or os.path.getsize(original_path) == 0:
                flash("Failed to save file")
                return render_with_history()

            file_ext = ext.lower().lstrip('.')
            needs_conversion = file_ext != 'mp3'
            
            if needs_conversion:
                try:
                    base_name = os.path.splitext(sanitized_name)[0]
                    mp3_path = get_unique_filepath(os.path.join(app.config['UPLOAD_FOLDER'], f"{base_name}.mp3"))
                    convert_to_mp3(original_path, mp3_path)
                    try:
                        os.remove(original_path)
                    except OSError:
                        pass
                except Exception as e:
                    flash(f"Failed to convert to MP3: {str(e)}")
                    try:
                        os.remove(original_path)
                    except OSError:
                        pass
                    return render_with_history()
            else:
                mp3_path = original_path

            base = os.path.splitext(os.path.basename(mp3_path))[0]
            midi_base_value = sanitize_filename(secure_filename(f"{base}_transkun")) or 'conversion'
            midi_name = f"{midi_base_value}.mid"
            midi_path = get_unique_filepath(os.path.join(app.config['CONVERTED_FOLDER'], midi_name))

            device = request.form.get("device", None)
            if device not in ["gpu", "mps", "cuda", "cpu"]:
                device = None
            
            start = time.time()
            try:
                convert_to_midi(mp3_path, midi_path, device)
                conversion_time = round(time.time() - start, 2)

                append_history({
                    "timestamp": time.time(),
                    "type": "upload",
                    "mp3_name": os.path.basename(mp3_path),
                    "youtube_url": None,
                    "tiktok_url": None,
                    "video_id": None,
                    "video_title": None,
                    "midi_name": midi_name,
                    "library": "Transkun",
                    "conversion_time": conversion_time,
                })

            except Exception as e:
                flash(f"Conversion failed: {str(e)}")
                if needs_conversion and os.path.exists(mp3_path):
                    try:
                        os.remove(mp3_path)
                    except OSError:
                        pass

        elif "media_url" in request.form:
            url = request.form["media_url"].strip()
            if not url:
                flash("Please enter a valid YouTube, TikTok, or Discord URL")
                return render_with_history()

            source = detect_source(url)
            if source is None:
                flash("Invalid URL format. Please enter a valid YouTube, TikTok, or Discord URL")
                return render_with_history()

            video_id = None
            video_title = None
            thumbnail_url = ''
            try:
                if source == 'youtube':
                    cookiefile = "cookies.txt" if os.path.exists("cookies.txt") else None
                    m = re.search(r"(?:v=|youtu\.be/|shorts/)([\w-]{11})", url)
                    if m:
                        video_id = m.group(1)
                    mp3_path, video_title, thumbnail_url = download_mp3_from_youtube(
                        youtube_url=url,
                        output_dir=app.config["UPLOAD_FOLDER"],
                        custom_name=None,
                        cookiefile=cookiefile, 
                    )
                elif source == 'tiktok':
                    mp3_path, video_title, thumbnail_url = download_mp3_from_tiktok(
                        tiktok_url=url,
                        output_dir=app.config["UPLOAD_FOLDER"],
                        custom_name=None,
                        cookiefile=None,
                    )
                elif source == 'discord':
                    mp3_path, video_title, thumbnail_url = download_mp3_from_discord(
                        discord_url=url,
                        output_dir=app.config["UPLOAD_FOLDER"],
                        custom_name=None,
                        cookiefile=None,
                    )
                if not os.path.exists(mp3_path) or os.path.getsize(mp3_path) == 0:
                    flash("MP3 file was not downloaded successfully.")
                    return render_with_history()

                midi_name = os.path.splitext(os.path.basename(mp3_path))[0] + "_transkun.mid"
                midi_path = get_unique_filepath(os.path.join(app.config["CONVERTED_FOLDER"], midi_name))

                device = request.form.get("device", None)
                if device not in ["gpu", "mps", "cuda", "cpu"]:
                    device = None
                
                start = time.time()
                try:
                    convert_to_midi(mp3_path, midi_path, device)
                    conversion_time = round(time.time() - start, 2)

                    append_history({
                        "timestamp": time.time(),
                        "type": source,
                        "youtube_url": url if source=='youtube' else None,
                        "tiktok_url": url if source=='tiktok' else None,
                        "discord_url": url if source=='discord' else None,
                        "video_id": video_id,
                        "video_title": video_title,
                        "thumbnail_url": thumbnail_url,
                        "mp3_name": os.path.basename(mp3_path),
                        "midi_name": os.path.basename(midi_path),
                        "library": "Transkun",
                        "conversion_time": conversion_time,
                    })

                except Exception as e:
                    flash(f"Conversion failed: {str(e)}")

            except yt_dlp.DownloadError as e:
                logger.error(f"YouTube/TikTok/Discord download error: {str(e)}")
                flash(f"Download failed: {str(e)}")
            except yt_dlp.utils.ExtractorError as e:
                logger.error(f"Extractor error: {str(e)}")
                flash(f"Error extracting video information: {str(e)}")
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                flash(f"Unexpected error occurred: {str(e)}")

        return render_with_history(
            video_id=video_id,
            conversion_time=conversion_time,
            midi_name=midi_name,
        )

    return render_with_history(
        video_id=video_id,
        conversion_time=conversion_time,
        midi_name=midi_name,
    )

@app.route("/converted/<path:filename>")
def download_file(filename):
    try:
        safe_name = _resolve_safe_path(
            app.config['CONVERTED_FOLDER'],
            filename,
            {'.mid', '.midi', '.mp3', '.wav', '.txt'},
        )
        return send_from_directory(app.config['CONVERTED_FOLDER'], safe_name, as_attachment=True)
    except ValueError:
        abort(400)
    except FileNotFoundError:
        try:
            flash('Requested file not found')
            return render_template(
                'index.html',
                **({'history': prepare_history_for_ui(load_history())}
                   if 'prepare_history_for_ui' in globals() else {})
            ), 404
        except Exception:
            return 'Requested file not found', 404


@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    try:
        safe_name = _resolve_safe_path(
            app.config['UPLOAD_FOLDER'],
            filename,
            {'.jpg', '.jpeg', '.png', '.webp'},
        )
        return send_from_directory(
            app.config['UPLOAD_FOLDER'],
            safe_name,
            as_attachment=False,
        )
    except ValueError:
        abort(400)
    except FileNotFoundError:
        flash('Requested file not found')
        return render_template('index.html', history=prepare_history_for_ui(load_history()))


@app.route("/templates/<path:filename>")
def serve_template_file(filename):
    try:
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico')):
            abort(404)
        
        templates_folder = os.path.join(app.root_path, 'templates')
        return send_from_directory(
            templates_folder,
            filename,
            as_attachment=False
        )
    except FileNotFoundError:
        abort(404)
    except Exception as e:
        logger.error(f"Error serving template file {filename}: {e}")
        abort(404)

@app.route("/wallpapers/<path:filename>")
def serve_wallpaper(filename):
    try:
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov')):
            abort(404)
        
        wallpapers_folder = os.path.join(app.root_path, 'wallpapers')
        return send_from_directory(
            wallpapers_folder,
            filename,
            as_attachment=False
        )
    except FileNotFoundError:
        abort(404)
    except Exception as e:
        logger.error(f"Error serving wallpaper {filename}: {e}")
        abort(404)

SOUNDFONTS_FOLDER = os.path.join(app.root_path, 'soundfonts')
os.makedirs(SOUNDFONTS_FOLDER, exist_ok=True)

@csrf.exempt
@app.route("/api/soundfonts", methods=["GET"])
def api_list_soundfonts():
    """Return a list of .sf2 SoundFont files available in the soundfonts directory."""
    try:
        if not os.path.exists(SOUNDFONTS_FOLDER):
            return jsonify({"soundfonts": []})
        soundfonts = []
        for filename in sorted(os.listdir(SOUNDFONTS_FOLDER)):
            if filename.lower().endswith('.sf2') and os.path.isfile(os.path.join(SOUNDFONTS_FOLDER, filename)):
                file_size = os.path.getsize(os.path.join(SOUNDFONTS_FOLDER, filename))
                soundfonts.append({
                    "filename": filename,
                    "url": f"/soundfonts/{filename}",
                    "size": file_size,
                })
        return jsonify({"soundfonts": soundfonts})
    except Exception as e:
        logger.error(f"Error listing soundfonts: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/soundfonts/<path:filename>")
def serve_soundfont(filename):
    """Serve a SoundFont (.sf2) file from the soundfonts directory."""
    try:
        safe_name = _resolve_safe_path(SOUNDFONTS_FOLDER, filename, {'.sf2'})
        return send_from_directory(
            SOUNDFONTS_FOLDER,
            safe_name,
            as_attachment=False,
        )
    except ValueError:
        abort(400)
    except FileNotFoundError:
        abort(404)
    except Exception as e:
        logger.error(f"Error serving soundfont {filename}: {e}")
        abort(404)

@csrf.exempt
@app.route("/api/midi/<path:filename>")
def api_serve_midi(filename):
    """Serve a MIDI file inline (not as download) for browser-side parsing."""
    try:
        safe_name = _resolve_safe_path(
            app.config['CONVERTED_FOLDER'],
            filename,
            {'.mid', '.midi'},
        )
        return send_from_directory(
            app.config['CONVERTED_FOLDER'],
            safe_name,
            as_attachment=False,
            mimetype='audio/midi',
        )
    except ValueError:
        abort(400)
    except FileNotFoundError:
        abort(404)
    except Exception as e:
        logger.error(f"Error serving MIDI file {filename}: {e}")
        abort(404)


@app.after_request
def add_csp(response):
    if request.path.startswith('/api/') or request.path == '/history.json':
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    nonce = getattr(g, "csp_nonce", "")
    csp = [
        "default-src 'self'",
        "img-src 'self' data: blob: https://img.youtube.com https://*.ytimg.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
        f"script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net 'unsafe-eval' 'wasm-unsafe-eval' 'nonce-{nonce}'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.tiktok.com",
        "connect-src 'self'",
        "media-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ]
    response.headers['Content-Security-Policy'] = '; '.join(csp)
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'DENY')
    response.headers.setdefault('Referrer-Policy', 'no-referrer')
    response.headers.setdefault('Permissions-Policy', "geolocation=(), microphone=(), camera=(), payment=(), usb=()")
    response.headers.setdefault('Cross-Origin-Resource-Policy', 'same-origin')
    response.headers.setdefault('Cross-Origin-Opener-Policy', 'same-origin')
    return response

@csrf.exempt
@app.route("/api/<path:path>", methods=["OPTIONS"])
def api_options(path):
    response = jsonify({})
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

conversion_tasks = {}
task_results = {}
active_threads = {}

def _is_cancelled(task_id: str) -> bool:
    return conversion_tasks.get(task_id, {}).get("status") == "cancelled"

def _cleanup_files(*filepaths: str):
    for filepath in filepaths:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass

def run_conversion_task(task_id: str, url: str, device: str = None):
    with app.app_context():
        try:
            conversion_tasks[task_id] = {"status": "processing", "progress": "Starting download..."}
            
            if _is_cancelled(task_id):
                return
            
            source = detect_source(url)
            if source is None:
                conversion_tasks[task_id] = {"status": "error", "error": "Invalid URL format"}
                return
            cmd_log(logger, "i", "Queued %s conversion (%s)", source, task_id[:8])

            video_id = None
            video_title = None
            thumbnail_url = ''

            conversion_tasks[task_id] = {"status": "processing", "progress": "Downloading video..."}
            
            if _is_cancelled(task_id):
                return
            
            stop_event = Event()
            active_threads[task_id] = stop_event
            
            if source == 'youtube':
                cookiefile = "cookies.txt" if os.path.exists("cookies.txt") else None
                m = re.search(r"(?:v=|youtu\.be/|shorts/)([\w-]{11})", url)
                if m:
                    video_id = m.group(1)
                mp3_path, video_title, thumbnail_url = download_mp3_from_youtube(
                    youtube_url=url,
                    output_dir=app.config["UPLOAD_FOLDER"],
                    custom_name=None,
                    cookiefile=cookiefile,
                )
            elif source == 'tiktok':
                mp3_path, video_title, thumbnail_url = download_mp3_from_tiktok(
                    tiktok_url=url,
                    output_dir=app.config["UPLOAD_FOLDER"],
                    custom_name=None,
                    cookiefile=None,
                )
            elif source == 'discord':
                mp3_path, video_title, thumbnail_url = download_mp3_from_discord(
                    discord_url=url,
                    output_dir=app.config["UPLOAD_FOLDER"],
                    custom_name=None,
                    cookiefile=None,
                )

            if _is_cancelled(task_id):
                _cleanup_files(mp3_path)
                return

            if not os.path.exists(mp3_path) or os.path.getsize(mp3_path) == 0:
                conversion_tasks[task_id] = {"status": "error", "error": "MP3 file was not downloaded successfully"}
                return
            cmd_log(logger, "+", "Audio downloaded: %s", os.path.basename(mp3_path))

            conversion_tasks[task_id] = {"status": "processing", "progress": "Converting to MIDI..."}
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path)
                return
            
            midi_name = os.path.splitext(os.path.basename(mp3_path))[0] + "_transkun.mid"
            midi_path = get_unique_filepath(os.path.join(app.config["CONVERTED_FOLDER"], midi_name))

            start = time.time()
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path)
                return
            
            output_library = convert_to_midi(mp3_path, midi_path, device)
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path, midi_path)
                return

            conversion_time = round(time.time() - start, 2)

            append_history({
                "timestamp": time.time(),
                "type": source,
                "youtube_url": url if source == 'youtube' else None,
                "tiktok_url": url if source == 'tiktok' else None,
                "discord_url": url if source == 'discord' else None,
                "video_id": video_id,
                "video_title": video_title,
                "thumbnail_url": thumbnail_url,
                "mp3_name": os.path.basename(mp3_path),
                "midi_name": os.path.basename(midi_path),
                "library": output_library,
                "conversion_time": conversion_time,
            })

            midi_filename = os.path.basename(midi_path)
            download_url_path = f"/converted/{midi_filename}"
            
            task_results[task_id] = {
                "status": "completed",
                "midi_name": midi_filename,
                "download_url": download_url_path,
                "conversion_time": conversion_time,
                "video_id": video_id,
                "video_title": video_title,
                "thumbnail_url": thumbnail_url,
                "type": source,
                "youtube_url": url if source == 'youtube' else None,
                "tiktok_url": url if source == 'tiktok' else None,
                "discord_url": url if source == 'discord' else None,
                "library": output_library,
                "timestamp": time.time(),
            }
            conversion_tasks[task_id] = {"status": "completed"}
            cmd_log(logger, "+", "MIDI ready: %s (%ss)", midi_filename, conversion_time)
            
            _cleanup_files(mp3_path)
            logger.debug(f"Deleted downloaded MP3 file: {mp3_path}")

        except Exception as e:
            logger.error(f"Conversion task error: {str(e)}")
            if not _is_cancelled(task_id):
                conversion_tasks[task_id] = {"status": "error", "error": str(e)}
            if 'mp3_path' in locals():
                _cleanup_files(mp3_path)
                logger.debug(f"Deleted downloaded MP3 file after error: {mp3_path}")

@csrf.exempt
@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({"status": "ok", "message": "Server is running"})

@csrf.exempt
@app.route("/api/convert", methods=["POST"])
def api_convert():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        url = data.get("media_url", "").strip()

        if not url:
            return jsonify({"error": "No media_url provided"}), 400

        source = detect_source(url)
        if source is None:
            return jsonify({"error": "Invalid URL format. Please enter a valid YouTube, TikTok, or Discord URL"}), 400

        device = data.get("device", None)
        if device not in ["gpu", "mps", "cuda", "cpu"]:
            device = None
        
        task_id = str(uuid.uuid4())
        conversion_tasks[task_id] = {"status": "queued", "progress": "Queued for processing"}
        
        thread = Thread(target=run_conversion_task, args=(task_id, url, device))
        thread.daemon = True
        thread.start()

        return jsonify({"task_id": task_id, "status": "queued"}), 202

    except Exception as e:
        logger.error(f"API convert error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/status/<task_id>", methods=["GET"])
def api_status(task_id):
    if task_id not in conversion_tasks:
        return jsonify({"error": "Task not found"}), 404

    task_status = conversion_tasks.get(task_id, {})
    
    if task_status.get("status") == "completed":
        result = task_results.get(task_id, {})
        return jsonify({
            "status": "completed",
            "midi_name": result.get("midi_name"),
            "download_url": result.get("download_url"),
            "conversion_time": result.get("conversion_time"),
            "video_id": result.get("video_id"),
            "video_title": result.get("video_title"),
            "thumbnail_url": result.get("thumbnail_url"),
            "type": result.get("type"),
            "youtube_url": result.get("youtube_url"),
            "tiktok_url": result.get("tiktok_url"),
            "discord_url": result.get("discord_url"),
            "library": result.get("library"),
            "timestamp": result.get("timestamp"),
        })
    elif task_status.get("status") == "error":
        return jsonify({
            "status": "error",
            "error": task_status.get("error", "Unknown error"),
        })
    elif task_status.get("status") == "cancelled":
        return jsonify({
            "status": "cancelled",
            "error": "Conversion was cancelled by user",
        })
    else:
        return jsonify({
            "status": task_status.get("status", "processing"),
            "progress": task_status.get("progress", "Processing..."),
        })

@csrf.exempt
@app.route("/api/stop/<task_id>", methods=["POST"])
def api_stop(task_id):
    if task_id not in conversion_tasks:
        return jsonify({"error": "Task not found"}), 404
    
    task_status = conversion_tasks.get(task_id, {})
    if task_status.get("status") in ["completed", "error", "cancelled"]:
        return jsonify({"error": "Task is already finished"}), 400
    
    conversion_tasks[task_id] = {"status": "cancelled", "progress": "Cancelled by user"}
    
    return jsonify({"status": "cancelled", "message": "Conversion cancelled"})

@csrf.exempt
@app.route("/api/history", methods=["GET"])
def api_history():
    try:
        limit = request.args.get("limit", type=int, default=10)
        history = load_history(max_items=limit)
        prepared = prepare_history_for_ui(history)
        
        for item in prepared:
            if item.get("midi_name"):
                try:
                    item["download_url"] = url_for('download_file', filename=item["midi_name"])
                except Exception:
                    item["download_url"] = f"/converted/{item['midi_name']}"
        
        return jsonify(prepared)
    except Exception as e:
        logger.error(f"API history error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/history/delete", methods=["POST"])
def api_delete_history():
    try:
        data = request.get_json()
        timestamp = data.get("timestamp")
        
        if timestamp is None:
            return jsonify({"error": "Timestamp is required"}), 400
        
        ensure_history_file()
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
                if not isinstance(history, list):
                    history = []
        except Exception:
            history = []
        
        original_length = len(history)
        timestamp_float = float(timestamp)
        history = [item for item in history if abs(item.get("timestamp", 0) - timestamp_float) > 0.001]
        
        if len(history) == original_length:
            return jsonify({"status": "success", "message": "History item deleted (or not found in file)"}), 200
        
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        
        return jsonify({"status": "success", "message": "History item deleted"})
    except Exception as e:
        logger.error(f"API delete history error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/settings", methods=["GET"])
def api_get_settings():
    try:
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                settings = json.load(f)
                return jsonify(settings)
        else:
            return jsonify({}), 200
    except Exception as e:
        logger.error(f"API get settings error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/settings", methods=["POST"])
def api_save_settings():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({"status": "success", "message": "Settings saved"})
    except Exception as e:
        logger.error(f"API save settings error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/convert-to-sheets", methods=["POST"])
def api_convert_to_sheets():
    try:
        if not HAS_MIDI_TO_SHEETS:
            return jsonify({"error": "MIDI to sheets converter not available"}), 500
        
        data = request.get_json()
        midi_filename = data.get("midi_filename")
        
        if not midi_filename:
            return jsonify({"error": "midi_filename is required"}), 400
        
        midi_path = os.path.join(app.config['CONVERTED_FOLDER'], midi_filename)
        if not os.path.exists(midi_path):
            return jsonify({"error": "MIDI file not found"}), 404
        
        base_name = os.path.splitext(midi_filename)[0]
        sheets_filename = f"{base_name}_sheets.txt"
        sheets_path = os.path.join(app.config['CONVERTED_FOLDER'], sheets_filename)
        
        default_settings = {
            'resilience': 2,
            'place_shifted_notes': 'start',
            'place_out_of_range_notes': 'inorder',
            'break_lines_how': 'manually',
            'break_lines_every': 4,
            'quantize': 35,
            'classic_chord_order': True,
            'sequential_quantizes': False,
            'curly_braces_for_quantized_chords': False,
            'include_out_of_range': True,
            'show_tempo_timing_marks': True,
            'show_out_of_range_text_marks': True,
            'out_of_range_separator': ':',
            'show_bpm_changes_as_comments': True,
            'auto_transpose': True,
        }
        
        user_settings = data.get("settings", {})
        settings = {**default_settings, **user_settings}
        
        _, sheet_text = convert_midi_to_sheets(midi_path, sheets_path, settings)
        
        if sheet_text is None:
            sheet_text = ""
        
        try:
            download_url = url_for('download_file', filename=sheets_filename)
        except Exception:
            download_url = f"/converted/{sheets_filename}"
        
        return jsonify({
            "success": True,
            "sheets_filename": sheets_filename,
            "download_url": download_url,
            "sheet_text": sheet_text
        })
        
    except Exception as e:
        logger.error(f"Convert to sheets error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/upload-midi", methods=["POST"])
def api_upload_midi():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        filename = file.filename
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        if file_ext not in ALLOWED_MIDI_EXTENSIONS:
            return jsonify({"error": f"Invalid file type. Allowed: {', '.join(ALLOWED_MIDI_EXTENSIONS)}"}), 400
        
        secure_name = secure_filename(filename)
        timestamp = int(time.time())
        base_name = os.path.splitext(secure_name)[0]
        midi_filename = f"{base_name}_{timestamp}.mid"
        midi_path = os.path.join(app.config['CONVERTED_FOLDER'], midi_filename)
        
        file.save(midi_path)
        
        return jsonify({
            "success": True,
            "midi_filename": midi_filename,
            "message": "MIDI file uploaded successfully"
        })
    except Exception as e:
        logger.error(f"Upload MIDI error: {str(e)}")
        return jsonify({"error": str(e)}), 500


def run_file_conversion_task(task_id: str, file_path: str, device: str = None):
    with app.app_context():
        try:
            conversion_tasks[task_id] = {"status": "processing", "progress": "Processing file..."}
            cmd_log(logger, "i", "Queued upload conversion (%s): %s", task_id[:8], os.path.basename(file_path))
            
            if _is_cancelled(task_id):
                _cleanup_files(file_path)
                return
            
            _, ext = os.path.splitext(file_path)
            file_ext = ext.lower().lstrip('.')
            
            needs_conversion = file_ext != 'mp3'
            mp3_path = file_path
            
            if needs_conversion:
                conversion_tasks[task_id] = {"status": "processing", "progress": "Converting to MP3..."}
                
                if _is_cancelled(task_id):
                    _cleanup_files(file_path)
                    return
                
                try:
                    base_name = os.path.splitext(os.path.basename(file_path))[0]
                    mp3_path = get_unique_filepath(os.path.join(app.config['UPLOAD_FOLDER'], f"{base_name}.mp3"))
                    convert_to_mp3(file_path, mp3_path)
                    cmd_log(logger, "+", "Audio normalized to MP3: %s", os.path.basename(mp3_path))
                    try:
                        os.remove(file_path)
                    except OSError:
                        pass
                except Exception as e:
                    try:
                        os.remove(file_path)
                    except OSError:
                        pass
                    if not _is_cancelled(task_id):
                        conversion_tasks[task_id] = {"status": "error", "error": f"Failed to convert to MP3: {str(e)}"}
                    return
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path)
                return
            
            conversion_tasks[task_id] = {"status": "processing", "progress": "Converting to MIDI..."}
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path)
                return
            
            base = os.path.splitext(os.path.basename(mp3_path))[0]
            midi_name = f"{base}_transkun.mid"
            midi_path = get_unique_filepath(os.path.join(app.config['CONVERTED_FOLDER'], midi_name))
            
            start = time.time()
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path)
                return
            
            output_library = convert_to_midi(mp3_path, midi_path, device)
            
            if _is_cancelled(task_id):
                _cleanup_files(mp3_path, midi_path)
                return
            
            conversion_time = round(time.time() - start, 2)
            
            append_history({
                "timestamp": time.time(),
                "type": "upload",
                "mp3_name": os.path.basename(mp3_path),
                "youtube_url": None,
                "tiktok_url": None,
                "video_id": None,
                "video_title": None,
                "midi_name": midi_name,
                "library": output_library,
                "conversion_time": conversion_time,
            })
            
            midi_filename = os.path.basename(midi_path)
            download_url_path = f"/converted/{midi_filename}"
            
            task_results[task_id] = {
                "status": "completed",
                "midi_name": midi_filename,
                "download_url": download_url_path,
                "conversion_time": conversion_time,
                "video_id": None,
                "video_title": None,
                "thumbnail_url": None,
                "type": "upload",
                "youtube_url": None,
                "tiktok_url": None,
                "discord_url": None,
                "library": output_library,
                "timestamp": time.time(),
            }
            conversion_tasks[task_id] = {"status": "completed"}
            cmd_log(logger, "+", "MIDI ready: %s (%ss)", midi_filename, conversion_time)
            
            _cleanup_files(mp3_path)
            logger.debug(f"Deleted processed MP3 file: {mp3_path}")
            
        except Exception as e:
            logger.error(f"File conversion task error: {str(e)}")
            if not _is_cancelled(task_id):
                conversion_tasks[task_id] = {"status": "error", "error": str(e)}
            if 'mp3_path' in locals():
                _cleanup_files(mp3_path)
                logger.debug(f"Deleted processed MP3 file after error: {mp3_path}")

@csrf.exempt
@app.route("/api/upload-media", methods=["POST"])
def api_upload_media():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": f"Unsupported file format. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"}), 400
        
        raw_name = secure_filename(file.filename)
        sanitized_name = sanitize_filename(raw_name)
        
        original_path = get_unique_filepath(os.path.join(app.config['UPLOAD_FOLDER'], sanitized_name))
        file.save(original_path)
        
        if not os.path.exists(original_path) or os.path.getsize(original_path) == 0:
            return jsonify({"error": "Failed to save file"}), 500
        
        device = request.form.get("device") if request.form else None
        if device not in ["gpu", "mps", "cuda", "cpu"]:
            device = None
        
        task_id = str(uuid.uuid4())
        conversion_tasks[task_id] = {"status": "queued", "progress": "Queued for processing"}
        
        thread = Thread(target=run_file_conversion_task, args=(task_id, original_path, device))
        thread.daemon = True
        thread.start()
        
        return jsonify({"task_id": task_id, "status": "queued"}), 202
        
    except Exception as e:
        logger.error(f"Upload media error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/midi-files", methods=["GET"])
def api_midi_files():
    """Return unique MIDI files from the converted folder, deduplicated by content hash."""
    try:
        converted_dir = app.config['CONVERTED_FOLDER']
        if not os.path.exists(converted_dir):
            return jsonify({"midi_files": []})

        midi_extensions = ('.mid', '.midi')
        midi_candidates = []

        for filename in os.listdir(converted_dir):
            if filename.lower().endswith(midi_extensions):
                filepath = os.path.join(converted_dir, filename)
                if os.path.isfile(filepath):
                    midi_candidates.append((filename, filepath))

        # Deduplicate by file content hash – keep the newest file per hash
        seen_hashes = {}
        for filename, filepath in midi_candidates:
            try:
                with open(filepath, 'rb') as f:
                    content_hash = hashlib.sha256(f.read()).hexdigest()
                mtime = os.path.getmtime(filepath)
                if content_hash not in seen_hashes or mtime > seen_hashes[content_hash][2]:
                    seen_hashes[content_hash] = (filename, filepath, mtime)
            except Exception:
                continue

        # Build history lookup: midi_name -> history entry (for thumbnails)
        history_data = load_history()
        history_lookup = {}
        for item in history_data:
            midi_name = item.get('midi_name', '')
            if midi_name and midi_name not in history_lookup:
                history_lookup[midi_name] = item

        result = []
        for content_hash, (filename, filepath, mtime) in seen_hashes.items():
            file_size = os.path.getsize(filepath)
            time_str = human_dt(mtime)

            # Try to find thumbnail from history
            hist_entry = history_lookup.get(filename, {})
            thumbnail_url = hist_entry.get('thumbnail_url', '')
            video_title = hist_entry.get('video_title', '')
            video_id = hist_entry.get('video_id', '')
            source_type = hist_entry.get('type', '')
            source_url = ''
            if source_type == 'youtube':
                source_url = hist_entry.get('youtube_url', '')
            elif source_type == 'tiktok':
                source_url = hist_entry.get('tiktok_url', '')
            elif source_type == 'discord':
                source_url = hist_entry.get('discord_url', '')

            # For YouTube, build thumbnail from video_id if not present
            if not thumbnail_url and video_id:
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"

            try:
                download_url = url_for('download_file', filename=filename)
            except Exception:
                download_url = f"/converted/{filename}"

            result.append({
                "filename": filename,
                "download_url": download_url,
                "file_size": file_size,
                "modified_time": mtime,
                "time_str": time_str,
                "thumbnail_url": thumbnail_url or '',
                "video_title": video_title or '',
                "video_id": video_id or '',
                "source_type": source_type or '',
                "source_url": source_url or '',
                "content_hash": content_hash[:16],
            })

        # Sort by modification time, newest first
        result.sort(key=lambda x: x['modified_time'], reverse=True)

        return jsonify({"midi_files": result})
    except Exception as e:
        logger.error(f"Error listing MIDI files: {e}")
        return jsonify({"error": str(e)}), 500

@csrf.exempt
@app.route("/api/wallpapers", methods=["GET"])
def api_list_wallpapers():
    try:
        wallpapers_folder = os.path.join(app.root_path, 'wallpapers')
        if not os.path.exists(wallpapers_folder):
            return jsonify({"wallpapers": []})
        
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov')
        wallpapers = []
        
        for filename in os.listdir(wallpapers_folder):
            if filename.lower().endswith(allowed_extensions):
                file_ext = filename.lower().split('.')[-1]
                is_video = file_ext in ('mp4', 'webm', 'mov')
                wallpapers.append({
                    "filename": filename,
                    "url": f"/wallpapers/{filename}",
                    "type": "video" if is_video else "image"
                })
        
        wallpapers.sort(key=lambda x: x["filename"])
        
        return jsonify({"wallpapers": wallpapers})
    except Exception as e:
        logger.error(f"Error listing wallpapers: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/history.json", methods=["GET"])
def serve_history_json():
    ensure_history_file()
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except Exception as exc:
        logger.error("Failed to read history.json: %s", exc)
        data = []

    response = jsonify(data)
    response.headers['Cache-Control'] = 'no-store, max-age=0'
    return response

def silence_flask_startup_banner():
    try:
        import flask.cli
        flask.cli.show_server_banner = lambda *args, **kwargs: None
    except Exception:
        pass

def show_startup_console(mode: str = "Browser", host: str = "127.0.0.1", port: int = 5000):
    silence_flask_startup_banner()
    set_console_title("MP3 -> MIDI Converter")
    print_banner("MP3 -> MIDI Converter")
    cmd_log(logger, "i", "Mode: %s", mode)
    cmd_log(logger, "i", "Local URL: http://%s:%s/", host, port)
    cmd_log(logger, "i", "Auto device: %s", resolve_transkun_device(None))
    cmd_log(logger, "i", "Stop server: Ctrl+C")
    for warning in STARTUP_WARNINGS:
        logger.warning(warning)

if __name__ == "__main__":
    HOST = '127.0.0.1'
    PORT = 5000
    show_startup_console("Browser", HOST, PORT)

    def open_browser():
        time.sleep(1.5)
        webbrowser.open(f'http://{HOST}:{PORT}/')
    
    Timer(1.5, open_browser).start()
    app.run(host=HOST, port=PORT, debug=False, use_reloader=False)
