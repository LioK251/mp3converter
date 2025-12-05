# 🎵 Audio Converter Web

A powerful web application for converting MP3 audio files to MIDI format using Transkun, with support for YouTube and TikTok video downloads. The application also includes a QWERTY sheet converter for MIDI files, allowing you to play music directly on your keyboard.

## ✨ Features

- 🎹 **MP3 to MIDI Conversion**: Convert MP3 audio files to MIDI format using Transkun
- 📺 **YouTube & TikTok Support**: Download and convert audio directly from YouTube and TikTok videos
- ⌨️ **QWERTY Sheet Converter**: Convert MIDI files to QWERTY keyboard sheet notation for easy playing
- 🎨 **Modern Web Interface**: Beautiful, responsive UI with real-time progress tracking
- 📜 **Conversion History**: Track all your conversions with thumbnails and metadata
- ⚙️ **Customizable Settings**: Fine-tune QWERTY sheet conversion parameters
- 🚀 **Real-time Progress**: Monitor conversion progress with visual indicators
- 💾 **Download Management**: Easy download of MIDI and sheet files
- 🎯 **Async Processing**: Non-blocking conversions for better user experience

## 📋 Requirements

### System Requirements

- **Python**: 3.8 or higher
- **GPU**: CUDA-capable GPU (recommended for faster conversion, but CPU works too)
- **FFmpeg**: Required for audio processing
- **Transkun**: Must be installed and available in your system PATH

### Python Dependencies

All Python dependencies are listed in `requirements.txt` and will be installed automatically.

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd audioconverter-web
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- PyTorch (for GPU support)
- yt-dlp (for video downloads)
- pretty-midi (for MIDI processing)
- And other required packages

### Step 3: Install Transkun

Ensure Transkun is installed and accessible from your command line:

```bash
transkun --version
```

