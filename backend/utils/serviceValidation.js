const SERVICE_CATEGORIES = ['cut', 'perm', 'color', 'combo', 'styling', 'treatment'];

const isString = (value) => typeof value === 'string' && value.trim().length > 0;
const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value);
const isBoolean = (value) => typeof value === 'boolean';
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');

const validateServiceInput = (data = {}, options = {}) => {
  const { partial = false } = options;
  const errors = {};

  if (!partial || data.name !== undefined) {
    if (!isString(data.name)) {
      errors.name = 'Tên dịch vụ là bắt buộc và phải là một chuỗi không rỗng.';
    }
  }

  if (!partial || data.price !== undefined) {
    if (!isNumber(data.price)) {
      errors.price = 'Giá dịch vụ là bắt buộc và phải là một số hợp lệ.';
    }
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.description = 'Mô tả dịch vụ phải là một chuỗi.';
  }

  if (data.durationMinutes !== undefined && !Number.isInteger(data.durationMinutes)) {
    errors.durationMinutes = 'Thời lượng dịch vụ phải là một số nguyên.';
  }

  if (data.category !== undefined && !SERVICE_CATEGORIES.includes(data.category)) {
    errors.category = `Danh mục dịch vụ phải là một trong: ${SERVICE_CATEGORIES.join(', ')}.`;
  }

  if (data.hairTypes !== undefined && !isStringArray(data.hairTypes)) {
    errors.hairTypes = 'hairTypes phải là một mảng các chuỗi.';
  }

  if (data.styleCompatibility !== undefined && !isStringArray(data.styleCompatibility)) {
    errors.styleCompatibility = 'styleCompatibility phải là một mảng các chuỗi.';
  }

  if (data.expertiseRequired !== undefined && !isStringArray(data.expertiseRequired)) {
    errors.expertiseRequired = 'expertiseRequired phải là một mảng các chuỗi.';
  }

  if (data.images !== undefined && !isStringArray(data.images)) {
    errors.images = 'images phải là một mảng các đường dẫn chuỗi.';
  }

  if (data.steps !== undefined && !isStringArray(data.steps)) {
    errors.steps = 'steps phải là một mảng các chuỗi.';
  }

  if (data.suggestedFor !== undefined && !isStringArray(data.suggestedFor)) {
    errors.suggestedFor = 'suggestedFor phải là một mảng các chuỗi.';
  }

  if (data.isActive !== undefined && !isBoolean(data.isActive)) {
    errors.isActive = 'isActive phải là true hoặc false.';
  }

  if (data.popularity !== undefined && !Number.isInteger(data.popularity)) {
    errors.popularity = 'popularity phải là một số nguyên.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const sanitizeServiceData = (data = {}) => {
  const sanitized = {};

  if (data.name !== undefined) sanitized.name = String(data.name).trim();
  if (data.description !== undefined) sanitized.description = String(data.description).trim();
  if (data.price !== undefined) sanitized.price = Number(data.price);
  if (data.durationMinutes !== undefined) sanitized.durationMinutes = Number(data.durationMinutes);
  if (data.category !== undefined) sanitized.category = String(data.category).trim();
  if (data.hairTypes !== undefined) sanitized.hairTypes = data.hairTypes.map(String);
  if (data.styleCompatibility !== undefined) sanitized.styleCompatibility = data.styleCompatibility.map(String);
  if (data.expertiseRequired !== undefined) sanitized.expertiseRequired = data.expertiseRequired.map(String);
  if (data.images !== undefined) sanitized.images = data.images.map(String);
  if (data.steps !== undefined) sanitized.steps = data.steps.map(String);
  if (data.suggestedFor !== undefined) sanitized.suggestedFor = data.suggestedFor.map(String);
  if (data.isActive !== undefined) sanitized.isActive = Boolean(data.isActive);
  if (data.popularity !== undefined) sanitized.popularity = Number(data.popularity);

  return sanitized;
};

module.exports = {
  validateServiceInput,
  sanitizeServiceData
};
