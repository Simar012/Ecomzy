const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("avatar"); // 'avatar' matches formData key

module.exports = upload;
