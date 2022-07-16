mod utils;

use serde::Serialize;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Debug, Serialize)]
struct ExifData {
    tag: String,
    value: String,
    value_with_unit: String,
}

#[wasm_bindgen(start)]
pub fn run() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn get_exif(raw: Vec<u8>) -> JsValue {
    let mut exif_data: Vec<ExifData> = Vec::new();
    let exifreader = exif::Reader::new();

    // vec<u8> 转换为 io::BufRead + io::Seek
    let mut bufreader = std::io::Cursor::new(raw.as_slice());
    let exif = exifreader.read_from_container(&mut bufreader).unwrap();

    for field in exif.fields() {
        if let Some(_) = field.tag.to_string().find("Tag(Exif") {
            continue;
        }

        if ["Make", "Model"].contains(&field.tag.to_string().as_str()) {
            exif_data.push(ExifData {
                tag: field.tag.to_string(),
                value: field
                    .display_value()
                    .to_string()
                    .replace(|item: char| ["\"", ",", " "].contains(&item.to_string().as_str()), ""),
                value_with_unit: field
                    .display_value()
                    .with_unit(&exif)
                    .to_string()
                    .replace('"', ""),
            });
            continue;
        }

        exif_data.push(ExifData {
            tag: field.tag.to_string(),
            value: field.display_value().to_string(),
            value_with_unit: field.display_value().with_unit(&exif).to_string(),
        });
    }

    JsValue::from_serde(&exif_data).unwrap()
}
