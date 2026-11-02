import { buildCvUploadConfig } from './cv-upload.config';

const reader = (value: string | undefined): { get: () => string | undefined } => ({ get: () => value });

describe('buildCvUploadConfig', () => {
  it('should read CV_MAX_FILE_BYTES from the environment', () => {
    expect(buildCvUploadConfig(reader('1000'))).toEqual({ maxFileBytes: 1000 });
  });

  it.each([[undefined], [''], ['abc'], ['0'], ['-5'], ['1.5']])('should fall back to the 5 MiB default for %p', (value) => {
    expect(buildCvUploadConfig(reader(value))).toEqual({ maxFileBytes: 5_242_880 });
  });
});
