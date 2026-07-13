import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Field, FieldLabel } from "../../../components/ui/field";
import { Textarea } from "../../../components/ui/textarea";
import { FileText } from "lucide-react";

interface StickyNoteEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: any;
    onSave: (nodeId: string, label: string, description: string) => void;
}

export function StickyNoteEditorModal({
    open,
    onOpenChange,
    node,
    onSave,
}: StickyNoteEditorModalProps) {
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!node) return;
        setLabel(node.data?.label || "");
        setDescription(node.data?.description || "");
    }, [node, open]);

    if (!node) return null;

    const handleSave = () => {
        onSave(node.id, label, description);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-lg p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-5 border-b border-neutral-100 flex-none bg-amber-50/20">
                    <DialogTitle className="flex items-center gap-2 text-md text-neutral-800 font-semibold">
                        <FileText className="size-5 text-amber-500" />
                        Editar Nota Visual
                    </DialogTitle>
                </DialogHeader>

                <div className="p-5 flex flex-col gap-4">
                    <Field>
                        <FieldLabel className="text-neutral-600 font-medium">Título da Nota</FieldLabel>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Título / Assunto da nota"
                            className="w-full border-neutral-200 focus:border-amber-400 focus:ring-amber-400/20"
                        />
                    </Field>
                    <Field>
                        <FieldLabel className="text-neutral-600 font-medium">Conteúdo / Descrição</FieldLabel>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Escreva a descrição ou instruções da nota..."
                            className="min-h-[140px] w-full border-neutral-200 focus:border-amber-400 focus:ring-amber-400/20 font-sans leading-relaxed text-sm"
                        />
                    </Field>
                </div>

                <DialogFooter className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex-none">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-md border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave}
                        className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-md border-0"
                    >
                        Salvar Nota
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
