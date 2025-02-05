use esp_idf_sys as _; // If using the `std` feature of `esp-idf-sys`, always keep this module imported
use esp_idf_hal::prelude::*;
use esp_idf_hal::gpio::{Gpio2, Output};

fn main() -> anyhow::Result<()> {
    esp_idf_sys::link_patches();

    let peripherals = Peripherals::take().unwrap();
    let pins = peripherals.pins;

    let mut led = pins.gpio2.into_output()?;

    loop {
        led.set_high()?;
        std::thread::sleep(std::time::Duration::from_millis(1000));
        led.set_low()?;
        std::thread::sleep(std::time::Duration::from_millis(1000));
    }
}
