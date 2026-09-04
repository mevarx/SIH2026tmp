import { useEffect, useState } from 'react';
import { Shield, Terminal, Database } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Tabs, TabItem } from '../ui/Tabs';
import { AuditTrailTab } from '../inspector/AuditTrailTab';
import { SandboxConsoleTab } from '../inspector/SandboxConsoleTab';
import { RagInspectorTab } from '../inspector/RagInspectorTab';
import { TaskType } from '../../types/task';

interface InspectorDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  activeChatMode: TaskType;
}

export function InspectorDrawer({
  isOpen,
  onToggle,
  activeChatMode,
}: InspectorDrawerProps) {
  // Context-sensitive default tab based on chat mode per PRD Section 4.3
  const [activeTab, setActiveTab] = useState<'audit' | 'sandbox' | 'rag'>('audit');

  useEffect(() => {
    if (activeChatMode === 'sandbox') {
      setActiveTab('sandbox');
    } else if (activeChatMode === 'rag') {
      setActiveTab('rag');
    } else {
      setActiveTab('audit');
    }
  }, [activeChatMode]);

  const tabs: TabItem[] = [
    { id: 'audit', label: 'Audit Trail', icon: Shield },
    { id: 'sandbox', label: 'Docker Sandbox', icon: Terminal },
    { id: 'rag', label: 'RAG Inspector', icon: Database },
  ];

  return (
    <Sheet
      isOpen={isOpen}
      onToggle={onToggle}
      title="System Inspector"
      width={400}
    >
      <div className="flex flex-col h-full gap-3">
        {/* Tab Switcher */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="underline"
          className="pb-1"
        />

        {/* Tab Panes */}
        <div className="flex-1 overflow-hidden pt-1">
          {activeTab === 'audit' && <AuditTrailTab />}
          {activeTab === 'sandbox' && <SandboxConsoleTab />}
          {activeTab === 'rag' && <RagInspectorTab />}
        </div>
      </div>
    </Sheet>
  );
}
