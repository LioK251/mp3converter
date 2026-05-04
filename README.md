# MP3 to MIDI Converter

Flask web application for converting local media files and media links into MIDI with Transkun. The app also includes a browser MIDI library, QWERTY sheet conversion, a SoundFont piano visualizer, conversion history, drag-and-drop upload, and a configurable UI theme/background system.

## Current Features

- Convert uploaded audio/video files to MIDI through Transkun.
- Convert YouTube, TikTok, and Discord CDN links to MP3 with `yt-dlp`, then to MIDI.
- Upload existing `.mid`/`.midi` files directly into the MIDI library.
- Drag and drop or paste supported files anywhere on the page.
- Track asynchronous conversions with progress polling and stop/cancel controls.
- Browse recent conversions and the full MIDI library.
- Deduplicate MIDI library entries by file content hash.
- Download generated MIDI files and generated QWERTY sheet text files.
- Convert MIDI to Virtual Piano/QWERTY sheets with configurable quantization, transpose, out-of-range, chord, tempo-mark, and line-break settings.
- Preview QWERTY sheets in a modal with copy, fullscreen, Auto/Multi transpose mode, and colored separators.
- Visualize MIDI playback with an 88-key piano-roll canvas, SoundFont playback, seek, play/pause/stop, and volume controls.
- Customize backgrounds, wallpaper/video wallpaper opacity, button/card/modal/history colors, badges, inputs, and theme colors.
- Run in a browser or in an optional `pywebview` desktop window.

## Requirements

- Python 3.10 recommended.
- FFmpeg available on `PATH` for audio/video normalization and downloads.
- Transkun installed in the active Python environment or available as a `transkun` command.
- PyTorch installed for your hardware. CPU works; CUDA or MPS can be used when available.
- Optional: Node, Deno, QuickJS, or Bun can help `yt-dlp` handle pages that require JavaScript.
- Optional desktop mode: `pywebview`; Windows topmost-window support also uses `pywin32`.

Browser runtime dependencies are loaded from CDNs in `templates/index.html`:

- Tailwind CDN
- `@tonejs/midi`
- `js-synthesizer`

## Setup

Create and activate a virtual environment:

```powershell
cd C:\Script\audioconverter-web
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

For GPU acceleration, install a PyTorch build that matches your GPU before or after the project dependencies. Keep `torch`, `torchvision`, and `torchaudio` from the same index.

CUDA example:

```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

RTX 50-series nightly CUDA example:

```powershell
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu129
```

Verify external tools:

```powershell
ffmpeg -version
transkun --version
python -c "import torch; print('CUDA:', torch.cuda.is_available())"
```

## Running

Browser mode:

```powershell
python app.py
```

The server listens on:

```text
http://127.0.0.1:5000/
```

Desktop window mode:

```powershell
python app_gui.py
```

Windows shortcuts:

```powershell
.\run.bat
.\run_app.bat
```

`run.bat` starts browser mode. `run_app.bat` starts desktop window mode.

## Usage

1. Open the app.
2. Choose GPU/auto mode or CPU mode with the device toggle.
3. Upload a supported local media file or paste a YouTube/TikTok/Discord URL.
4. Start conversion and wait for the progress bar to finish.
5. Download the MIDI, visualize it, convert it to QWERTY, or download sheet text.
6. Use the History tab to search previous conversions and imported MIDI files.

You can also drag/drop or paste files into the page:

- Audio/video files start an MP3 normalization and Transkun conversion task.
- MIDI files are imported directly, then opened in the QWERTY sheet viewer.

## Supported Files

Media upload extensions:

```text
mp3, wav, flac, m4a, aac, ogg, opus, wma,
mp4, webm, avi, mov, mkv, flv, wmv, m4v
```

MIDI upload extensions:

```text
mid, midi
```

## SoundFonts

The piano visualizer uses `.sf2` SoundFont files from:

```text
soundfonts/
```

Place at least one `.sf2` file there. The app exposes them through `/api/soundfonts` and `/soundfonts/<filename>`. Large SoundFont files are ignored by git via `soundfonts/*.sf2`.

## Wallpapers

Custom UI backgrounds are loaded from:

```text
wallpapers/
```

Supported wallpaper extensions:

```text
jpg, jpeg, png, webp, gif, mp4, webm, mov
```

The Settings modal can select a wallpaper, adjust opacity, and generate matching colors from the selected background.

## Settings and Data Files

Runtime files and folders:

- `uploads/` - temporary and downloaded media files.
- `converted/` - generated MIDI files and generated sheet `.txt` files.
- `history.json` - conversion history.
- `settings.json` - persisted sheet, background, and theme settings.
- `cookies.txt` - optional YouTube cookies for restricted downloads.
- `app.log` - rotating Flask application log.
- `soundfonts/` - local `.sf2` files for the visualizer.
- `wallpapers/` - local image/video backgrounds.

Most runtime data is intentionally ignored in `.gitignore`.

## Configuration

Environment variables:

