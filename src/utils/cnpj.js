const CNPJ_LENGTH = 14;

const normalizeCnpj = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\D/g, '');
};

const calculateCheckDigit = (digits, weights) => {
  const sum = digits
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);

  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
};

const isValidCnpj = (value) => {
  const cnpj = normalizeCnpj(value);

  if (cnpj.length !== CNPJ_LENGTH) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calculateCheckDigit(cnpj.slice(0, 12), firstWeights);
  const secondDigit = calculateCheckDigit(cnpj.slice(0, 12) + firstDigit, secondWeights);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
};

module.exports = {
  normalizeCnpj,
  isValidCnpj
};