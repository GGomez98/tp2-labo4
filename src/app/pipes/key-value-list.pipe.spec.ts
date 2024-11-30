import { KeyValueListPipe } from './key-value-list.pipe';

describe('KeyValueListPipe', () => {
  it('create an instance', () => {
    const pipe = new KeyValueListPipe();
    expect(pipe).toBeTruthy();
  });
});
