use std::error::Error;
use std::{fs, io, path::Path};

struct SourceFile {
    files: Vec<&'static str>,
    dirs: Vec<&'static str>,
}

fn main() -> Result<(), Box<dyn Error>> {
    let build_dir_path = Path::new("build");
    let source = SourceFile {
        files: vec![
            "index.html",
            "logo.png",
            "simple.jpg",
            "index.js",
            "index.css",
            "sw.js",
            "sw.reg.mgr.js"
        ],
        dirs: vec!["pkg", "brand"],
    };

    match fs::remove_dir_all(&build_dir_path) { _ => {} };

    // 创建目标目录;
    fs::create_dir_all(&build_dir_path)?;

    // 遍历 fiLes
    for file in source.files.iter() {
        fs::copy(&file, build_dir_path.join(&file))?;
    }

    // 遍历 dirs
    for dir in source.dirs.iter() {
        copy_dir_content(Path::new(dir), &build_dir_path.join(dir))?;
    }

    println!("复制到 {} 完成", build_dir_path.display());

    Ok(())
}

fn copy_dir_content(dir: &Path, to_dir: &Path) -> io::Result<()> {
    // 创建目标目录;
    fs::create_dir_all(&to_dir)?;

    // 读取源目录，进行内容遍历
    for item in fs::read_dir(dir)? {
        // 获取 DirEntry
        let item_entry = item?;

        // 是否为目录
        if item_entry.file_type()?.is_dir() {
            copy_dir_content(&item_entry.path(), &to_dir.join(item_entry.file_name()))?;
        } else {
            fs::copy(item_entry.path(), to_dir.join(item_entry.file_name()))?;
        }
    }

    Ok(())
}