If not installed, follow the [Transkun installation guide]([https://github.com/your-transkun-repo](https://github.com/Yujia-Yan/Transkun?tab=readme-ov-file)).

### Step 4: Install FFmpeg

FFmpeg is required for audio processing. Install it based on your operating system:

**Windows:**
- Download from [FFmpeg official website](https://ffmpeg.org/download.html)
- Extract and add to your system PATH
- Or use: `choco install ffmpeg` (if using Chocolatey)

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

### Step 5: Verify Installation

Run a quick test to ensure everything is set up correctly:

```bash
python -c "import torch; print('CUDA available:', torch.cuda.is_available())"
transkun --version
ffmpeg -version
```

## 💻 Usage

### Web Interface

#### Option 1: Standard Flask Server

Run the Flask application:

```bash
python app.py
```

The application will start on `http://127.0.0.1:5000`

#### Option 2: GUI Application

For a standalone window application:

```bash
python app_gui.py
```

This opens a native window with the web interface (requires `pywebview`).

### Using the Application

#### 1. 📤 Upload MP3 File

- Click "Choose File" and select an MP3 file from your computer
- Click "Convert MP3" to start the conversion
- Wait for the conversion to complete
- Download your MIDI file

#### 2. 🔗 Convert from YouTube/TikTok

- Paste a YouTube or TikTok URL in the input field
- Click "Convert Link"
- The application will:
  - Download the video audio
  - Convert it to MIDI format
  - Display a preview with thumbnail
  - Provide download links

#### 3. ⌨️ Convert MIDI to QWERTY Sheets

- After converting to MIDI, click "Convert to QWERTY" to view the sheet
- Or click "Download Sheets" to download the text file
- Customize conversion settings using the "Settings" button

### 🎛️ QWERTY Sheet Settings

Access settings via the "Settings" button to customize:

- **Resilience**: Transposition sensitivity (0-12)
- **Note Placement**: Where to place shifted and out-of-range notes
- **Line Breaks**: Manual or automatic line breaking
- **Quantization**: Time threshold for grouping notes (milliseconds)
- **Chord Ordering**: Classic or custom chord ordering
- **Visual Markers**: Tempo marks, out-of-range indicators, BPM changes
- **Auto Transpose**: Automatically transpose to optimal key

## ⚙️ Configuration

### Environment Variables

You can configure the application using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key for sessions | Auto-generated |
| `MAX_CONTENT_LENGTH_MB` | Maximum upload size in MB | 25 |
| `UPLOAD_FOLDER` | Folder for uploaded files | `uploads` |
| `CONVERTED_FOLDER` | Folder for converted files | `converted` |
| `FORCE_HTTPS` | Force HTTPS connections | `false` |

### Example Configuration

```bash
export SECRET_KEY="your-secret-key-here"
export MAX_CONTENT_LENGTH_MB=50
export UPLOAD_FOLDER="/path/to/uploads"
python app.py
```

## 📁 Project Structure

```
audioconverter-web/
├── app.py                 # Main Flask application
├── app_gui.py            # GUI wrapper using pywebview
├── midi_to_sheets.py     # MIDI to QWERTY sheet converter
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html       # Web interface
├── uploads/             # Uploaded files directory
├── converted/           # Converted files directory
├── transkun/           # Transkun transcription module
├── resources/          # Model files and resources
└── history.json        # Conversion history (auto-generated)
```

## 🔌 API Endpoints

The application provides a RESTful API for programmatic access:

### Main Interface
- `GET /` - Main web interface

### Conversion Endpoints
- `POST /api/convert` - Start video conversion (YouTube/TikTok)
  - Request body: `{"media_url": "https://..."}`
  - Returns: `{"task_id": "...", "status": "queued"}`

- `GET /api/status/<task_id>` - Check conversion status
  - Returns: Status, progress, and result information

- `POST /api/stop/<task_id>` - Cancel a running conversion

### Sheet Conversion
- `POST /api/convert-to-sheets` - Convert MIDI to QWERTY sheets
  - Request body: `{"midi_filename": "...", "settings": {...}}`
  - Returns: Sheet text and download URL

### History & Health
- `GET /api/history` - Get conversion history
  - Query params: `limit` (default: 10)

- `GET /api/health` - Health check endpoint

### Example API Usage

```bash
# Start a conversion
curl -X POST http://127.0.0.1:5000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"media_url": "https://www.youtube.com/watch?v=..."}'

# Check status
curl http://127.0.0.1:5000/api/status/<task_id>

# Convert MIDI to sheets
curl -X POST http://127.0.0.1:5000/api/convert-to-sheets \
  -H "Content-Type: application/json" \
  -d '{"midi_filename": "song_transkun.mid", "settings": {}}'
```

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Transkun not found"
- Ensure Transkun is installed and in your system PATH
- Verify with: `transkun --version`
- Check that the executable is accessible from your terminal

#### ❌ "CUDA not available"
- The application works on CPU, but will be slower
- For GPU support, ensure:
  - CUDA-capable GPU is installed
  - PyTorch with CUDA support is installed
  - CUDA drivers are up to date

#### ❌ "FFmpeg not found"
- Install FFmpeg and add it to your system PATH
- Verify with: `ffmpeg -version`

#### ❌ "Conversion timeout"
- Large files may take longer to process
- Check your system resources (CPU/GPU usage)
- Try converting smaller audio segments

#### ❌ "Download failed" (YouTube/TikTok)
- Check your internet connection
- Verify the URL is correct and accessible
- Some videos may have restrictions
- Try using a cookies file (place `cookies.txt` in project root)

### Performance Tips

- 🚀 Use a CUDA-capable GPU for faster conversions
- 💾 Ensure sufficient disk space for uploads and conversions
- 🌐 Stable internet connection for video downloads
- 🔧 Close other resource-intensive applications during conversion

## 🔒 Security Notes

- The application runs on `127.0.0.1` by default (localhost only)
- For production deployment, use proper security measures:
  - Set a strong `SECRET_KEY`
  - Enable HTTPS with `FORCE_HTTPS=true`
  - Configure firewall rules
  - Use a reverse proxy (nginx, Apache)
  - Implement rate limiting (already included)

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Credits

- 🎹 **QWERTY Sheet Converter**: Based on [midi-converter](https://github.com/ArijanJ/midi-converter) by [@ArijanJ](https://github.com/ArijanJ) and [@Albacusphetical](https://github.com/Albacusphetical)
- 🎵 **Transkun**: For audio-to-MIDI transcription
- 🎨 **UI Framework**: Built with Flask, Tailwind CSS, and modern web technologies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

**Made with ❤️ for music enthusiasts**
