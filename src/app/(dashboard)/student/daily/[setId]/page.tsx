import LearningSessionClient from './LearningSessionClient';

export function generateStaticParams() {
  return [{ setId: 'placeholder' }];
}

export default function LearningSessionPage() {
  return <LearningSessionClient />;
}
