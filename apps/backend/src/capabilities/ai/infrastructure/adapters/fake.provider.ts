import { Injectable } from '@nestjs/common';
import { FAKE_MODEL_ID } from '../../domain/constants/ai.constants';
import { AI_TOPICS } from '../../domain/ai-topics';
import type { IAiCompletion, IAiCompletionRequest, IAiFileUpload } from '../../domain/interfaces/ai-completion.interface';
import type { TAiTopic } from '@ibm-talent-bridge/shared-types';
import type { IAiProviderPort } from '../../application/ports/ai-provider.port';

const FAKE_ANSWERS: Readonly<Record<TAiTopic, string>> = {
  general: 'Respuesta de demostración del asistente (proveedor fake, sin IA real).',
};

/** Borrador inventado que devuelve el fake ante una consulta con archivo (nunca datos reales). */
const FAKE_CV_DRAFT = {
  fullName: 'Persona de Prueba',
  email: 'persona.prueba@example.test',
  primaryRole: 'Backend Developer',
  seniority: 'ssr',
  skills: [{ name: 'TypeScript', level: 4, years: 3 }],
  languages: [{ code: 'es', level: 'native' }],
} as const;
const FAKE_FILE_TEXT = 'Texto de CV de demostración (proveedor fake).';

/** Respuesta fija por tópico. Solo con `AI_PROVIDER=fake` y nunca en producción; ICA nunca cae aquí. */
@Injectable()
export class FakeProvider implements IAiProviderPort {
  complete(request: IAiCompletionRequest): Promise<IAiCompletion> {
    const inlineCv = request.messages.some((message) => message.role === 'user' && message.content.includes('<cv>'));
    if (request.fileIds?.length || inlineCv) return Promise.resolve({ content: JSON.stringify(FAKE_CV_DRAFT), finishReason: 'stop', model: FAKE_MODEL_ID });
    const system = request.messages.find((message) => message.role === 'system')?.content;
    const topic = (Object.keys(AI_TOPICS) as TAiTopic[]).find((id) => AI_TOPICS[id].systemPrompt === system) ?? 'general';
    return Promise.resolve({ content: FAKE_ANSWERS[topic], finishReason: 'stop', model: FAKE_MODEL_ID });
  }

  listModels(): Promise<readonly string[]> {
    return Promise.resolve([FAKE_MODEL_ID]);
  }

  uploadFile(_file: IAiFileUpload): Promise<string> {
    return Promise.resolve('fake-file-1');
  }

  waitForFile(_fileId: string): Promise<string> {
    return Promise.resolve(FAKE_FILE_TEXT);
  }

  deleteFile(_fileId: string): Promise<void> {
    return Promise.resolve();
  }
}
