import StudentDetailClient from "./StudentDetailClient";

export function generateStaticParams() {
  return [
    { studentId: "placeholder" },
    ...Array.from({ length: 15 }, (_, i) => ({ studentId: `s${i + 1}` })),
  ];
}

export default function StudentDetailPage() {
  return <StudentDetailClient />;
}
