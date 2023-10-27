import { useMutation } from 'react-query';
import { AuthService } from '../services';

const authService = new AuthService();

const signInUser = (data: ILoginDataProps) => authService.signIn(data);

const useSignOutUser = () =>
  useMutation((data: Record<string, string>) => authService.signOut(data));

const useSignInUser = () => useMutation(signInUser);

export { useSignInUser, useSignOutUser };
