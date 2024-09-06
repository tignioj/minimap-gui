/**
 * windows目录名称校验
 * @param name
 * @returns {boolean}
 */
export function isValidDirectoryName(name) {
    // 检查是否为空或长度过长
    if (!name || name.length > 255) {
        return false;
    }

    // 定义非法字符
    const invalidChars = /[<>:"\/\\|?*']/;

    // 检查是否包含非法字符
    if (invalidChars.test(name)) {
        return false;
    }

    // 检查是否以空格或点结尾
    if (name.startsWith(' ') || name.endsWith(' ') || name.endsWith('.')) {
        return false;
    }

    // Windows 系统中的保留字
    const reservedNames = new Set([
        "CON", "PRN", "AUX", "NUL",
        "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
    ]);

    // 检查是否为保留字
    if (reservedNames.has(name.toUpperCase())) {
        return false;
    }

    return true;
}