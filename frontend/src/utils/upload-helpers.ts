export function getBase64(file: TObject) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function getFormData(data: TDocsOrMultimedia) {
  const formData = new FormData();

  for (const key in data) {
    formData.append(key, data[key]);
  }

  return formData;
}

export const ErrorArrayHandler = (errors: TObject) => {
  return errors?.data?.context?.map((error: TObject) => error?.field);
};
