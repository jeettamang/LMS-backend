import multer from "multer";
import fs from "fs";

const uploadDir = "./tmp/users";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage })
