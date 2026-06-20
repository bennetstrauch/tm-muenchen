import { getCurrentTenant } from '@/lib/tenant';
import LoginForm from './login-form';

export default async function LoginPage() {
  const { city } = await getCurrentTenant();
  return <LoginForm city={city} />;
}
