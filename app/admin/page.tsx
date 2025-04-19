import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to the static admin page
  redirect('/admin/index.html');
}
