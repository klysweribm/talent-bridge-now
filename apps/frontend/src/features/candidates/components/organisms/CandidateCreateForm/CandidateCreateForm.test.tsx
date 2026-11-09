import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ICandidate, ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { createCandidate, extractCv } from '../../../infrastructure/candidates.infra';
import { makeCandidate, makeFile, makeResult, renderPage } from '../../../test-utils';
import { CandidateCreateForm, type ICandidateCreateFormState } from './CandidateCreateForm';

vi.mock('../../../infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

const extract = vi.mocked(extractCv);
const create = vi.mocked(createCandidate);

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>(res => { resolve = res; });
  return { promise, resolve };
}

async function fillManual(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Persona Inventada');
  await user.type(screen.getByLabelText(/correo/i), 'persona@example.com');
}

describe('CandidateCreateForm', () => {
  beforeEach(() => { extract.mockReset(); create.mockReset(); });

  it('should call onSuccess with the saved candidate and never render the created panel when saving', async () => {
    const saved = makeCandidate();
    create.mockResolvedValue(saved);
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderPage(<CandidateCreateForm onSuccess={onSuccess} />);
    await user.click(screen.getByRole('button', { name: /escritura manual/i }));
    await fillManual(user);
    await user.click(screen.getByRole('button', { name: /crear candidato/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(saved, 'created'));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /cargar otro/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  describe('onStateChange', () => {
    function setup(): { states: ICandidateCreateFormState[]; last: () => ICandidateCreateFormState } {
      const states: ICandidateCreateFormState[] = [];
      renderPage(<CandidateCreateForm onSuccess={vi.fn()} onStateChange={s => states.push(s)} />);
      return { states, last: () => states[states.length - 1] };
    }

    it('should report clean and idle when nothing was done', () => {
      const { last } = setup();
      expect(last()).toEqual({ busy: false, dirty: false });
    });

    it('should report dirty when a file is chosen', async () => {
      const { last } = setup();
      await userEvent.upload(screen.getByLabelText(/archivo del cv/i), makeFile());
      expect(last()).toEqual({ busy: false, dirty: true });
    });

    it('should report busy while the extraction is pending and dirty with the result afterwards', async () => {
      const pending = deferred<ICvExtractionResult>();
      extract.mockReturnValue(pending.promise);
      const { last } = setup();
      const user = userEvent.setup();
      await user.upload(screen.getByLabelText(/archivo del cv/i), makeFile());
      await user.click(screen.getByRole('button', { name: /extraer perfil/i }));
      await waitFor(() => expect(last()).toEqual({ busy: true, dirty: true }));
      await act(async () => { pending.resolve(makeResult('classic')); await pending.promise; });
      await screen.findByLabelText(/nombre completo/i);
      expect(last()).toEqual({ busy: false, dirty: true });
    });

    it('should stay clean in manual mode until the user edits a field', async () => {
      const { last } = setup();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /escritura manual/i }));
      expect(last()).toEqual({ busy: false, dirty: false });
      await user.type(screen.getByLabelText(/nombre completo/i), 'P');
      expect(last()).toEqual({ busy: false, dirty: true });
    });

    it('should report busy while the save is pending', async () => {
      const pending = deferred<ICandidate>();
      create.mockReturnValue(pending.promise);
      const { last } = setup();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /escritura manual/i }));
      await fillManual(user);
      await user.click(screen.getByRole('button', { name: /crear candidato/i }));
      await waitFor(() => expect(last().busy).toBe(true));
      await act(async () => { pending.resolve(makeCandidate()); await pending.promise; });
      await waitFor(() => expect(last().busy).toBe(false));
    });

    it('should flag saving only while the save is pending, never during an extraction', async () => {
      const pendingExtraction = deferred<ICvExtractionResult>();
      extract.mockReturnValue(pendingExtraction.promise);
      const pendingSave = deferred<ICandidate>();
      create.mockReturnValue(pendingSave.promise);
      const { states, last } = setup();
      const user = userEvent.setup();
      await user.upload(screen.getByLabelText(/archivo del cv/i), makeFile());
      await user.click(screen.getByRole('button', { name: /extraer perfil/i }));
      await waitFor(() => expect(last().busy).toBe(true));
      expect(states.some(s => s.saving === true)).toBe(false);
      await act(async () => { pendingExtraction.resolve(makeResult('classic')); await pendingExtraction.promise; });
      await screen.findByLabelText(/nombre completo/i);
      await user.click(screen.getByRole('button', { name: /crear candidato/i }));
      await waitFor(() => expect(last()).toEqual({ busy: true, dirty: true, saving: true }));
      await act(async () => { pendingSave.resolve(makeCandidate()); await pendingSave.promise; });
      await waitFor(() => expect(last().saving).toBeFalsy());
    });
  });

  it('should force a single column in the extractor cards when stacked', () => {
    renderPage(<CandidateCreateForm onSuccess={vi.fn()} stacked />);
    const grid = screen.getAllByRole('radio')[0].closest('div');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).not.toHaveClass('sm:grid-cols-3');
  });

  it('should keep the three-column breakpoint layout when not stacked', () => {
    renderPage(<CandidateCreateForm onSuccess={vi.fn()} />);
    expect(screen.getAllByRole('radio')[0].closest('div')).toHaveClass('sm:grid-cols-3');
  });

  it('should not render Cancelar when onCancel is not given', async () => {
    renderPage(<CandidateCreateForm onSuccess={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /^cancelar$/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /escritura manual/i }));
    expect(screen.queryByRole('button', { name: /^cancelar$/i })).not.toBeInTheDocument();
  });

  it('should call onCancel from the upload step and from the review step', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderPage(<CandidateCreateForm onSuccess={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /^cancelar$/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /escritura manual/i }));
    await user.click(screen.getByRole('button', { name: /^cancelar$/i }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('should apply nothing when unmounted during an extraction', async () => {
    const pending = deferred<ICvExtractionResult>();
    extract.mockReturnValue(pending.promise);
    const onSuccess = vi.fn();
    const onStateChange = vi.fn();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    const view = renderPage(<CandidateCreateForm onSuccess={onSuccess} onStateChange={onStateChange} />);
    await user.upload(screen.getByLabelText(/archivo del cv/i), makeFile());
    await user.click(screen.getByRole('button', { name: /extraer perfil/i }));
    await waitFor(() => expect(extract).toHaveBeenCalled());
    view.unmount();
    onStateChange.mockClear();
    await act(async () => { pending.resolve(makeResult('classic')); await pending.promise; });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onStateChange).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
