import StudentDetailClient from './StudentDetailClient';

export function generateStaticParams() {
  return [{ studentId: 'placeholder' }];
}

export default function StudentDetailPage() {
  return <StudentDetailClient />;
}
