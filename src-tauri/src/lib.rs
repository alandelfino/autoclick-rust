use std::process::Command;
use std::fs::File;
use std::io::Write;
use std::thread;
use std::time::Duration;
use tauri::Emitter;

// Win32 Structs
#[repr(C)]
#[derive(Copy, Clone)]
struct POINT {
    x: i32,
    y: i32,
}

#[repr(C)]
#[derive(Copy, Clone)]
struct MOUSEINPUT {
    dx: i32,
    dy: i32,
    mouse_data: u32,
    dw_flags: u32,
    time: u32,
    dw_extra_info: usize,
}

#[repr(C)]
#[derive(Copy, Clone)]
struct KEYBDINPUT {
    w_vk: u16,
    w_scan: u16,
    dw_flags: u32,
    time: u32,
    dw_extra_info: usize,
}

#[repr(C)]
#[derive(Copy, Clone)]
struct HARDWAREINPUT {
    u_msg: u32,
    w_param_l: u16,
    w_param_h: u16,
}

#[repr(C)]
union INPUT_UNION {
    mi: MOUSEINPUT,
    ki: KEYBDINPUT,
    hi: HARDWAREINPUT,
}

#[repr(C)]
struct INPUT {
    r#type: u32,
    u: INPUT_UNION,
}

#[repr(C)]
struct CURSORINFO {
    cb_size: u32,
    flags: u32,
    h_cursor: *mut std::ffi::c_void,
    pt_screen_pos: POINT,
}

#[link(name = "user32")]
extern "system" {
    fn SetCursorPos(x: i32, y: i32) -> i32;
    fn GetCursorPos(lpPoint: *mut POINT) -> i32;
    fn SendInput(cInputs: u32, pInputs: *const INPUT, cbSize: i32) -> u32;
    fn GetForegroundWindow() -> *mut std::ffi::c_void;
    fn GetWindowTextW(hWnd: *mut std::ffi::c_void, lpString: *mut u16, nMaxCount: i32) -> i32;
    fn GetAsyncKeyState(vKey: i32) -> i16;
    fn GetCursorInfo(pci: *mut CURSORINFO) -> i32;
}

// VK codes mapping helper
fn get_vk_code(key_name: &str) -> u16 {
    match key_name.to_lowercase().as_str() {
        "backspace" => 0x08,
        "tab" => 0x09,
        "enter" => 0x0D,
        "shift" => 0x10,
        "ctrl" | "control" => 0x11,
        "alt" => 0x12,
        "pause" => 0x13,
        "capslock" => 0x14,
        "esc" | "escape" => 0x1B,
        "space" | " " => 0x20,
        "pageup" => 0x21,
        "pagedown" => 0x22,
        "end" => 0x23,
        "home" => 0x24,
        "left" => 0x25,
        "up" => 0x26,
        "right" => 0x27,
        "down" => 0x28,
        "insert" => 0x2D,
        "delete" => 0x2E,
        "f1" => 0x70,
        "f2" => 0x71,
        "f3" => 0x72,
        "f4" => 0x73,
        "f5" => 0x74,
        "f6" => 0x75,
        "f7" => 0x76,
        "f8" => 0x77,
        "f9" => 0x78,
        "f10" => 0x79,
        "f11" => 0x7A,
        "f12" => 0x7B,
        // Alphanumeric
        c if c.len() == 1 => {
            let ch = c.chars().next().unwrap();
            if ch >= 'a' && ch <= 'z' {
                (ch as u8 - b'a' + b'A') as u16
            } else {
                ch as u16
            }
        }
        _ => 0,
    }
}

// Mouse click down & up event sender
fn send_mouse_click() {
    let down = INPUT {
        r#type: 0, // INPUT_MOUSE
        u: INPUT_UNION {
            mi: MOUSEINPUT {
                dx: 0,
                dy: 0,
                mouse_data: 0,
                dw_flags: 0x0002, // MOUSEEVENTF_LEFTDOWN
                time: 0,
                dw_extra_info: 0,
            }
        }
    };
    let up = INPUT {
        r#type: 0, // INPUT_MOUSE
        u: INPUT_UNION {
            mi: MOUSEINPUT {
                dx: 0,
                dy: 0,
                mouse_data: 0,
                dw_flags: 0x0004, // MOUSEEVENTF_LEFTUP
                time: 0,
                dw_extra_info: 0,
            }
        }
    };
    unsafe {
        SendInput(1, &down, std::mem::size_of::<INPUT>() as i32);
        std::thread::sleep(Duration::from_millis(50));
        SendInput(1, &up, std::mem::size_of::<INPUT>() as i32);
    }
}

// Keystroke modifier helper
fn send_key_event(vk: u16, up: bool) {
    let flags = if up { 0x0002 } else { 0 }; // KEYEVENTF_KEYUP = 0x0002
    let input = INPUT {
        r#type: 1, // INPUT_KEYBOARD
        u: INPUT_UNION {
            ki: KEYBDINPUT {
                w_vk: vk,
                w_scan: 0,
                dw_flags: flags,
                time: 0,
                dw_extra_info: 0,
            }
        }
    };
    unsafe {
        SendInput(1, &input, std::mem::size_of::<INPUT>() as i32);
    }
}

