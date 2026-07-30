' Fully silent launcher for Windows: no console window, no flash.
' Double-click this file to start the app.
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)

On Error Resume Next
shell.Run """pythonw.exe"" app_gui.py", 0, False
If Err.Number <> 0 Then
    Err.Clear
    ' Fallback: plain python with a hidden window (style 0)
    shell.Run """python.exe"" app_gui.py", 0, False
    If Err.Number <> 0 Then
        MsgBox "Python not found. Install Python 3.10+ and try again.", 16, "MP3 to MIDI Converter"
    End If
End If
