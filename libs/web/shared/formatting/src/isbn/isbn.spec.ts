import { hyphenateIsbn } from './isbn';

describe('hyphenateIsbn', () => {
  it('hyphenates a Polish ISBN-13 by publisher ranges', () => {
    expect(hyphenateIsbn('9788308049181')).toBe('978-83-08-04918-1');
  });

  it('hyphenates a foreign ISBN-13 by its own ranges', () => {
    expect(hyphenateIsbn('9780306406157')).toBe('978-0-306-40615-7');
  });

  it('shows a value that is not a valid ISBN as it is', () => {
    expect(hyphenateIsbn('9788308049182')).toBe('9788308049182');
  });
});