fn press_key_impl(key_combo: &str) {
    let parts: Vec<&str> = key_combo.split('+').collect();
    let mut vks = Vec::new();
    for part in parts {
        let vk = get_vk_code(part.trim());
        if vk != 0 {
            vks.push(vk);
        }
    }
    if vks.is_empty() {
        return;
    }
    // Press keys in order
    for &vk in &vks {
        send_key_event(vk, false);
    }
    std::thread::sleep(Duration::from_millis(20));
    // Release in reverse order
    for &vk in vks.iter().rev() {
        send_key_event(vk, true);
    }
}

fn type_text_impl(text: &str) {
    for ch in text.encode_utf16() {
        let input_down = INPUT {
            r#type: 1, // INPUT_KEYBOARD
            u: INPUT_UNION {
                ki: KEYBDINPUT {
                    w_vk: 0,
                    w_scan: ch,
                    dw_flags: 0x0004, // KEYEVENTF_UNICODE
                    time: 0,
                    dw_extra_info: 0,
                }
            }
        };
        let input_up = INPUT {
            r#type: 1, // INPUT_KEYBOARD
            u: INPUT_UNION {
                ki: KEYBDINPUT {
                    w_vk: 0,
                    w_scan: ch,
                    dw_flags: 0x0004 | 0x0002, // KEYEVENTF_UNICODE | KEYEVENTF_KEYUP
                    time: 0,
                    dw_extra_info: 0,
                }
            }
        };
        unsafe {
            SendInput(1, &input_down, std::mem::size_of::<INPUT>() as i32);
            SendInput(1, &input_up, std::mem::size_of::<INPUT>() as i32);
        }
    }
}

// Tauri commands exposed to the frontend
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn move_mouse(x: i32, y: i32) -> Result<(), String> {
    unsafe {
        if SetCursorPos(x, y) == 0 {
            return Err("Falha ao mover o cursor".to_string());
        }
    }
    Ok(())
}

#[tauri::command]
fn click_mouse(x: i32, y: i32) -> Result<(), String> {
    unsafe {
        SetCursorPos(x, y);
    }
    std::thread::sleep(Duration::from_millis(50));
    send_mouse_click();
    Ok(())
}

#[tauri::command]
fn press_key(key: String, count: u32) -> Result<(), String> {
    for _ in 0..count {
        press_key_impl(&key);
        std::thread::sleep(Duration::from_millis(50));
    }
    Ok(())
}

#[tauri::command]
fn type_text(text: String) -> Result<(), String> {
    type_text_impl(&text);
    Ok(())
}

#[tauri::command]
fn get_active_window() -> Result<(String, usize), String> {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return Err("Nenhuma janela ativa encontrada".to_string());
        }
        let mut buffer = [0u16; 512];
        let len = GetWindowTextW(hwnd, buffer.as_mut_ptr(), 512);
        if len > 0 {
            let title = String::from_utf16_lossy(&buffer[..len as usize]);
            Ok((title, hwnd as usize))
        } else {
            Ok(("Sem título".to_string(), hwnd as usize))
        }
    }
}

#[tauri::command]
fn get_mouse_cursor() -> Result<(i32, i32, String), String> {
    unsafe {
        let mut pt = POINT { x: 0, y: 0 };
        if GetCursorPos(&mut pt) == 0 {
            return Err("Não foi possível obter a posição do mouse".to_string());
        }
        
        let mut ci = CURSORINFO {
            cb_size: std::mem::size_of::<CURSORINFO>() as u32,
            flags: 0,
            h_cursor: std::ptr::null_mut(),
            pt_screen_pos: POINT { x: 0, y: 0 },
        };
        
        let mut cursor_name = "Arrow".to_string();
        if GetCursorInfo(&mut ci) != 0 && ci.flags != 0 {
            cursor_name = format!("{:?}", ci.h_cursor);
        }
        
        Ok((pt.x, pt.y, cursor_name))
    }
}

