/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// 
// example usage: 
// replaceIniKey(iniContentString, 'section', 'key', 'newValue');
// 
// Why use this over ini module stringify?
// 1. This is a simple function that does not require any additional dependencies.
// 2. This function is more flexible and can be used to replace a specific key-value pair in a specific section.
// 3. This function does NOT require the entire ini file to be parsed and stringified, thus, comments and formatting are preserved.
// 
export default function replaceIniKey(iniContentString, section, key, newValue) {
    // Create a regular expression to match the specific section and key
    const sectionRegex = new RegExp(`\\[${section}\\][\\s\\S]*?${key}\\s*=\\s*.*`, 'g');
    // Create a replacer function that replaces the old value with the new value
    const replacer = s => s.replace(new RegExp(`(${key}\\s*=\\s*)[^\\n]*`), `$1${newValue}`);
    // Replace the key-value pair in the ini content string using the regexp replacer
    return iniContentString.replace(sectionRegex, replacer);
}
