import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  Cpu, 
  Play, 
  Square, 
  Terminal, 
  Activity, 
  Database, 
  Globe, 
  Code, 
  HelpCircle, 
  AlertTriangle, 
  Save, 
  FolderOpen, 
  Plus, 
  Edit, 
  Pause, 
  Undo, 
  Redo, 
  X,
  Info,
  MousePointerClick,
  MousePointer,
  Keyboard,
  Type,
  Clock,
  Monitor,
  GitFork,
  GitPullRequest,
  Repeat,
  ArrowRight,
  DatabaseZap
} from "lucide-react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import WaypointEdge from "./components/WaypointEdge";
import NodeProperties from "./components/NodeProperties";

// Helper component to render Lucide Icons dynamically
const NodeIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ComponentType<any>> = {
    Play,
    MousePointerClick,
    MousePointer,
    Keyboard,
    Type,
    Clock,
    Monitor,
    GitFork,
    GitPullRequest,
    Repeat,
    ArrowRight,
    Square,
    Database,
    Globe,
    Code,
    HelpCircle,
    AlertTriangle,
    DatabaseZap
  };
  const IconComponent = icons[name] || HelpCircle;
  return <IconComponent className={className} />;
};

// Node Category Configurations - Colored Headers for the Original Light Theme
const CATEGORIES: Record<string, { bg: string; text: string; label: string }> = {
  core: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-600", label: "Core" },
  mouse: { bg: "bg-purple-50 border-purple-200", text: "text-purple-600", label: "Mouse" },
  keyboard: { bg: "bg-pink-50 border-pink-200", text: "text-pink-600", label: "Teclado" },
  time: { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", label: "Tempo" },
  utility: { bg: "bg-teal-50 border-teal-200", text: "text-teal-600", label: "Utilitário" },
  logic: { bg: "bg-violet-50 border-violet-200", text: "text-violet-600", label: "Lógica" },
  storage: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600", label: "Armazenamento" },
  database: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-600", label: "Banco de Dados" },
  network: { bg: "bg-sky-50 border-sky-200", text: "text-sky-600", label: "Rede" },
  scripting: { bg: "bg-orange-50 border-orange-200", text: "text-orange-600", label: "Scripting" },
  ui: { bg: "bg-rose-50 border-rose-200", text: "text-rose-600", label: "Interface" },
};

// Custom Node component styled to match the original clean Card look
const WorkflowNode = ({ data, selected }: any) => {
  const type = data.type || "unknown";
  const properties = data.properties || {};
  const cat = CATEGORIES[data.category] || CATEGORIES.core;
  const isActive = data.isActive;
  const isError = data.isError;

  // Custom renders for properties preview text
  const renderPreview = () => {
    switch (type) {
      case "start":
        return `Modo: ${properties.loop_mode || "Executar 1 vez"}`;
      case "click":
      case "move_mouse":
        return `Coords: X=${properties.x ?? "?"}, Y=${properties.y ?? "?"}`;
      case "key":
        return `Tecla: ${properties.key || "?"} (x${properties.count || 1})`;
      case "type_text":
        return `Texto: ${properties.text ? (properties.text.substring(0, 18) + (properties.text.length > 18 ? "..." : "")) : "?"}`;
      case "delay":
        return `Espera: ${properties.seconds ?? "1"}s`;
      case "capture":
        return properties.capture_type || "Janela Ativa";
      case "condition":
        return `${properties.variable_path || "var"} ${properties.operator || "=="} ${properties.value || "val"}`;
      case "switch":
        return `Valor: ${properties.variable_path || "?"}`;
      case "loop":
        return `Array: ${properties.source_array || "?"}`;
      case "storage_var":
        return `${properties.var_name || "?"} = ${properties.var_value || "?"}`;
      case "confirm_dialog":
        return `Confirmação: ${properties.title || "?"}`;
      case "alert_dialog":
        return `Alerta: ${properties.title || "?"}`;
      case "postgres":
      case "mysql":
      case "sqlite":
        return `DB: ${properties.connection_name || "?"}`;
      case "api":
        return `${properties.method || "GET"} ${properties.url || "?"}`;
      case "js":
      case "python":
        return `Código: ${type.toUpperCase()}`;
      default:
        return data.description || "Nó customizado";
    }
  };

  const getSourceHandles = () => {
    if (type === "condition") {
      const handles = [
        { id: "out_true", label: "Verdadeiro", color: "bg-emerald-500" },
        { id: "out_false", label: "Falso", color: "bg-red-500" }
      ];
      const elseIfs = properties.else_ifs || [];
      elseIfs.forEach((_: any, idx: number) => {
        handles.push({ id: `out_else_if_${idx}`, label: `Senão Se #${idx + 1}`, color: "bg-purple-500" });
      });
      return handles;
    }
    
    if (type === "loop") {
      return [
        { id: "out_item", label: "Iterar Item", color: "bg-blue-500" },
        { id: "out_done", label: "Ao Terminar", color: "bg-slate-500" }
      ];
    }
    
    if (type === "switch") {
      const handles = (properties.cases || []).map((cs: string, idx: number) => ({
        id: `out_case_${idx}`,
        label: `Caso: ${cs}`,
        color: "bg-blue-500"
      }));
      handles.push({ id: "out_default", label: "Padrão", color: "bg-slate-400" });
      return handles;
    }

    if (data.hasOutput) {
      return [{ id: "out", label: "", color: "bg-primary" }];
    }
    return [];
  };

  return (
    <div 
      style={{ width: 280 }}
      className={`shadow-sm rounded-lg border bg-card text-card-foreground text-xs font-sans overflow-hidden transition-all duration-200
        ${isActive ? "border-amber-500 ring-2 ring-amber-500/20" : isError ? "border-red-500 ring-2 ring-red-500/20" : selected ? "border-primary" : "border-border hover:border-slate-300"}
      `}
    >
      {/* Header - Styled like original */}
      <div className={`border-b px-3 py-1.5 font-bold uppercase tracking-wider text-[9px] flex items-center justify-between ${cat.bg} ${cat.text}`}>
        <div className="flex items-center gap-1.5">
          <NodeIcon name={data.iconName || "HelpCircle"} className="h-3.5 w-3.5 shrink-0" />
          <span>{data.title || "NÓ"}</span>
        </div>
        {data.id !== "start" && (
          <span className="opacity-60 text-[8px] font-mono">ID: {data.id?.substring(0, 5)}</span>
        )}
      </div>

      {/* Body - Styled like original */}
      <div className="p-3 bg-card">
        <div className="font-semibold text-foreground leading-tight">{renderPreview()}</div>
        <div className="text-muted-foreground mt-1 text-[10px] leading-normal">{data.description || "Configuração Padrão"}</div>
      </div>

      {/* Input Handle (Left) */}
      {data.hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          className="w-2.5 h-2.5 bg-primary border-2 border-background rounded-full hover:scale-125 transition-transform"
          style={{ left: "-5px" }}
        />
      )}

      {/* Output Handles (Right) */}
      <div className="flex flex-col gap-2 py-1 items-end justify-center relative bg-card">
        {getSourceHandles().map((h: any, idx: number) => {
          const count = getSourceHandles().length;
          const percentage = count > 1 ? ((idx + 1) / (count + 1)) * 100 : 50;
          return (
            <div key={h.id} className="flex items-center gap-1.5 pr-2 h-4 select-none">
              {h.label && <span className="text-[8px] text-muted-foreground font-bold uppercase">{h.label}</span>}
              <Handle
                type="source"
                position={Position.Right}
                id={h.id}
                className={`w-2.5 h-2.5 ${h.color} border-2 border-background rounded-full hover:scale-125 transition-transform`}
                style={{ right: "-5px", top: `${percentage}%`, transform: "translateY(-50%)" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Accordion nodes list setup
const nodeCategories = [
  {
    name: "⚙️ Core (Principal)",
    category: "core",
    nodes: [
      {
        type: "start",
        title: "Início",
        description: "O ponto de entrada obrigatório do fluxo. Configura o modo de execução (execução única, N vezes ou loop infinito).",
        hasInput: false,
        hasOutput: true,
        iconName: "Play",
        category: "core",
        properties: { loop_mode: "Executar 1 vez" }
      }
    ]
  },
  {
    name: "🖱️ Mouse",
    category: "mouse",
    nodes: [
      {
        type: "click",
        title: "Clique por Coordenada",
        description: "Simula um clique esquerdo do mouse em coordenadas X/Y específicas da tela.",
        hasInput: true,
        hasOutput: true,
        iconName: "MousePointerClick",
        category: "mouse",
        properties: { x: "0", y: "0" }
      },
      {
        type: "move_mouse",
        title: "Mover Cursor",
        description: "Movimenta o cursor do mouse para coordenadas X/Y sem clicar.",
        hasInput: true,
        hasOutput: true,
        iconName: "MousePointer",
        category: "mouse",
        properties: { x: "0", y: "0" }
      }
    ]
  },
  {
    name: "⌨️ Keyboard (Teclado)",
    category: "keyboard",
    nodes: [
      {
        type: "key",
        title: "Pressionar Tecla",
        description: "Simula o pressionamento de teclas simples ou atalhos (ex: Enter, Tab, Ctrl, Shift).",
        hasInput: true,
        hasOutput: true,
        iconName: "Keyboard",
        category: "keyboard",
        properties: { key: "", count: 1 }
      },
      {
        type: "type_text",
        title: "Digitar Texto",
        description: "Digita sequências de texto no campo ativo, com suporte a substituição dinâmica de variáveis.",
        hasInput: true,
        hasOutput: true,
        iconName: "Type",
        category: "keyboard",
        properties: { text: "" }
      }
    ]
  },
  {
    name: "⏱️ Timing (Tempo)",
    category: "time",
    nodes: [
      {
        type: "delay",
        title: "Aguardar / Delay",
        description: "Insere uma pausa temporizada na execução do fluxo por um período determinado em segundos.",
        hasInput: true,
        hasOutput: true,
        iconName: "Clock",
        category: "time",
        properties: { seconds: "1" }
      }
    ]
  },
  {
    name: "🔍 Utility (Utilitários)",
    category: "utility",
    nodes: [
      {
        type: "capture",
        title: "Capturar Dados Window",
        description: "Obtém dados do sistema, como título da janela activa, HWND e tipo de cursor.",
        hasInput: true,
        hasOutput: true,
        iconName: "Monitor",
        category: "utility",
        properties: { capture_type: "Dados da Janela Ativa" }
      }
    ]
  },
  {
    name: "🔀 Logic (Lógica)",
    category: "logic",
    nodes: [
      {
        type: "condition",
        title: "Condicional",
        description: "Cria ramificações baseadas em comparações lógicas (se contém, se é igual, maior que, etc.).",
        hasInput: true,
        hasOutput: true,
        iconName: "GitFork",
        category: "logic",
        properties: { variable_path: "", operator: "igual", value: "", else_ifs: [] }
      },
      {
        type: "switch",
        title: "Switch Case",
        description: "Executa desvios múltiplos e direciona o fluxo conforme o valor de uma variável.",
        hasInput: true,
        hasOutput: true,
        iconName: "GitPullRequest",
        category: "logic",
        properties: { variable_path: "", cases: [] }
      },
      {
        type: "loop",
        title: "Loop",
        description: "Itera sobre uma lista de dados ou array armazenado no payload.",
        hasInput: true,
        hasOutput: true,
        iconName: "Repeat",
        category: "logic",
        properties: { source_array: "" }
      },
      {
        type: "continue_loop",
        title: "Próximo Item Loop",
        description: "Pula imediatamente para a próxima iteração do loop ativo.",
        hasInput: true,
        hasOutput: true,
        iconName: "ArrowRight",
        category: "logic",
        properties: {}
      },
      {
        type: "break_loop",
        title: "Interromper Loop",
        description: "Interrompe e encerra por completo o loop atual.",
        hasInput: true,
        hasOutput: true,
        iconName: "Square",
        category: "logic",
        properties: {}
      }
    ]
  },
  {
    name: "📦 Storage (Armazenamento)",
    category: "storage",
    nodes: [
      {
        type: "storage_var",
        title: "Variável de Armazenamento",
        description: "Declara e salva variáveis no payload global para serem lidas por outros nós subsequentes.",
        hasInput: true,
        hasOutput: true,
        iconName: "Database",
        category: "storage",
        properties: { var_name: "", var_value: "" }
      }
    ]
  },
  {
    name: "🗄️ Database (Banco de Dados)",
    category: "database",
    nodes: [
      {
        type: "postgres",
        title: "PostgreSQL Query",
        description: "Executa comandos SQL em uma base PostgreSQL configurada.",
        hasInput: true,
        hasOutput: true,
        iconName: "DatabaseZap",
        category: "database",
        properties: { connection_name: "", query: "" }
      },
      {
        type: "mysql",
        title: "MySQL Query",
        description: "Executa comandos SQL em uma base MySQL configurada.",
        hasInput: true,
        hasOutput: true,
        iconName: "DatabaseZap",
        category: "database",
        properties: { connection_name: "", query: "" }
      },
      {
        type: "sqlite",
        title: "SQLite Query",
        description: "Executa comandos SQL em uma base SQLite local.",
        hasInput: true,
        hasOutput: true,
        iconName: "DatabaseZap",
        category: "database",
        properties: { connection_name: "", query: "" }
      }
    ]
  },
  {
    name: "🌐 Network (Rede)",
    category: "network",
    nodes: [
      {
        type: "api",
        title: "Requisição API",
        description: "Envia requisições HTTP (GET, POST, etc.) permitindo personalizar cabeçalhos e corpo.",
        hasInput: true,
        hasOutput: true,
        iconName: "Globe",
        category: "network",
        properties: { connection_name: "", method: "GET", url: "", headers: "", body: "" }
      }
    ]
  },
  {
    name: "💻 Scripting (Scripts)",
    category: "scripting",
    nodes: [
      {
        type: "js",
        title: "Executar JavaScript",
        description: "Roda scripts JavaScript para tratamentos complexos de payloads na memória.",
        hasInput: true,
        hasOutput: true,
        iconName: "Code",
        category: "scripting",
        properties: { code: "// payload['resultado'] = 123;\nlog('Executando JS...');" }
      },
      {
        type: "python",
        title: "Executar Python",
        description: "Executa código Python customizado para tarefas e processamentos complexos.",
        hasInput: true,
        hasOutput: true,
        iconName: "Code",
        category: "scripting",
        properties: { code: "# payload['resultado'] = 'python'\nlog('Olá Python')" }
      }
    ]
  },
  {
    name: "💬 UI / Dialogs (Interface)",
    category: "ui",
    nodes: [
      {
        type: "confirm_dialog",
        title: "Confirmar Ação / Windows",
        description: "Abre uma janela com opções 'Sim' e 'Não', salvando a escolha como booleano.",
        hasInput: true,
        hasOutput: true,
        iconName: "HelpCircle",
        category: "ui",
        properties: { title: "Confirmar", message: "Deseja continuar?", label_true: "Sim", label_false: "Não", target_var: "confirm_res" }
      },
      {
        type: "alert_dialog",
        title: "Alerta / Aviso / Windows",
        description: "Abre uma pop-up de alerta com uma mensagem informativa e um botão 'OK'.",
        hasInput: true,
        hasOutput: true,
        iconName: "AlertTriangle",
        category: "ui",
        properties: { title: "Aviso", message: "A operação foi concluída.", label_ok: "OK" }
      }
    ]
  }
];

const initialNodes: Node[] = [
  {
    id: "start",
    type: "workflow",
    position: { x: 200, y: 180 },
    data: { 
      id: "start",
      type: "start",
      title: "Início", 
      description: "O ponto de entrada obrigatório do fluxo. Configura o modo de execução (execução única, N vezes ou loop infinito).", 
      hasInput: false,
      hasOutput: true,
      iconName: "Play",
      category: "core",
      properties: { loop_mode: "Executar 1 vez" }
    },
  }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function resolveVariable(value: any, payload: any): any {
  if (typeof value !== "string") return value;

  const singleMatch = value.match(/^\{([a-zA-Z0-9_\.]+)\}$/) || value.match(/^\{\{([a-zA-Z0-9_\.]+)\}\}$/);
  if (singleMatch) {
    const path = singleMatch[1];
    const resolved = getNestedValue(payload, path);
    if (resolved !== undefined) return resolved;
  }

  return value.replace(/\{([a-zA-Z0-9_\.]+)\}/g, (match, path) => {
    const resolved = getNestedValue(payload, path);
    return resolved !== undefined ? (typeof resolved === "object" ? JSON.stringify(resolved) : String(resolved)) : match;
  }).replace(/\{\{([a-zA-Z0-9_\.]+)\}\}/g, (match, path) => {
    const resolved = getNestedValue(payload, path);
    return resolved !== undefined ? (typeof resolved === "object" ? JSON.stringify(resolved) : String(resolved)) : match;
  });
}

function extractLoopArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") {
    if (Array.isArray(val.rows)) return val.rows;
    if (Array.isArray(val.body)) return val.body;
    for (const key of Object.keys(val)) {
      if (Array.isArray(val[key])) return val[key];
    }
  }
  return [];
}

interface DialogConfig {
  show: boolean;
  type: "alert" | "confirm";
  title: string;
  message: string;
  labelOk?: string;
  labelTrue?: string;
  labelFalse?: string;
  resolve?: (value: boolean) => void;
}

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // States
  const [logs, setLogs] = useState<string[]>(["Canvas limpo. Novo fluxo iniciado."]);
  const [payload, setPayload] = useState<any>({ __active_loops__: [] });
  const [executionState, setExecutionState] = useState<"idle" | "running" | "paused" | "stopped">("idle");
  const [isRunningWithHide, setIsRunningWithHide] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Connections CRUD state profiles
  const [savedConnections, setSavedConnections] = useState<any>({});
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [editingConnName, setEditingConnName] = useState<string | null>(null);
  const [connName, setConnName] = useState("");
  const [connType, setConnType] = useState("sqlite");
  const [connConfig, setConnConfig] = useState<any>({});
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string; schema?: any } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Lasso selection mode
  const [lassoMode, setLassoMode] = useState(false);

  // Modals Dialog
  const [dialog, setDialog] = useState<DialogConfig>({ show: false, type: "alert", title: "", message: "" });

  // Console Resizing state
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(180);
  const [isResizing, setIsResizing] = useState(false);

  // History stacks
  const [past, setPast] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [future, setFuture] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  }, []);

  const saveToHistory = useCallback(() => {
    setPast((prev) => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...prev]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    addLog("[HISTÓRICO] Desfazer (Undo) aplicado.");
  }, [past, nodes, edges, setNodes, setEdges, addLog]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    addLog("[HISTÓRICO] Refazer (Redo) aplicado.");
  }, [future, nodes, edges, setNodes, setEdges, addLog]);

  // Global keybindings
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "Z")) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" && selectedNodeId) {
        e.preventDefault();
        saveToHistory();
        setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
        setSelectedNodeId(null);
        addLog("Nó deletado.");
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [undo, redo, selectedNodeId, saveToHistory, setNodes, setEdges, addLog]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const handleNodePropertiesChange = useCallback((newProperties: any) => {
    saveToHistory();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              properties: newProperties
            }
          };
        }
        return node;
      })
    );
  }, [selectedNodeId, setNodes, saveToHistory]);

  const nodeTypes = useMemo(() => ({ workflow: WorkflowNode }), []);
  const edgeTypes = useMemo(() => ({ waypoint: WaypointEdge }), []);

  const onConnect = useCallback((params: Connection) => {
    saveToHistory();
    setEdges((eds) => addEdge({ ...params, type: "waypoint", data: { waypoints: [] } }, eds));
    const src = nodes.find(n => n.id === params.source);
    const dst = nodes.find(n => n.id === params.target);
    addLog(`[CONEXÃO] Conectado: [${src?.data.title || params.source}] -> [${dst?.data.title || params.target}]`);
  }, [nodes, setEdges, saveToHistory, addLog]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const addNode = (n: any) => {
    saveToHistory();
    const newId = `${n.type}_${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: "workflow",
      position: { 
        x: 250 + Math.random() * 80, 
        y: 180 + Math.random() * 80 
      },
      data: {
        id: newId,
        type: n.type,
        title: n.title,
        description: n.description,
        hasInput: n.hasInput,
        hasOutput: n.hasOutput,
        iconName: n.iconName,
        category: n.category,
        properties: JSON.parse(JSON.stringify(n.properties))
      }
    };
    setNodes((nds) => [...nds, newNode]);
    addLog(`[NÓ] Adicionado: ${n.title}`);
  };

  const autoLayout = () => {
    saveToHistory();
    let visited = new Set<string>();
    let queue = [{ id: "start", col: 0, row: 0 }];
    let colCounts: number[] = [1];
    let nodePositions: Record<string, { x: number; y: number }> = {
      start: { x: 200, y: 180 }
    };
    
    visited.add("start");
    
    while (queue.length > 0) {
      const { id, col } = queue.shift()!;
      const outgoing = edges.filter(e => e.source === id);
      outgoing.forEach((edge) => {
        const targetId = edge.target;
        if (!visited.has(targetId)) {
          visited.add(targetId);
          const nextCol = col + 1;
          colCounts[nextCol] = (colCounts[nextCol] || 0) + 1;
          const nextRow = colCounts[nextCol] - 1;
          nodePositions[targetId] = {
            x: 200 + nextCol * 320,
            y: 180 + nextRow * 180
          };
          queue.push({ id: targetId, col: nextCol, row: nextRow });
        }
      });
    }
    
    let disconnectedCol = colCounts.length;
    let discCount = 0;
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        visited.add(node.id);
        nodePositions[node.id] = {
          x: 200 + disconnectedCol * 320,
          y: 180 + discCount * 180
        };
        discCount++;
      }
    });
    
    setNodes(nds => nds.map(n => ({
      ...n,
      position: nodePositions[n.id] || n.position
    })));
    addLog("[AUTO-LAYOUT] Reposicionamento automático concluído.");
  };

  const saveFlowToFile = () => {
    const data = {
      nodes,
      edges,
      savedConnections,
      zoom_scale: 1.0,
      scroll_x: 0,
      scroll_y: 0
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "fluxo.flow");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog("[EXPORTAR] Fluxo salvo.");
  };

  const loadFlowFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.nodes)) {
          saveToHistory();
          setNodes(data.nodes);
          setEdges(data.edges || []);
          setSavedConnections(data.saved_connections || data.savedConnections || {});
          addLog("[IMPORTAR] Fluxo importado com sucesso.");
        }
      } catch (err) {
        addLog(`[ERRO] Falha ao ler arquivo: ${err}`);
      }
    };
    reader.readAsText(file);
  };

  const captureCoordinates = async () => {
    const invoke = (window as any).__TAURI__?.core?.invoke;
    if (!invoke) {
      addLog("[CAPTURA] Simulador: Capturando coordenadas em 2s...");
      await sleep(2000);
      const fakeX = Math.floor(Math.random() * 1920);
      const fakeY = Math.floor(Math.random() * 1080);
      handleNodePropertiesChange({
        ...((selectedNode?.data as any)?.properties || {}),
        x: String(fakeX),
        y: String(fakeY)
      });
      addLog(`[CAPTURA] Simulador: Coordenadas capturadas X=${fakeX}, Y=${fakeY}`);
      return;
    }

    try {
      addLog("[CAPTURA] Ocultando janela. Mova o mouse e pressione CTRL + CLIQUE para capturar. ESC para cancelar.");
      const result = await invoke("capture_coordinate_loop");
      const [x, y] = result;
      handleNodePropertiesChange({
        ...((selectedNode?.data as any)?.properties || {}),
        x: String(x),
        y: String(y)
      });
      addLog(`[CAPTURA] Coordenadas salvas: X=${x}, Y=${y}`);
    } catch (err) {
      addLog(`[CAPTURA] Cancelada ou falhou: ${err}`);
    }
  };

  // Connections CRUD setup
  const openNewConnection = () => {
    setEditingConnName(null);
    setConnName("");
    setConnType("sqlite");
    setConnConfig({});
    setTestResult(null);
    setIsConnModalOpen(true);
  };

  const openEditConnection = (name: string) => {
    const profile = savedConnections[name];
    setEditingConnName(name);
    setConnName(name);
    setConnType(profile.type);
    setConnConfig(profile);
    setTestResult({ success: true, msg: "Perfil testado.", schema: profile.schema });
    setIsConnModalOpen(true);
  };

  const deleteConnection = (name: string) => {
    const updated = { ...savedConnections };
    delete updated[name];
    setSavedConnections(updated);
    addLog(`[CONEXÕES] Perfil de conexão removido: ${name}`);
  };

  const handleConnConfigChange = (key: string, value: any) => {
    setConnConfig((prev: any) => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const testConnectionProfile = async () => {
    setIsTesting(true);
    setTestResult(null);
    const invoke = (window as any).__TAURI__?.core?.invoke;
    
    if (connType === "api") {
      try {
        const headersJson = connConfig.headers ? JSON.parse(connConfig.headers) : {};
        if (connConfig.auth_type === "Bearer Token" && connConfig.auth_token) {
          headersJson["Authorization"] = `Bearer ${connConfig.auth_token}`;
        } else if (connConfig.auth_type === "Basic Auth" && connConfig.auth_token) {
          headersJson["Authorization"] = `Basic ${connConfig.auth_token}`;
        } else if (connConfig.auth_type === "API Key" && connConfig.auth_token) {
          headersJson["x-api-key"] = connConfig.auth_token;
        }

        const res = await fetch(connConfig.base_url, {
          method: "GET",
          headers: headersJson,
          mode: "cors"
        });
        
        if (res.status < 500) {
          setTestResult({ success: true, msg: `Conectado! Resposta HTTP código ${res.status}.` });
        } else {
          setTestResult({ success: false, msg: `Erro HTTP: Servidor respondeu com código ${res.status}.` });
        }
      } catch (err: any) {
        setTestResult({ success: false, msg: `Falha na requisição API: ${err.message}` });
      } finally {
        setIsTesting(false);
      }
      return;
    }

    if (!invoke) {
      setTimeout(() => {
        setIsTesting(false);
        const mockSchema = connType === "sqlite" 
          ? { usuarios: ["id", "nome", "senha"], logs: ["id", "data"] }
          : { clientes: ["id", "nome", "email"], pedidos: ["id", "total"] };
        setTestResult({
          success: true,
          msg: `[Simulador] Conectado! ${Object.keys(mockSchema).length} tabelas mapeadas.`,
          schema: mockSchema
        });
      }, 1000);
      return;
    }

    try {
      const resultStr = await invoke("run_db_helper", {
        action: "test",
        dbType: connType,
        configJson: JSON.stringify(connConfig)
      });
      const res = JSON.parse(resultStr);
      if (res.status === "success") {
        setTestResult({
          success: true,
          msg: res.message,
          schema: res.schema
        });
      } else {
        setTestResult({
          success: false,
          msg: res.message
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConnectionProfile = () => {
    if (!testResult?.success) return;
    const nameToSave = connName.trim();
    if (!nameToSave) return;
    
    setSavedConnections((prev: any) => ({
      ...prev,
      [nameToSave]: {
        ...connConfig,
        type: connType,
        schema: testResult.schema || {}
      }
    }));
    setIsConnModalOpen(false);
    addLog(`[CONEXÕES] Conexão salva com sucesso: ${nameToSave}`);
  };

  // HTML Prompts modal resolvers
  const showAlertDialog = (title: string, message: string, labelOk: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        show: true,
        type: "alert",
        title,
        message,
        labelOk,
        resolve: () => {
          setDialog((d) => ({ ...d, show: false }));
          resolve(true);
        }
      });
    });
  };

  const showConfirmDialog = (title: string, message: string, labelTrue: string, labelFalse: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        show: true,
        type: "confirm",
        title,
        message,
        labelTrue,
        labelFalse,
        resolve: (value: boolean) => {
          setDialog((d) => ({ ...d, show: false }));
          resolve(value);
        }
      });
    });
  };

  // Execution engine run-loop
  const executionStateRef = useRef(executionState);
  useEffect(() => {
    executionStateRef.current = executionState;
  }, [executionState]);

  const startFlowExecution = async () => {
    const startNode = nodes.find((n) => n.data.type === "start");
    if (!startNode) {
      addLog("[ERRO] Nó 'Início' é necessário para iniciar a execução do fluxo.");
      return;
    }

    setExecutionState("running");
    addLog("Iniciando execução do fluxo...");
    setPayload({ __active_loops__: [] });

    if (countdown > 0) {
      for (let i = countdown; i > 0; i--) {
        addLog(`Iniciando em ${i}s...`);
        await sleep(1000);
      }
    }

    const invoke = (window as any).__TAURI__?.core?.invoke;
    if (isRunningWithHide && invoke) {
      addLog("Ocultando janela do aplicativo.");
      await invoke("hide_app_window");
    }

    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isActive: false, isError: false } })));

    let currentNodeId = startNode.id;
    let localPayload: any = { __active_loops__: [] as string[] };
    let flowState: "running" | "stopped" | "error" = "running";

    let stopListener: any = null;
    let pauseListener: any = null;
    
    const listen = (window as any).__TAURI__?.event?.listen;
    if (listen) {
      stopListener = await listen("global-stop", () => {
        addLog("[HOTKEY] Parar acionado (F1).");
        setExecutionState("stopped");
      });
      pauseListener = await listen("global-pause", () => {
        setExecutionState((prev) => {
          if (prev === "running") {
            addLog("[HOTKEY] Pausar acionado (F2).");
            return "paused";
          }
          if (prev === "paused") {
            addLog("[HOTKEY] Retomar acionado (F2).");
            return "running";
          }
          return prev;
        });
      });
    }

    addLog("[MOTOR] Iniciando processamento de nós...");

    try {
      while (currentNodeId && flowState === "running") {
        while (executionStateRef.current === "paused") {
          await sleep(100);
        }
        if (executionStateRef.current === "stopped") {
          flowState = "stopped";
          break;
        }

        const node = nodes.find((n) => n.id === currentNodeId);
        if (!node) break;

        setNodes((nds) =>
          nds.map((n) => ({ ...n, data: { ...n.data, isActive: n.id === currentNodeId } }))
        );

        addLog(`[MOTOR] Executando nó: ${node.data.title || node.id}`);

        const properties: any = (node.data as any).properties || {};
        let nextPort = "out";

        try {
          switch (node.data.type) {
            case "start":
              break;

            case "click": {
              const xVal = parseInt(resolveVariable(properties.x, localPayload)) || 0;
              const yVal = parseInt(resolveVariable(properties.y, localPayload)) || 0;
              if (invoke) {
                await invoke("click_mouse", { x: xVal, y: yVal });
              }
              setNestedValue(localPayload, "last_click", { x: xVal, y: yVal });
              break;
            }

            case "move_mouse": {
              const xVal = parseInt(resolveVariable(properties.x, localPayload)) || 0;
              const yVal = parseInt(resolveVariable(properties.y, localPayload)) || 0;
              if (invoke) {
                await invoke("move_mouse", { x: xVal, y: yVal });
              }
              setNestedValue(localPayload, "last_mouse_pos", { x: xVal, y: yVal });
              break;
            }

            case "key": {
              const keyVal = resolveVariable(properties.key, localPayload);
              const countVal = parseInt(properties.count) || 1;
              if (invoke) {
                await invoke("press_key", { key: keyVal, count: countVal });
              }
              setNestedValue(localPayload, "last_key", { key: keyVal, count: countVal });
              break;
            }

            case "type_text": {
              const textVal = resolveVariable(properties.text, localPayload) || "";
              if (invoke) {
                await invoke("type_text", { text: textVal });
              }
              setNestedValue(localPayload, "last_typed", textVal);
              break;
            }

            case "delay": {
              const secVal = parseFloat(resolveVariable(properties.seconds, localPayload)) || 1.0;
              await sleep(secVal * 1000);
              break;
            }

            case "capture": {
              if (properties.capture_type === "Dados da Janela Ativa") {
                if (invoke) {
                  const [title, hwnd] = await invoke("get_active_window");
                  setNestedValue(localPayload, "active_window", { title, hwnd });
                  addLog(`[CAPTURA] Janela Ativa: "${title}"`);
                } else {
                  setNestedValue(localPayload, "active_window", { title: "Navegador Simulador", hwnd: 9999 });
                }
              } else {
                if (invoke) {
                  const [x, y, cursorName] = await invoke("get_mouse_cursor");
                  setNestedValue(localPayload, "captured_mouse", { x, y, cursor_name: cursorName });
                  addLog(`[CAPTURA] Mouse: X=${x}, Y=${y}`);
                } else {
                  setNestedValue(localPayload, "captured_mouse", { x: 500, y: 500, cursor_name: "Arrow" });
                }
              }
              break;
            }

            case "condition": {
              const varVal = resolveVariable(properties.variable_path, localPayload);
              const resolvedVar = getNestedValue(localPayload, varVal);
              const op = properties.operator || "igual";
              const targetVal = resolveVariable(properties.value, localPayload);

              const evaluate = (val: any, operator: string, compare: any) => {
                const valStr = String(val).toLowerCase();
                const compStr = String(compare).toLowerCase();
                if (operator === "igual") return valStr === compStr;
                if (operator === "diferente") return valStr !== compStr;
                if (operator === "contém") return valStr.includes(compStr);
                if (operator === "maior que") return parseFloat(val) > parseFloat(compare);
                return false;
              };

              let matches = evaluate(resolvedVar, op, targetVal);
              if (matches) {
                nextPort = "out_true";
              } else {
                let elseIfMatched = false;
                const elseIfs = properties.else_ifs || [];
                for (let i = 0; i < elseIfs.length; i++) {
                  const elseIf = elseIfs[i];
                  const elseIfVal = getNestedValue(localPayload, resolveVariable(elseIf.variable_path, localPayload));
                  const elseIfMatches = evaluate(elseIfVal, elseIf.operator, resolveVariable(elseIf.value, localPayload));
                  if (elseIfMatches) {
                    nextPort = `out_else_if_${i}`;
                    elseIfMatched = true;
                    break;
                  }
                }
                if (!elseIfMatched) {
                  nextPort = "out_false";
                }
              }
              break;
            }

            case "switch": {
              const varPath = resolveVariable(properties.variable_path, localPayload);
              const resolvedVar = String(getNestedValue(localPayload, varPath)).toLowerCase();
              const cases = properties.cases || [];
              let switchMatched = false;
              for (let i = 0; i < cases.length; i++) {
                if (resolvedVar === String(cases[i]).toLowerCase()) {
                  nextPort = `out_case_${i}`;
                  switchMatched = true;
                  break;
                }
              }
              if (!switchMatched) {
                nextPort = "out_default";
              }
              break;
            }

            case "loop": {
              const arraySource = resolveVariable(properties.source_array, localPayload);
              const arrayVal = extractLoopArray(getNestedValue(localPayload, arraySource) || resolveVariable(properties.source_array, localPayload));
              
              const activeLoops = localPayload.__active_loops__;
              const loopStatePath = `loop_${node.id}`;
              let loopState = localPayload[loopStatePath];

              if (!loopState || loopState.status === "done" || loopState.status === "broken") {
                loopState = {
                  item: arrayVal[0],
                  index: 0,
                  total: arrayVal.length,
                  status: arrayVal.length > 0 ? "running" : "done"
                };
                if (arrayVal.length > 0) {
                  activeLoops.push(node.id);
                }
              } else {
                const nextIndex = loopState.index + 1;
                if (nextIndex < loopState.total) {
                  loopState.index = nextIndex;
                  loopState.item = arrayVal[nextIndex];
                  loopState.status = "running";
                } else {
                  loopState.status = "done";
                  localPayload.__active_loops__ = activeLoops.filter((id: string) => id !== node.id);
                }
              }

              localPayload[loopStatePath] = loopState;
              
              if (loopState.status === "running") {
                nextPort = "out_item";
              } else {
                nextPort = "out_done";
              }
              break;
            }

            case "break_loop": {
              const activeLoops = localPayload.__active_loops__;
              if (activeLoops.length > 0) {
                const targetLoopId = activeLoops[activeLoops.length - 1];
                const loopStatePath = `loop_${targetLoopId}`;
                if (localPayload[loopStatePath]) {
                  localPayload[loopStatePath].status = "broken";
                }
                const loopEdge = edges.find((e) => e.source === targetLoopId && e.sourceHandle === "out_done");
                if (loopEdge) {
                  currentNodeId = loopEdge.target;
                  nextPort = "";
                  localPayload.__active_loops__ = activeLoops.slice(0, -1);
                }
              }
              break;
            }

            case "continue_loop": {
              const activeLoops = localPayload.__active_loops__;
              if (activeLoops.length > 0) {
                const targetLoopId = activeLoops[activeLoops.length - 1];
                currentNodeId = targetLoopId;
                nextPort = "";
              }
              break;
            }

            case "storage_var": {
              const nameVal = resolveVariable(properties.var_name, localPayload);
              const valVal = resolveVariable(properties.var_value, localPayload);
              setNestedValue(localPayload, nameVal, valVal);
              break;
            }

            case "confirm_dialog": {
              const titleVal = resolveVariable(properties.title, localPayload);
              const msgVal = resolveVariable(properties.message, localPayload);
              const userRes = await showConfirmDialog(titleVal, msgVal, properties.label_true || "Sim", properties.label_false || "Não");
              const targetVar = resolveVariable(properties.target_var, localPayload) || "confirm_result";
              setNestedValue(localPayload, targetVar, userRes);
              break;
            }

            case "alert_dialog": {
              const titleVal = resolveVariable(properties.title, localPayload);
              const msgVal = resolveVariable(properties.message, localPayload);
              await showAlertDialog(titleVal, msgVal, properties.label_ok || "OK");
              break;
            }

            case "postgres":
            case "mysql":
            case "sqlite": {
              const connProfile = savedConnections[properties.connection_name];
              if (!connProfile) {
                throw new Error(`Perfil de conexão '${properties.connection_name}' não existe.`);
              }
              const queryVal = resolveVariable(properties.query, localPayload);
              
              if (invoke) {
                const resultStr = await invoke("run_db_helper", {
                  action: "query",
                  dbType: node.data.type,
                  configJson: JSON.stringify(connProfile),
                  query: queryVal
                });
                const res = JSON.parse(resultStr);
                if (res.status === "success") {
                  localPayload[node.id] = { rows: res.rows, rows_affected: res.rows_affected };
                  localPayload["last_db_result"] = { rows: res.rows, rows_affected: res.rows_affected };
                } else {
                  throw new Error(res.message);
                }
              } else {
                const mockRows = [{ id: 1, nome: "Fulano de Tal" }, { id: 2, nome: "Ciclano de Tal" }];
                localPayload[node.id] = { rows: mockRows, rows_affected: 2 };
                localPayload["last_db_result"] = { rows: mockRows, rows_affected: 2 };
              }
              break;
            }

            case "api": {
              const connProfile = savedConnections[properties.connection_name] || {};
              const methodVal = properties.method || "GET";
              
              let fullUrl = properties.url || "";
              if (connProfile.base_url) {
                fullUrl = connProfile.base_url + fullUrl;
              }
              fullUrl = resolveVariable(fullUrl, localPayload);

              let headersJson = connProfile.headers ? JSON.parse(connProfile.headers) : {};
              if (properties.headers) {
                headersJson = { ...headersJson, ...JSON.parse(resolveVariable(properties.headers, localPayload)) };
              }
              
              if (connProfile.auth_type === "Bearer Token" && connProfile.auth_token) {
                headersJson["Authorization"] = `Bearer ${connProfile.auth_token}`;
              } else if (connProfile.auth_type === "Basic Auth" && connProfile.auth_token) {
                headersJson["Authorization"] = `Basic ${connConfig.auth_token}`;
              }

              const rawBody = properties.body ? resolveVariable(properties.body, localPayload) : undefined;
              
              try {
                const apiRes = await fetch(fullUrl, {
                  method: methodVal,
                  headers: headersJson,
                  body: rawBody ? (typeof rawBody === "object" ? JSON.stringify(rawBody) : String(rawBody)) : undefined,
                  mode: "cors"
                });
                
                let bodyData: any = "";
                const responseText = await apiRes.text();
                try {
                  bodyData = JSON.parse(responseText);
                } catch {
                  bodyData = responseText;
                }

                const result = {
                  status_code: apiRes.status,
                  headers: Object.fromEntries(apiRes.headers.entries()),
                  body: bodyData
                };

                localPayload[node.id] = result;
                localPayload["last_api_result"] = result;
              } catch (err: any) {
                throw new Error(`Falha HTTP REST API: ${err.message}`);
              }
              break;
            }

            case "js": {
              const codeVal = properties.code || "";
              const userFunction = new Function("payload", "log", `
                try {
                  ${codeVal}
                } catch(e) {
                  throw new Error(e.message);
                }
              `);
              
              userFunction(localPayload, (msg: string) => {
                addLog(`[JS Script] ${msg}`);
              });
              
              localPayload[node.id] = localPayload["last_js_result"] || "OK";
              break;
            }

            case "python": {
              const codeVal = properties.code || "";
              
              if (invoke) {
                const [updatedPayloadStr, scriptLogs] = await invoke("run_python_script", {
                  code: codeVal,
                  payloadJson: JSON.stringify(localPayload)
                });
                
                localPayload = JSON.parse(updatedPayloadStr);
                
                if (scriptLogs) {
                  scriptLogs.split("\n").forEach((line: string) => {
                    addLog(`[Python Script] ${line}`);
                  });
                }
                localPayload[node.id] = localPayload["last_python_result"] || "OK";
              } else {
                localPayload[node.id] = "Simulador Python";
              }
              break;
            }
          }
        } catch (nodeError: any) {
          setNodes((nds) =>
            nds.map((n) => ({ ...n, data: { ...n.data, isError: n.id === currentNodeId, isActive: false } }))
          );
          throw nodeError;
        }

        setPayload({ ...localPayload });

        if (nextPort) {
          const outgoingEdge = edges.find(
            (e) => e.source === currentNodeId && e.sourceHandle === nextPort
          );
          if (outgoingEdge) {
            currentNodeId = outgoingEdge.target;
          } else {
            currentNodeId = "";
          }
        }
        
        await sleep(200);
      }
    } catch (err: any) {
      flowState = "error";
      addLog(`[ERRO CRÍTICO] Execução interrompida: ${err.message || err}`);
    } finally {
      if (stopListener) stopListener();
      if (pauseListener) pauseListener();

      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isActive: false } })));
      setExecutionState("idle");

      if (isRunningWithHide && invoke) {
        await invoke("show_app_window");
      }
      
      if (flowState === "running") {
        addLog("Fluxo executado com sucesso.");
      } else if (flowState === "stopped") {
        addLog("Execução interrompida pelo usuário.");
      }
    }
  };

  const stopFlowExecution = () => {
    setExecutionState("stopped");
    addLog("Interrompendo execução...");
  };

  // Resize Console panel
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 60 && newHeight < 400) {
        setConsoleHeight(newHeight);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground font-sans antialiased flex flex-col relative select-none">
      
      {/* Capture Coordinate Instructions Overlay */}
      {(selectedNode?.data?.properties as any)?.capturing && (
        <div className="absolute top-0 left-0 right-0 h-10 bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 z-50 text-xs shadow-md">
          <Info className="h-4 w-4 shrink-0 animate-bounce" />
          <span>Posicione o mouse e pressione CTRL + CLIQUE para capturar as coordenadas. ESC para cancelar.</span>
        </div>
      )}

      {/* dialog blocking prompts */}
      {dialog.show && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-card border-border text-foreground shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-bold tracking-tight text-foreground">{dialog.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{dialog.message}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4">
              {dialog.type === "confirm" ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => dialog.resolve?.(false)} className="h-8 text-xs font-semibold">
                    {dialog.labelFalse || "Não"}
                  </Button>
                  <Button variant="default" size="sm" onClick={() => dialog.resolve?.(true)} className="h-8 text-xs font-semibold">
                    {dialog.labelTrue || "Sim"}
                  </Button>
                </>
              ) : (
                <Button variant="default" size="sm" onClick={() => dialog.resolve?.(true)} className="h-8 text-xs font-semibold">
                  {dialog.labelOk || "OK"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Top Header - Styled like original light theme */}
      <header className="bg-card text-card-foreground py-3 px-6 flex items-center justify-between border-b border-border shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 text-primary p-1.5 rounded-lg border border-border">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-foreground">Autoclick</h1>
            <p className="text-[10px] text-muted-foreground font-medium">Desktop Human-like Automation</p>
          </div>
        </div>

        {/* state buttons & delay dropdown */}
        <div className="flex items-center gap-2.5">
          
          {/* History Undo/Redo tools */}
          <div className="flex items-center border-r border-border pr-2.5 gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={past.length === 0}
              onClick={undo}
              title="Desfazer (Ctrl+Z)"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={future.length === 0}
              onClick={redo}
              title="Refazer (Ctrl+Y)"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 border-r border-border pr-2.5 text-[11px] text-muted-foreground font-semibold">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase">Delay</Label>
            <select
              value={countdown}
              onChange={(e) => setCountdown(parseInt(e.target.value) || 0)}
              className="bg-background border border-border text-[10px] rounded px-1.5 py-1 text-foreground"
            >
              <option value="0">0s</option>
              <option value="3">3s</option>
              <option value="5">5s</option>
            </select>

            <label className="flex items-center gap-1.5 cursor-pointer ml-1 text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={isRunningWithHide}
                onChange={(e) => setIsRunningWithHide(e.target.checked)}
                className="rounded bg-background border-border text-primary w-3.5 h-3.5 focus:ring-0"
              />
              <span>Ocultar App</span>
            </label>
          </div>

          {executionState === "idle" ? (
            <Button 
              onClick={startFlowExecution}
              variant="default"
              className="h-9 px-4 text-xs font-semibold"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              EXECUTAR FLUXO
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setExecutionState((p) => p === "paused" ? "running" : "paused")}
                className="h-9 border-amber-400 text-amber-600 hover:bg-amber-50 px-3 text-xs font-semibold"
              >
                <Pause className="h-4 w-4 mr-1.5" />
                {executionState === "paused" ? "Retomar" : "Pausar"}
              </Button>
              <Button 
                onClick={stopFlowExecution}
                variant="destructive"
                className="h-9 px-4 text-xs font-semibold"
              >
                <Square className="h-4 w-4 mr-2 fill-current" />
                PARAR
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main tab wrapper */}
      <Tabs defaultValue="fluxo" className="flex-1 flex flex-col overflow-hidden min-h-0">
        
        {/* Navigation list */}
        <div className="bg-muted/40 border-b border-border px-6 py-2 shrink-0 flex items-center justify-between">
          <TabsList className="bg-muted p-0.5 rounded-md gap-1 h-auto w-auto inline-flex">
            <TabsTrigger 
              value="fluxo" 
              className="text-xs font-medium px-4 py-1.5 rounded bg-transparent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Fluxo
            </TabsTrigger>
            <TabsTrigger 
              value="conexoes" 
              className="text-xs font-medium px-4 py-1.5 rounded bg-transparent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              Conexões
            </TabsTrigger>
          </TabsList>

          {/* Load/Save buttons */}
          <div className="flex items-center gap-2">
            <label className="bg-card hover:bg-muted border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer flex items-center gap-1.5 transition-all">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Carregar</span>
              <input
                type="file"
                accept=".flow"
                onChange={loadFlowFromFile}
                className="hidden"
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={saveFlowToFile}
              className="bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-semibold text-xs h-[30px]"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Salvar fluxo
            </Button>
          </div>
        </div>

        {/* TAB 1: FLOW WORKSPACE */}
        <TabsContent value="fluxo" className="flex-1 flex m-0 p-0 outline-none overflow-hidden min-h-0">
          <div className="flex flex-1 overflow-hidden">
            
            {/* Left Sidebar Toolbox */}
            <aside className="w-72 bg-card text-card-foreground flex flex-col border-r border-border select-none overflow-hidden shrink-0">
              <div className="p-4 flex-1 flex flex-col overflow-y-auto min-h-0 scrollbar-thin">
                <h3 className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase mb-4 flex items-center justify-between">
                  <span>Componentes</span>
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </h3>
                
                <div className="space-y-4 flex-1">
                  {nodeCategories.map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <h4 className="text-[9px] font-bold text-muted-foreground/80 tracking-wider uppercase px-1">
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.nodes.map((node) => (
                          <button 
                            key={node.type}
                            onClick={() => addNode(node)}
                            className="w-full aspect-square flex flex-col items-center justify-center gap-2 p-2.5 border border-border bg-card hover:bg-muted text-card-foreground rounded-lg transition-all cursor-pointer select-none"
                            title={node.description}
                          >
                            <NodeIcon name={node.iconName} className="h-7 w-7 shrink-0 text-muted-foreground" />
                            <span className="text-[10px] font-semibold leading-tight text-center whitespace-normal break-words max-w-full px-0.5">
                              {node.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Central Area React Flow Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              
              <main className="flex-1 bg-background relative min-h-0">
                
                {/* Auto layout + lasso action triggers */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autoLayout}
                    className="bg-card hover:bg-muted text-[10px] h-7 font-bold border-border shadow-sm text-foreground"
                  >
                    Auto-Ajustar
                  </Button>
                  <Button
                    variant={lassoMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLassoMode(!lassoMode)}
                    className="text-[10px] h-7 font-bold border-border shadow-sm"
                  >
                    {lassoMode ? "Lasso Ativo" : "Ativar Lasso"}
                  </Button>
                </div>

                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  panOnDrag={!lassoMode}
                  selectionOnDrag={lassoMode}
                  selectionKeyCode="Shift"
                  fitView
                  fitViewOptions={{ maxZoom: 1.0 }}
                >
                  <Background color="#CBD5E1" gap={16} size={1} />
                  <Controls 
                    position="bottom-right" 
                    className="bg-background border border-border shadow-sm rounded-md p-1 [&_button]:border-border [&_button]:bg-background [&_button]:text-foreground" 
                  />
                </ReactFlow>

                {!isConsoleOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConsoleOpen(true)}
                    className="absolute bottom-4 left-4 z-40 bg-background shadow-md border border-border flex items-center gap-1.5 h-8"
                  >
                    <Terminal className="h-4 w-4" />
                    Console
                  </Button>
                )}
              </main>

              {/* Debug Logs Console */}
              {isConsoleOpen && (
                <div 
                  className="bg-muted/30 border-t border-border flex flex-col font-mono shrink-0 relative"
                  style={{ height: consoleHeight }}
                >
                  <div 
                    onMouseDown={() => setIsResizing(true)}
                    className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-primary/20 transition-all z-40"
                  />

                  <div className="px-4 py-2 flex items-center justify-between border-b border-border shrink-0 bg-muted/20">
                    <h4 className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5" />
                      Console de Execução
                    </h4>
                    <div className="flex gap-1.5 items-center">
                      <Button
                        variant="ghost"
                        onClick={() => setLogs(["Canvas limpo. Novo fluxo iniciado."])}
                        className="h-5 text-[9px] font-bold text-muted-foreground hover:text-foreground px-2"
                      >
                        Limpar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsConsoleOpen(false)}
                        className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto text-[10px] text-muted-foreground space-y-1 p-4 scrollbar-thin select-text">
                    {logs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Sidebar properties panel */}
            <aside className="w-72 bg-card text-card-foreground flex flex-col border-l border-border select-none overflow-hidden shrink-0">
              <Tabs defaultValue="propriedades" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="bg-muted/40 border-b border-border p-0.5 rounded-none h-10 w-full grid grid-cols-2 shrink-0">
                  <TabsTrigger 
                    value="propriedades" 
                    className="text-xs font-medium px-4 py-1.5 rounded-none bg-transparent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    Propriedades
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payload" 
                    className="text-xs font-medium px-4 py-1.5 rounded-none bg-transparent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    Payload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="propriedades" className="flex-1 m-0 p-0 overflow-y-auto select-none outline-none">
                  <NodeProperties
                    selectedNode={selectedNode}
                    savedConnections={savedConnections}
                    onChange={handleNodePropertiesChange}
                    onCaptureCoordinate={captureCoordinates}
                  />
                </TabsContent>

                <TabsContent value="payload" className="flex-1 m-0 p-4 overflow-y-auto font-mono text-[10px] text-muted-foreground select-text outline-none scrollbar-thin">
                  <span className="text-[9px] font-bold text-muted-foreground/80 tracking-wider uppercase block mb-3">Payload Global</span>
                  <pre className="whitespace-pre-wrap leading-relaxed bg-muted/30 border border-border p-3 rounded-lg">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </aside>

          </div>
        </TabsContent>

        {/* TAB 2: CONNECTIONS CRUD VIEW */}
        <TabsContent value="conexoes" className="flex-1 bg-background m-0 p-8 overflow-y-auto outline-none min-h-0 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-end border-b border-border pb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Conexões</h2>
                <p className="text-xs text-muted-foreground mt-1">Gerencie perfis e credenciais externas para PostgreSQL, MySQL, SQLite e APIs.</p>
              </div>
              <Button
                onClick={openNewConnection}
                className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conexão
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {Object.keys(savedConnections).length === 0 ? (
                <div className="col-span-2 border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground text-xs">
                  Nenhuma conexão configurada.
                </div>
              ) : (
                Object.entries(savedConnections).map(([name, profile]: any) => (
                  <Card key={name} className="bg-card border-border shadow-sm flex flex-col justify-between overflow-hidden">
                    <CardHeader className="pb-3.5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md font-bold text-foreground">{name}</CardTitle>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {profile.type.toUpperCase()}
                        </span>
                      </div>
                      <CardDescription className="text-[11px] text-muted-foreground mt-1 leading-relaxed truncate">
                        {profile.type === "sqlite" ? `Arquivo: ${profile.path}` : profile.type === "api" ? `URL Base: ${profile.base_url}` : `Servidor: ${profile.host}:${profile.port}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 text-xs text-foreground">
                      {profile.schema && Object.keys(profile.schema).length > 0 ? (
                        <div className="bg-muted/50 p-2.5 rounded-lg border border-border text-[9px] max-h-24 overflow-y-auto">
                          <span className="font-bold text-muted-foreground uppercase block mb-1">Tabelas ({Object.keys(profile.schema).length}):</span>
                          {Object.entries(profile.schema).map(([tbl, cols]: any) => (
                            <div key={tbl} className="truncate">
                              <span className="font-semibold text-primary">{tbl}</span>: {cols.join(", ")}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Mapeamento de tabelas vazio.</span>
                      )}
                    </CardContent>
                    <CardFooter className="border-t border-border/40 pt-3 flex justify-end gap-2 bg-muted/10 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteConnection(name)}
                        className="h-8 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        Excluir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditConnection(name)}
                        className="h-8 text-xs font-semibold border-border text-foreground hover:bg-muted"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* modal dialog config connection */}
      {isConnModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card border border-border text-foreground shadow-2xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-foreground">
                  {editingConnName ? `Editar: ${editingConnName}` : "Nova Conexão"}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsConnModalOpen(false)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nome</Label>
                  <Input
                    placeholder="postgres_dev"
                    value={connName}
                    disabled={!!editingConnName}
                    onChange={(e) => {
                      setConnName(e.target.value);
                      setTestResult(null);
                    }}
                    className="h-8 text-xs bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo</Label>
                  <select
                    value={connType}
                    disabled={!!editingConnName}
                    onChange={(e) => {
                      setConnType(e.target.value);
                      setConnConfig({});
                      setTestResult(null);
                    }}
                    className="w-full bg-background border border-border rounded-md px-3 h-8 text-xs text-foreground focus:outline-none"
                  >
                    <option value="sqlite">SQLite</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="api">API REST (JSON)</option>
                  </select>
                </div>
              </div>

              {connType === "sqlite" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Caminho do Arquivo (.db, .sqlite)</Label>
                  <Input
                    placeholder="C:\dados\banco.db"
                    value={connConfig.path || ""}
                    onChange={(e) => handleConnConfigChange("path", e.target.value)}
                    className="h-8 text-xs bg-background border-border"
                  />
                </div>
              )}

              {(connType === "postgres" || connType === "mysql") && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Host</Label>
                      <Input
                        placeholder="localhost"
                        value={connConfig.host || ""}
                        onChange={(e) => handleConnConfigChange("host", e.target.value)}
                        className="h-8 text-xs bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Porta</Label>
                      <Input
                        placeholder={connType === "postgres" ? "5432" : "3306"}
                        value={connConfig.port || ""}
                        onChange={(e) => handleConnConfigChange("port", e.target.value)}
                        className="h-8 text-xs bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Database</Label>
                    <Input
                      placeholder="vendas"
                      value={connConfig.database || ""}
                      onChange={(e) => handleConnConfigChange("database", e.target.value)}
                      className="h-8 text-xs bg-background border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Usuário</Label>
                      <Input
                        placeholder="root"
                        value={connConfig.user || ""}
                        onChange={(e) => handleConnConfigChange("user", e.target.value)}
                        className="h-8 text-xs bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Senha</Label>
                      <Input
                        type="password"
                        placeholder="*****"
                        value={connConfig.password || ""}
                        onChange={(e) => handleConnConfigChange("password", e.target.value)}
                        className="h-8 text-xs bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {connType === "api" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">URL Base da API</Label>
                    <Input
                      placeholder="https://api.empresa.com"
                      value={connConfig.base_url || ""}
                      onChange={(e) => handleConnConfigChange("base_url", e.target.value)}
                      className="h-8 text-xs bg-background border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Autenticação</Label>
                      <select
                        value={connConfig.auth_type || "Nenhuma"}
                        onChange={(e) => handleConnConfigChange("auth_type", e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 h-8 text-xs text-foreground focus:outline-none"
                      >
                        <option>Nenhuma</option>
                        <option>Bearer Token</option>
                        <option>Basic Auth</option>
                        <option>API Key</option>
                      </select>
                    </div>
                    {connConfig.auth_type !== "Nenhuma" && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Token / Chave</Label>
                        <Input
                          type="password"
                          value={connConfig.auth_token || ""}
                          onChange={(e) => handleConnConfigChange("auth_token", e.target.value)}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Headers Padrão (JSON)</Label>
                    <textarea
                      placeholder='{ "Content-Type": "application/json" }'
                      value={connConfig.headers || ""}
                      onChange={(e) => handleConnConfigChange("headers", e.target.value)}
                      className="w-full h-16 bg-background border border-border rounded-md p-2 text-xs text-foreground font-mono resize-none"
                    />
                  </div>
                </div>
              )}

              {testResult && (
                <div className={`p-3 rounded-lg border text-xs leading-relaxed max-h-24 overflow-y-auto
                  ${testResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}
                `}>
                  {testResult.msg}
                </div>
              )}

            </CardContent>
            <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnectionProfile}
                disabled={isTesting}
                className="h-8 text-xs font-semibold border-border text-foreground hover:bg-muted"
              >
                {isTesting ? "Testando..." : "Testar Conexão"}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConnModalOpen(false)}
                  className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  disabled={!testResult?.success}
                  onClick={saveConnectionProfile}
                  className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50"
                >
                  Salvar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
