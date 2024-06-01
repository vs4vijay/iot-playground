#!/usr/bin/env bash

project="$(pwd)"

echo "[+] Building ${project}"
idf.py build

echo "[+] Merging binaries"
cd build

esptool.py --chip esp32 merge_bin -o ../firmware2.bin --fill-flash-size 4MB @flash_args

echo "[+] Booting"
qemu-system-xtensa -machine esp32 -nographic -drive file=firmware2.bin,if=mtd,format=raw