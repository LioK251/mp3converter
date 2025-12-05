import os
import platform
import subprocess
import re
import logging
import torch

logger = logging.getLogger(__name__)

def is_valid_cpu_name(cpu_string):
    if not cpu_string or cpu_string == "Unknown":
        return False
    generic_patterns = ["Family", "Model", "Stepping", "AuthenticAMD", "GenuineIntel", "AMD64", "x86_64"]
    return not any(pattern in cpu_string for pattern in generic_patterns)

def get_system_info():
    try:
        try:
            if platform.system() == "Windows":
                username = os.environ.get('USERNAME', os.environ.get('USER', ''))
                hostname = platform.node()
                if username and hostname:
                    host_name = f"{username}@{hostname}"
                elif username:
                    host_name = username
                else:
                    host_name = hostname
            else:
                username = os.environ.get('USER', os.environ.get('USERNAME', ''))
                hostname = platform.node()
                if username and hostname:
                    host_name = f"{username}@{hostname}"
                elif username:
                    host_name = username
                else:
                    host_name = hostname
        except:
            host_name = platform.node()
        
        cpu_info = None
        try:
            if platform.system() == "Windows":
                try:
                    import winreg
                    key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
                    cpu_info = winreg.QueryValueEx(key, "ProcessorNameString")[0].strip()
                    winreg.CloseKey(key)
                    if is_valid_cpu_name(cpu_info):
                        logger.info(f"CPU detected via Registry: {cpu_info}")
                    else:
                        logger.debug(f"Registry returned invalid CPU name: {cpu_info}")
                        cpu_info = None
                except Exception as e:
                    logger.debug(f"Registry method failed: {e}")
                
                if not is_valid_cpu_name(cpu_info):
                    try:
                        result = subprocess.run(
                            "wmic cpu get name",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        if result.returncode == 0 and result.stdout:
                            lines = [line.strip() for line in result.stdout.strip().split("\n") 
                                   if line.strip() and line.strip().upper() not in ["NAME", ""]]
                            if lines and lines[0] and is_valid_cpu_name(lines[0]):
                                cpu_info = lines[0]
                                logger.info(f"CPU detected via wmic (shell): {cpu_info}")
                    except Exception as e:
                        logger.debug(f"wmic (shell) failed: {e}")
                
                if not is_valid_cpu_name(cpu_info):
                    try:
                        result = subprocess.run(
                            ["wmic", "cpu", "get", "name"],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        if result.returncode == 0 and result.stdout:
                            lines = [line.strip() for line in result.stdout.strip().split("\n") 
                                   if line.strip() and line.strip().upper() not in ["NAME", ""]]
                            if lines and lines[0] and is_valid_cpu_name(lines[0]):
                                cpu_info = lines[0]
                                logger.info(f"CPU detected via wmic (list): {cpu_info}")
                    except Exception as e:
                        logger.debug(f"wmic (list) failed: {e}")
                
                if not is_valid_cpu_name(cpu_info):
                    try:
                        ps_cmd = 'powershell -Command "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty Name"'
                        result = subprocess.run(
                            ps_cmd,
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        if result.returncode == 0 and result.stdout.strip():
                            candidate = result.stdout.strip().split('\n')[0].strip()
                            if is_valid_cpu_name(candidate):
                                cpu_info = candidate
                                logger.info(f"CPU detected via PowerShell: {cpu_info}")
                    except Exception as e:
                        logger.debug(f"PowerShell method failed: {e}")
                
                if not is_valid_cpu_name(cpu_info):
                    try:
                        ps_cmd = 'powershell -Command "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name"'
                        result = subprocess.run(
                            ps_cmd,
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        if result.returncode == 0 and result.stdout.strip():
                            candidate = result.stdout.strip().split('\n')[0].strip()
                            if is_valid_cpu_name(candidate):
                                cpu_info = candidate
                                logger.info(f"CPU detected via PowerShell CIM: {cpu_info}")
                    except Exception as e:
                        logger.debug(f"PowerShell CIM method failed: {e}")
                
                if not cpu_info or not is_valid_cpu_name(cpu_info):
                    cpu_info = "Unknown"
                    processor = platform.processor()
                    logger.warning(f"CPU detection failed. All methods exhausted. platform.processor() = {processor}")
            elif platform.system() == "Linux":
                try:
                    with open("/proc/cpuinfo", "r") as f:
                        for line in f:
                            if "model name" in line.lower():
                                cpu_info = line.split(":")[1].strip()
                                break
                except:
                    cpu_info = "Unknown"
            else:
                try:
                    cpu_info = subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"], text=True).strip()
                except:
                    cpu_info = "Unknown"
        except Exception as e:
            logger.warning(f"Error getting CPU info: {e}")
            cpu_info = "Unknown"
        
        gpu_blacklist = ["AMD Radeon(TM) Graphics", "Meta Virtual Monitor"]
        
        def clean_ansi_codes(text):
            ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
            return ansi_escape.sub('', text)
        
        def clean_gpu_name(name):
            name = clean_ansi_codes(name).strip()
            name = re.sub(r'[\uE000-\uF8FF]', '', name)
            name = re.sub(r'[\uF000-\uFFFF]', '', name)
            name = name.strip()
            return name
        
        def is_valid_gpu_name(name):
            if not name or len(name) < 3:
                return False
            name = clean_gpu_name(name)
            if not name or len(name) < 3:
                return False
            name_upper = name.upper()
            for blacklisted in gpu_blacklist:
                if blacklisted.upper() in name_upper or name_upper in blacklisted.upper():
                    return False
            cpu_indicators = ['GHZ', 'MHZ', 'PROCESSOR', 'CORE', 'THREAD', '@', 'RYZEN', 'INTEL CORE', 'I3', 'I5', 'I7', 'I9', 'X3D']
            if any(indicator in name_upper for indicator in cpu_indicators):
                return False
            box_drawing_chars = set(['⣾', '⣿', '⣷', '⢸', '⡜', '⢯', '⡌', '⡻', '⣆', '⢈', '⠻', '⠿', '⢿', '⣦', '⣤', '⣀', '⡁', '⢳', '⢀', '⢻', '⠰', '⢣', '⠉', '⠑', '⠪', '⢙', '⠋', '⠁', '⡇', '⡞', '⡄', '⣧', '⠧', '⢧', '⢢', '⠑', '⠈', '⠘', '⡸', '⣰', '⢟', '⡷', '⠃', '⠎', '⡏', '⡐', '⢹', '⢡', '⢣', '⠔', '⠢', '⡘', '⡀', '⠡', '⢇', '⡆', '⣤', '⠚', '⢂', '⢡', '⢿', '⠄', '⠠', '⠹', '⠻', '⣶', '⣸', '⣏', '⣬', '⣋', '⡼', '⣠', '⢠', '⣼', '⠙', '⡄', '⠁', '⠹', '⠃', '⠙', '⣏', '⣓', '⣉', '⣭', '⣴', '⠋', '⢷', '⠂', '⠐', '⡞', '⣴', '⣾', '⣶', '⣄', '⢆', '⠆', '⠢', '⠲', '⠥', '⣰', '⡟', '⡆', '⠟', '⠫', '⠊', '⢻', '⡿', '⠛', '⢋', '⣀', '⣼', '⢁', '⠨', '⣛', '⠶'])
            if any(char in name for char in box_drawing_chars):
                return False
            non_ascii_ratio = len([c for c in name if ord(c) > 127]) / len(name) if name else 0
            if non_ascii_ratio > 0.2:
                return False
            if name.count(' ') > 10:
                return False
            gpu_keywords = ['NVIDIA', 'GEFORCE', 'RTX', 'GTX', 'AMD', 'RADEON', 'INTEL', 'GRAPHICS', 'VIDEO', 'CONTROLLER', 'DISPLAY']
            if not any(keyword in name_upper for keyword in gpu_keywords):
                return False
            return True
        
        def get_unique_gpus(gpu_list):
            seen = set()
            unique_gpus = []
            for gpu in gpu_list:
                gpu_cleaned = clean_gpu_name(gpu)
                if gpu_cleaned and is_valid_gpu_name(gpu_cleaned):
                    gpu_upper = gpu_cleaned.upper()
                    if gpu_upper not in seen:
                        seen.add(gpu_upper)
                        unique_gpus.append(gpu_cleaned)
            return unique_gpus
        
        def detect_gpu_cuda():
            try:
                if torch.cuda.is_available():
                    gpu_count = torch.cuda.device_count()
                    gpu_names = []
                    for i in range(gpu_count):
                        gpu_name = torch.cuda.get_device_name(i)
                        if is_valid_gpu_name(gpu_name):
                            gpu_names.append(gpu_name)
                    return gpu_names
            except Exception as e:
                logger.debug(f"CUDA GPU detection failed: {e}")
            return []
        
        def detect_gpu_nvidia_smi():
            try:
                result = subprocess.run(["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"], 
                                      stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)
                if result.returncode == 0 and result.stdout:
                    gpu_output = result.stdout.decode('utf-8', errors='ignore')
                    gpu_lines = [line.strip() for line in gpu_output.strip().split("\n") if line.strip()]
                    return get_unique_gpus(gpu_lines)
            except Exception as e:
                logger.debug(f"nvidia-smi GPU detection failed: {e}")
            return []
        
        def detect_gpu_powershell_wmi():
            try:
                ps_cmd = 'powershell -NoProfile -Command "Get-WmiObject Win32_VideoController | Select-Object -ExpandProperty Name"'
                result = subprocess.run(ps_cmd, shell=True, capture_output=True, text=True, timeout=5, 
                                      encoding='utf-8', errors='ignore', cwd=os.getcwd())
                if result.returncode == 0 and result.stdout and result.stdout.strip():
                    gpu_lines = [line.strip() for line in result.stdout.strip().split("\n") if line.strip()]
                    return get_unique_gpus(gpu_lines)
            except Exception as e:
                logger.debug(f"PowerShell WMI GPU detection failed: {e}")
            return []
        
        def detect_gpu_powershell_cim():
            try:
                ps_cmd = 'powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name"'
                result = subprocess.run(ps_cmd, shell=True, capture_output=True, text=True, timeout=5, 
                                      encoding='utf-8', errors='ignore', cwd=os.getcwd())
                if result.returncode == 0 and result.stdout and result.stdout.strip():
                    gpu_lines = [line.strip() for line in result.stdout.strip().split("\n") if line.strip()]
                    return get_unique_gpus(gpu_lines)
            except Exception as e:
                logger.debug(f"PowerShell CIM GPU detection failed: {e}")
            return []
        
        def detect_gpu_wmic():
            try:
                result = subprocess.run(["wmic", "path", "win32_VideoController", "get", "name"], 
                                      stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5, cwd=os.getcwd())
                if result.returncode == 0 and result.stdout:
                    gpu_output = result.stdout.decode('utf-8', errors='ignore')
                    gpu_lines = [line.strip() for line in gpu_output.strip().split("\n")[1:] 
                               if line.strip() and line.strip().upper() != "NAME"]
                    return get_unique_gpus(gpu_lines)
            except Exception as e:
                logger.debug(f"wmic GPU detection failed: {e}")
            return []
        
        def detect_gpu_lspci():
            try:
                result = subprocess.run(["lspci"], capture_output=True, text=True, stderr=subprocess.DEVNULL, timeout=5)
                if result.returncode == 0:
                    gpu_output = result.stdout
                    gpu_list = []
                    for line in gpu_output.split("\n"):
                        if "VGA" in line or "3D" in line or "Display" in line:
                            gpu_name = line.split(":")[-1].strip()
                            if gpu_name:
                                gpu_list.append(gpu_name)
                    return get_unique_gpus(gpu_list)
            except Exception as e:
                logger.debug(f"lspci GPU detection failed: {e}")
            return []
        
        def detect_gpu_system_profiler():
            try:
                result = subprocess.run(["system_profiler", "SPDisplaysDataType"], 
                                      capture_output=True, text=True, stderr=subprocess.DEVNULL, timeout=5)
                if result.returncode == 0:
                    gpu_output = result.stdout
                    gpu_list = []
                    for line in gpu_output.split("\n"):
                        if "Chipset Model" in line:
                            gpu_name = line.split(":")[1].strip()
                            if gpu_name:
                                gpu_list.append(gpu_name)
                    return get_unique_gpus(gpu_list)
            except Exception as e:
                logger.debug(f"system_profiler GPU detection failed: {e}")
            return []
        
        gpu_info = "Not available"
        all_detected_gpus = []
        
        detection_methods = []
        if platform.system() == "Windows":
            detection_methods = [
                detect_gpu_cuda,
                detect_gpu_nvidia_smi,
                detect_gpu_powershell_wmi,
                detect_gpu_powershell_cim,
                detect_gpu_wmic,
            ]
        elif platform.system() == "Linux":
            detection_methods = [
                detect_gpu_cuda,
                detect_gpu_nvidia_smi,
                detect_gpu_lspci,
            ]
        else:
            detection_methods = [
                detect_gpu_cuda,
                detect_gpu_nvidia_smi,
                detect_gpu_system_profiler,
            ]
        
        for method in detection_methods:
            try:
                gpus = method()
                if gpus:
                    all_detected_gpus.extend(gpus)
                    seen = set()
                    unique_gpus = []
                    for gpu in all_detected_gpus:
                        gpu_upper = gpu.upper()
                        if gpu_upper not in seen:
                            seen.add(gpu_upper)
                            unique_gpus.append(gpu)
                    all_detected_gpus = unique_gpus
                    if all_detected_gpus:
                        gpu_info = ", ".join(all_detected_gpus[:3])
                        break
            except Exception as e:
                logger.debug(f"GPU detection method {method.__name__} failed: {e}")
                continue
        
        return {
            "host_name": host_name,
            "cpu": cpu_info,
            "gpu": gpu_info,
        }
    except Exception as e:
        logger.error(f"Error getting system info: {str(e)}")
        return {
            "host_name": "Unknown",
            "cpu": "Unknown",
            "gpu": "Unknown",
        }

