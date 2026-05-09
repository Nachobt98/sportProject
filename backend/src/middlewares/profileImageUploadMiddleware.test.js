jest.mock("fs", () => ({
  mkdirSync: jest.fn(),
}));

const mockSingle = jest.fn();
const mockMulter = jest.fn(() => ({ single: mockSingle }));

mockMulter.diskStorage = jest.fn((options) => options);
mockMulter.MulterError = class MulterError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
};

jest.mock("multer", () => mockMulter);

const multer = require("multer");
const {
  PROFILE_IMAGE_UPLOAD_DIR,
  handleProfileImageUpload,
} = require("./profileImageUploadMiddleware");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("profileImageUploadMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("configures multer storage, limits and file filtering", () => {
    expect(multer.diskStorage).toHaveBeenCalledWith(expect.objectContaining({
      destination: expect.any(Function),
      filename: expect.any(Function),
    }));
    expect(multer).toHaveBeenCalledWith(expect.objectContaining({
      storage: expect.any(Object),
      limits: { fileSize: 1.5 * 1024 * 1024, files: 1 },
      fileFilter: expect.any(Function),
    }));
  });

  test("sets upload destination and safe filenames", () => {
    const storage = multer.diskStorage.mock.calls[0][0];
    const destinationCallback = jest.fn();
    const filenameCallback = jest.fn();

    storage.destination({}, {}, destinationCallback);
    storage.filename(
      { auth: { userName: "Nacho Test" } },
      { mimetype: "image/png", originalname: "avatar.original" },
      filenameCallback
    );

    expect(destinationCallback).toHaveBeenCalledWith(null, PROFILE_IMAGE_UPLOAD_DIR);
    expect(filenameCallback.mock.calls[0][1]).toMatch(/^nacho-test-\d+\.png$/);
  });

  test("falls back to original extension for unexpected but accepted storage calls", () => {
    const storage = multer.diskStorage.mock.calls[0][0];
    const filenameCallback = jest.fn();

    storage.filename(
      { auth: {} },
      { mimetype: "image/unknown", originalname: "avatar.gif" },
      filenameCallback
    );

    expect(filenameCallback.mock.calls[0][1]).toMatch(/^user-\d+\.gif$/);
  });

  test("accepts allowed image mime types", () => {
    const fileFilter = multer.mock.calls[0][0].fileFilter;
    const callback = jest.fn();

    fileFilter({}, { mimetype: "image/jpeg" }, callback);
    fileFilter({}, { mimetype: "image/png" }, callback);
    fileFilter({}, { mimetype: "image/webp" }, callback);

    expect(callback).toHaveBeenNthCalledWith(1, null, true);
    expect(callback).toHaveBeenNthCalledWith(2, null, true);
    expect(callback).toHaveBeenNthCalledWith(3, null, true);
  });

  test("rejects unsupported image mime types", () => {
    const fileFilter = multer.mock.calls[0][0].fileFilter;
    const callback = jest.fn();

    fileFilter({}, { mimetype: "image/gif" }, callback);

    expect(callback.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(callback.mock.calls[0][0].message).toBe("La imagen debe ser JPG, PNG o WEBP.");
  });

  test("continues when upload succeeds", () => {
    mockSingle.mockImplementation(() => (req, res, callback) => callback());
    const req = {};
    const res = createResponse();
    const next = jest.fn();

    handleProfileImageUpload(req, res, next);

    expect(mockSingle).toHaveBeenCalledWith("profileImage");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns normalized error for oversized files", () => {
    mockSingle.mockImplementation(() => (req, res, callback) => callback(new multer.MulterError("LIMIT_FILE_SIZE")));
    const res = createResponse();

    handleProfileImageUpload({}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "La imagen es demasiado grande. Usa una imagen de menos de 1.5 MB." });
  });

  test("returns normalized error for invalid uploads", () => {
    mockSingle.mockImplementation(() => (req, res, callback) => callback(new Error("Tipo invalido")));
    const res = createResponse();

    handleProfileImageUpload({}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Tipo invalido" });
  });

  test("returns fallback upload error message", () => {
    mockSingle.mockImplementation(() => (req, res, callback) => callback({}));
    const res = createResponse();

    handleProfileImageUpload({}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "La imagen de perfil no es valida." });
  });
});