- `SECRET_KEY` - Flask secret key. Defaults to a random value per process.
- `UPLOAD_FOLDER` - upload directory. Default: `uploads`.
- `CONVERTED_FOLDER` - output directory. Default: `converted`.
- `FORCE_HTTPS` - enable HTTPS-focused Talisman headers and secure cookies when set to `1`, `true`, or `yes`.
- `NO_COLOR` - disable colored console output.
- `FORCE_COLOR` - force colored console output.
- `AUDIO_CONSOLE_CLEAR=0` - prevent the console banner from clearing the terminal.

Device resolution values:

- omitted, `null`, `gpu`, or `auto` - resolve to CUDA, MPS, or CPU.
- `cuda` - use CUDA when available, otherwise CPU.
- `mps` - use Apple MPS when available, otherwise CPU.
- `cpu` - force CPU.

## API

Health and conversion:

- `GET /api/health`
- `POST /api/convert` with JSON `{"media_url": "...", "device": "gpu|cuda|mps|cpu|null"}`
- `POST /api/upload-media` with multipart `file` and optional `device`
- `GET /api/status/<task_id>`
- `POST /api/stop/<task_id>`

History and library:

- `GET /api/history?limit=32`
- `POST /api/history/delete` with JSON `{"timestamp": 1234567890.0}`
- `GET /api/midi-files`
- `GET /history.json`

Settings:

- `GET /api/settings`
- `POST /api/settings` with the complete settings JSON payload

MIDI, sheets, SoundFonts, and wallpapers:

- `POST /api/upload-midi` with multipart `file`
- `GET /api/midi/<filename>`
- `POST /api/convert-to-sheets` with JSON `{"midi_filename": "...", "settings": {...}}`
- `GET /api/soundfonts`
- `GET /soundfonts/<filename>`
- `GET /api/wallpapers`
- `GET /wallpapers/<filename>`

Downloads and static served files:

- `GET /converted/<filename>`
- `GET /uploads/<filename>` for locally saved thumbnail images
- `GET /templates/<filename>`

## Frontend Structure

- `templates/index.html` - main Flask template and modal markup.
- `static/css/style.css` - app layout, theme variables, cards, history, and general UI.
- `static/css/piano-visualizer.css` - visualizer modal and transport controls.
- `static/js/conversion.js` - async conversion flow, polling, stop controls, drag/drop, paste, and action dispatch.
- `static/js/history.js` - recent/full history loading, search, display, and deletion.
- `static/js/midis.js` - MIDI library card rendering.
- `static/js/piano-visualizer.js` - SoundFont piano-roll playback and canvas renderer.
- `static/js/settings.js` - sheet settings, theme/background settings, wallpaper loading, color matching, and persistence.
- `static/js/sheets-viewer.js` - QWERTY sheet modal, copy, fullscreen, and transpose mode.
- `static/js/sheets-utils.js` - sheet coloring helpers.
- `static/js/device.js` - device toggle persistence.
- `static/js/modal.js` - reusable alert/confirm modal.
- `static/js/ui.js` - tab switching.

## Backend Structure

- `app.py` - Flask app, routes, conversion tasks, downloads, history, settings, security headers, and startup console.
- `app_gui.py` - optional `pywebview` desktop wrapper around the Flask app.
- `midi_to_sheets.py` - MIDI to Virtual Piano/QWERTY sheet converter.
- `console_ui.py` - formatted startup and logging output.
- `utils/system_info.py` - system info shown in the UI.

## Security Notes

- Flask-WTF CSRF is enabled for normal form routes.
- JSON and upload API routes are CSRF-exempt to support the JavaScript frontend.
- Served files are constrained through safe path resolution and extension allowlists.
- Talisman and the custom `after_request` handler add security headers and CSP.
- Thumbnail downloads are restricted by domain, content type, and size.

## Troubleshooting

`Transkun not found`

Install it in the same Python environment:

```powershell
pip install transkun
```

`FFmpeg not found`

Install FFmpeg and ensure `ffmpeg` is available on `PATH`.

`CUDA is not used`

Verify your PyTorch CUDA build:

```powershell
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
```

The app falls back to CPU if CUDA or MPS is unavailable.

`YouTube/TikTok download fails`

Update `yt-dlp`, install a JavaScript runtime such as Node or Deno, and add a fresh `cookies.txt` when the source requires logged-in cookies.

`Visualizer has no instrument sound`

Add an `.sf2` file to `soundfonts/`, restart or refresh the page, and select it in the visualizer.

`Port 5000 is already in use`

Stop the existing Flask/Python process using port 5000 before starting `app.py` or `app_gui.py`.

## Credits

- Transkun for audio-to-MIDI transcription.
- `yt-dlp` for media downloads.
- `pretty_midi` for MIDI parsing on the Python side.
- `@tonejs/midi` and `js-synthesizer` for browser MIDI parsing and SoundFont playback.
- QWERTY sheet converter logic based on the Virtual Piano/midi-converter approach by ArijanJ and Albacusphetical.
