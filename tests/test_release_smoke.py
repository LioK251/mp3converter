import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ReleaseSmokeTests(unittest.TestCase):
    def test_required_release_files_exist(self):
        required = (
            "README.md",
            "LICENSE",
            "requirements.txt",
            "app.py",
            "templates/index.html",
            "static/css/style.css",
        )
        for relative_path in required:
            with self.subTest(path=relative_path):
                self.assertTrue((ROOT / relative_path).is_file())

    def test_private_runtime_data_is_ignored(self):
        gitignore = (ROOT / ".gitignore").read_text(encoding="utf-8")
        for pattern in ("cookies.txt", "uploads/", "converted/", "instance/", "soundfonts/"):
            with self.subTest(pattern=pattern):
                self.assertIn(pattern, gitignore)

    def test_template_static_references_exist(self):
        template = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
        expected_assets = (
            "static/css/style.css",
            "static/css/piano-visualizer.css",
            "static/js/conversion.js",
            "static/js/history.js",
            "static/js/piano-visualizer.js",
            "templates/icon.ico",
            "templates/notfound.jpg",
        )
        for relative_path in expected_assets:
            with self.subTest(path=relative_path):
                self.assertTrue((ROOT / relative_path).is_file())
                self.assertIn("/" + relative_path.replace("\\", "/"), template)


if __name__ == "__main__":
    unittest.main()
