import { useState } from 'react';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { InspectorDrawer } from './InspectorDrawer';
import { ChatFeed } from '../chat/ChatFeed';
import { ChatBar } from '../chat/ChatBar';
import { DragDropOverlay } from '../chat/DragDropOverlay';
import { SettingsModal } from '../modals/SettingsModal';
import { SystemInfoModal } from '../modals/SystemInfoModal';
import { useTaskStream } from '../../hooks/useTaskStream';
import { useDragDrop } from '../../hooks/useDragDrop';
import { TaskType, TaskAttachment } from '../../types/task';

interface ConsoleShellProps {
  onReturnToHero?: () => void;
}

export function ConsoleShell({ onReturnToHero }: ConsoleShellProps) {
  const [sessionName, setSessionName] = useState('Zero-Egress Session');
  const [currentSessionId, setCurrentSessionId] = useState('sess-1');
  const [currentMode, setCurrentMode] = useState<TaskType>('general');
  const [temperature, setTemperature] = useState(0.7);
  const [sandboxEnforced, setSandboxEnforced] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'auditor' | 'admin'>('user');

  // Inspector Drawer state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);

  // External prompt state for prompt chips
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>(undefined);

  // Custom task streaming hook
  const {
    messages,
    isStreaming,
    submitTask,
    cancelTask,
    clearMessages,
  } = useTaskStream();

  // Drag and drop hook
  const handleDropFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Route dropped file to active prompt context
    const type: 'document' | 'image' | 'code' =
      file.name.match(/\.(png|jpe?g|webp)$/i)
        ? 'image'
        : file.name.match(/\.(py|ts|tsx|js|json|sh)$/i)
        ? 'code'
        : 'document';

    const attachment: TaskAttachment = {
      filename: file.name,
      filePath: `/data/uploads/${file.name}`,
      fileSize: file.size,
      ocrApplied: type === 'image' || file.name.endsWith('.pdf'),
      type,
    };

    submitTask(`Analyze and inspect uploaded ${type}: ${file.name}`, currentMode, {
      attachment,
      sandbox: sandboxEnforced,
      temperature,
    });
  };

  const { isDraggingOver } = useDragDrop(handleDropFiles);

  const handleNewSession = () => {
    clearMessages();
    setSessionName('New Investigation');
    setCurrentSessionId(`sess-${Date.now()}`);
  };

  const handleSelectMode = (mode: TaskType) => {
    setCurrentMode(mode);
    if (mode === 'sandbox') {
      setSandboxEnforced(true);
    }
  };

  const handleSubmitPrompt = (prompt: string, attachment?: TaskAttachment) => {
    submitTask(prompt, currentMode, {
      attachment,
      sandbox: sandboxEnforced,
      temperature,
    });
  };

  const handleRunCodeInSandbox = (code: string) => {
    setCurrentMode('sandbox');
    setSandboxEnforced(true);
    setIsInspectorOpen(true);
    submitTask(`Execute following code in sandbox:\n\`\`\`python\n${code}\n\`\`\``, 'sandbox', {
      sandbox: true,
      temperature: 0.1,
    });
  };

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Full-console Drag & Drop Overlay */}
      <DragDropOverlay isVisible={isDraggingOver} />

      {/* Top Bar per PRD Section 4.1 */}
      <TopBar
        sessionName={sessionName}
        onRenameSession={setSessionName}
        onNewSession={handleNewSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReturnToHero={onReturnToHero}
      />

      {/* Center Console Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar per PRD Section 4.2 */}
        <LeftSidebar
          currentSessionId={currentSessionId}
          onSelectSession={(id) => setCurrentSessionId(id)}
          onNewSession={handleNewSession}
        />

        {/* Center Chat Feed & Composer */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <ChatFeed
            messages={messages}
            onSelectPromptChip={(prompt) => setExternalPrompt(prompt)}
            onOpenSandbox={() => {
              setCurrentMode('sandbox');
              setIsInspectorOpen(true);
            }}
            onRunCode={handleRunCodeInSandbox}
          />

          <ChatBar
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            onSubmitPrompt={handleSubmitPrompt}
            onCancelStream={cancelTask}
            isStreaming={isStreaming}
            externalPrompt={externalPrompt}
            onClearExternalPrompt={() => setExternalPrompt(undefined)}
            temperature={temperature}
            onChangeTemperature={setTemperature}
            sandboxEnforced={sandboxEnforced}
            onToggleSandboxEnforced={setSandboxEnforced}
          />
        </div>

        {/* Right Inspector Drawer per PRD Section 4.3 */}
        <InspectorDrawer
          isOpen={isInspectorOpen}
          onToggle={() => setIsInspectorOpen((prev) => !prev)}
          activeChatMode={currentMode}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        temperature={temperature}
        onChangeTemperature={setTemperature}
        role={userRole}
        onChangeRole={setUserRole}
      />

      <SystemInfoModal
        isOpen={isSystemInfoOpen}
        onClose={() => setIsSystemInfoOpen(false)}
      />
    </div>
  );
}
