import * as pdf from 'html-pdf';

export const generateFileBuffer = (data: any, options: any) =>
  new Promise<Uint8Array>((resolve, reject) => {
    pdf.create(data, options).toBuffer((error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });
