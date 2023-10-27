export const FILE_STATUS = {
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
  REMOVED: 'removed'
};

export const FILE_TYPE = {
  ALL_FORMATS: '*',
  ALL_VIDEOS: 'video/*',
  ALL_AUDIO: 'audio/*',
  ALL_IMGS: 'image/*',
  ALL_DOCS: '.pdf, .doc, .docx, .txt, .rtf, .csv',
  CSV: '.csv',
  FILE_ATTACHMENT_VENDOR: 'image/*, .pdf, .doc, .docx, .txt, .rtf',
  FILE_ATTACHMENT_PO: 'image/*, .pdf, .doc, .docx, .txt, .rtf, .csv'
};
