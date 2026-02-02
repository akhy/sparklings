// Mock for pdfjs-dist to avoid DOMMatrix issues in tests
export const GlobalWorkerOptions = {
  workerSrc: '',
}

export const getDocument = () => ({
  promise: Promise.resolve({
    numPages: 0,
    getPage: () => Promise.resolve({
      getTextContent: () => Promise.resolve({ items: [], styles: {} }),
    }),
  }),
})

export default {
  GlobalWorkerOptions,
  getDocument,
}
