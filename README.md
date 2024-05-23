# iot-playground


## Using Platform IO

### Install Platform IO

```shell
pip install platformio
```

### Compile firmware

```bash
pio run
```

---


## Using Arduino CLI

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

### Compile firmware (with Arduino CLI)

```bash

arduino-cli compile --fqbn m5stack:esp32:m5stack_cardputer -e \
                    --libraries M5Cardputer,IRRemoteESP8266 \
                    --build-property build.partitions=huge_app \
                    --build-property upload.maximum_size=3145728 \
                    ./m5stick-nemo.ino

```

## Merge bootloader, partiotion table with app

```bash

esptool.py --chip esp32 merge_bin -o flash_image.bin @flash_args

esptool.py --chip esp32s3 merge_bin --output Evil-Cardputer-${{ steps.version.outputs.version }}.bin \
0x1000 build/m5stack.esp32.m5stack_cardputer/Evil-Cardputer-v1-2-2.ino.bootloader.bin \
0x8000 build/m5stack.esp32.m5stack_cardputer/Evil-Cardputer-v1-2-2.ino.partitions.bin \
0x10000 build/m5stack.esp32.m5stack_cardputer/Evil-Cardputer-v1-2-2.ino.bin


```

## Flash firmware

- Install esptool.py - `pip install -U esptool`

```bash

esptool write_flash -z 0 name.bin

```

---

## Credits and Thanks

- https://github.com/VolosR
- https://github.com/m5stack
- https://github.com/matthew-5pl