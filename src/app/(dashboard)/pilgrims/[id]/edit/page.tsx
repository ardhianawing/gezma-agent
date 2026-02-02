import { redirect } from 'next/navigation';

export default function EditPilgrimPage({ params }: { params: { id: string } }) {
  // For now, redirect to detail page
  // In production, this would be a full edit form
  redirect(`/pilgrims/${params.id}`);
}
