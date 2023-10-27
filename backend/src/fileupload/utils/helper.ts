//Returns true for files having extension = [csv]
const fileExtensionFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new Error('Only CSV files are allowed!'), false);
  }
  callback(null, true);
};

const removeSpaces = (data: string): string => {
  return data.replace(/\s+/g, '');
};

const toLowerCase = (data: string): string => {
  return data.toLowerCase();
};

export { fileExtensionFilter, removeSpaces, toLowerCase };
