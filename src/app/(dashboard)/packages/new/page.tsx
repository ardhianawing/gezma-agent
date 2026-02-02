import { redirect } from 'next/navigation';

export default function NewPackagePage() {
  // Redirect to list for now - would be full package builder form
  redirect('/packages');
}