#[tauri::command]
fn capture_coordinate_loop(window: tauri::Window) -> Result<(i32, i32), String> {
    let _ = window.hide();
    
    let mut pos = (0, 0);
    let mut captured = false;
    let mut cancelled = false;
    
    // Sleep briefly to avoid catching the triggers mouse down
    std::thread::sleep(Duration::from_millis(400));
    
    unsafe {
        loop {
            // Esc (VK_ESCAPE = 0x1B)
            if (GetAsyncKeyState(0x1B) as u16 & 0x8000) != 0 {
                cancelled = true;
                break;
            }
            // Ctrl (VK_CONTROL = 0x11) + Left Click (VK_LBUTTON = 0x01)
            let ctrl_pressed = (GetAsyncKeyState(0x11) as u16 & 0x8000) != 0;
            let lbutton_pressed = (GetAsyncKeyState(0x01) as u16 & 0x8000) != 0;
            
            if ctrl_pressed && lbutton_pressed {
                let mut pt = POINT { x: 0, y: 0 };
                if GetCursorPos(&mut pt) != 0 {
                    pos = (pt.x, pt.y);
                    captured = true;
                }
                break;
            }
            std::thread::sleep(Duration::from_millis(30));
        }
    }
    
    let _ = window.show();
    let _ = window.set_focus();
    
    if cancelled {
        return Err("Captura cancelada".to_string());
    }
    if captured {
        Ok(pos)
    } else {
        Err("Falha na captura".to_string())
    }
}

#[tauri::command]
fn hide_app_window(window: tauri::Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
fn show_app_window(window: tauri::Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())
}

fn uuid_v4_like() -> String {
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("{:x}", ts)
}

#[tauri::command]
fn run_python_script(code: String, payload_json: String) -> Result<(String, String), String> {
    let mut temp_dir = std::env::temp_dir();
    temp_dir.push(format!("autoclick_script_{}.py", uuid_v4_like()));
    
    // Write wrapped code to temp python file
    let wrapper = format!(
        "import json\nimport sys\n\npayload = json.loads({:?})\n\ndef log(msg):\n    print(f\"[SCRIPT_LOG] {{msg}}\")\n\ntry:\n    exec({:?})\nexcept Exception as e:\n    print(f\"[SCRIPT_ERROR] {{e}}\", file=sys.stderr)\n    sys.exit(1)\n\nprint(\"[FINAL_PAYLOAD]\")\nprint(json.dumps(payload))\n",
        payload_json, code
    );
    
    let mut file = File::create(&temp_dir)
        .map_err(|e| format!("Erro ao criar arquivo temporário: {}", e))?;
    file.write_all(wrapper.as_bytes())
        .map_err(|e| format!("Erro ao escrever no arquivo temporário: {}", e))?;
        
    let output = Command::new("python")
        .arg(&temp_dir)
        .output()
        .map_err(|e| format!("Falha ao iniciar o interpretador Python. Certifique-se de que o Python está instalado no PATH.\nErro: {}", e))?;
        
    let _ = std::fs::remove_file(&temp_dir);
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    if !output.status.success() {
        return Err(format!("Erro no script:\n{}", stderr));
    }
    
    let mut script_logs = Vec::new();
    let mut final_payload_str = payload_json.clone();
    let mut parsing_payload = false;
    let mut payload_lines = Vec::new();
    
    for line in stdout.lines() {
        if line.starts_with("[SCRIPT_LOG]") {
            script_logs.push(line.replace("[SCRIPT_LOG]", "").trim().to_string());
        } else if line == "[FINAL_PAYLOAD]" {
            parsing_payload = true;
        } else if parsing_payload {
            payload_lines.push(line);
        } else {
            script_logs.push(line.to_string());
        }
    }
    
    if parsing_payload && !payload_lines.is_empty() {
        final_payload_str = payload_lines.join("\n");
    }
    
    Ok((final_payload_str, script_logs.join("\n")))
}

#[tauri::command]
fn run_db_helper(action: String, db_type: String, config_json: String, query: Option<String>) -> Result<String, String> {
    let mut cmd = Command::new("python");
    cmd.arg("db_helper.py").arg(&action).arg(&db_type).arg(&config_json);
    if let Some(q) = query {
        cmd.arg(&q);
    }
    
    let output = cmd.output()
        .map_err(|e| format!("Falha ao executar db_helper.py: {}", e))?;
        
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    if !output.status.success() {
        return Err(format!("Erro no Banco de Dados: {}", stderr));
    }
    
    Ok(stdout.trim().to_string())
}

// Background thread listening to VK_F1 / VK_F2 system-wide
fn start_hotkey_listener(app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        let mut f1_was_down = false;
        let mut f2_was_down = false;
        loop {
            unsafe {
                let f1_state = GetAsyncKeyState(0x70); // VK_F1
                let f2_state = GetAsyncKeyState(0x71); // VK_F2
                
                let f1_pressed = (f1_state as u16 & 0x8000) != 0;
                let f2_pressed = (f2_state as u16 & 0x8000) != 0;
                
                if f1_pressed && !f1_was_down {
                    let _ = app_handle.emit("global-stop", ());
                }
                if f2_pressed && !f2_was_down {
                    let _ = app_handle.emit("global-pause", ());
                }
                
                f1_was_down = f1_pressed;
                f2_was_down = f2_pressed;
            }
            thread::sleep(Duration::from_millis(50));
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            start_hotkey_listener(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            move_mouse,
            click_mouse,
            press_key,
            type_text,
            get_active_window,
            get_mouse_cursor,
            hide_app_window,
            show_app_window,
            run_python_script,
            run_db_helper,
            capture_coordinate_loop
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

