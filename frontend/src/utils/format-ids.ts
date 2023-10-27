export const generateFormattedId = (
  id: TNumberOrStringOrEmpty,
  prefixLength = 5,
  prefixCharacter = '0'
) => {
  const fId = !id ? '' : id.toString();
  const res = fId.padStart(prefixLength, prefixCharacter);
  return res;
};
