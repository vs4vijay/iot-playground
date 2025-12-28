# iot-playground

A firmware playground for IoT Devices like ESP32, Arduino, M5Stack, etc.

## 🔌 Web Flasher - Flash from Browser

**No installation required!** Flash pre-compiled firmware directly from your browser using our web flasher:

🌐 **[https://vs4vijay.github.io/iot-playground/](https://vs4vijay.github.io/iot-playground/)**

### Available Projects

#### M5Stack Cardputer (ESP32-S3)
- **[UserDemo](https://vs4vijay.github.io/iot-playground/flash-userdemo-cardputer.html)** - Official M5Stack Cardputer user demo
- **[M5CardRemote](https://vs4vijay.github.io/iot-playground/flash-m5cardremote.html)** - IR remote control application
- **[GameBoy Emulator](https://vs4vijay.github.io/iot-playground/flash-gameboy.html)** - GameBoy emulator with ROM support
- **[Resistor Calculator](https://vs4vijay.github.io/iot-playground/flash-resistor.html)** - Resistor color code calculator
- **[M5Stick Launcher](https://vs4vijay.github.io/iot-playground/flash-m5launcher.html)** - Application launcher system
- **[Evil Cardputer](https://vs4vijay.github.io/iot-playground/flash-evil-cardputer.html)** - WiFi security testing tool

#### M5StickC Plus2 (ESP32-S3)
- **[UserDemo](https://vs4vijay.github.io/iot-playground/flash-userdemo-stickc.html)** - Official M5StickC Plus2 user demo
- **[OneButton](https://vs4vijay.github.io/iot-playground/flash-onebutton.html)** - OneButton library example
- **[Evil Clock](https://vs4vijay.github.io/iot-playground/flash-evilclock.html)** - WiFi deauth clock

### Requirements
- Chrome or Edge browser (Web Serial API required)
- USB cable to connect your device
- USB/Serial drivers installed (CP210x, CH340, etc.)

### Direct Binary Downloads
Latest compiled binaries are available in the [Releases](https://github.com/vs4vijay/iot-playground/releases/latest) section.

---

## 📦 Development Setup

- Update subomdules using `scripts/update-submodules.sh` script

---

## Platform IO

### Install Platform IO

```shell
pip install platformio
```

### Compile firmware

```bash
pio run
```

---


## Arduino CLI

### Install Arduino CLI

```shell
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
```

### Install Core, Boards, Libraries

```bash
arduino-cli core install m5stack:esp32 --additional-urls "https://m5stack.oss-cn-shenzhen.aliyuncs.com/resource/arduino/package_m5stack_index.json"

arduino-cli core search m5stack
arduino-cli board listall

arduino-cli lib install M5Cardputer M5Unified IRremoteESP8266 ArduinoJson TinyGpsPlus "Adafruit NeoPixel" --log-level warn --verbose
```

## Compile firmware with Arduino CLI

```bash

arduino-cli compile --fqbn m5stack:esp32:m5stack_cardputer -e \
                    --libraries M5Cardputer,IRRemoteESP8266 \
                    --build-property build.partitions=huge_app \
                    --build-property upload.maximum_size=3145728 \
                    ./M5CardRemote.ino

```

### Merge bootloader, partiotion table with app

```bash
esptool.py --chip esp32 merge_bin -o flash_image.bin @flash_args

esptool.py --chip esp32s3 merge_bin --output M5CardRemote.M5Cardputer.bin \
    0x0000 build/m5stack.esp32.m5stack_cardputer/M5CardRemote.ino.bootloader.bin \
    0x8000 build/m5stack.esp32.m5stack_cardputer/M5CardRemote.ino.partitions.bin \
    0x10000 build/m5stack.esp32.m5stack_cardputer/M5CardRemote.ino.bin
```

---

## ESP IDF

### Install ESP IDF

```bash
sudo apt install git wget flex bison gperf python3 python3-pip python3-venv cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0

mkdir ~/esp

git clone -b release/v5.3 --recursive https://github.com/espressif/esp-idf.git --depth 1 ~/esp/esp-idf

cd ~/esp/esp-idf
./install.sh

source ~/esp/esp-idf/export.sh
# OR
. ~/esp/esp-idf/export.sh
```


### Compile firmware with ESP IDF
- cd into the project
```bash
idf.py menuconfig

idf.py build
```


### Merge bootloader, partiotion table with app

```bash
cd build/

esptool.py --chip esp32 merge_bin -o ../firmware.bin --fill-flash-size 4MB @flash_args
```

### Other commands

```bash
idf.py build flash monitor

idf.py menuconfig

idf.py set-target esp32

idf.py add-dependency
```

---

## Rust

### Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Install espup

```bash
cargo install espup
espup install
```

### Compile firmware with Rust

```bash
cd demo_rust
cargo build --release
```

---

## Flash Firmware

### Option 1: Web Flasher (Recommended - No Installation)

Use our browser-based web flasher for the easiest flashing experience:
- **Web Flasher:** [https://vs4vijay.github.io/iot-playground/](https://vs4vijay.github.io/iot-playground/)
- No software installation required
- Works on Chrome/Edge browsers
- One-click flashing for all pre-compiled projects

### Option 2: Command Line (esptool.py)

For manual flashing or custom builds:

```bash
# Install esptool.py
pip install -U esptool

# Flash firmware
esptool.py write_flash 0x0 firmware.bin
```

## QEMU Emulation

```bash
# Install pre-requisites
sudo apt install -y libgcrypt20 libglib2.0-0 libpixman-1-0 libsdl2-2.0-0 libslirp0

# Install
idf_tools.py install qemu-xtensa qemu-riscv32

# Reload env.
. ~/esp/esp-idf/export.sh

# Boot firmware image
qemu-system-xtensa -machine esp32 -nographic -drive file=firmware1.bin,if=mtd,format=raw
```
- Press Ctrl+A then C to exit qemu


---

### Development Notes

```bash



esptool.py --chip esp32 read_flash 0x310000 0xF0000 spiffs.bin
mkspiffs.exe -u spiffs_unpack -b 4096 -p 256 -s 0xF0000 .\spiffs.bin

esptool.py --chip esp32 merge_bin --fill-flash-size 4MB -o flash_image.bin @flash_args)


https://github.com/mluis/qemu-esp32

qemu-system-xtensa -machine esp32 -drive file=build/flash_image.bin,if=mtd,format=raw -serial tcp::5555,server,nowait -display none -daemonize


https://github.com/esp-rs/esp-idf-template

```

---

## Credits and Thanks

- https://github.com/VolosR
- https://github.com/m5stack
- https://github.com/matthew-5pl
- https://github.com/bmorcelli
- https://github.com/7h30th3r0n3
