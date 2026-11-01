import { Injectable } from '@nestjs/common';
import { FAKE_MODEL_ID } from '../../domain/constants/ai.constants';
import { AI_TOPICS } from '../../domain/ai-topics';
import type { IAiCompletion, IAiCompletionRequest } from '../../domain/interfaces/ai-completion.interface';
import type { TAiTopic } from '@ibm-talent-bridge/shared-types';
import type { IAiProviderPort } from '../../application/ports/ai-provider.port';

const FAKE_ANSWERS: Readonly<Record<TAiTopic, string>> = {
  general: 'Respuesta de demostración del asistente (proveedor fake, sin IA real).',
};

/** Respuesta fija por tópico. Solo con `AI_PROVIDER=fake` y nunca en producción; ICA nunca cae aquí. */
@Injectable()
export class FakeProvider implements IAiProviderPort {
  complete(request: IAiCompletionRequest): Promise<IAiCompletion> {
    const system = request.messages.find((message) => message.role === 'system')?.content;
    const topic = (Object.keys(AI_TOPICS) as TAiTopic[]).find((id) => AI_TOPICS[id].systemPrompt === system) ?? 'general';
    return Promise.resolve({ content: FAKE_ANSWERS[topic], finishReason: 'stop', model: FAKE_MODEL_ID });
  }

  listModels(): Promise<readonly string[]> {
    return Promise.resolve([FAKE_MODEL_ID]);
  }
}
