# iot-playground

A firmware playground for IoT Devices like ESP32, Arduino, M5Stack, etc.


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
sudo apt-get install git wget flex bison gperf python3 python3-pip python3-venv cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0

mkdir ~/esp
cd ~/esp

git clone -b release/v5.3 --recursive https://github.com/espressif/esp-idf.git --depth 1

cd ~/esp/esp-idf
./install.sh

source ~/esp/esp-idf/export.sh
```


### Compile firmware with ESP IDF


```bash
idf.py build
```


### Merge bootloader, partiotion table with app

```bash
esptool.py --chip esp32s3 merge_bin -o ../Demo.ESP_IDF.bin --fill-flash-size 4MB @flash_args
```

### Other commands

```bash
idf.py build flash monitor

idf.py menuconfig

idf.py set-target esp32

idf.py add-dependency
```

---

## Flash firmware

- Install esptool.py - `pip install -U esptool`

```bash

esptool write_flash -z 0 name.bin

```
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