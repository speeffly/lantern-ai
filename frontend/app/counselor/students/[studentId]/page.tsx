import StudentDetailClient from './StudentDetailClient';

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  return <StudentDetailClient studentId={params.studentId} />;
}