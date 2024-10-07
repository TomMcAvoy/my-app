const helloWorld = require('../helloWorld');

test('should return "Hello, World!"', () => {
  expect(helloWorld()).toBe('Hello, World!');
});