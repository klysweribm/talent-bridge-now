import { DRAFT_COPY } from '../config/opportunityDraft.copy';
import { OPPORTUNITY_SOURCE_MAX_FILE_BYTES } from '../config/opportunitySource.constants';
import { validateBrochureFile } from './validateBrochureFile';

function fileOf(name: string, size: number): File {
  return new File([new Uint8Array(size)], name);
}

describe('validateBrochureFile', () => {
  it.each(['b.pdf', 'b.DOCX', 'b.md', 'b.txt'])('should accept %s', name => {
    expect(validateBrochureFile(fileOf(name, 10))).toBeNull();
  });

  it('should reject an unsupported type', () => {
    expect(validateBrochureFile(fileOf('b.exe', 10))).toBe(DRAFT_COPY.fileErrors.type);
  });

  it('should reject an empty file', () => {
    expect(validateBrochureFile(fileOf('b.pdf', 0))).toBe(DRAFT_COPY.fileErrors.empty);
  });

  it('should reject a file over the limit and accept one exactly at it', () => {
    expect(validateBrochureFile(fileOf('b.pdf', OPPORTUNITY_SOURCE_MAX_FILE_BYTES + 1))).toBe(DRAFT_COPY.fileErrors.tooLarge(OPPORTUNITY_SOURCE_MAX_FILE_BYTES + 1));
    expect(validateBrochureFile(fileOf('b.pdf', OPPORTUNITY_SOURCE_MAX_FILE_BYTES))).toBeNull();
  });
});
