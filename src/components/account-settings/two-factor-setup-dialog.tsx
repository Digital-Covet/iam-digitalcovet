import {
  type SetupMode,
  TwoFactorSetupFlow,
} from "@/components/account-settings/two-factor-setup-flow";
import { Modal } from "@/components/ui/modal";

interface TwoFactorSetupDialogProps {
  open: boolean;
  mode: SetupMode;
  onOpenChange: (open: boolean) => void;
  onFinished: () => void;
}

export function TwoFactorSetupDialog(props: TwoFactorSetupDialogProps) {
  return (
    <Modal
      open={props.open}
      title={
        props.mode === "reset" ? "Reset Authenticator" : "Set Up Two-Factor"
      }
      onOpenChange={props.onOpenChange}
    >
      <TwoFactorSetupFlow
        mode={props.mode}
        onClose={() => props.onOpenChange(false)}
        onFinished={props.onFinished}
      />
    </Modal>
  );
}
