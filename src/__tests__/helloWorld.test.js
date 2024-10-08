// eslint-disable-next-line @typescript-eslint/no-var-requires
import helloWorld from '../helloWorld';

test('should return "Hello, World!"', () => {
  expect(helloWorld()).toBe('Hello, World!');
});
