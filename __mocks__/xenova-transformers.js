// Mock para @xenova/transformers para evitar problemas con ES modules en Jest
module.exports = {
  pipeline: jest.fn(() => Promise.resolve({
    process: jest.fn(),
  })),
  AutoModel: jest.fn(),
  AutoTokenizer: jest.fn(),
};

