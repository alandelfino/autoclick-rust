import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Field, FieldLabel, FieldDescription } from "../../../components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { invoke } from "@tauri-apps/api/core";
import { Play } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";


interface NodeEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: any;
    allNodes: any[];
    allEdges: any[];
    onSave: (nodeId: string, name: string, alias: string, parameters: any, output: any) => void;
}

// Graph traversal to accumulate outputs of preceding/ancestor nodes
function getPrecedingPayload(nodeId: string, nodes: any[], edges: any[]): Record<string, any> {
    const payload: Record<string, any> = {};
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
        if (visited.has(currentId)) return;
        visited.add(currentId);

        // Find incoming connections pointing to this node
        const incomingEdges = edges.filter((e) => e.target === currentId);
        for (const edge of incomingEdges) {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            if (sourceNode) {
                const alias = sourceNode.data?.alias || sourceNode.id.replace(/-/g, "_");
                if (sourceNode.data?.output !== undefined && sourceNode.data?.output !== null) {
                    payload[alias] = sourceNode.data.output;
                }
                traverse(sourceNode.id);
            }
        }
    };

    traverse(nodeId);
    return payload;
}

export function NodeEditorModal({
    open,
    onOpenChange,
    node,
    allNodes,
    allEdges,
    onSave,
}: NodeEditorModalProps) {
    const [name, setName] = useState("");
    const [alias, setAlias] = useState("");
    const [parameters, setParameters] = useState<any>({});
    const [output, setOutput] = useState<any>(null);
    const [credentials, setCredentials] = useState<any[]>([]);
    const [aliasError, setAliasError] = useState("");

    const { toast } = useToast();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnectDb = async () => {
        const credId = parameters.connection;
        if (!credId) {
            toast({
                title: "Nenhuma conexão selecionada",
                description: "Selecione uma credencial para conectar.",
                variant: "destructive",
            });
            return;
        }
        const cred = credentials.find(c => c.id === credId);
        if (!cred) return;
        
        setIsConnecting(true);
        try {
            const configJson = JSON.stringify({
                value1: cred.value1,
                value2: cred.value2,
                value3: cred.value3,
            });
            const resultStr = await invoke<string>("run_db_helper", {
                action: "schema",
                dbType: cred.type,
                configJson,
                query: null
            });
            const result = JSON.parse(resultStr);
            if (result.status === "success") {
                setOutput({
                    connected: true,
                    database_type: cred.type,
                    connection_name: cred.name,
                    tables: result.tables
                });
                toast({
                    title: "Conectado com sucesso!",
                    description: `Estrutura do banco de dados carregada (${result.tables.length} tabelas).`,
                    variant: "success",
                });
            } else {
                throw new Error(result.message || "Erro ao carregar o esquema.");
            }
        } catch (err: any) {
            console.error("Failed to connect database:", err);
            toast({
                title: "Falha ao conectar!",
                description: err.message || String(err),
                variant: "destructive",
            });
        } finally {
            setIsConnecting(false);
        }
    };


    // Load node details and credentials on mount/open
    useEffect(() => {
        if (!node) return;

        setName(node.data?.label || node.type);
        setAlias(node.data?.alias || node.id.replace(/-/g, "_"));
        setParameters(node.data?.parameters || {});
        setOutput(node.data?.output || null);
        setAliasError("");

        const loadCreds = async () => {
            try {
                const list = await invoke<any[]>("list_credentials");
                setCredentials(list);
            } catch (err) {
                console.error("Failed to load credentials:", err);
            }
        };

        if (["sqliteQueryNode", "postgresqlQueryNode", "mysqlQueryNode"].includes(node.type)) {
            loadCreds();
        }
    }, [node, open]);

    if (!node) return null;

    // Ancestor payloads
    const precedingPayload = getPrecedingPayload(node.id, allNodes, allEdges);

    // Filter connections based on query node type
    const getFilteredConnections = () => {
        if (node.type === "sqliteQueryNode") {
            return credentials.filter((c) => c.type === "sqlite");
        }
        if (node.type === "postgresqlQueryNode") {
            return credentials.filter((c) => c.type === "postgre");
        }
        if (node.type === "mysqlQueryNode") {
            return credentials.filter((c) => c.type === "mysql");
        }
        return [];
    };

    const filteredCreds = getFilteredConnections().map((c) => ({
        label: c.name,
        value: c.id,
    }));

    // Alias slug validation
    const handleAliasChange = (val: string) => {
        // Convert to lowercase and slugify
        const slug = val
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
        setAlias(slug);

        // Check uniqueness excluding current node
        const isDuplicate = allNodes.some(
            (n) => n.id !== node.id && (n.data?.alias === slug || n.id.replace(/-/g, "_") === slug)
        );

        if (isDuplicate) {
            setAliasError("Este alias já está sendo usado no fluxo.");
        } else if (!slug) {
            setAliasError("O alias não pode ser vazio.");
        } else {
            setAliasError("");
        }
    };

    // Simulated Execution of step
    const handleExecuteStep = () => {
        let mockOutput: any = {};
        const params = parameters;

        switch (node.type) {
            case "stickNote":
                mockOutput = {
                    status: "note",
                    note_id: node.id,
                    last_edited: new Date().toISOString()
                };
                break;
            case "clickByCoordinatesNode":

                mockOutput = {
                    action: "click",
                    coordinates: { x: Number(params.x) || 100, y: Number(params.y) || 200 },
                    timestamp: new Date().toISOString(),
                };
                break;
            case "moveCursorNode":
                mockOutput = {
                    action: "move",
                    coordinates: { x: Number(params.x) || 0, y: Number(params.y) || 0 },
                    timestamp: new Date().toISOString(),
                };
                break;
            case "keypressNode":
                mockOutput = {
                    action: "key_press",
                    key: params.key || "enter",
                    count: Number(params.count) || 1,
                    timestamp: new Date().toISOString(),
                };
                break;
            case "typeTextNode":
                mockOutput = {
                    action: "type",
                    text: params.text || "",
                    charCount: (params.text || "").length,
                    timestamp: new Date().toISOString(),
                };
                break;
            case "delayNode":
                mockOutput = {
                    action: "wait",
                    ms: Number(params.ms) || 1000,
                    status: "completed",
                };
                break;
            case "loopNode":
                mockOutput = {
                    action: "loop_start",
                    iterations: Number(params.iterations) || 10,
                    currentIndex: 0,
                };
                break;
            case "apiRequestNode":
                mockOutput = {
                    status: 200,
                    statusText: "OK",
                    method: params.method || "GET",
                    url: params.url || "https://api.example.com/data",
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        message: "Dados de resposta da API simulados com sucesso!",
                        received_body: params.body || null,
                    },
                };
                break;
            case "sqliteQueryNode":
            case "postgresqlQueryNode":
            case "mysqlQueryNode":
                mockOutput = {
                    success: true,
                    query: params.query || "",
                    connection_id: params.connection || "default",
                    records: [
                        { id: 1, name: "Item A", description: "Record mock from DB" },
                        { id: 2, name: "Item B", description: "Record mock from DB" },
                    ],
                };
                break;
            case "variableNode":
                mockOutput = {
                    variable: params.name || "my_variable",
                    value: params.value || "",
                    type: typeof params.value,
                };
                break;
            case "runJavascriptNode":
                mockOutput = {
                    success: true,
                    result: "Javascript evaluated successfully",
                    timestamp: new Date().toISOString(),
                };
                break;
            case "actionsDialogNode":
            case "alertDialogNode":
                mockOutput = {
                    dialog_shown: true,
                    message: params.message || "",
                    user_response: "ok",
                };
                break;
            default:
                mockOutput = {
                    status: "executed",
                    timestamp: new Date().toISOString(),
                };
        }
        setOutput(mockOutput);
    };

    const handleSave = () => {
        if (aliasError) return;
        onSave(node.id, name, alias, parameters, output);
        onOpenChange(false);
    };

    const updateParam = (key: string, val: any) => {
        setParameters((prev: any) => ({ ...prev, [key]: val }));
    };

    // Render middle form fields depending on node type
    const renderNodeParams = () => {
        switch (node.type) {
            case "clickByCoordinatesNode":
            case "moveCursorNode":
                return (
                    <>
                        <Field>
                            <FieldLabel>X Coordinate</FieldLabel>
                            <Input
                                type="number"
                                value={parameters.x || ""}
                                onChange={(e) => updateParam("x", e.target.value)}
                                placeholder="0"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Y Coordinate</FieldLabel>
                            <Input
                                type="number"
                                value={parameters.y || ""}
                                onChange={(e) => updateParam("y", e.target.value)}
                                placeholder="0"
                            />
                        </Field>
                    </>
                );
            case "keypressNode":
                return (
                    <>
                        <Field>
                            <FieldLabel>Teclar (Key Combo)</FieldLabel>
                            <Input
                                value={parameters.key || ""}
                                onChange={(e) => updateParam("key", e.target.value)}
                                placeholder="ctrl+c ou enter"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Repetições</FieldLabel>
                            <Input
                                type="number"
                                value={parameters.count || ""}
                                onChange={(e) => updateParam("count", e.target.value)}
                                placeholder="1"
                            />
                        </Field>
                    </>
                );
            case "typeTextNode":
                return (
                    <Field>
                        <FieldLabel>Texto a Digitar</FieldLabel>
                        <Textarea
                            value={parameters.text || ""}
                            onChange={(e) => updateParam("text", e.target.value)}
                            placeholder="Digite o texto aqui..."
                        />
                    </Field>
                );
            case "delayNode":
                return (
                    <Field>
                        <FieldLabel>Tempo de Espera (ms)</FieldLabel>
                        <Input
                            type="number"
                            value={parameters.ms || ""}
                            onChange={(e) => updateParam("ms", e.target.value)}
                            placeholder="1000"
                        />
                    </Field>
                );
            case "loopNode":
                return (
                    <Field>
                        <FieldLabel>Iterações / Repetições</FieldLabel>
                        <Input
                            type="number"
                            value={parameters.iterations || ""}
                            onChange={(e) => updateParam("iterations", e.target.value)}
                            placeholder="10"
                        />
                    </Field>
                );
            case "apiRequestNode":
                return (
                    <>
                        <Field>
                            <FieldLabel>HTTP Method</FieldLabel>
                            <Select
                                value={parameters.method || "GET"}
                                onValueChange={(val) => val && updateParam("method", val)}
                                items={[
                                    { label: "GET", value: "GET" },
                                    { label: "POST", value: "POST" },
                                    { label: "PUT", value: "PUT" },
                                    { label: "DELETE", value: "DELETE" },
                                ]}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel>URL da API</FieldLabel>
                            <Input
                                value={parameters.url || ""}
                                onChange={(e) => updateParam("url", e.target.value)}
                                placeholder="https://api.example.com/data"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Request Body</FieldLabel>
                            <Textarea
                                value={parameters.body || ""}
                                onChange={(e) => updateParam("body", e.target.value)}
                                placeholder="JSON payload..."
                            />
                        </Field>
                    </>
                );
            case "stickNote":
                return (
                    <>
                        <Field>
                            <FieldLabel>Título da Nota</FieldLabel>
                            <Input
                                value={parameters.label !== undefined ? parameters.label : (node.data?.label || "")}
                                onChange={(e) => {
                                    updateParam("label", e.target.value);
                                    setName(e.target.value);
                                }}
                                placeholder="I'm a note"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Descrição / Conteúdo</FieldLabel>
                            <Textarea
                                className="h-28"
                                value={parameters.description !== undefined ? parameters.description : (node.data?.description || "")}
                                onChange={(e) => updateParam("description", e.target.value)}
                                placeholder="Double click to edit me. Guide"
                            />
                        </Field>
                    </>
                );
            case "sqliteQueryNode":
            case "postgresqlQueryNode":
            case "mysqlQueryNode":
                return (
                    <>
                        <Field>
                            <FieldLabel>Database Connection</FieldLabel>
                            {filteredCreds.length === 0 ? (
                                <p className="text-xs text-red-500 italic">Cadastre credenciais desse tipo nas configurações primeiro!</p>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Select
                                            value={parameters.connection || ""}
                                            onValueChange={(val) => val && updateParam("connection", val)}
                                            items={filteredCreds}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma conexão" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCreds.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>
                                                        {c.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleConnectDb}
                                        disabled={isConnecting || !parameters.connection}
                                        className="h-10 text-xs shrink-0 cursor-pointer"
                                    >
                                        {isConnecting ? "Conectando..." : "Conectar"}
                                    </Button>
                                </div>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel>SQL Query</FieldLabel>
                            <Textarea
                                className="font-mono text-xs h-32"
                                value={parameters.query || ""}
                                onChange={(e) => updateParam("query", e.target.value)}
                                placeholder="SELECT * FROM table WHERE id = 1"
                            />
                        </Field>
                    </>
                );

            case "variableNode":
                return (
                    <>
                        <Field>
                            <FieldLabel>Variável Nome</FieldLabel>
                            <Input
                                value={parameters.name || ""}
                                onChange={(e) => updateParam("name", e.target.value)}
                                placeholder="my_var"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Valor</FieldLabel>
                            <Input
                                value={parameters.value || ""}
                                onChange={(e) => updateParam("value", e.target.value)}
                                placeholder="123"
                            />
                        </Field>
                    </>
                );
            case "runJavascriptNode":
                return (
                    <Field>
                        <FieldLabel>Javascript Code</FieldLabel>
                        <Textarea
                            className="font-mono text-xs h-40"
                            value={parameters.code || ""}
                            onChange={(e) => updateParam("code", e.target.value)}
                            placeholder="// E.g. console.log('hello');"
                        />
                    </Field>
                );
            case "actionsDialogNode":
            case "alertDialogNode":
                return (
                    <Field>
                        <FieldLabel>Alert/Dialog Message</FieldLabel>
                        <Textarea
                            value={parameters.message || ""}
                            onChange={(e) => updateParam("message", e.target.value)}
                            placeholder="Insira a mensagem do diálogo para o usuário..."
                        />
                    </Field>
                );
            default:
                return <p className="text-xs text-muted-foreground italic">Nenhum parâmetro extra configurável.</p>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[calc(100vw-4rem)] h-full max-h-[calc(100vh-4rem)] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-neutral-100 flex-none">
                    <DialogTitle className="flex items-center gap-2 text-md">
                        <span className="bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-teal-600 text-xs font-mono uppercase">
                            {node.type}
                        </span>
                        Editar Node: {name}
                    </DialogTitle>
                </DialogHeader>

                {/* 3-Column Layout */}
                <div className="flex flex-1 min-h-0 divide-x divide-neutral-100">
                    
                    {/* COLUMN 1: INPUT */}
                    <div className="w-1/3 p-4 flex flex-col min-h-0 bg-neutral-50/20">
                        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wider mb-3">
                            Input (Preceding Payload)
                        </div>
                        <div className="flex-1 overflow-auto border border-neutral-100 bg-white rounded p-3 font-mono text-xs">
                            {Object.keys(precedingPayload).length === 0 ? (
                                <span className="text-neutral-400 italic">Nenhum payload de entrada disponível. Conecte nodes executados anteriormente para alimentar a entrada.</span>
                            ) : (
                                <pre className="whitespace-pre-wrap">{JSON.stringify(precedingPayload, null, 2)}</pre>
                            )}
                        </div>
                    </div>

                    {/* COLUMN 2: PARAMETERS */}
                    <div className="w-1/3 p-4 flex flex-col min-h-0 overflow-y-auto">
                        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wider mb-4">
                            Node Parameters
                        </div>
                        <div className="flex flex-col gap-4 flex-1">
                            <Field>
                                <FieldLabel>Node Name</FieldLabel>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Clique em Confirmar"
                                />
                            </Field>

                            <Field data-invalid={!!aliasError}>
                                <FieldLabel>Alias / Slug (Unique Key)</FieldLabel>
                                <Input
                                    value={alias}
                                    onChange={(e) => handleAliasChange(e.target.value)}
                                    placeholder="clique_confirmar"
                                    autoComplete="off"
                                />
                                {aliasError ? (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{aliasError}</p>
                                ) : (
                                    <FieldDescription>
                                        Chave usada para mapear o output deste node no payload global.
                                    </FieldDescription>
                                )}
                            </Field>

                            {/* Node parameters */}
                            <div className="border-t border-neutral-100 pt-4 flex flex-col gap-4">
                                {renderNodeParams()}
                            </div>
                        </div>

                        {/* Execute button */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex-none">
                            <Button 
                                type="button" 
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5"
                                onClick={handleExecuteStep}
                            >
                                <Play className="size-4" /> Execute Step
                            </Button>
                        </div>
                    </div>

                    {/* COLUMN 3: OUTPUT */}
                    <div className="w-1/3 p-4 flex flex-col min-h-0 bg-neutral-50/20">
                        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wider mb-3">
                            Output (Result Preview)
                        </div>
                        <div className="flex-1 overflow-auto border border-neutral-100 bg-white rounded p-3 font-mono text-xs">
                            {output === null ? (
                                <span className="text-neutral-400 italic">Clique em "Execute Step" para rodar e visualizar o output deste node.</span>
                            ) : (
                                <pre className="whitespace-pre-wrap">{JSON.stringify(output, null, 2)}</pre>
                            )}
                        </div>
                    </div>

                </div>

                <DialogFooter className="p-4 border-t border-neutral-100 flex-none">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!!aliasError}>
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
