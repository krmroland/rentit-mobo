export const isFilled = (value): boolean => {
  return value === 0 || value === false || !!value;
};

export const isBlank = (value): boolean => {
  return !isFilled(value);
};
