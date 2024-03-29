# iot-playground


## Compile firmware (with Arduino CLI)

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