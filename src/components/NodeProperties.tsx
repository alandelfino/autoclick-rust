import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface NodePropertiesProps {
  selectedNode: any;
  savedConnections: any;
  onChange: (properties: any) => void;
  onCaptureCoordinate: () => void;
}

export default function NodeProperties({
  selectedNode,
  savedConnections,
  onChange,
  onCaptureCoordinate
}: NodePropertiesProps) {
  if (!selectedNode) {
    return (
      <div className="text-muted-foreground text-xs p-4 text-center">
        Selecione um nó no canvas para editar suas propriedades.
      </div>
    );
  }

  const { type, data } = selectedNode;
  const properties = data.properties || {};

  const updateProp = (key: string, value: any) => {
    onChange({ ...properties, [key]: value });
  };

  const renderFields = () => {
    switch (type || selectedNode.type) {
      case "start":
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Modo de Execução</Label>
              <select
                value={properties.loop_mode || "Executar 1 vez"}
                onChange={(e) => updateProp("loop_mode", e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Executar 1 vez</option>
                <option>Executar N vezes</option>
                <option>Loop Infinito</option>
              </select>
            </div>
            {(properties.loop_mode === "Executar N vezes") && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">Quantidade de Repetições</Label>
                <Input
                  type="number"
                  value={properties.loop_count ?? 1}
                  onChange={(e) => updateProp("loop_count", parseInt(e.target.value) || 1)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            )}
          </div>
        );

      case "click":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Coordenadas</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onCaptureCoordinate}
                className="h-7 text-[10px] font-semibold border border-purple-500/30 text-purple-400 hover:bg-purple-950/20"
              >
                Capturar Coordenada
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-semibold">X</Label>
                <Input
                  placeholder="Ex: 800 ou {obter_usuarios.x}"
                  value={properties.x ?? ""}
                  onChange={(e) => updateProp("x", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-semibold">Y</Label>
                <Input
                  placeholder="Ex: 450 ou {obter_usuarios.y}"
                  value={properties.y ?? ""}
                  onChange={(e) => updateProp("y", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
          </div>
        );

      case "move_mouse":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Coordenadas</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onCaptureCoordinate}
                className="h-7 text-[10px] font-semibold border border-purple-500/30 text-purple-400 hover:bg-purple-950/20"
              >
                Capturar Coordenada
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-semibold">X</Label>
                <Input
                  placeholder="Ex: 800 ou {x}"
                  value={properties.x ?? ""}
                  onChange={(e) => updateProp("x", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-semibold">Y</Label>
                <Input
                  placeholder="Ex: 450 ou {y}"
                  value={properties.y ?? ""}
                  onChange={(e) => updateProp("y", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
          </div>
        );

      case "key":
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Tecla / Atalho</Label>
              <Input
                placeholder="Ex: enter, tab, ctrl+c, alt+f4"
                value={properties.key ?? ""}
                onChange={(e) => updateProp("key", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Repetições</Label>
              <Input
                type="number"
                value={properties.count ?? 1}
                onChange={(e) => updateProp("count", parseInt(e.target.value) || 1)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>
        );

      case "type_text":
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Texto a Digitar</Label>
            <textarea
              placeholder="Digite o texto aqui. Use {variavel} para interpolar valores."
              value={properties.text ?? ""}
              onChange={(e) => updateProp("text", e.target.value)}
              className="w-full h-24 bg-background border border-border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-none"
            />
          </div>
        );

      case "delay":
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Aguardar (Segundos)</Label>
            <Input
              placeholder="Ex: 2.5 ou {obter_dados.tempo}"
              value={properties.seconds ?? "1"}
              onChange={(e) => updateProp("seconds", e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>
        );

      case "capture":
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Tipo de Captura</Label>
            <select
              value={properties.capture_type || "Dados da Janela Ativa"}
              onChange={(e) => updateProp("capture_type", e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option>Dados da Janela Ativa</option>
              <option>Dados do Cursor/Mouse</option>
            </select>
          </div>
        );

      case "condition":
        const elseIfs = properties.else_ifs || [];
        
        const updateElseIf = (idx: number, key: string, val: any) => {
          const updated = [...elseIfs];
          updated[idx] = { ...updated[idx], [key]: val };
          updateProp("else_ifs", updated);
        };

        const addElseIf = () => {
          const updated = [...elseIfs, { variable_path: "", operator: "igual", value: "" }];
          updateProp("else_ifs", updated);
        };

        const removeElseIf = (idx: number) => {
          const updated = [...elseIfs];
          updated.splice(idx, 1);
          updateProp("else_ifs", updated);
        };

        return (
          <div className="space-y-4">
            <div className="border border-border p-3 rounded-md bg-muted/20 space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">Condição Se (If)</span>
              <div className="space-y-2">
                <Label className="text-[9px] text-muted-foreground font-bold">Caminho da Variável</Label>
                <Input
                  placeholder="Ex: obter_usuarios.status_code"
                  value={properties.variable_path ?? ""}
                  onChange={(e) => updateProp("variable_path", e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[9px] text-muted-foreground font-bold">Operador</Label>
                  <select
                    value={properties.operator || "igual"}
                    onChange={(e) => updateProp("operator", e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
                  >
                    <option value="igual">igual</option>
                    <option value="diferente">diferente</option>
                    <option value="contém">contém</option>
                    <option value="maior que">maior que</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[9px] text-muted-foreground font-bold">Valor</Label>
                  <Input
                    placeholder="Comparar"
                    value={properties.value ?? ""}
                    onChange={(e) => updateProp("value", e.target.value)}
                    className="h-7 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Else If List */}
            {elseIfs.map((elseIf: any, idx: number) => (
              <div key={idx} className="border border-purple-500/20 p-3 rounded-md bg-purple-950/5 space-y-3 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeElseIf(idx)}
                  className="absolute top-1 right-1 h-5 w-5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  &times;
                </Button>
                <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase block">Senão Se (Else If #{idx + 1})</span>
                <div className="space-y-2">
                  <Label className="text-[9px] text-muted-foreground font-bold">Caminho da Variável</Label>
                  <Input
                    placeholder="Ex: obter_usuarios.status_code"
                    value={elseIf.variable_path ?? ""}
                    onChange={(e) => updateElseIf(idx, "variable_path", e.target.value)}
                    className="h-7 text-xs bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[9px] text-muted-foreground font-bold">Operador</Label>
                    <select
                      value={elseIf.operator || "igual"}
                      onChange={(e) => updateElseIf(idx, "operator", e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="igual">igual</option>
                      <option value="diferente">diferente</option>
                      <option value="contém">contém</option>
                      <option value="maior que">maior que</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[9px] text-muted-foreground font-bold">Valor</Label>
                    <Input
                      placeholder="Comparar"
                      value={elseIf.value ?? ""}
                      onChange={(e) => updateElseIf(idx, "value", e.target.value)}
                      className="h-7 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addElseIf}
              className="w-full h-8 text-xs font-semibold"
            >
              + Adicionar Else If
            </Button>
          </div>
        );

      case "switch":
        const cases = properties.cases || [];

        const updateCase = (idx: number, val: string) => {
          const updated = [...cases];
          updated[idx] = val;
          updateProp("cases", updated);
        };

        const addCase = () => {
          const updated = [...cases, `Caso ${cases.length + 1}`];
          updateProp("cases", updated);
        };

        const removeCase = (idx: number) => {
          const updated = [...cases];
          updated.splice(idx, 1);
          updateProp("cases", updated);
        };

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Variável do Payload</Label>
              <Input
                placeholder="Ex: obter_dados.status"
                value={properties.variable_path ?? ""}
                onChange={(e) => updateProp("variable_path", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase block">Casos de Desvio (Cases)</Label>
              <div className="space-y-2">
                {cases.map((cs: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={cs}
                      onChange={(e) => updateCase(idx, e.target.value)}
                      className="h-8 text-xs bg-background flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCase(idx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addCase}
                className="w-full h-8 text-xs font-semibold"
              >
                + Adicionar Caso
              </Button>
            </div>
          </div>
        );

      case "loop":
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Array de Origem (Payload)</Label>
            <Input
              placeholder="Ex: obter_usuarios.rows ou [1, 2, 3]"
              value={properties.source_array ?? ""}
              onChange={(e) => updateProp("source_array", e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>
        );

      case "break_loop":
      case "continue_loop":
        return (
          <div className="text-muted-foreground text-xs p-4 text-center">
            Este nó não possui propriedades configuráveis.
          </div>
        );

      case "storage_var":
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Nome da Variável</Label>
              <Input
                placeholder="Ex: meu_id"
                value={properties.var_name ?? ""}
                onChange={(e) => updateProp("var_name", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Valor</Label>
              <Input
                placeholder="Ex: 123 ou {outro_nó.campo}"
                value={properties.var_value ?? ""}
                onChange={(e) => updateProp("var_value", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>
        );

      case "confirm_dialog":
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Título da Janela</Label>
              <Input
                placeholder="Ex: Confirmação"
                value={properties.title ?? ""}
                onChange={(e) => updateProp("title", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Mensagem</Label>
              <Input
                placeholder="Deseja continuar?"
                value={properties.message ?? ""}
                onChange={(e) => updateProp("message", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-semibold">Botão Verdadeiro</Label>
                <Input
                  value={properties.label_true ?? "Sim"}
                  onChange={(e) => updateProp("label_true", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-semibold">Botão Falso</Label>
                <Input
                  value={properties.label_false ?? "Não"}
                  onChange={(e) => updateProp("label_false", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Variável de Destino</Label>
              <Input
                placeholder="Ex: confirmacao_ok"
                value={properties.target_var ?? ""}
                onChange={(e) => updateProp("target_var", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>
        );

      case "alert_dialog":
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Título</Label>
              <Input
                placeholder="Aviso"
                value={properties.title ?? ""}
                onChange={(e) => updateProp("title", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Mensagem</Label>
              <Input
                placeholder="Operação concluída com sucesso."
                value={properties.message ?? ""}
                onChange={(e) => updateProp("message", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Botão de OK</Label>
              <Input
                value={properties.label_ok ?? "OK"}
                onChange={(e) => updateProp("label_ok", e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>
        );

      case "postgres":
      case "mysql":
      case "sqlite":
        // Filter saved connections by type
        const connections = Object.entries(savedConnections)
          .filter(([_, value]: any) => value.type === type)
          .map(([name]) => name);

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Perfil de Conexão</Label>
              <select
                value={properties.connection_name || ""}
                onChange={(e) => updateProp("connection_name", e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione uma conexão...</option>
                {connections.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Instrução SQL</Label>
              <textarea
                placeholder="SELECT * FROM tabela WHERE id = {var_id};"
                value={properties.query ?? ""}
                onChange={(e) => updateProp("query", e.target.value)}
                className="w-full h-40 bg-background border border-border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono resize-none"
              />
            </div>
          </div>
        );

      case "api":
        const apiConnections = Object.entries(savedConnections)
          .filter(([_, value]: any) => value.type === "api")
          .map(([name]) => name);

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Perfil (Opcional)</Label>
              <select
                value={properties.connection_name || ""}
                onChange={(e) => updateProp("connection_name", e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none"
              >
                <option value="">Nenhum (Usar URL completa)</option>
                {apiConnections.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">Método</Label>
                <select
                  value={properties.method || "GET"}
                  onChange={(e) => updateProp("method", e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">Subcaminho / URL</Label>
                <Input
                  placeholder="/usuarios ou https://api.com/v1"
                  value={properties.url ?? ""}
                  onChange={(e) => updateProp("url", e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Cabeçalhos adicionais (JSON)</Label>
              <textarea
                placeholder='{ "Content-Type": "application/json" }'
                value={properties.headers ?? ""}
                onChange={(e) => updateProp("headers", e.target.value)}
                className="w-full h-16 bg-background border border-border rounded-md p-2 text-xs text-foreground focus:outline-none font-mono resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase">Corpo / Body</Label>
              <textarea
                placeholder='{ "nome": "{inserir_nome}" }'
                value={properties.body ?? ""}
                onChange={(e) => updateProp("body", e.target.value)}
                className="w-full h-24 bg-background border border-border rounded-md p-2 text-xs text-foreground focus:outline-none font-mono resize-none"
              />
            </div>
          </div>
        );

      case "js":
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Código JavaScript</Label>
            <textarea
              placeholder="// Altere o payload diretamente:&#10;payload['dados_processados'] = payload['obter_usuarios'].map(u => u.nome);&#10;log('Finalizado!');"
              value={properties.code ?? ""}
              onChange={(e) => updateProp("code", e.target.value)}
              className="w-full h-80 bg-background border border-border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono resize-none"
            />
          </div>
        );

      case "python":
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Código Python</Label>
            <textarea
              placeholder="# Altere o payload diretamente:&#10;payload['dados_processados'] = [u['nome'] for u in payload['obter_usuarios']]&#10;log('Finalizado!')"
              value={properties.code ?? ""}
              onChange={(e) => updateProp("code", e.target.value)}
              className="w-full h-80 bg-background border border-border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono resize-none"
            />
          </div>
        );

      default:
        return (
          <div className="text-muted-foreground text-xs p-4 text-center">
            Tipo de nó desconhecido: {type}
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3 shrink-0">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
          {type}
        </span>
        <div className="truncate">
          <span className="text-xs font-bold block text-foreground truncate">{data.title}</span>
          <span className="text-[9px] font-semibold text-muted-foreground block truncate">ID: {selectedNode.id}</span>
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto pr-1 select-none">
        {renderFields()}
      </div>
    </div>
  );
}
