import { redirect } from 'next/navigation';

export default function EditPackagePage({ params }: { params: { id: string } }) {
  redirect(`/packages/${params.id}`);
}
