export interface PermissionPromptProps {
  onRequestPermission: () => Promise<void>;
}

export interface NotificationInstructionsProps {
  onClose: () => void;
}
