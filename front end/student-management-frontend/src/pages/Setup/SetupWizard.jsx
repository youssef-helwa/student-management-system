import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import SetupStepper from '../../components/setup/SetupStepper';
import BranchStep from '../../components/setup/BranchStep';
import GradesStep from '../../components/setup/GradesStep';
import ClassesStep from '../../components/setup/ClassesStep';
import FeesStep from '../../components/setup/FeesStep';
import CompleteStep from '../../components/setup/CompleteStep';
import { useSetupStatus } from '../../context/SetupStatusContext';
import { PATHS } from '../../router/paths';

const STEPS = ['Branch', 'Grades', 'Classes', 'Grade Fees', 'Complete'];

export default function SetupWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const { markSetupComplete } = useSetupStatus();

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }
  function finish() {
    // Setup is now truly done — update the app's cached setup-status flag
    // so /login stops bouncing back to /setup, then hand off to it.
    markSetupComplete();
    navigate(PATHS.login, { replace: true, state: { setupSuccess: true } });
  }

  return (
    <AuthLayout wide>
      <SetupStepper steps={STEPS} currentIndex={stepIndex} />

      {stepIndex === 0 && <BranchStep onNext={next} />}
      {stepIndex === 1 && <GradesStep onNext={next} onBack={back} />}
      {stepIndex === 2 && <ClassesStep onNext={next} onBack={back} />}
      {stepIndex === 3 && <FeesStep onNext={next} onBack={back} />}
      {stepIndex === 4 && <CompleteStep onFinish={finish} />}
    </AuthLayout>
  );
}
