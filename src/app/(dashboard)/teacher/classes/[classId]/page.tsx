import ClassDetailClient from './ClassDetailClient';

export function generateStaticParams() {
  return [{ classId: 'placeholder' }];
}

export default function ClassDetailPage() {
  return <ClassDetailClient />;
}
