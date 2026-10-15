import { loginUser } from './auth.infra';
import { DEMO_USERS } from './authDemoUsers';

describe('loginUser', () => {
  it('should resolve with the matching demo user and a token for a provisioned email', async () => {
    const demoUser = DEMO_USERS[0];
    const result = await loginUser({ email: demoUser.email, password: 'password123' });
    expect(result.user).toEqual(demoUser);
    expect(result.token).toBe('mock-jwt-token');
  });

  it('should resolve with the correct role for each demo user', async () => {
    const results = await Promise.all(
      DEMO_USERS.map(user => loginUser({ email: user.email, password: 'password123' })),
    );
    expect(results.map(r => r.user.role)).toEqual(DEMO_USERS.map(u => u.role));
  });

  it('should reject with "usuario no provisionado" for an unknown @ibm.com email', async () => {
    await expect(loginUser({ email: 'desconocido@ibm.com', password: 'password123' }))
      .rejects.toThrow('Usuario no provisionado');
  });

  it('should reject with a generic error for a non-ibm.com email', async () => {
    await expect(loginUser({ email: 'ana@gmail.com', password: 'password123' }))
      .rejects.toThrow('Credenciales incorrectas');
  });

  it('should reject with a generic error when the password is too short', async () => {
    await expect(loginUser({ email: DEMO_USERS[0].email, password: '123' }))
      .rejects.toThrow('Credenciales incorrectas');
  });
});
