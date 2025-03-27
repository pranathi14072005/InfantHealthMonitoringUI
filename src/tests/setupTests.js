// Global mocks and setup
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key]),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
}); 
