import { loginUser } from './auth.infra';
import { httpClient } from '@shared/infrastructure/httpClient';
import { HttpError } from '@shared/infrastructure/httpError';

vi.mock('@shared/infrastructure/httpClient', () => ({
  httpClient: { post: vi.fn() },
}));

const mockedPost = httpClient.post as ReturnType<typeof vi.fn>;

describe('loginUser', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('should resolve with the mapped user and token on a successful dev-login', async () => {
    mockedPost.mockResolvedValue({
      accessToken: 'jwt-abc',
      user: { id: '1', email: 'ana@ibm.com', fullName: 'Ana García', role: 'recruiter' },
    });

    const result = await loginUser({ email: 'ana@ibm.com', password: 'password123' });

    expect(result).toEqual({
      token: 'jwt-abc',
      user: { id: '1', email: 'ana@ibm.com', role: 'recruiter', name: 'Ana García' },
    });
  });

  it('should reject with the propagated HttpError when the email is not provisioned', async () => {
    mockedPost.mockRejectedValue(new HttpError(401, 'Usuario no provisionado'));

    await expect(loginUser({ email: 'desconocido@ibm.com', password: 'password123' }))
      .rejects.toMatchObject({ name: 'HttpError', status: 401, message: 'Usuario no provisionado' });
  });

  it('should call httpClient.post with only the email, never the password', async () => {
    mockedPost.mockResolvedValue({
      accessToken: 'jwt-xyz',
      user: { id: '2', email: 'carlos@ibm.com', fullName: 'Carlos Londoño', role: 'technical_ref' },
    });

    await loginUser({ email: 'carlos@ibm.com', password: 'password123' });

    expect(mockedPost).toHaveBeenCalledWith('/auth/dev-login', { email: 'carlos@ibm.com' });
  });
});
