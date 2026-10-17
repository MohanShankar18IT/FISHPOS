import os
import sys
import urllib.request
import zipfile
import shutil

NODE_VERSION = "v20.18.0"
NODE_DIR_NAME = f"node-{NODE_VERSION}-win-x64"
ZIP_NAME = f"{NODE_DIR_NAME}.zip"
DOWNLOAD_URL = f"https://nodejs.org/dist/{NODE_VERSION}/{ZIP_NAME}"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NODE_TARGET_DIR = os.path.join(BASE_DIR, "node_bin")

def setup_node():
    print(f"Setting up portable Node.js ({NODE_VERSION}) in: {NODE_TARGET_DIR} ...")
    
    node_exe = os.path.join(NODE_TARGET_DIR, "node.exe")
    npm_cmd = os.path.join(NODE_TARGET_DIR, "npm.cmd")
    
    if os.path.exists(node_exe) and os.path.exists(npm_cmd):
        print(f"[OK] Node.js already setup at: {node_exe}")
        return NODE_TARGET_DIR
    
    zip_path = os.path.join(BASE_DIR, ZIP_NAME)
    if not os.path.exists(zip_path):
        print(f"Downloading {DOWNLOAD_URL} ...")
        urllib.request.urlretrieve(DOWNLOAD_URL, zip_path)
        print("[OK] Download complete.")

    print(f"Extracting {zip_path} ...")
    temp_extract = os.path.join(BASE_DIR, "temp_node")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract)
    
    extracted_folder = os.path.join(temp_extract, NODE_DIR_NAME)
    if os.path.exists(NODE_TARGET_DIR):
        shutil.rmtree(NODE_TARGET_DIR)
    shutil.move(extracted_folder, NODE_TARGET_DIR)
    
    # Cleanup
    if os.path.exists(temp_extract):
        shutil.rmtree(temp_extract)
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print(f"[OK] Portable Node.js & npm installed successfully to: {NODE_TARGET_DIR}")
    return NODE_TARGET_DIR

if __name__ == "__main__":
    setup_node()
