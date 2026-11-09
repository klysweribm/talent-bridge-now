import 'reflect-metadata';
import { AiController } from '../../capabilities/ai/infrastructure/controllers/ai.controller';
import { AvailableCandidatesController } from '../../capabilities/candidates/infrastructure/controllers/available-candidates.controller';
import { CandidatesListController } from '../../capabilities/candidates/infrastructure/controllers/candidates-list.controller';
import { OpportunityDraftFileController } from '../../capabilities/ai/infrastructure/controllers/opportunity-draft-file.controller';
import { CandidatesController } from '../../capabilities/candidates/infrastructure/controllers/candidates.controller';
import { ProcessCandidatesController } from '../../capabilities/processes/infrastructure/controllers/process-candidates.controller';
import { ProcessesController } from '../../capabilities/processes/infrastructure/controllers/processes.controller';
import { NO_BODY_LOG_KEY } from './no-body-log.decorator';

const handler = (controller: { prototype: object }, name: string): object =>
  Object.getOwnPropertyDescriptor(controller.prototype, name)?.value as object;
const marked = (target: object): unknown => Reflect.getMetadata(NO_BODY_LOG_KEY, target);

describe('@NoBodyLog() on controllers that carry free text or candidate PII', () => {
  it.each([['ask'], ['opportunityDraft']])('should mark AiController.%s', (name) => {
    expect(marked(handler(AiController, name))).toBe(true);
  });

  it('should mark OpportunityDraftFileController.opportunityDraftFile', () => {
    expect(marked(handler(OpportunityDraftFileController, 'opportunityDraftFile'))).toBe(true);
  });

  it('should mark ProcessesController.detail (embeds candidate names) but not the list', () => {
    expect(marked(handler(ProcessesController, 'detail'))).toBe(true);
    expect(marked(handler(ProcessesController, 'list'))).toBeUndefined();
  });

  it('should not mark AiController.status', () => {
    expect(marked(handler(AiController, 'status'))).toBeUndefined();
    expect(marked(AiController)).toBeUndefined();
  });

  it.each([['extractCv'], ['create'], ['update']])('should mark CandidatesController.%s', (name) => {
    expect(marked(handler(CandidatesController, name))).toBe(true);
  });

  it.each([
    ['CandidatesListController', CandidatesListController],
    ['AvailableCandidatesController', AvailableCandidatesController],
    ['ProcessCandidatesController', ProcessCandidatesController],
  ])('should mark %s at class level', (_name, controller) => {
    expect(marked(controller)).toBe(true);
  });
});
