import ClassDetailClient from "./ClassDetailClient";

export function generateStaticParams() {
  return [
    { classId: "placeholder" },
    { classId: "c1" },
    { classId: "c2" },
    { classId: "c3" },
  ];
}

export default function ClassDetailPage() {
  return <ClassDetailClient />;
}
