import { Module } from '@nestjs/common';
import { DOCUMENT_TEXT_EXTRACTOR_PORT } from './document-text-extractor.port';
import { LocalDocumentTextExtractor } from './local-document-text-extractor.adapter';

@Module({
  providers: [{ provide: DOCUMENT_TEXT_EXTRACTOR_PORT, useClass: LocalDocumentTextExtractor }],
  exports: [DOCUMENT_TEXT_EXTRACTOR_PORT],
})
export class DocumentTextModule {}
